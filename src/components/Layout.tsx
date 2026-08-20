import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Users, Columns, Bot, BarChart3, LogOut, Settings, Cpu, DollarSign } from 'lucide-react';

export default function Layout() {
  const { t } = useTranslation();
  const { logout, user } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: t('dashboard'), path: '/app', icon: LayoutDashboard },
    { name: t('leads'), path: '/app/leads', icon: Users },
    { name: t('pipeline'), path: '/app/pipeline', icon: Columns },
    { name: t('reports'), path: '/app/reports', icon: BarChart3 },
    { name: t('ai_assistant', 'AI Assistant'), path: '/app/ai', icon: Bot },
    { name: t('pricing', 'Pricing'), path: '/app/pricing', icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      {/* Sidebar background styling */}
      <div className="w-64 border-r border-white/5 glass-dark flex flex-col h-screen sticky top-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-brand-500 flex items-center justify-center neon-border shadow-lg shadow-brand-500/20">
            <Cpu size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white autocomplete to-zinc-400">
            {t('app_name')}
          </span>
        </div>

        <div className="px-4 pb-4">
          <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs uppercase">
              {user?.email?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.displayName || 'User'}</p>
              <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {navItems.map((item) => {
            const active = location.pathname === item.path || (item.path !== '/app' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium ${
                  active ? 'bg-gradient-to-r from-accent-500/20 to-transparent text-white border-l-2 border-accent-400' : 'text-zinc-400 hover:text-white hover:bg-white/5'
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
            className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white hover:bg-white/5 w-full rounded-lg transition text-sm font-medium"
          >
            <LogOut size={18} className="opacity-70" />
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
