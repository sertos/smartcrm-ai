import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Users, TrendingUp, DollarSign, Activity, Zap, X, Sparkles, RefreshCw, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalLeads: 0, newLeads: 0, wonDeals: 0, negotiationDeals: 0 });
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', company: '' });
  const [leadsList, setLeadsList] = useState<any[]>([]);

  // Real-time AI Insights state
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [quarterlyForecast, setQuarterlyForecast] = useState<string>('');

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'leads'), where('userId', '==', user.uid));
    const unsub = onSnapshot(
      q,
      (snap) => {
        let newL = 0;
        let won = 0;
        let neg = 0;
        const list: any[] = [];
        snap.forEach((doc) => {
          const dt = doc.data();
          list.push({ id: doc.id, ...dt });
          if (dt.status === 'new') newL++;
          if (dt.status === 'won') won++;
          if (dt.status === 'negotiation') neg++;
        });
        setLeadsList(list);
        setStats({
          totalLeads: snap.size,
          newLeads: newL,
          wonDeals: won,
          negotiationDeals: neg,
        });
      },
      (err) => {
        console.error('Firestore snapshot error:', err);
      }
    );
    return () => unsub();
  }, [user]);

  const fetchLiveAIInsights = async (leads: any[]) => {
    if (!leads || leads.length === 0) return;
    setLoadingInsights(true);
    try {
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leads: leads.map((l) => ({
            name: l.name,
            company: l.company,
            status: l.status,
            score: l.score,
          })),
          language: i18n.language || 'es',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.insights) setAiInsights(data.insights);
        if (data.quarterlyForecast) setQuarterlyForecast(data.quarterlyForecast);
      }
    } catch (e) {
      console.error('Failed to fetch AI insights:', e);
    } finally {
      setLoadingInsights(false);
    }
  };

  useEffect(() => {
    if (leadsList.length > 0 && aiInsights.length === 0) {
      fetchLiveAIInsights(leadsList);
    }
  }, [leadsList.length, i18n.language]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addDoc(collection(db, 'leads'), {
        userId: user.uid,
        name: formData.name,
        email: formData.email,
        company: formData.company,
        status: 'new',
        score: Math.floor(Math.random() * 30) + 65,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setShowAdd(false);
      setFormData({ name: '', email: '', company: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const revenueMultiplier = Math.max(stats.totalLeads, 1);
  const chartData = [
    { name: 'Jan', revenue: revenueMultiplier * 1200 },
    { name: 'Feb', revenue: revenueMultiplier * 1800 },
    { name: 'Mar', revenue: revenueMultiplier * 2400 },
    { name: 'Apr', revenue: revenueMultiplier * 3100 },
    { name: 'May', revenue: revenueMultiplier * 3800 },
    { name: 'Jun', revenue: revenueMultiplier * 4500 },
  ];

  const cards = [
    {
      title: t('total_leads'),
      value: stats.totalLeads.toString(),
      icon: Users,
      color: 'from-blue-500/20 to-blue-500/5',
      text: 'text-blue-400',
    },
    {
      title: t('new_lead'),
      value: stats.newLeads.toString(),
      icon: Activity,
      color: 'from-brand-500/20 to-brand-500/5',
      text: 'text-brand-400',
    },
    {
      title: t('negotiation'),
      value: stats.negotiationDeals.toString(),
      icon: TrendingUp,
      color: 'from-purple-500/20 to-purple-500/5',
      text: 'text-purple-400',
    },
    {
      title: t('revenue_forecast'),
      value: `$${(revenueMultiplier * 12500 + stats.wonDeals * 8000).toLocaleString()}`,
      icon: DollarSign,
      color: 'from-emerald-500/20 to-emerald-500/5',
      text: 'text-emerald-400',
    },
  ];

  return (
    <div className="space-y-8 relative">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-white">{t('dashboard')}</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/10 border border-brand-500/30 text-brand-400">
              <Sparkles size={12} />
              {t('gemini_connected')}
            </span>
          </div>
          <p className="text-zinc-400 mt-1 text-sm">
            {t('welcome_back')}, {user?.displayName?.split(' ')[0] || t('sales_pro')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/app/ai')}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-200 transition flex items-center gap-2"
          >
            <Sparkles size={14} className="text-brand-400" />
            {t('ai_assistant')}
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="bg-brand-500 hover:bg-brand-400 text-black font-semibold px-4 py-2 rounded-xl transition shadow-[0_0_15px_rgba(34,197,94,0.3)] flex items-center gap-2 text-sm"
          >
            + {t('add_lead')}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="p-5 rounded-2xl glass-dark border border-white/10 relative overflow-hidden group shadow-lg"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-zinc-400 font-medium text-xs mb-1.5 uppercase tracking-wider">{card.title}</p>
                <h3 className="text-3xl font-extrabold tracking-tight text-white">{card.value}</h3>
              </div>
              <div className={`p-3 rounded-xl bg-white/5 ${card.text}`}>
                <card.icon size={20} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts & AI Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Forecast Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass-dark border border-white/10 p-6 rounded-2xl flex flex-col justify-between shadow-xl"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {t('revenue_ai_forecast')}
              </h2>
              {quarterlyForecast && (
                <p className="text-xs text-brand-400 mt-1 font-medium">{quarterlyForecast}</p>
              )}
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400">
              {t('six_months_projection')}
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} dy={10} />
                <YAxis stroke="#71717a" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} dx={-10} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#22c55e', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* AI Strategic Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-dark border border-white/10 p-6 rounded-2xl flex flex-col justify-between shadow-xl"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap className="text-brand-400" size={18} />
                {t('ai_insights')}
              </h2>
              <button
                onClick={() => fetchLiveAIInsights(leadsList)}
                disabled={loadingInsights || leadsList.length === 0}
                className="text-xs text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition disabled:opacity-40"
                title="Regenerate Insights"
              >
                <RefreshCw size={14} className={loadingInsights ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="space-y-3.5">
              {loadingInsights ? (
                <div className="p-8 text-center space-y-2">
                  <Sparkles className="text-brand-400 animate-spin mx-auto" size={20} />
                  <p className="text-xs text-zinc-400">{t('analyzing')}</p>
                </div>
              ) : aiInsights.length > 0 ? (
                aiInsights.map((insight, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border transition-all ${
                      insight.type === 'opportunity'
                        ? 'bg-brand-500/10 border-brand-500/30'
                        : insight.type === 'warning'
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-purple-500/10 border-purple-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        {insight.type === 'opportunity' ? (
                          <CheckCircle2 size={13} className="text-brand-400" />
                        ) : (
                          <ShieldAlert size={13} className="text-amber-400" />
                        )}
                        {insight.title}
                      </p>
                      {insight.impact && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-brand-300">
                          {insight.impact}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">{insight.description}</p>
                  </div>
                ))
              ) : stats.totalLeads > 0 ? (
                <>
                  <div className="p-3.5 rounded-xl bg-brand-500/10 border border-brand-500/20">
                    <p className="text-xs font-bold text-brand-200 mb-1 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-brand-400" /> {t('pipeline_acceleration')}
                    </p>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {t('pipeline_acc_desc')}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <p className="text-xs font-bold text-purple-200 mb-1 flex items-center gap-1.5">
                      <TrendingUp size={13} className="text-purple-400" /> {t('velocity_forecast')}
                    </p>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {t('velocity_desc')}
                    </p>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center border border-dashed border-white/10 rounded-xl bg-white/5">
                  <p className="text-zinc-500 text-xs">{t('no_data')}</p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => navigate('/app/ai')}
            className="w-full mt-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition text-xs font-semibold text-zinc-200 flex items-center justify-center gap-2"
          >
            <span>{t('view_all_insights')}</span>
            <ArrowRight size={14} />
          </button>
        </motion.div>
      </div>

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
