
import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TransactionForm } from './components/TransactionForm';
import { TransactionTable } from './components/TransactionTable';
import { AdvancedDatePicker } from './components/AdvancedDatePicker';
import { Settings } from './components/Settings';
import { DisbursementView } from './components/DisbursementView';
import { Transaction, TransactionType, Disbursement } from './types';

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', timestamp: '2024-05-20T10:30:00', type: TransactionType.CD, amount: 5000, status: 'Success' },
  { id: '2', timestamp: '2024-05-20T11:45:00', type: TransactionType.LD, amount: 50000, status: 'Pending' },
  { id: '3', timestamp: '2024-05-21T09:15:00', type: TransactionType.CW, amount: 1200, status: 'Success' },
  { id: '4', timestamp: '2024-05-21T14:20:00', type: TransactionType.BC, amount: 450, status: 'Success' },
  { id: '5', timestamp: '2024-05-19T16:00:00', type: TransactionType.ID, amount: 75, status: 'Success' },
];

const INITIAL_OFFICERS = ['Officer Rahim', 'Officer Karim', 'Officer Shila'];

export type View = 'dashboard' | 'transactions' | 'disbursements' | 'settings';

const App: React.FC = () => {
  // Persistence Helper
  const getStoredValue = <T,>(key: string, defaultValue: T): T => {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    try {
      return JSON.parse(stored) as T;
    } catch {
      return defaultValue;
    }
  };

  const [isDarkMode, setIsDarkMode] = useState(() => getStoredValue('nexus_darkMode', false));
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentView, setCurrentView] = useState<View>(() => getStoredValue('nexus_lastView', 'dashboard'));
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => 
    getStoredValue('nexus_transactions', INITIAL_TRANSACTIONS)
  );

  const [disbursements, setDisbursements] = useState<Disbursement[]>(() => 
    getStoredValue('nexus_disbursements', [])
  );

  const [loanOfficers, setLoanOfficers] = useState<string[]>(() => 
    getStoredValue('nexus_loanOfficers', INITIAL_OFFICERS)
  );
  
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Settings State
  const [bankName, setBankName] = useState(() => getStoredValue('nexus_bankName', 'Nexus Bank'));
  const [bankLogo, setBankLogo] = useState<string | null>(() => getStoredValue('nexus_bankLogo', null));
  const [language, setLanguage] = useState<'en' | 'bn'>(() => getStoredValue('nexus_language', 'en'));
  const [userName, setUserName] = useState(() => getStoredValue('nexus_userName', 'Admin Panel'));
  const [userAvatar, setUserAvatar] = useState<string | null>(() => getStoredValue('nexus_userAvatar', null));

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('nexus_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('nexus_disbursements', JSON.stringify(disbursements));
  }, [disbursements]);

  useEffect(() => {
    localStorage.setItem('nexus_loanOfficers', JSON.stringify(loanOfficers));
  }, [loanOfficers]);

  useEffect(() => {
    localStorage.setItem('nexus_lastView', JSON.stringify(currentView));
  }, [currentView]);

  useEffect(() => {
    localStorage.setItem('nexus_bankName', JSON.stringify(bankName));
    localStorage.setItem('nexus_bankLogo', JSON.stringify(bankLogo));
    localStorage.setItem('nexus_language', JSON.stringify(language));
    localStorage.setItem('nexus_userName', JSON.stringify(userName));
    localStorage.setItem('nexus_userAvatar', JSON.stringify(userAvatar));
    localStorage.setItem('nexus_darkMode', JSON.stringify(isDarkMode));
  }, [bankName, bankLogo, language, userName, userAvatar, isDarkMode]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => tx.timestamp.startsWith(selectedDate));
  }, [transactions, selectedDate]);

  const addTransaction = (newTx: Omit<Transaction, 'id' | 'timestamp' | 'status'>) => {
    const tx: Transaction = {
      ...newTx,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      status: 'Success'
    };
    setTransactions(prev => [tx, ...prev]);
    setIsFormOpen(false);
  };

  const addDisbursement = (newDis: Omit<Disbursement, 'id'>) => {
    const dis: Disbursement = {
      ...newDis,
      id: Math.random().toString(36).substr(2, 9)
    };
    setDisbursements(prev => [dis, ...prev]);
  };

  const deleteDisbursement = (id: string) => {
    setDisbursements(prev => prev.filter(d => d.id !== id));
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="space-y-10">
            <Dashboard 
              transactions={transactions} 
              selectedDate={selectedDate} 
              onDateChange={setSelectedDate}
              isDarkMode={isDarkMode}
              language={language}
            />
            <div className="w-full">
              <TransactionTable 
                transactions={filteredTransactions} 
                onViewAll={() => setCurrentView('transactions')}
                language={language}
              />
            </div>
          </div>
        );
      case 'transactions':
        return (
          <div className="w-full animate-in slide-in-from-bottom-4 duration-500">
            <TransactionTable 
              transactions={filteredTransactions} 
              isFullView 
              language={language}
            />
          </div>
        );
      case 'disbursements':
        return (
          <DisbursementView 
            disbursements={disbursements}
            loanOfficers={loanOfficers}
            onAddDisbursement={addDisbursement}
            onDeleteDisbursement={deleteDisbursement}
            language={language}
          />
        );
      case 'settings':
        return (
          <Settings 
            bankName={bankName}
            setBankName={setBankName}
            bankLogo={bankLogo}
            setBankLogo={setBankLogo}
            userName={userName}
            setUserName={setUserName}
            userAvatar={userAvatar}
            setUserAvatar={setUserAvatar}
            loanOfficers={loanOfficers}
            setLoanOfficers={setLoanOfficers}
            language={language}
            setLanguage={setLanguage}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0F172A] text-[#1A1A1A] dark:text-slate-100 transition-colors duration-300">
      <Layout 
        isDarkMode={isDarkMode} 
        onToggleTheme={toggleTheme} 
        onOpenAddTransaction={() => setIsFormOpen(true)}
        currentView={currentView}
        onViewChange={setCurrentView}
        bankName={bankName}
        bankLogo={bankLogo}
        userName={userName}
        userAvatar={userAvatar}
        language={language}
      >
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
          
          {/* Global Header with Date Selector (Hidden on Settings/Disbursements) */}
          {(currentView !== 'settings' && currentView !== 'disbursements') && (
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
              <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                  {currentView === 'dashboard' ? (language === 'en' ? 'Overview' : 'ওভারভিউ') : (language === 'en' ? 'Ledger' : 'লেজার')}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                  {currentView === 'dashboard' 
                    ? (language === 'en' ? 'Insight into your daily performance' : 'আপনার দৈনন্দিন কর্মক্ষমতা দেখুন')
                    : (language === 'en' ? `Transaction history for ${selectedDate}` : `${selectedDate}-এর লেনদেনের ইতিহাস`)}
                </p>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  {language === 'en' ? 'Select Data Range' : 'তারিখ নির্বাচন করুন'}
                </label>
                <AdvancedDatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
              </div>
            </div>
          )}

          {renderView()}
        </div>
      </Layout>

      {/* Transaction Modal Overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md animate-in zoom-in-95 duration-200">
            <TransactionForm 
              onAddTransaction={addTransaction} 
              onClose={() => setIsFormOpen(false)} 
              language={language}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
