import React, { useState } from 'react';
import { 
  Sun, Moon, LayoutDashboard, History, Settings as SettingsIcon, 
  Bell, Search, User, Plus, HandCoins, PiggyBank,
  PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
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
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  const sidebarWidth = isCollapsed ? 'w-20' : 'w-64';
  const mainMargin = isCollapsed ? 'ml-20' : 'ml-64';

  return (
    <div className="flex">
      {/* Collapsible Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen ${sidebarWidth} bg-white dark:bg-[#1E293B] border-r border-slate-200 dark:border-slate-800 transition-all duration-300 z-40 flex flex-col`}>
        {/* Toggle Button at the top of Sidebar */}
        <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-end'}`}>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen size={22} /> : <PanelLeftClose size={22} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="mt-2 px-3 space-y-2 flex-1">
          <NavItem 
            icon={<LayoutDashboard size={22} />} 
            label={t.dashboard} 
            active={currentView === 'dashboard'} 
            onClick={() => onViewChange('dashboard')}
            isCollapsed={isCollapsed}
          />
          <NavItem 
            icon={<HandCoins size={22} />} 
            label={t.disbursements} 
            active={currentView === 'disbursements'} 
            onClick={() => onViewChange('disbursements')}
            isCollapsed={isCollapsed}
          />
          <NavItem 
            icon={<PiggyBank size={22} />} 
            label={t.fdrDps} 
            active={currentView === 'fdrDps'} 
            onClick={() => onViewChange('fdrDps')}
            isCollapsed={isCollapsed}
          />
          <NavItem 
            icon={<History size={22} />} 
            label={t.transactions} 
            active={currentView === 'transactions'} 
            onClick={() => onViewChange('transactions')}
            isCollapsed={isCollapsed}
          />
          <NavItem 
            icon={<Bell size={22} />} 
            label={t.alerts} 
            active={currentView === 'alerts'}
            onClick={() => onViewChange('alerts')}
            isCollapsed={isCollapsed}
          />
          <NavItem 
            icon={<SettingsIcon size={22} />} 
            label={t.settings} 
            active={currentView === 'settings'}
            onClick={() => onViewChange('settings')}
            isCollapsed={isCollapsed}
          />
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 ${mainMargin} transition-all duration-300 min-h-screen`}>
        {/* Header Bar - Now Unified for all views and includes Bank Identity */}
        <header className="sticky top-0 h-16 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 flex items-center justify-between z-30 transition-theme">
          
          <div className="flex items-center gap-4 flex-1">
            {/* Bank Identity - Permanently here on the left side */}
            <div className="flex items-center gap-3 pr-4 border-r border-slate-200 dark:border-slate-800 h-10 cursor-pointer" onClick={() => onViewChange('dashboard')}>
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/30 overflow-hidden flex-shrink-0">
                {bankLogo ? (
                  <img src={bankLogo} alt="Bank Logo" className="w-full h-full object-cover" />
                ) : (
                  bankName.charAt(0)
                )}
              </div>
              <span className="hidden lg:block text-lg font-black dark:text-white tracking-tighter truncate max-w-[150px]">
                {bankName}
              </span>
            </div>

            {/* Quick Add Button */}
            <button 
              onClick={onOpenAddTransaction}
              className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-full shadow-lg shadow-blue-500/40 transition-all active:scale-90 flex-shrink-0"
              title={t.quickAdd}
            >
              <Plus size={22} strokeWidth={2.5} />
            </button>

            {/* Search Bar */}
            <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-full px-4 py-2 w-full max-w-xs md:max-w-sm border border-transparent dark:border-slate-700 transition-theme">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder={t.search}
                className="bg-transparent border-none focus:outline-none ml-2 text-sm w-full dark:text-slate-100 placeholder:text-slate-400 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 ml-4">
            {/* Theme Toggle */}
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

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-2 group cursor-pointer">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-black dark:text-slate-200 leading-none">{userName}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Admin</span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-slate-700 overflow-hidden shadow-sm transition-colors group-hover:border-blue-500">
                {userAvatar ? (
                  <img src={userAvatar} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <User size={22} />
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-0">
          {children}
        </div>
      </main>
    </div>
  );
};

const NavItem: React.FC<{ 
  icon: React.ReactNode, 
  label: string, 
  active?: boolean, 
  onClick?: () => void,
  isCollapsed: boolean
}> = ({ icon, label, active, onClick, isCollapsed }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center group relative h-12 rounded-2xl transition-all duration-300 ${
      isCollapsed ? 'justify-center px-0' : 'px-4 gap-4'
    } ${
      active 
        ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
        : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
    }`}
  >
    <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
      {icon}
    </div>
    
    {!isCollapsed && (
      <span className={`text-sm font-black tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300 ${active ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`}>
        {label}
      </span>
    )}

    {/* Tooltip for Collapsed State */}
    {isCollapsed && (
      <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 text-white text-[11px] font-black rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-[100] whitespace-nowrap uppercase tracking-widest">
        {label}
      </div>
    )}

    {active && !isCollapsed && (
      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
    )}
  </button>
);