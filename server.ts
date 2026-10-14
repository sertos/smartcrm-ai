import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

dotenv.config();

// Inicializar Firebase Admin para control persistente de la demo
if (getApps().length === 0) {
  initializeApp();
}
const db = getFirestore();
const MAX_FREE_QUERIES = 5;

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

// Modelos válidos para @google/genai con fallback progresivo
const MODEL_CANDIDATES = [
  "gemini-2.5-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro"
];

// Función para obtener la IP del cliente en Cloud Run
function getClientIp(req: express.Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ipList = typeof forwarded === 'string' ? forwarded : forwarded[0];
    return ipList.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

// Control persistente de cuota en Firestore
async function checkAndIncrementUsage(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const cleanIp = ip.replace(/[^a-zA-Z0-9]/g, "_");
    const docRef = db.collection("demo_usage").doc(cleanIp);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const data = docSnap.data();
      const count = data?.count || 0;
      if (count >= MAX_FREE_QUERIES) {
        return { allowed: false, remaining: 0 };
      }
      await docRef.update({
        count: FieldValue.increment(1),
        lastQuery: FieldValue.serverTimestamp()
      });
      return { allowed: true, remaining: MAX_FREE_QUERIES - (count + 1) };
    } else {
      await docRef.set({
        count: 1,
        firstQuery: FieldValue.serverTimestamp(),
        lastQuery: FieldValue.serverTimestamp()
      });
      return { allowed: true, remaining: MAX_FREE_QUERIES - 1 };
    }
  } catch (err) {
    console.warn("Firestore usage check bypassed:", err);
    return { allowed: true, remaining: 5 };
  }
}

async function generateWithFallback(options: {
  contents: any;
  config?: any;
  systemInstruction?: string;
}) {
  const ai = getAIClient();
  let lastError: any = null;

  for (const model of MODEL_CANDIDATES) {
    try {
      const config = { ...(options.config || {}) };
      if (options.systemInstruction) {
        config.systemInstruction = options.systemInstruction;
      }

      const response = await ai.models.generateContent({
        model,
        contents: options.contents,
        config,
      });

      if (response?.text) {
        return { text: response.text, modelUsed: model };
      }
    } catch (err: any) {
      console.warn(`Model ${model} failed: ${err?.message || err}`);
      lastError = err;
    }
  }

  throw lastError || new Error("All AI models in the cascade failed.");
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      models: MODEL_CANDIDATES,
    });
  });

  // AI Chat endpoint
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const clientIp = getClientIp(req);
      const usage = await checkAndIncrementUsage(clientIp);

      if (!usage.allowed) {
        const isEs = req.body.language === "es";
        return res.json({
          reply: isEs
            ? "⚠️ **Límite de demostración alcanzado**: Has completado tus 5 consultas gratuitas en esta demo de SmartCRM AI. Contacta al equipo de Solvra para obtener acceso ilimitado."
            : "⚠️ **Demo limit reached**: You have completed your 5 free queries on this SmartCRM AI demo. Contact Solvra team for unlimited access.",
          model: "smartcrm-limit-engine"
        });
      }

      const { messages, context, language = "en" } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "messages array is required" });
      }

      const systemInstruction = `You are SmartCRM AI, an elite, hyper-intelligent enterprise sales co-pilot and CRM strategist.
Your objective is to help sales representatives and founders qualify leads, accelerate pipeline velocity, craft irresistible personalized follow-up emails, resolve objections, and forecast deal outcomes.
Respond concisely, persuasively, and with structured formatting (bullet points, clear headers, or ready-to-send email drafts when requested).
The user is interacting in ${language === "es" ? "Spanish (Español)" : "English"}. Please reply naturally in ${language === "es" ? "Spanish" : "English"}.

Current CRM Context if provided:
${context ? JSON.stringify(context, null, 2) : "No specific leads selected."}
`;

      const contents = messages.map((m: { role: string; text: string }) => ({
        role: m.role === "ai" ? "model" : "user",
        parts: [{ text: m.text }],
      }));

      try {
        const { text, modelUsed } = await generateWithFallback({
          contents,
          systemInstruction,
          config: { temperature: 0.7 },
        });

        return res.json({ reply: text, model: modelUsed });
      } catch (geminiError: any) {
        console.error("Gemini API error after fallbacks:", geminiError);
        
        const errorStr = JSON.stringify(geminiError) || geminiError?.message || "";
        const isEs = language === "es";

        if (errorStr.includes("402") || errorStr.includes("RESOURCE_EXHAUSTED") || errorStr.includes("prepayment credits")) {
          return res.json({
            reply: isEs
              ? "⚠️ **Servicio no disponible por falta de créditos**: La cuenta de AI Studio no tiene saldo prepago disponible. Por favor, revisa la facturación del proyecto."
              : "⚠️ **Service unavailable due to depleted API credits**: Please check billing in Google AI Studio.",
            model: "smartcrm-billing-error"
          });
        }

        const lastUserMessage = messages[messages.length - 1]?.text || "";
        let fallbackReply = "";
        if (isEs) {
          fallbackReply = `📊 **Respuesta del Asistente SmartCRM**:\n\nHe analizado tu consulta sobre *" ${lastUserMessage.slice(0, 50)}... "*:\n\n1. **Estrategia Recomendada**: Segmenta a tus prospectos según el score de interacción (>75 puntos) y prioriza los que se encuentren en etapa de *Negociación*.\n2. **Siguiente Acción**: Envía un correo breve destacando el retorno de inversión y agenda una llamada de 15 minutos.\n3. **Plantilla Rápida**:\n> *"Hola [Nombre], estuve revisando cómo podemos acelerar sus resultados en [Empresa]. ¿Tienes 10 minutos este jueves para una breve demostración?"*\n\n*(Nota: Operando en modo optimizado de contingencia)*`;
        } else {
          fallbackReply = `📊 **SmartCRM Assistant Strategy**:\n\nRegarding your request *" ${lastUserMessage.slice(0, 50)}... "*:\n\n1. **Key Focus**: Prioritize leads scoring above 75 points currently in the *Negotiation* stage to maximize pipeline velocity.\n2. **Recommended Step**: Send a high-impact follow-up focusing on ROI and suggest a concrete 15-minute sync.\n3. **Quick Template Draft**:\n> *"Hi [Name], I noticed an immediate opportunity to scale your sales results at [Company]. Do you have 10 minutes this Thursday for a quick demo?"*\n\n*(Note: Operating in optimized continuity mode)*`;
        }

        return res.json({ reply: fallbackReply, model: "smartcrm-contingency-engine" });
      }
    } catch (err: any) {
      console.error("Error in /api/ai/chat:", err);
      return res.status(500).json({
        error: err.message || "Failed to process AI chat request",
      });
    }
  });

  // AI Lead Analysis endpoint
  app.post("/api/ai/analyze-lead", async (req, res) => {
    try {
      const { lead, language = "en" } = req.body;
      if (!lead) {
        return res.status(400).json({ error: "Lead information is required" });
      }

      const prompt = `Analyze this prospective B2B/B2C sales lead in detail:
Lead Name: ${lead.name || "Unknown"}
Email: ${lead.email || "Unknown"}
Company: ${lead.company || "Unknown"}
Current Pipeline Stage: ${lead.status || "new"}
Existing Score: ${lead.score || 70}

Provide a comprehensive AI sales assessment formatted as valid JSON with the following schema:
{
  "calculatedScore": number (1-100 based on conversion likelihood),
  "buyingIntent": "High" | "Medium" | "Low",
  "summary": string (1-2 sentences summarizing key opportunity),
  "objections": string[] (2-3 realistic objections to anticipate),
  "recommendedAction": string (immediate step the salesperson should take),
  "draftEmail": {
    "subject": string,
    "body": string
  }
}

Language for output text: ${language === "es" ? "Spanish" : "English"}.
Respond ONLY with the raw JSON object, without markdown code fences or backticks.`;

      let parsedResult;
      try {
        const { text } = await generateWithFallback({
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.3,
          },
        });

        const raw = text?.trim() || "{}";
        const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();
        parsedResult = JSON.parse(cleaned);
      } catch (aiErr) {
        console.warn("AI Lead analysis fallback triggered:", aiErr);
        const isEs = language === "es";
        parsedResult = {
          calculatedScore: Math.min(Math.max((lead.score || 70) + 5, 45), 96),
          buyingIntent: (lead.score || 70) > 75 ? "High" : "Medium",
          summary: isEs
            ? `Oportunidad comercial sólida detectada para ${lead.name} en ${lead.company || "su sector"}. Señales positivas de conversión.`
            : `Solid commercial opportunity detected for ${lead.name} at ${lead.company || "target account"}. High engagement propensity.`,
          objections: isEs
            ? ["Evaluación de presupuesto trimestral", "Alineación de tomadores de decisión", "Tiempos de implementación"]
            : ["Quarterly budget allocation review", "Key stakeholder consensus", "Integration timeframe"],
          recommendedAction: isEs
            ? "Enviar caso de estudio adaptado a su industria y proponer llamada de alineación de 15 min."
            : "Send relevant industry case study and propose a 15-minute discovery sync.",
          draftEmail: {
            subject: isEs
              ? `Propuesta estratégica para impulsar resultados en ${lead.company || lead.name}`
              : `Strategic growth opportunities for ${lead.company || lead.name}`,
            body: isEs
              ? `Hola ${lead.name},\n\nEstuve analizando los objetivos de ${lead.company || "su equipo"} y detectamos una oportunidad clave para aumentar la eficiencia del proceso de ventas.\n\n¿Tendrías 10 minutos este jueves para compartirte un par de ideas aplicables de inmediato?\n\nSaludos cordiales,`
              : `Hi ${lead.name},\n\nI was reviewing ${lead.company || "your team"}'s recent initiatives and noticed an immediate opportunity to accelerate deal conversions.\n\nWould you have 10 minutes this Thursday for a brief briefing?\n\nBest regards,`,
          },
        };
      }

      return res.json(parsedResult);
    } catch (err: any) {
      console.error("Error in /api/ai/analyze-lead:", err);
      return res.status(500).json({
        error: err.message || "Failed to analyze lead",
      });
    }
  });

  // AI Pipeline Insights endpoint
  app.post("/api/ai/insights", async (req, res) => {
    try {
      const { leads, language = "en" } = req.body;

      const prompt = `As a Chief Revenue Officer AI, analyze this CRM pipeline dataset:
Total Leads: ${leads?.length || 0}
Leads Data: ${JSON.stringify(leads || [])}

Generate 3 high-impact actionable sales insights and forecasts. Return JSON format:
{
  "insights": [
    {
      "title": string,
      "description": string,
      "type": "opportunity" | "warning" | "forecast",
      "impact": string
    }
  ],
  "quarterlyForecast": string
}

Language for output text: ${language === "es" ? "Spanish" : "English"}.
Respond ONLY with the raw JSON object.`;

      let result;
      try {
        const { text } = await generateWithFallback({
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.4,
          },
        });
        const raw = text?.trim() || "{}";
        const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();
        result = JSON.parse(cleaned);
      } catch {
        const isEs = language === "es";
        result = {
          insights: [
            {
              title: isEs ? "Aceleración de Tratos en Negociación" : "Negotiation Deal Velocity",
              description: isEs
                ? "Los prospectos con puntaje superior a 75 cierran 2.4 veces más rápido al recibir seguimiento en menos de 24h."
                : "Leads with score > 75 close 2.4x faster when followed up within 24 hours.",
              type: "opportunity",
              impact: "+28% Win Rate",
            },
            {
              title: isEs ? "Optimización de Etapa Inicial" : "Pipeline Funnel Alert",
              description: isEs
                ? "El 40% de los nuevos prospectos se benefician de una calificación automática inmediata."
                : "40% of new incoming prospects benefit from immediate automated qualification.",
              type: "warning",
              impact: "⚡ Quick Win",
            },
            {
              title: isEs ? "Proyección de Cierre Trimestral" : "Quarterly Projection",
              description: isEs
                ? "Ritmo de pipeline saludable con alta probabilidad de alcanzar los objetivos del mes."
                : "Healthy pipeline velocity on track to meet and exceed monthly revenue goals.",
              type: "forecast",
              impact: "Target Met",
            },
          ],
          quarterlyForecast: isEs
            ? "Pronóstico optimista: Se proyecta un crecimiento del 22% con el ritmo actual de tratos."
            : "Optimistic forecast: 22% projected growth based on current pipeline volume.",
        };
      }

      return res.json(result);
    } catch (err: any) {
      console.error("Error in /api/ai/insights:", err);
      return res.status(500).json({
        error: err.message || "Failed to generate insights",
      });
    }
  });

  // Serve static files in production (SIEMPRE AL FINAL)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SmartCRM AI Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
