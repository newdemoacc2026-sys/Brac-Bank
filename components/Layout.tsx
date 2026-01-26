import React, { useState } from 'react';
import { 
  Sun, Moon, LayoutDashboard, History, Settings as SettingsIcon, 
  Bell, Search, User, Plus, HandCoins, PiggyBank,
  PanelLeftClose, PanelLeftOpen, CreditCard, SearchCode, Menu, X, Code2
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const t = {
    dashboard: language === 'en' ? 'Dashboard' : 'ড্যাশবোর্ড',
    transactions: language === 'en' ? 'Transactions' : 'লেনদেন',
    disbursements: language === 'en' ? 'Disbursement' : 'ডিসবার্সমেন্ট',
    fdrDps: language === 'en' ? 'FDR/DPS' : 'এফডিআর/ডিপিএস',
    inventory: language === 'en' ? 'Cards & Cheques' : 'কার্ড ও চেক',
    accounts: language === 'en' ? 'Acc Inquiry' : 'অ্যাকাউন্ট অনুসন্ধান',
    alerts: language === 'en' ? 'Alerts' : 'সতর্কতা',
    settings: language === 'en' ? 'Settings' : 'সেটিংস',
    search: language === 'en' ? 'Search records...' : 'রেকর্ড খুঁজুন...',
    quickAdd: language === 'en' ? 'Quick Add Transaction' : 'নতুন লেনদেন',
  };

  const sidebarWidth = isCollapsed ? 'w-20' : 'w-64';
  
  // Responsive margin: 0 on mobile, sidebar width on large screens
  const mainMargin = isCollapsed ? 'lg:ml-20' : 'lg:ml-64';

  const handleNavClick = (view: View) => {
    onViewChange(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Responsive Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen bg-white dark:bg-[#1E293B] border-r border-slate-200 dark:border-slate-800 transition-all duration-300 z-[60] flex flex-col
        ${sidebarWidth} 
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Toggle Button / Mobile Close */}
        <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 lg:block hidden">Navigation</span>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen size={22} /> : <PanelLeftClose size={22} />}
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="mt-2 px-3 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
          <NavItem 
            icon={<LayoutDashboard size={22} />} 
            label={t.dashboard} 
            active={currentView === 'dashboard'} 
            onClick={() => handleNavClick('dashboard')}
            isCollapsed={isCollapsed}
          />
          <NavItem 
            icon={<SearchCode size={22} />} 
            label={t.accounts} 
            active={currentView === 'accounts'} 
            onClick={() => handleNavClick('accounts')}
            isCollapsed={isCollapsed}
          />
          <NavItem 
            icon={<HandCoins size={22} />} 
            label={t.disbursements} 
            active={currentView === 'disbursements'} 
            onClick={() => handleNavClick('disbursements')}
            isCollapsed={isCollapsed}
          />
          <NavItem 
            icon={<PiggyBank size={22} />} 
            label={t.fdrDps} 
            active={currentView === 'fdrDps'} 
            onClick={() => handleNavClick('fdrDps')}
            isCollapsed={isCollapsed}
          />
          <NavItem 
            icon={<CreditCard size={22} />} 
            label={t.inventory} 
            active={currentView === 'inventory'} 
            onClick={() => handleNavClick('inventory')}
            isCollapsed={isCollapsed}
          />
          <NavItem 
            icon={<History size={22} />} 
            label={t.transactions} 
            active={currentView === 'transactions'} 
            onClick={() => handleNavClick('transactions')}
            isCollapsed={isCollapsed}
          />
          <NavItem 
            icon={<Bell size={22} />} 
            label={t.alerts} 
            active={currentView === 'alerts'}
            onClick={() => handleNavClick('alerts')}
            isCollapsed={isCollapsed}
          />
          <NavItem 
            icon={<SettingsIcon size={22} />} 
            label={t.settings} 
            active={currentView === 'settings'}
            onClick={() => handleNavClick('settings')}
            isCollapsed={isCollapsed}
          />
        </nav>

        {/* Branding Watermark */}
        <div className={`p-6 mt-auto border-t border-slate-50 dark:border-slate-800/50 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
           <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <Code2 size={16} />
           </div>
           {!isCollapsed && (
             <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Powered By</span>
                <span className="text-[11px] font-black text-slate-900 dark:text-white leading-tight">build by Ashiq</span>
             </div>
           )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 w-full ${mainMargin} transition-all duration-300 min-h-screen flex flex-col`}>
        {/* Header Bar */}
        <header className="sticky top-0 h-16 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 flex items-center justify-between z-40 transition-theme">
          
          <div className="flex items-center gap-2 md:gap-4 flex-1 overflow-hidden">
            {/* Mobile Hamburger */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 mr-1"
            >
              <Menu size={24} />
            </button>

            {/* Bank Identity */}
            <div className="flex items-center gap-2 md:gap-3 pr-2 md:pr-4 border-r border-slate-200 dark:border-slate-800 h-10 cursor-pointer flex-shrink-0" onClick={() => onViewChange('dashboard')}>
              <div className="w-8 h-8 md:w-9 md:h-9 bg-blue-600 rounded-lg md:rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/30 overflow-hidden flex-shrink-0">
                {bankLogo ? (
                  <img src={bankLogo} alt="Bank Logo" className="w-full h-full object-cover" />
                ) : (
                  bankName.charAt(0)
                )}
              </div>
              <span className="hidden sm:block text-base md:text-lg font-black dark:text-white tracking-tighter truncate max-w-[100px] md:max-w-[150px]">
                {bankName}
              </span>
            </div>

            {/* Quick Add Button */}
            <button 
              onClick={onOpenAddTransaction}
              className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white w-9 h-9 md:w-10 md:h-10 rounded-full shadow-lg shadow-blue-500/40 transition-all active:scale-90 flex-shrink-0"
              title={t.quickAdd}
            >
              <Plus size={22} strokeWidth={2.5} />
            </button>

            {/* Search Bar - Hidden on very small screens */}
            <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-full px-4 py-2 w-full max-w-xs border border-transparent dark:border-slate-700 transition-theme ml-2">
              <Search size={16} className="text-slate-400" />
              <input 
                type="text" 
                placeholder={t.search}
                className="bg-transparent border-none focus:outline-none ml-2 text-xs w-full dark:text-slate-100 placeholder:text-slate-400 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-1 md:gap-4 ml-2">
            {/* Theme Toggle */}
            <button 
              onClick={onToggleTheme}
              className="p-2 md:p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-theme group"
              aria-label="Toggle Theme"
            >
              {isDarkMode 
                ? <Sun size={20} className="text-yellow-400 group-hover:rotate-45 transition-transform" /> 
                : <Moon size={20} className="text-slate-600 group-hover:-rotate-12 transition-transform" />
              }
            </button>

            <div className="hidden xs:block h-6 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1" />

            {/* User Profile */}
            <div className="flex items-center gap-2 md:gap-3 pl-1 group cursor-pointer">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs md:text-sm font-black dark:text-slate-200 leading-none">{userName}</span>
                <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Admin</span>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-2xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-slate-700 overflow-hidden shadow-sm transition-colors group-hover:border-blue-500">
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
        <div className="flex-1 w-full max-w-full overflow-x-hidden p-0">
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
    
    <span className={`text-sm font-black tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300 
      ${isCollapsed ? 'lg:hidden opacity-0 w-0' : 'opacity-100'} 
      ${active ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}
    `}>
      {label}
    </span>

    {/* Tooltip for Collapsed State (Desktop only) */}
    {isCollapsed && (
      <div className="hidden lg:block absolute left-full ml-4 px-3 py-1.5 bg-slate-900 text-white text-[11px] font-black rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-[100] whitespace-nowrap uppercase tracking-widest">
        {label}
      </div>
    )}

    {active && (!isCollapsed || window.innerWidth < 1024) && (
      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
    )}
  </button>
);