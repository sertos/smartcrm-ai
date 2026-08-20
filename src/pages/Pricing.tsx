import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Check, Cpu } from 'lucide-react';

export default function Pricing() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="mb-8 text-center mt-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{t('pricing_plans')}</h1>
        <p className="text-zinc-400 max-w-xl mx-auto">{t('pricing_subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="glass-dark border border-white/5 p-8 rounded-3xl relative">
           <h3 className="text-xl font-bold mb-2">{t('starter')}</h3>
           <p className="text-zinc-400 text-sm mb-6">For small teams getting started.</p>
           <div className="mb-8"><span className="text-4xl font-extrabold">$29</span><span className="text-zinc-500">/mo</span></div>
           <button className="w-full py-3 rounded-full bg-white/5 hover:bg-white/10 transition font-semibold mb-8">{t('get_started')}</button>
           <ul className="space-y-4 text-sm text-zinc-300">
             <li className="flex items-center gap-3"><Check size={16} className="text-brand-500"/> Up to 1,000 Leads</li>
             <li className="flex items-center gap-3"><Check size={16} className="text-brand-500"/> Basic Pipeline</li>
             <li className="flex items-center gap-3"><Check size={16} className="text-brand-500"/> Standard Support</li>
           </ul>
        </motion.div>

        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="glass border border-brand-500/50 p-8 rounded-3xl relative transform md:-translate-y-4 shadow-[0_0_40px_rgba(34,197,94,0.15)]">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-brand-400 to-accent-400 text-black font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">{t('most_popular')}</div>
           <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Cpu size={20} className="text-brand-500"/> {t('professional')}</h3>
           <p className="text-zinc-400 text-sm mb-6">For growing businesses needing AI.</p>
           <div className="mb-8"><span className="text-4xl font-extrabold">$99</span><span className="text-zinc-500">/mo</span></div>
           <button className="w-full py-3 rounded-full bg-white text-black hover:bg-zinc-200 transition font-bold mb-8 shadow-lg shadow-white/10">{t('start_free_trial')}</button>
           <ul className="space-y-4 text-sm text-zinc-300">
             <li className="flex items-center gap-3"><Check size={16} className="text-brand-500"/> Unlimited Leads</li>
             <li className="flex items-center gap-3"><Check size={16} className="text-brand-500"/> Advanced AI Scoring</li>
             <li className="flex items-center gap-3"><Check size={16} className="text-brand-500"/> Automated Emails</li>
             <li className="flex items-center gap-3"><Check size={16} className="text-brand-500"/> Custom Pipelines</li>
           </ul>
        </motion.div>

        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}} className="glass-dark border border-white/5 p-8 rounded-3xl relative">
           <h3 className="text-xl font-bold mb-2">{t('enterprise')}</h3>
           <p className="text-zinc-400 text-sm mb-6">For large organizations.</p>
           <div className="mb-8"><span className="text-4xl font-extrabold">Custom</span></div>
           <button className="w-full py-3 rounded-full bg-white/5 hover:bg-white/10 transition font-semibold mb-8">{t('contact_sales')}</button>
           <ul className="space-y-4 text-sm text-zinc-300">
             <li className="flex items-center gap-3"><Check size={16} className="text-brand-500"/> Dedicated AI Model</li>
             <li className="flex items-center gap-3"><Check size={16} className="text-brand-500"/> Advanced Analytics</li>
             <li className="flex items-center gap-3"><Check size={16} className="text-brand-500"/> 24/7 Phone Support</li>
           </ul>
        </motion.div>
      </div>
    </div>
  );
}
