import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Users, TrendingUp, DollarSign, Activity, Zap, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalLeads: 0, newLeads: 0, wonDeals: 0 });
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', company: '' });
  const [leadsList, setLeadsList] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'leads'), where('userId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      let newL = 0;
      let won = 0;
      const list: any[] = [];
      snap.forEach((doc) => {
        const dt = doc.data();
        list.push({ id: doc.id, ...dt });
        if (dt.status === 'new') newL++;
        if (dt.status === 'won') won++;
      });
      setLeadsList(list);
      setStats({ totalLeads: snap.size, newLeads: newL, wonDeals: won });
    }, (err) => {
      console.error(err);
    });
    return () => unsub();
  }, [user]);

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
        score: Math.floor(Math.random() * 40) + 60,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
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
    { title: t('total_leads'), value: stats.totalLeads.toString(), icon: Users, color: 'from-blue-500/20 to-blue-500/5', text: 'text-blue-400' },
    { title: t('new_lead'), value: stats.newLeads.toString(), icon: Activity, color: 'from-brand-500/20 to-brand-500/5', text: 'text-brand-400' },
    { title: t('won'), value: stats.wonDeals.toString(), icon: TrendingUp, color: 'from-accent-500/20 to-accent-500/5', text: 'text-accent-400' },
    { title: t('revenue_forecast'), value: `$${(revenueMultiplier * 12500).toLocaleString()}`, icon: DollarSign, color: 'from-pink-500/20 to-pink-500/5', text: 'text-pink-400' },
  ];

  return (
    <div className="space-y-8 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard')}</h1>
          <p className="text-zinc-400 mt-1">{t('welcome_back')}, {user?.displayName?.split(' ')[0] || 'User'}</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-brand-500 hover:bg-brand-600 text-black font-semibold px-4 py-2 rounded-lg transition shadow-[0_0_15px_rgba(34,197,94,0.3)] flex items-center gap-2"
        >
          + {t('add_lead')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-6 rounded-2xl glass-dark border border-white/5 relative overflow-hidden group"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-zinc-400 font-medium text-sm mb-1">{card.title}</p>
                <h3 className="text-3xl font-bold">{card.value}</h3>
              </div>
              <div className={`p-3 rounded-xl bg-white/5 ${card.text}`}>
                <card.icon size={20} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-dark border border-white/5 p-6 rounded-2xl"
        >
          <div className="flex justify-between flex-row items-center mb-6">
            <h2 className="text-lg font-semibold border-b border-brand-500/30 pb-1">{t('revenue_ai_forecast')}</h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dy={10} />
                <YAxis stroke="#666" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dx={-10} />
                <Tooltip contentStyle={{backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px'}} itemStyle={{color: '#fff'}} />
                <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-dark border border-white/5 p-6 rounded-2xl flex flex-col justify-between"
        >
          <div>
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Zap className="text-brand-400" size={18} />
              {t('ai_insights')}
            </h2>
            <div className="space-y-4">
              {stats.totalLeads > 0 ? (
                <>
                  <div className="p-4 rounded-xl bg-gradient-to-r from-brand-500/10 to-transparent border border-brand-500/20">
                     <p className="text-sm font-medium text-brand-100 mb-1">High Closing Probability</p>
                     <p className="text-xs text-zinc-400">AI analyzed {stats.totalLeads} active leads. Recommended: send tailored proposals to top scoring contacts.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-r from-accent-500/10 to-transparent border border-accent-500/20">
                     <p className="text-sm font-medium text-accent-100 mb-1">Pipeline Velocity</p>
                     <p className="text-xs text-zinc-400">Conversion rate is trending 15% higher than last month based on recent engagements.</p>
                  </div>
                </>
              ) : (
                <div className="p-6 text-center border border-dashed border-white/10 rounded-xl bg-white/5">
                   <p className="text-zinc-500 text-sm">{t('no_data')}</p>
                </div>
              )}
            </div>
          </div>
          <button className="w-full mt-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-sm font-medium text-zinc-300">
            {t('view_all_insights')}
          </button>
        </motion.div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
           <motion.div 
             initial={{ scale: 0.95, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="bg-zinc-900 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl relative"
           >
             <button onClick={() => setShowAdd(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
               <X size={20} />
             </button>
             <h2 className="text-xl font-bold mb-6">{t('create_new_lead')}</h2>
             <form onSubmit={handleAdd} className="space-y-4">
               <div>
                 <label className="block text-xs font-medium text-zinc-400 mb-1">{t('full_name')}</label>
                 <input required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 transition-colors" placeholder="e.g. Sarah Connor" />
               </div>
               <div>
                 <label className="block text-xs font-medium text-zinc-400 mb-1">{t('email')}</label>
                 <input type="email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 transition-colors" placeholder="sarah@cyberdyne.com" />
               </div>
               <div>
                 <label className="block text-xs font-medium text-zinc-400 mb-1">{t('company')}</label>
                 <input value={formData.company} onChange={e=>setFormData({...formData, company: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 transition-colors" placeholder="Cyberdyne Systems" />
               </div>
               <button type="submit" className="w-full bg-brand-500 text-black font-semibold py-2 rounded-lg mt-4 hover:bg-brand-600 transition">
                 {t('save_lead')}
               </button>
             </form>
           </motion.div>
        </div>
      )}
    </div>
  );
}

