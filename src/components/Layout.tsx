import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Users, Columns, Bot, BarChart3, LogOut, Cpu, DollarSign, Globe, LogIn } from 'lucide-react';

export default function Layout() {
  const { t, i18n } = useTranslation();
  const { logout, user, loading, loginWithGoogle } = useAuth();
  const location = useLocation();

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith('es') ? 'en' : 'es';
    i18n.changeLanguage(nextLang);
  };

  // 1. Estado de carga mientras Firebase verifica la sesión
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center animate-pulse">
            <Cpu size={20} className="text-white" />
          </div>
          <p className="text-sm text-zinc-400 font-medium">Iniciando SmartCRM AI...</p>
        </div>
      </div>
    );
  }

  // 2. Si no hay usuario autenticado, renderiza la pantalla de Login con Google
  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="w-full max-w-md bg-zinc-900/80 border border-white/10 rounded-2xl p-8 backdrop-blur-xl relative z-10 text-center shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-brand-500 flex items-center justify-center mx-auto mb-4 neon-border shadow-lg shadow-brand-500/20">
            <Cpu size={24} className="text-white" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 mb-2">
            SmartCRM AI
          </h1>
          <p className="text-sm text-zinc-400 mb-8">
            Ingresa con tu cuenta corporativa para acceder a la demo.
          </p>

          <button
            onClick={() => loginWithGoogle()}
            className="w-full py-3.5 px-4 bg-white hover:bg-zinc-100 text-zinc-950 font-semibold rounded-xl flex items-center justify-center gap-3 transition shadow-lg hover:shadow-white/10"
          >
            <LogIn size={18} className="text-zinc-900" />
            <span>Continuar con Google</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. Renderizado habitual del Dashboard cuando el usuario SÍ está autenticado
  const navItems = [
    { name: t('dashboard'), path: '/app', icon: LayoutDashboard },
    { name: t('leads'), path: '/app/leads', icon: Users },
    { name: t('pipeline'), path: '/app/pipeline', icon: Columns },
    { name: t('reports'), path: '/app/reports', icon: BarChart3 },
    { name: t('ai_assistant'), path: '/app/ai', icon: Bot },
    { name: t('pricing'), path: '/app/pricing', icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      {/* Sidebar background styling */}
      <div className="w-64 border-r border-white/5 glass-dark flex flex-col h-screen sticky top-0">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-brand-500 flex items-center justify-center neon-border shadow-lg shadow-brand-500/20">
              <Cpu size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              {t('app_name')}
            </span>
          </div>
        </div>

        {/* User Card & Language Selector */}
        <div className="px-4 pb-2 space-y-2">
          <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3 border border-white/5">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs uppercase text-brand-400 border border-brand-500/30">
              {user?.email?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-white">{user?.displayName || t('sales_pro')}</p>
              <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
            </div>
          </div>

          {/* Language Toggle Button */}
          <button
            onClick={toggleLanguage}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-xs text-zinc-300 transition"
            title="Cambiar idioma / Switch language"
          >
            <div className="flex items-center gap-2">
              <Globe size={14} className="text-brand-400" />
              <span>{i18n.language.startsWith('es') ? '🇪🇸 Español' : '🇺🇸 English'}</span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 uppercase">
              {i18n.language.startsWith('es') ? 'ES' : 'EN'}
            </span>
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-3">
          {navItems.map((item) => {
            const active = location.pathname === item.path || (item.path !== '/app' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                  active ? 'bg-gradient-to-r from-accent-500/20 to-transparent text-white border-l-2 border-accent-400 shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} className={active ? 'text-accent-400' : 'opacity-70'} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 text-zinc-400 hover:text-white hover:bg-white/5 w-full rounded-xl transition text-sm font-medium"
          >
            <LogOut size={18} className="opacity-70 text-rose-400" />
            {t('logout')}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        <div className="absolute inset-0 pointer-events-none z-0">
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px]" />
        </div>
        <div className="p-8 relative z-10 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
