import React, { useState, useMemo } from 'react';
import { 
  AreaChart, Area, 
  BarChart, Bar, 
  XAxis, YAxis, 
  CartesianGrid, Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  ArrowUpRight, ArrowDownRight, Activity, Wallet, 
  HandCoins, PiggyBank, CreditCard, SearchCode, 
  Users, BookOpen, Clock, ShieldCheck, ChevronRight
} from 'lucide-react';
import { Transaction, Disbursement, FdrDps, ChequeBook, DebitCard, BankAccount } from '../types';
import { calculateDailySummary, formatCurrency, calculateDynamicTrend } from '../utils/finance';

interface DashboardProps {
  transactions: Transaction[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  isDarkMode: boolean;
  language: 'en' | 'bn';
  // Additional Data for Snapshots
  accounts: BankAccount[];
  disbursements: Disbursement[];
  fdrDps: FdrDps[];
  cheques: ChequeBook[];
  cards: DebitCard[];
  onViewChange?: (view: any) => void;
}

const MOCK_CHART_DATA = [
  { name: 'May 15', volume: 4000, frequency: 22 },
  { name: 'May 16', volume: 3000, frequency: 15 },
  { name: 'May 17', volume: 2000, frequency: 28 },
  { name: 'May 18', volume: 2780, frequency: 12 },
  { name: 'May 19', volume: 1890, frequency: 35 },
  { name: 'May 20', volume: 2390, frequency: 18 },
  { name: 'May 21', volume: 3490, frequency: 25 },
];

export const Dashboard: React.FC<DashboardProps> = ({ 
  transactions, 
  selectedDate, 
  onDateChange, 
  isDarkMode, 
  language,
  accounts,
  disbursements,
  fdrDps,
  cheques,
  cards,
  onViewChange
}) => {
  const [activeMetric, setActiveMetric] = useState<'volume' | 'frequency'>('volume');

  const { currentSummary, trends, snapshots } = useMemo(() => {
    const curDate = new Date(selectedDate);
    const prevDate = new Date(curDate);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevDateStr = prevDate.toISOString().split('T')[0];

    const currentDayTxs = transactions.filter(t => t.timestamp.startsWith(selectedDate));
    const previousDayTxs = transactions.filter(t => t.timestamp.startsWith(prevDateStr));

    const daySummary = calculateDailySummary(currentDayTxs);
    const prevSummary = calculateDailySummary(previousDayTxs);

    const txByDate: Record<string, number> = {};
    const countByDate: Record<string, number> = {};
    
    transactions.forEach(tx => {
      const d = tx.timestamp.split('T')[0];
      txByDate[d] = (txByDate[d] || 0) + tx.amount;
      countByDate[d] = (countByDate[d] || 0) + 1;
    });
    
    const datesCount = Object.keys(txByDate).length || 1;
    const avgVolume = Object.values(txByDate).reduce((a, b) => a + b, 0) / datesCount;
    const avgCount = Object.values(countByDate).reduce((a, b) => a + b, 0) / datesCount;

    // Snapshot Calculations
    const dailyDisbursed = disbursements
      .filter(d => d.date === selectedDate)
      .reduce((sum, d) => sum + d.disbursementAmount, 0);
    
    const pendingInventory = 
      cheques.filter(c => c.status === 'Pending').length + 
      cards.filter(c => c.status === 'Pending').length;

    return {
      currentSummary: daySummary,
      trends: {
        cashIn: calculateDynamicTrend(daySummary.totalCashIn, prevSummary.totalCashIn, avgVolume / 2),
        cashOut: calculateDynamicTrend(daySummary.totalCashOut, prevSummary.totalCashOut, avgVolume / 2),
        net: calculateDynamicTrend(daySummary.netPosition, prevSummary.netPosition, avgVolume / 4),
        count: calculateDynamicTrend(daySummary.transactionCount, prevSummary.transactionCount, avgCount)
      },
      snapshots: {
        totalAccounts: accounts.length,
        dailyDisbursed,
        activeDeposits: fdrDps.filter(e => e.status === 'Active').length,
        pendingInventory
      }
    };
  }, [transactions, selectedDate, accounts, disbursements, fdrDps, cheques, cards]);

  const isVolume = activeMetric === 'volume';
  const themeColor = isVolume ? '#2563EB' : '#10B981';

  const t = {
    totalCashIn: language === 'en' ? 'Total Cash In' : 'মোট জমা (In)',
    totalCashOut: language === 'en' ? 'Total Cash Out' : 'মোট খরচ (Out)',
    netPosition: language === 'en' ? 'Net Position' : 'নিট ব্যালেন্স',
    transCount: language === 'en' ? 'Trans. Count' : 'লেনদেনের সংখ্যা',
    perfTrend: language === 'en' ? 'Performance Trend' : 'পারফরম্যান্স ট্রেন্ড',
    volume: language === 'en' ? 'Volume' : 'ভলিউম',
    frequency: language === 'en' ? 'Frequency' : 'ফ্রিকোয়েন্সি',
    snapshotsTitle: language === 'en' ? 'Business Overview' : 'ব্যবসা ওভারভিউ',
    snapshotsSubtitle: language === 'en' ? 'Quick summary across all departments' : 'সব বিভাগের দ্রুত সারাংশ',
    viewAll: language === 'en' ? 'View Details' : 'বিস্তারিত দেখুন',
    accTitle: language === 'en' ? 'Customer Base' : 'গ্রাহক সংখ্যা',
    disbTitle: language === 'en' ? 'Loan Processed' : 'লোন প্রসেসড',
    depTitle: language === 'en' ? 'Active Deposits' : 'সক্রিয় ডিপোজিট',
    invTitle: language === 'en' ? 'Pending Actions' : 'পেন্ডিং অ্যাকশন',
  };

  return (
    <div className="space-y-8 md:space-y-12 px-4 md:px-0">
      
      {/* 1. Primary Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <SummaryCard 
          title={t.totalCashIn} 
          value={formatCurrency(currentSummary.totalCashIn)} 
          icon={<ArrowUpRight size={22} />} 
          color="blue"
          trend={trends.cashIn}
          trendColor="emerald"
        />
        <SummaryCard 
          title={t.totalCashOut} 
          value={formatCurrency(currentSummary.totalCashOut)} 
          icon={<ArrowDownRight size={22} />} 
          color="rose"
          trend={trends.cashOut}
          trendColor="rose"
        />
        <SummaryCard 
          title={t.netPosition} 
          value={formatCurrency(currentSummary.netPosition)} 
          icon={<Wallet size={22} />} 
          color="emerald"
          trend={trends.net}
          trendColor="emerald"
        />
        <SummaryCard 
          title={t.transCount} 
          value={currentSummary.transactionCount.toString()} 
          icon={<Activity size={22} />} 
          color="slate"
          trend={trends.count}
          trendColor="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. Charts Section - Main Content */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] p-6 md:p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-theme">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 md:mb-10 gap-6">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{t.perfTrend}</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Analytics Dashboard</p>
            </div>
            <div className="flex w-full sm:w-auto gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-transparent dark:border-slate-700">
               <button 
                  onClick={() => setActiveMetric('volume')}
                  className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                    activeMetric === 'volume' 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
               >
                  {t.volume}
               </button>
               <button 
                  onClick={() => setActiveMetric('frequency')}
                  className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                    activeMetric === 'frequency' 
                      ? 'bg-emerald-600 text-white shadow-lg' 
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
               >
                  {t.frequency}
               </button>
            </div>
          </div>
          <div className="h-[300px] md:h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {isVolume ? (
                <AreaChart data={MOCK_CHART_DATA}>
                  <defs>
                    <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={themeColor} stopOpacity={0.25}/>
                      <stop offset="95%" stopColor={themeColor} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#E2E8F0'} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 10, fontWeight: 700}} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 10, fontWeight: 700}}
                    width={40}
                  />
                  <Tooltip 
                    cursor={{ stroke: themeColor, strokeWidth: 2 }}
                    contentStyle={{ 
                      backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF', 
                      borderColor: isDarkMode ? '#334155' : '#E2E8F0',
                      borderRadius: '16px',
                      fontSize: '11px',
                      padding: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="volume" 
                    stroke={themeColor} 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorMetric)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              ) : (
                <BarChart data={MOCK_CHART_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#E2E8F0'} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 10, fontWeight: 700}} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 10, fontWeight: 700}}
                    width={40}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ 
                      backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF', 
                      borderColor: isDarkMode ? '#334155' : '#E2E8F0',
                      borderRadius: '16px',
                      fontSize: '11px',
                      padding: '12px'
                    }}
                  />
                  <Bar 
                    dataKey="frequency" 
                    radius={[8, 8, 0, 0]} 
                    animationDuration={1500}
                    barSize={window.innerWidth < 768 ? 24 : 40}
                  >
                    {MOCK_CHART_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={themeColor} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Section Snapshots - Side Navigation Details */}
        <div className="space-y-6">
           <div className="px-2">
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{t.snapshotsTitle}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t.snapshotsSubtitle}</p>
           </div>
           
           <div className="grid grid-cols-1 gap-4">
              <SnapshotCard 
                 title={t.accTitle}
                 value={snapshots.totalAccounts.toString()}
                 label="Verified Accounts"
                 icon={<SearchCode size={20} />}
                 color="blue"
                 onClick={() => onViewChange?.('accounts')}
              />
              <SnapshotCard 
                 title={t.disbTitle}
                 value={formatCurrency(snapshots.dailyDisbursed)}
                 label={`Today, ${selectedDate}`}
                 icon={<HandCoins size={20} />}
                 color="purple"
                 onClick={() => onViewChange?.('disbursements')}
              />
              <SnapshotCard 
                 title={t.depTitle}
                 value={snapshots.activeDeposits.toString()}
                 label="Active FDR & DPS"
                 icon={<PiggyBank size={20} />}
                 color="emerald"
                 onClick={() => onViewChange?.('fdrDps')}
              />
              <SnapshotCard 
                 title={t.invTitle}
                 value={snapshots.pendingInventory.toString()}
                 label="Pending Cheques/Cards"
                 icon={<CreditCard size={20} />}
                 color="rose"
                 isAlert={snapshots.pendingInventory > 0}
                 onClick={() => onViewChange?.('inventory')}
              />
           </div>

           {/* Quick Guide Card */}
           <div className="bg-slate-900 dark:bg-slate-100 p-6 rounded-[2rem] text-white dark:text-slate-900 shadow-xl overflow-hidden relative group">
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                 <ShieldCheck size={120} />
              </div>
              <div className="relative z-10">
                 <h4 className="font-black text-sm uppercase tracking-widest mb-1 opacity-60">System Security</h4>
                 <p className="text-lg font-black leading-tight mb-4">Always verify customer ID before processing disbursements.</p>
                 <button 
                  onClick={() => onViewChange?.('alerts')}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 dark:bg-slate-900/10 dark:hover:bg-slate-900/20 rounded-xl text-xs font-black transition-colors"
                 >
                    Safety Protocols <ChevronRight size={14} />
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard: React.FC<{ 
  title: string, 
  value: string, 
  icon: React.ReactNode, 
  color: string, 
  trend?: string,
  trendColor?: 'emerald' | 'rose'
}> = ({ title, value, icon, color, trend, trendColor }) => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-600 text-white',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-600/20 dark:text-rose-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-600/20 dark:text-emerald-400',
    slate: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  };

  const isNeutral = trend === '0%';
  const isPositive = trend?.startsWith('+');
  let activeTrendColor = isNeutral ? 'slate' : (isPositive ? 'emerald' : 'rose');
  if (trendColor && !isNeutral) activeTrendColor = trendColor;

  const trendClasses: Record<string, string> = {
    slate: 'text-slate-400 bg-slate-50 dark:bg-slate-800',
    emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-600/10',
    rose: 'text-rose-600 bg-rose-50 dark:bg-rose-600/10',
  };

  return (
    <div className="bg-white dark:bg-[#1E293B] p-6 md:p-7 rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 ${colorMap[color] || colorMap.slate} ${
          color === 'blue' ? 'shadow-lg shadow-blue-500/40' : ''
        }`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-[9px] md:text-[10px] font-black px-2 py-0.5 rounded-full ${trendClasses[activeTrendColor]}`}>
            {trend}
          </div>
        )}
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest truncate">{title}</p>
      <h4 className="text-xl md:text-2xl font-black mt-1 md:mt-2 text-slate-900 dark:text-white tracking-tight truncate">{value}</h4>
    </div>
  );
};

const SnapshotCard: React.FC<{
  title: string;
  value: string;
  label: string;
  icon: React.ReactNode;
  color: 'blue' | 'purple' | 'emerald' | 'rose';
  isAlert?: boolean;
  onClick: () => void;
}> = ({ title, value, label, icon, color, isAlert, onClick }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30',
    purple: 'bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/30',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30',
    rose: 'bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30'
  };

  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-3xl hover:border-slate-400 dark:hover:border-slate-600 shadow-sm hover:shadow-md transition-all text-left group overflow-hidden relative`}
    >
       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${colorClasses[color].split(' border-')[0]}`}>
          {icon}
       </div>
       <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{title}</p>
          <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight truncate">{value}</h4>
          <p className="text-[9px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-tighter truncate">{label}</p>
       </div>
       <div className="text-slate-300 dark:text-slate-700 group-hover:text-slate-500 transition-colors">
          <ChevronRight size={18} />
       </div>
       {isAlert && (
         <div className="absolute top-4 right-4 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
         </div>
       )}
    </button>
  );
}
