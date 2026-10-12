import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Check, Cpu } from 'lucide-react';

export default function Pricing() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="mb-8 text-center mt-6">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 text-white">{t('pricing_plans')}</h1>
        <p className="text-zinc-400 max-w-xl mx-auto text-sm">{t('pricing_subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {/* Starter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-dark border border-white/10 p-8 rounded-3xl relative flex flex-col justify-between"
        >
          <div>
            <h3 className="text-xl font-bold mb-1 text-white">{t('starter')}</h3>
            <p className="text-zinc-400 text-xs mb-6">{t('starter_desc')}</p>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-white">$29</span>
              <span className="text-zinc-500 text-sm">{t('per_month')}</span>
            </div>
            <button className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition font-semibold text-sm mb-6 text-white">
              {t('get_started')}
            </button>
            <ul className="space-y-3.5 text-xs text-zinc-300">
              <li className="flex items-center gap-2.5"><Check size={15} className="text-brand-500 shrink-0" /> {t('p_starter_1')}</li>
              <li className="flex items-center gap-2.5"><Check size={15} className="text-brand-500 shrink-0" /> {t('p_starter_2')}</li>
              <li className="flex items-center gap-2.5"><Check size={15} className="text-brand-500 shrink-0" /> {t('p_starter_3')}</li>
              <li className="flex items-center gap-2.5"><Check size={15} className="text-brand-500 shrink-0" /> {t('p_starter_4')}</li>
            </ul>
          </div>
        </motion.div>

        {/* Professional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass border border-brand-500/50 p-8 rounded-3xl relative transform md:-translate-y-3 shadow-[0_0_40px_rgba(34,197,94,0.15)] flex flex-col justify-between bg-zinc-900/90"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-brand-400 to-accent-400 text-black font-bold text-[11px] px-3.5 py-1 rounded-full uppercase tracking-wider shadow-lg">
            {t('most_popular')}
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1 flex items-center gap-2 text-white">
              <Cpu size={20} className="text-brand-400" /> {t('professional')}
            </h3>
            <p className="text-zinc-400 text-xs mb-6">{t('professional_desc')}</p>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-white">$99</span>
              <span className="text-zinc-500 text-sm">{t('per_month')}</span>
            </div>
            <button className="w-full py-2.5 rounded-xl bg-brand-500 text-black hover:bg-brand-400 transition font-bold text-sm mb-6 shadow-lg shadow-brand-500/20">
              {t('start_free_trial')}
            </button>
            <ul className="space-y-3.5 text-xs text-zinc-200">
              <li className="flex items-center gap-2.5"><Check size={15} className="text-brand-400 shrink-0" /> {t('p_pro_1')}</li>
              <li className="flex items-center gap-2.5"><Check size={15} className="text-brand-400 shrink-0" /> {t('p_pro_2')}</li>
              <li className="flex items-center gap-2.5"><Check size={15} className="text-brand-400 shrink-0" /> {t('p_pro_3')}</li>
              <li className="flex items-center gap-2.5"><Check size={15} className="text-brand-400 shrink-0" /> {t('p_pro_4')}</li>
              <li className="flex items-center gap-2.5"><Check size={15} className="text-brand-400 shrink-0" /> {t('p_pro_5')}</li>
            </ul>
          </div>
        </motion.div>

        {/* Enterprise */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-dark border border-white/10 p-8 rounded-3xl relative flex flex-col justify-between"
        >
          <div>
            <h3 className="text-xl font-bold mb-1 text-white">{t('enterprise')}</h3>
            <p className="text-zinc-400 text-xs mb-6">{t('enterprise_desc')}</p>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-white">{t('custom_price')}</span>
            </div>
            <button className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition font-semibold text-sm mb-6 text-white">
              {t('contact_sales')}
            </button>
            <ul className="space-y-3.5 text-xs text-zinc-300">
              <li className="flex items-center gap-2.5"><Check size={15} className="text-brand-500 shrink-0" /> {t('p_ent_1')}</li>
              <li className="flex items-center gap-2.5"><Check size={15} className="text-brand-500 shrink-0" /> {t('p_ent_2')}</li>
              <li className="flex items-center gap-2.5"><Check size={15} className="text-brand-500 shrink-0" /> {t('p_ent_3')}</li>
              <li className="flex items-center gap-2.5"><Check size={15} className="text-brand-500 shrink-0" /> {t('p_ent_4')}</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
