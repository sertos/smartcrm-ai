import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Search, Plus, MoreVertical, Sparkles, X } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  status: string;
  score: number;
}

export default function Leads() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', email: '', company: '' });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'leads'), where('userId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const data: Lead[] = [];
      snap.forEach(d => data.push({ id: d.id, ...d.data() } as Lead));
      setLeads(data);
    }, (err) => {
       console.error("Firestore Error: ", JSON.stringify({
          error: err.message, operationType: 'list', path: 'leads'
       }));
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
        score: Math.floor(Math.random() * 100),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setShowAdd(false);
      setFormData({ name: '', email: '', company: '' });
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 relative h-[calc(100vh-64px)] flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('leads')}</h1>
          <p className="text-zinc-400 mt-1">{t('manage_score_contacts')}</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-brand-500 hover:bg-brand-600 text-black font-semibold px-4 py-2 rounded-lg transition shadow-[0_0_15px_rgba(34,197,94,0.3)] flex items-center gap-2"
        >
          <Plus size={18} /> {t('add_lead')}
        </button>
      </div>

      <div className="glass-dark border border-white/5 rounded-2xl overflow-hidden flex-1 flex flex-col">
        <div className="p-4 border-b border-white/5 flex gap-4 bg-white/[0.02]">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder={t('search_leads')}
              className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>
        </div>
        
        <div className="overflow-auto flex-1 p-4">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-black/20 rounded-lg">
              <tr>
                <th className="px-6 py-3 font-medium rounded-tl-lg">{t('name')}</th>
                <th className="px-6 py-3 font-medium">{t('company')}</th>
                <th className="px-6 py-3 font-medium">{t('status')}</th>
                <th className="px-6 py-3 font-medium">{t('ai_score')}</th>
                <th className="px-6 py-3 rounded-tr-lg"></th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={lead.id} 
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{lead.name}</div>
                    <div className="text-zinc-500 text-xs mt-1">{lead.email}</div>
                  </td>
                  <td className="px-6 py-4 text-zinc-300">{lead.company}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-white/10 rounded-md text-xs font-medium text-zinc-300 capitalize">
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center font-bold text-transparent bg-clip-text bg-gradient-to-br from-brand-400 to-accent-400">
                         {lead.score || 0}
                       </div>
                       {lead.score > 80 && <Sparkles size={14} className="text-brand-400" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-zinc-500 hover:text-white transition">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </motion.tr>
              ))}
              {leads.length === 0 && (
                <tr>
                   <td colSpan={5} className="text-center py-12 text-zinc-500">{t('no_leads')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
