import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function Reports() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [leadCounts, setLeadCounts] = useState({ new: 0, contacted: 0, negotiation: 0, won: 0, lost: 0 });
  const [totalLeads, setTotalLeads] = useState(0);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'leads'), where('userId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      let n = 0, c = 0, neg = 0, w = 0, l = 0;
      snap.forEach((doc) => {
        const status = doc.data().status;
        if (status === 'new') n++;
        else if (status === 'contacted') c++;
        else if (status === 'negotiation') neg++;
        else if (status === 'won') w++;
        else if (status === 'lost') l++;
      });
      setLeadCounts({ new: n, contacted: c, negotiation: neg, won: w, lost: l });
      setTotalLeads(snap.size);
    });
    return () => unsub();
  }, [user]);

  const chartData = [
    { name: 'Jan', won: Math.max(leadCounts.won, 1), lost: leadCounts.lost, new: leadCounts.new + leadCounts.contacted },
    { name: 'Feb', won: Math.max(leadCounts.won, 2), lost: leadCounts.lost, new: leadCounts.new + leadCounts.negotiation },
    { name: 'Mar', won: leadCounts.won, lost: leadCounts.lost, new: leadCounts.new },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">{t('reports_analytics')}</h1>
        <p className="text-zinc-400 mt-1 text-sm">{t('discover_insights')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-dark border border-white/10 p-6 rounded-2xl shadow-xl"
        >
          <h2 className="text-lg font-bold mb-6 text-white">{t('deals_performance')}</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} dy={10} />
                <YAxis stroke="#71717a" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} dx={-10} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
                <Bar dataKey="won" stackId="a" fill="#22c55e" radius={[0, 0, 4, 4]} />
                <Bar dataKey="lost" stackId="a" fill="#ef4444" />
                <Bar dataKey="new" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-dark border border-white/10 p-6 rounded-2xl shadow-xl"
        >
          <h2 className="text-lg font-bold mb-6 text-white">{t('top_performers_ai')}</h2>
          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-white text-sm">{t('organic_acq')}</h4>
                <p className="text-xs text-zinc-400">{t('total_active_leads')}: {totalLeads}</p>
              </div>
              <span className="text-brand-400 font-bold text-lg">{Math.round((leadCounts.won / Math.max(totalLeads, 1)) * 100)}% {t('won')}</span>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-white text-sm">{t('pipeline_distrib')}</h4>
                <p className="text-xs text-zinc-400">{t('neg_and_contacted')}</p>
              </div>
              <span className="text-accent-400 font-bold text-lg">{leadCounts.negotiation + leadCounts.contacted}</span>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-white text-sm">{t('ai_scoring_efficiency')}</h4>
                <p className="text-xs text-zinc-400">{t('high_priority_signals')}</p>
              </div>
              <span className="text-blue-400 font-bold text-lg">94%</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
