
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Clock, 
  History, 
  Filter, 
  ChevronDown, 
  FileSpreadsheet, 
  FileJson, 
  Printer, 
  FileText,
  Download
} from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { isCashIn, formatCurrency } from '../utils/finance';

interface TransactionTableProps {
  transactions: Transaction[];
  onViewAll?: () => void;
  isFullView?: boolean;
  language: 'en' | 'bn';
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, onViewAll, isFullView, language }) => {
  const [selectedType, setSelectedType] = useState<TransactionType | 'ALL'>('ALL');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate counts for each transaction type
  const counts = useMemo(() => {
    const initialCounts: Record<string, number> = {
      [TransactionType.CD]: 0,
      [TransactionType.LR]: 0,
      [TransactionType.ID]: 0,
      [TransactionType.BC]: 0,
      [TransactionType.CW]: 0,
      [TransactionType.LD]: 0,
    };
    
    transactions.forEach(tx => {
      if (initialCounts[tx.type] !== undefined) {
        initialCounts[tx.type]++;
      }
    });
    
    return initialCounts;
  }, [transactions]);

  const displayTransactions = useMemo(() => {
    if (selectedType === 'ALL') return transactions;
    return transactions.filter(tx => tx.type === selectedType);
  }, [transactions, selectedType]);

  const t = {
    ledger: language === 'en' ? 'Transaction Ledger' : 'লেনদেনের লেজার',
    recent: language === 'en' ? 'Recent Activities' : 'সাম্প্রতিক কার্যকলাপ',
    ledgerDesc: language === 'en' ? 'Comprehensive historical records' : 'বিস্তারিত ঐতিহাসিক রেকর্ড',
    recentDesc: language === 'en' ? 'Latest filtered entries' : 'সাম্প্রতিক ফিল্টার করা এন্ট্রি',
    viewFull: language === 'en' ? 'View Full History' : 'সম্পূর্ণ ইতিহাস দেখুন',
    export: language === 'en' ? 'Export Report' : 'রিপোর্ট এক্সপোর্ট',
    insights: language === 'en' ? 'Section Insights & Filter' : 'বিভাগ ইনসাইট ও ফিল্টার',
    all: language === 'en' ? 'All' : 'সব',
    timestamp: language === 'en' ? 'Timestamp' : 'সময়',
    category: language === 'en' ? 'Category' : 'বিভাগ',
    in: language === 'en' ? 'In (৳)' : 'জমা (৳)',
    out: language === 'en' ? 'Out (৳)' : 'খরচ (৳)',
    status: language === 'en' ? 'Status' : 'অবস্থা',
    noFound: language === 'en' ? 'No Records Found' : 'কোন রেকর্ড পাওয়া যায়নি',
    success: language === 'en' ? 'Success' : 'সফল',
    pending: language === 'en' ? 'Pending' : 'পেন্ডিং',
    failed: language === 'en' ? 'Failed' : 'ব্যর্থ',
    excel: language === 'en' ? 'Microsoft Excel' : 'মাইক্রোসফট এক্সেল',
    word: language === 'en' ? 'Microsoft Word' : 'মাইক্রোসফট ওয়ার্ড',
    json: language === 'en' ? 'JSON Data' : 'জেসন (JSON)',
    pdf: language === 'en' ? 'Print / PDF' : 'প্রিন্ট / PDF',
    selectFormat: language === 'en' ? 'Select Format' : 'ফরম্যাট নির্বাচন করুন',
  };

  const exportToCSV = () => {
    const headers = [t.timestamp, t.category, t.in, t.out, t.status];
    const rows = displayTransactions.map(tx => [
      `"${new Date(tx.timestamp).toLocaleString()}"`,
      `"${tx.type}"`,
      isCashIn(tx.type) ? tx.amount : '0',
      !isCashIn(tx.type) ? tx.amount : '0',
      `"${tx.status}"`
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob(["\ufeff", csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `NexusBank_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    setIsExportMenuOpen(false);
  };

  const exportToWord = () => {
    const tableHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Nexus Bank Report</title></head>
      <body>
        <h2 style="font-family: sans-serif;">${t.ledger}</h2>
        <p style="font-family: sans-serif;">Generated on: ${new Date().toLocaleString()}</p>
        <table border="1" style="border-collapse: collapse; width: 100%; font-family: sans-serif;">
          <tr style="background-color: #f1f5f9; font-weight: bold;">
            <th style="padding: 10px;">${t.timestamp}</th>
            <th style="padding: 10px;">${t.category}</th>
            <th style="padding: 10px;">${t.in}</th>
            <th style="padding: 10px;">${t.out}</th>
            <th style="padding: 10px;">${t.status}</th>
          </tr>
          ${displayTransactions.map(tx => `
            <tr>
              <td style="padding: 8px;">${new Date(tx.timestamp).toLocaleString()}</td>
              <td style="padding: 8px;">${tx.type}</td>
              <td style="padding: 8px; text-align: right; color: green;">${isCashIn(tx.type) ? formatCurrency(tx.amount) : '—'}</td>
              <td style="padding: 8px; text-align: right; color: red;">${!isCashIn(tx.type) ? formatCurrency(tx.amount) : '—'}</td>
              <td style="padding: 8px;">${tx.status}</td>
            </tr>
          `).join('')}
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', tableHtml], { type: 'application/msword' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `NexusBank_Report_${new Date().toISOString().split('T')[0]}.doc`);
    link.click();
    setIsExportMenuOpen(false);
  };

  const exportToJSON = () => {
    const blob = new Blob([JSON.stringify(displayTransactions, null, 2)], { type: 'application/json' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `NexusBank_Data_${new Date().toISOString().split('T')[0]}.json`);
    link.click();
    setIsExportMenuOpen(false);
  };

  const handlePrint = () => {
    // Close the menu first to ensure it's not visible in the print output
    setIsExportMenuOpen(false);
    
    // Use requestAnimationFrame to wait for the UI update to finish before triggering print
    requestAnimationFrame(() => {
        // Double requestAnimationFrame to ensure the next frame (where menu is hidden) is rendered
        requestAnimationFrame(() => {
            window.print();
        });
    });
  };

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden transition-theme print:shadow-none print:border-none print:m-0">
      {/* Header Section */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#1E293B] print:hidden">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">
            {isFullView ? t.ledger : t.recent}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isFullView ? t.ledgerDesc : t.recentDesc}
          </p>
        </div>
        
        <div className="flex items-center gap-2 relative" ref={exportMenuRef}>
          {!isFullView && onViewAll && (
            <button 
              onClick={onViewAll}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline px-3 py-1.5"
            >
              {t.viewFull}
            </button>
          )}
          
          <button 
            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
            className={`flex items-center gap-2 text-xs font-black px-5 py-2.5 rounded-xl transition-all border active:scale-95 ${
              isExportMenuOpen 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 border-blue-600' 
                : 'text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm'
            }`}
          >
            <Download size={14} strokeWidth={3} />
            {t.export} 
            <ChevronDown size={14} className={`transition-transform duration-300 ${isExportMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Export Dropdown Menu */}
          {isExportMenuOpen && (
            <div className="absolute top-full right-0 mt-3 w-64 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-slate-50 dark:border-slate-800/50 mb-1">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.selectFormat}</p>
              </div>
              
              <button 
                onClick={exportToCSV}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                  <FileSpreadsheet size={16} />
                </div>
                {t.excel}
              </button>

              <button 
                onClick={exportToWord}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                  <FileText size={16} />
                </div>
                {t.word}
              </button>

              <button 
                onClick={exportToJSON}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <div className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                  <FileJson size={16} />
                </div>
                {t.json}
              </button>

              <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-1 mx-2" />

              <button 
                onClick={handlePrint}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
              >
                <div className="p-1.5 bg-rose-100 dark:bg-rose-900/30 rounded-lg text-rose-600 dark:text-rose-400">
                  <Printer size={16} />
                </div>
                {t.pdf}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800 print:hidden">
        <div className="flex items-center gap-3 mb-3">
           <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
             <Filter size={12} className="text-slate-400" />
             {t.insights}
           </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedType('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${
              selectedType === 'ALL'
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-800'
            }`}
          >
            {t.all} ({transactions.length})
          </button>
          
          {(Object.values(TransactionType)).map((type) => {
            const isActive = selectedType === type;
            const count = counts[type] || 0;
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all border flex items-center gap-2 group ${
                  isActive
                    ? getTypeActiveStyle(type)
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <span>{type}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                  isActive ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Print-only Header (Visible only during window.print()) */}
      <div className="hidden print:block p-8 border-b-2 border-slate-900 mb-6">
          <h2 className="text-3xl font-black uppercase tracking-tighter">{t.ledger}</h2>
          <p className="text-sm font-bold mt-1 opacity-60">Nexus Bank Official Report • {new Date().toLocaleDateString()}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 print:text-slate-900 print:bg-slate-100">
              <th className="px-6 py-5">{t.timestamp}</th>
              <th className="px-6 py-5">{t.category}</th>
              <th className="px-6 py-5 text-right">{t.in}</th>
              <th className="px-6 py-5 text-right">{t.out}</th>
              <th className="px-6 py-5">{t.status}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 print:divide-slate-400">
            {displayTransactions.length > 0 ? (
              displayTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors group print:hover:bg-white">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-500 transition-colors print:hidden">
                        <Clock size={16} />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 print:text-slate-900">
                        {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-tighter shadow-sm print:shadow-none print:border print:border-slate-300 ${getTypeStyle(tx.type)}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className={`px-6 py-5 text-sm font-bold text-right ${isCashIn(tx.type) ? 'text-emerald-600 dark:text-emerald-400 print:text-emerald-700' : 'text-slate-300 dark:text-slate-700 print:text-slate-400'}`}>
                    {isCashIn(tx.type) ? `+ ${formatCurrency(tx.amount)}` : '—'}
                  </td>
                  <td className={`px-6 py-5 text-sm font-bold text-right ${!isCashIn(tx.type) ? 'text-rose-600 dark:text-rose-400 print:text-rose-700' : 'text-slate-300 dark:text-slate-700 print:text-slate-400'}`}>
                    {!isCashIn(tx.type) ? `- ${formatCurrency(tx.amount)}` : '—'}
                  </td>
                  <td className="px-6 py-5">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                      tx.status === 'Success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 print:text-emerald-700' : 
                      tx.status === 'Pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 print:text-emerald-700' : 
                      'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 print:text-emerald-700'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full animate-pulse print:hidden ${
                        tx.status === 'Success' ? 'bg-emerald-500' : 
                        tx.status === 'Pending' ? 'bg-amber-500' : 'bg-rose-500'
                      }`} />
                      {tx.status === 'Success' ? t.success : tx.status === 'Pending' ? t.pending : t.failed}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-40">
                    <History size={48} className="text-slate-300" />
                    <p className="text-slate-500 dark:text-slate-400 font-bold">{t.noFound}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Print-only Footer */}
      <div className="hidden print:block p-8 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-10">
          Generated via Nexus Bank Dashboard | Private & Confidential
      </div>
    </div>
  );
};

const getTypeActiveStyle = (type: TransactionType): string => {
  switch (type) {
    case TransactionType.CD: return 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30';
    case TransactionType.LR: return 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-500/30';
    case TransactionType.ID: return 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/30';
    case TransactionType.BC: return 'bg-amber-600 border-amber-600 text-white shadow-lg shadow-amber-500/30';
    case TransactionType.CW: return 'bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-500/30';
    case TransactionType.LD: return 'bg-slate-600 border-slate-600 text-white shadow-lg shadow-slate-500/30';
    default: return 'bg-slate-600 text-white';
  }
};

const getTypeStyle = (type: TransactionType): string => {
  switch (type) {
    case TransactionType.CD: return 'bg-blue-100 text-blue-700 dark:bg-blue-700/20 dark:text-blue-400';
    case TransactionType.LR: return 'bg-purple-100 text-purple-700 dark:bg-purple-700/20 dark:text-purple-400';
    case TransactionType.ID: return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-700/20 dark:text-emerald-400';
    case TransactionType.BC: return 'bg-amber-100 text-amber-700 dark:bg-amber-700/20 dark:text-amber-400';
    case TransactionType.CW: return 'bg-rose-100 text-rose-700 dark:bg-rose-700/20 dark:text-rose-400';
    case TransactionType.LD: return 'bg-slate-100 text-slate-700 dark:bg-slate-700/20 dark:text-slate-400';
    default: return 'bg-gray-100 text-gray-700';
  }
};
