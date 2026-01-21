
import React from 'react';
import { Sun, Moon, LayoutDashboard, History, Settings as SettingsIcon, Bell, Search, User, Plus, HandCoins, PiggyBank } from 'lucide-react';
import { View } from '../App';

interface LayoutProps {
  children: React.ReactNode;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenAddTransaction: () => void;
  currentView: View;
  onViewChange: (view: View) => void;
  bankName: string;
  bankLogo: string | null;
  userName: string;
  userAvatar: string | null;
  language: 'en' | 'bn';
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  isDarkMode, 
  onToggleTheme, 
  onOpenAddTransaction,
  currentView,
  onViewChange,
  bankName,
  bankLogo,
  userName,
  userAvatar,
  language
}) => {
  const t = {
    dashboard: language === 'en' ? 'Dashboard' : 'ড্যাশবোর্ড',
    transactions: language === 'en' ? 'Transactions' : 'লেনদেন',
    disbursements: language === 'en' ? 'Disbursement' : 'ডিসবার্সমেন্ট',
    fdrDps: language === 'en' ? 'FDR/DPS' : 'এফডিআর/ডিপিএস',
    alerts: language === 'en' ? 'Alerts' : 'সতর্কতা',
    settings: language === 'en' ? 'Settings' : 'সেটিংস',
    search: language === 'en' ? 'Search records...' : 'রেকর্ড খুঁজুন...',
    quickAdd: language === 'en' ? 'Quick Add Transaction' : 'নতুন লেনদেন',
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-20 md:w-64 bg-white dark:bg-[#1E293B] border-r border-slate-200 dark:border-slate-800 transition-all duration-300 z-40">
        <div className="p-6 flex items-center gap-3 cursor-pointer" onClick={() => onViewChange('dashboard')}>
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30 overflow-hidden">
            {bankLogo ? (
              <img src={bankLogo} alt="Bank Logo" className="w-full h-full object-cover" />
            ) : (
              bankName.charAt(0)
            )}
          </div>
          <span className="hidden md:block text-xl font-bold dark:text-white tracking-tight truncate">{bankName}</span>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label={t.dashboard} 
            active={currentView === 'dashboard'} 
            onClick={() => onViewChange('dashboard')}
          />
          <NavItem 
            icon={<HandCoins size={20} />} 
            label={t.disbursements} 
            active={currentView === 'disbursements'} 
            onClick={() => onViewChange('disbursements')}
          />
          <NavItem 
            icon={<PiggyBank size={20} />} 
            label={t.fdrDps} 
            active={currentView === 'fdrDps'} 
            onClick={() => onViewChange('fdrDps')}
          />
          <NavItem 
            icon={<History size={20} />} 
            label={t.transactions} 
            active={currentView === 'transactions'} 
            onClick={() => onViewChange('transactions')}
          />
          <NavItem 
            icon={<Bell size={20} />} 
            label={t.alerts} 
            active={currentView === 'alerts'}
            onClick={() => onViewChange('alerts')}
          />
          <NavItem 
            icon={<SettingsIcon size={20} />} 
            label={t.settings} 
            active={currentView === 'settings'}
            onClick={() => onViewChange('settings')}
          />
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-20 md:ml-64 min-h-screen">
        {/* The top bar is hidden when in fdrDps view for a cleaner look */}
        {currentView !== 'fdrDps' && (
          <header className="sticky top-0 h-16 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 flex items-center justify-between z-30 transition-theme animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-2 flex-1">
              <button 
                onClick={onOpenAddTransaction}
                className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-full shadow-lg shadow-blue-500/40 transition-all active:scale-90"
                title={t.quickAdd}
              >
                <Plus size={22} strokeWidth={2.5} />
              </button>

              <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-full px-4 py-2 w-full max-w-xs md:max-w-sm ml-2 border border-transparent dark:border-slate-700 transition-theme">
                <Search size={18} className="text-slate-400" />
                <input 
                  type="text" 
                  placeholder={t.search}
                  className="bg-transparent border-none focus:outline-none ml-2 text-sm w-full dark:text-slate-100 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4 ml-4">
              <button 
                onClick={onToggleTheme}
                className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-theme group"
                aria-label="Toggle Theme"
              >
                {isDarkMode 
                  ? <Sun size={20} className="text-yellow-400 group-hover:rotate-45 transition-transform" /> 
                  : <Moon size={20} className="text-slate-600 group-hover:-rotate-12 transition-transform" />
                }
              </button>
              <div className="hidden sm:block h-6 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1" />
              <div className="flex items-center gap-3 pl-2">
                <span className="hidden md:block text-sm font-semibold dark:text-slate-300">{userName}</span>
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-slate-700 overflow-hidden">
                  {userAvatar ? (
                    <img src={userAvatar} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <User size={20} />
                  )}
                </div>
              </div>
            </div>
          </header>
        )}
        <div className="p-0">
          {children}
        </div>
      </main>
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
    active 
      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold' 
      : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
  }`}>
    <span className={active ? 'text-white' : ''}>{icon}</span>
    <span className="hidden md:block text-sm">{label}</span>
  </button>
);
