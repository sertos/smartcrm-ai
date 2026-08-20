import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Globe, ArrowRight, Activity, Cpu, Zap } from 'lucide-react';

export default function LandingPage() {
  const { t, i18n } = useTranslation();
  const { user, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'es' : 'en');
  };

  const handleCTA = async () => {
    if (user) {
      navigate('/app');
    } else {
      await loginWithGoogle();
      navigate('/app');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative overflow-hidden">
      {/* Abstract Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-accent-600/30 rounded-full blur-[120px] mix-blend-screen opacity-50 animate-pulse" />
        <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-brand-500/20 rounded-full blur-[150px] mix-blend-screen opacity-40" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-12 glass border-b-0 border-white/5 rounded-b-2xl mx-4 mt-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-brand-500 flex items-center justify-center neon-border">
            <Cpu size={18} className="text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">{t('app_name')}</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleLanguage} className="flex items-center gap-2 hover:bg-white/10 px-3 py-1.5 rounded-full transition text-sm">
            <Globe size={16} />
            {i18n.language.toUpperCase() === 'EN' ? '🇺🇸 EN' : '🇪🇸 ES'}
          </button>
          <button onClick={handleCTA} className="bg-white text-black px-5 py-2 rounded-full font-medium hover:bg-zinc-200 transition text-sm">
            {user ? t('dashboard') : t('login')}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-dark text-xs font-medium text-brand-400 mb-6 border border-brand-500/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
            </span>
            {t('slogan')}
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            {t('hero_title').split(' ').map((word, i) => 
              word.toUpperCase() === 'AI-POWERED' || word.toUpperCase() === 'IA' ? 
              <span key={i} className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-brand-400 inline-block px-2">{word}</span> : 
              word + ' '
            )}
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            {t('hero_subtitle')}
          </p>
          <button onClick={handleCTA} className="group relative inline-flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)]">
            {t('get_started')}
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 max-w-6xl w-full">
          {[
            { icon: <Activity className="text-accent-400" />, title: "Predictive Lead Scoring" },
            { icon: <Zap className="text-brand-400" />, title: "Automated Workflows" },
            { icon: <Cpu className="text-blue-400" />, title: "AI Assistant & Emails" }
          ].map((feat, idx) => (
             <motion.div 
               key={idx}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5, delay: 0.2 + idx * 0.1 }}
               className="glass-dark p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors text-left"
             >
               <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-4">
                 {feat.icon}
               </div>
               <h3 className="font-semibold text-lg mb-2">{feat.title}</h3>
               <p className="text-zinc-400 text-sm">Experience the future of sales with our deep learning models predicting your next big closure.</p>
             </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
