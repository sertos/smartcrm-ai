import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

const STAGES = ['new', 'contacted', 'negotiation', 'won', 'lost'];

export default function Pipeline() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'leads'), where('userId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const data: any[] = [];
      snap.forEach(d => data.push({ id: d.id, ...d.data() }));
      setLeads(data);
    });
    return () => unsub();
  }, [user]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('leadId', id);
  };

  const handleDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('leadId');
    if (!id || !user) return;
    try {
      const leadRef = doc(db, 'leads', id);
      await updateDoc(leadRef, { status, updatedAt: serverTimestamp() });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{t('pipeline')}</h1>
        <p className="text-zinc-400 mt-1">{t('drag_drop_pipeline')}</p>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max h-full">
          {STAGES.map((stage) => (
            <div 
              key={stage} 
              className="w-80 flex flex-col bg-zinc-900/50 rounded-2xl border border-white/5 p-4"
              onDrop={(e) => handleDrop(e, stage)}
              onDragOver={handleDragOver}
            >
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="font-semibold capitalize flex items-center gap-2">
                  {stage === 'won' && <span className="w-2 h-2 rounded-full bg-brand-500" />}
                  {stage === 'lost' && <span className="w-2 h-2 rounded-full bg-red-500" />}
                  {stage === 'new' && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                  {stage === 'contacted' && <span className="w-2 h-2 rounded-full bg-yellow-500" />}
                  {stage === 'negotiation' && <span className="w-2 h-2 rounded-full bg-purple-500" />}
                  {t(stage)}
                </h3>
                <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-zinc-400">
                  {leads.filter(l => l.status === stage).length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                {leads.filter(l => l.status === stage).map((lead) => (
                  <motion.div
                    layoutId={lead.id}
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e as any, lead.id)}
                    className="bg-zinc-950 border border-white/10 p-4 rounded-xl cursor-grab active:cursor-grabbing hover:border-brand-500/50 transition-colors shadow-lg"
                  >
                    <p className="font-medium text-sm mb-1">{lead.name}</p>
                    <p className="text-xs text-zinc-500 mb-3">{lead.company || 'Unknown Company'}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono text-zinc-400 opacity-70">
                        {lead.score > 80 ? '🔥 Hot' : 'Warm'}
                      </span>
                      <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center font-bold text-[10px] bg-gradient-to-br from-brand-400 to-accent-400 text-black">
                         {lead.score || 0}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
