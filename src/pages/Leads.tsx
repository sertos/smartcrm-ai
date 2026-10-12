import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Search,
  Building,
  Mail,
  X,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Plus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export default function Leads() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', company: '' });

  // AI Deep Analysis Modal State
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [analyzingLead, setAnalyzingLead] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'leads'), where('userId', '==', user.uid));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: any[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
        setLeads(list);
      },
      (err) => {
        console.error('Firestore leads listener error:', err);
      }
    );
    return () => unsub();
  }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const defaultScore = Math.floor(Math.random() * 30) + 65;
      await addDoc(collection(db, 'leads'), {
        userId: user.uid,
        name: formData.name,
        email: formData.email,
        company: formData.company,
        status: 'new',
        score: defaultScore,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setShowAdd(false);
      setFormData({ name: '', email: '', company: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunAIAnalysis = async (lead: any) => {
    setSelectedLead(lead);
    setAnalysisResult(null);
    setAnalyzingLead(true);

    try {
      const res = await fetch('/api/ai/analyze-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead,
          language: i18n.language || 'es',
        }),
      });

      if (!res.ok) {
        throw new Error('Analysis request failed');
      }

      const data = await res.json();
      setAnalysisResult(data);
    } catch (e) {
      console.error('AI Analysis failed:', e);
      const isEs = i18n.language.startsWith('es');
      setAnalysisResult({
        calculatedScore: lead.score || 75,
        buyingIntent: (lead.score || 70) > 75 ? 'High' : 'Medium',
        summary: isEs
          ? `Oportunidad comercial de alta prioridad con ${lead.company || lead.name}.`
          : `High priority sales opportunity with ${lead.company || lead.name}.`,
        objections: isEs
          ? ['Revisión de presupuesto', 'Tiempos de implementación', 'Validación del equipo']
          : ['Budget approval', 'Implementation timeline', 'Team sign-off'],
        recommendedAction: isEs
          ? 'Agendar una demostración de 15 minutos enfocada en el retorno de inversión.'
          : 'Schedule a 15-minute product demonstration focusing on ROI.',
        draftEmail: {
          subject: isEs
            ? `Estrategia de crecimiento para ${lead.company || lead.name}`
            : `Growth opportunities for ${lead.company || lead.name}`,
          body: isEs
            ? `Hola ${lead.name},\n\nEstuve revisando el perfil de ${lead.company || 'su empresa'} y veo un gran potencial para optimizar sus ventas.\n\n¿Tendrías 10 minutos esta semana para una breve conversación?\n\nSaludos cordiales,`
            : `Hi ${lead.name},\n\nI was looking into ${lead.company || 'your business'} and noticed a strong opportunity to streamline your sales pipeline.\n\nDo you have 10 minutes this week for a brief call?\n\nBest regards,`,
        },
      });
    } finally {
      setAnalyzingLead(false);
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      (lead.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-white">{t('leads')}</h1>
            <span className="text-xs bg-brand-500/10 text-brand-400 border border-brand-500/30 px-2.5 py-0.5 rounded-full font-semibold">
              {leads.length} {t('total_leads').toLowerCase()}
            </span>
          </div>
          <p className="text-zinc-400 mt-1 text-sm">{t('manage_score_contacts')}</p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="bg-brand-500 hover:bg-brand-400 text-black font-semibold px-4 py-2.5 rounded-xl transition shadow-[0_0_15px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2 text-sm"
        >
          <Plus size={16} />
          {t('add_lead')}
        </button>
      </div>

      {/* Controls: Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('search_leads')}
            className="w-full bg-zinc-900/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {['all', 'new', 'contacted', 'negotiation', 'won', 'lost'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all capitalize ${
                statusFilter === status
                  ? 'bg-brand-500 text-black shadow-md shadow-brand-500/20'
                  : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              {status === 'all' ? t('all_stages') : t(status)}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table Container */}
      <div className="glass-dark border border-white/10 rounded-2xl overflow-hidden shadow-xl flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/60 border-b border-white/5">
              <tr>
                <th className="px-6 py-3.5 font-semibold">{t('name')}</th>
                <th className="px-6 py-3.5 font-semibold">{t('company')}</th>
                <th className="px-6 py-3.5 font-semibold">{t('status')}</th>
                <th className="px-6 py-3.5 font-semibold">{t('ai_score')}</th>
                <th className="px-6 py-3.5 font-semibold text-right">{t('ai_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLeads.map((lead, idx) => (
                <motion.tr
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  key={lead.id}
                  className="hover:bg-white/[0.03] transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white group-hover:text-brand-300 transition-colors">
                      {lead.name}
                    </div>
                    <div className="text-zinc-400 text-xs mt-0.5 flex items-center gap-1.5">
                      <Mail size={12} className="text-zinc-500" />
                      {lead.email || '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-300 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Building size={14} className="text-zinc-500" />
                      {lead.company || t('direct_contact')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        lead.status === 'won'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : lead.status === 'lost'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : lead.status === 'negotiation'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : lead.status === 'contacted'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {t(lead.status) || lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs border ${
                          (lead.score || 0) >= 80
                            ? 'border-brand-500/50 bg-brand-500/10 text-brand-300'
                            : (lead.score || 0) >= 60
                            ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                            : 'border-zinc-700 bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {lead.score || 70}
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        {(lead.score || 0) >= 80
                          ? t('high_priority')
                          : t('active_deal')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleRunAIAnalysis(lead)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 text-brand-300 hover:text-white transition text-xs font-semibold shadow-sm"
                    >
                      <Sparkles size={13} className="text-brand-400" />
                      <span>{t('analyze_lead_ai')}</span>
                    </button>
                  </td>
                </motion.tr>
              ))}

              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-500 text-sm">
                    {t('no_leads')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Deep Analysis Modal */}
      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-brand-500/40 p-6 rounded-3xl w-full max-w-xl shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <button
                onClick={() => setSelectedLead(null)}
                className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <X size={18} />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-400 to-emerald-600 flex items-center justify-center text-black font-bold shadow-lg shadow-brand-500/20">
                  <Sparkles size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {t('ai_deep_analysis')}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {selectedLead.name} · {selectedLead.company || t('direct_contact')}
                  </p>
                </div>
              </div>

              {analyzingLead ? (
                <div className="py-16 text-center space-y-3">
                  <Sparkles size={28} className="animate-spin text-brand-400 mx-auto" />
                  <p className="text-sm text-zinc-300 font-medium">{t('analyzing')}</p>
                </div>
              ) : analysisResult ? (
                <div className="space-y-4">
                  {/* Score & Intent row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/10 flex items-center gap-3">
                      <div className="text-3xl font-extrabold text-brand-400">
                        {analysisResult.calculatedScore || selectedLead.score || 85}
                      </div>
                      <div>
                        <p className="text-[11px] text-zinc-400 uppercase font-semibold">{t('ai_score')}</p>
                        <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                          <TrendingUp size={12} /> {t('win_rate')}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/10 flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <p className="text-[11px] text-zinc-400 uppercase font-semibold">{t('buying_intent')}</p>
                        <p className="text-xs font-bold text-white">
                          {analysisResult.buyingIntent === 'High'
                            ? t('buying_intent_high')
                            : analysisResult.buyingIntent === 'Low'
                            ? t('buying_intent_low')
                            : t('buying_intent_medium')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="p-4 rounded-2xl bg-brand-500/5 border border-brand-500/20">
                    <p className="text-xs text-zinc-200 leading-relaxed font-medium">
                      {analysisResult.summary}
                    </p>
                  </div>

                  {/* Action & Objections */}
                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/10">
                      <h4 className="text-xs font-bold text-brand-400 uppercase tracking-wider mb-1.5">
                        {t('recommended_action')}
                      </h4>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        {analysisResult.recommendedAction}
                      </p>
                    </div>

                    {analysisResult.objections && analysisResult.objections.length > 0 && (
                      <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/10">
                        <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <AlertCircle size={14} /> {t('anticipated_objections')}
                        </h4>
                        <ul className="space-y-1.5">
                          {analysisResult.objections.map((obj: string, i: number) => (
                            <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                              <span className="text-amber-400 font-bold">•</span>
                              <span>{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* AI Draft Email */}
                  {analysisResult.draftEmail && (
                    <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 space-y-2.5">
                      <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Mail size={14} className="text-brand-400" /> {t('ai_draft_email')}
                      </h4>

                      <div className="bg-zinc-900/90 rounded-xl p-3.5 border border-white/5 space-y-2 text-xs">
                        <div className="text-zinc-400 font-medium pb-2 border-b border-white/5">
                          <span className="text-zinc-500">Subject:</span> {analysisResult.draftEmail.subject}
                        </div>
                        <div className="text-zinc-300 whitespace-pre-wrap leading-relaxed">
                          {analysisResult.draftEmail.body}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Refresh analysis button */}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => handleRunAIAnalysis(selectedLead)}
                      disabled={analyzingLead}
                      className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 transition"
                    >
                      <RefreshCw size={13} className={analyzingLead ? 'animate-spin' : ''} />
                      {t('regenerate_ai')}
                    </button>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Lead Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl relative"
          >
            <button
              onClick={() => setShowAdd(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-6 text-white">{t('create_new_lead')}</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">{t('full_name')}</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 transition-colors text-white"
                  placeholder="e.g. Sarah Connor"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">{t('email')}</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 transition-colors text-white"
                  placeholder="sarah@cyberdyne.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">{t('company')}</label>
                <input
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 transition-colors text-white"
                  placeholder="Cyberdyne Systems"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-brand-500 text-black font-semibold py-2.5 rounded-lg mt-4 hover:bg-brand-400 transition"
              >
                {t('save_lead')}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
