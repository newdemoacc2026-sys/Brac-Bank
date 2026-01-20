
import React, { useState, useMemo } from 'react';
import { 
  AreaChart, Area, 
  BarChart, Bar, 
  XAxis, YAxis, 
  CartesianGrid, Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, Activity, Wallet } from 'lucide-react';
import { Transaction } from '../types';
import { calculateDailySummary, formatCurrency, calculateDynamicTrend } from '../utils/finance';

interface DashboardProps {
  transactions: Transaction[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  isDarkMode: boolean;
  language: 'en' | 'bn';
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

export const Dashboard: React.FC<DashboardProps> = ({ transactions, selectedDate, onDateChange, isDarkMode, language }) => {
  const [activeMetric, setActiveMetric] = useState<'volume' | 'frequency'>('volume');

  const { currentSummary, trends } = useMemo(() => {
    const curDate = new Date(selectedDate);
    const prevDate = new Date(curDate);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevDateStr = prevDate.toISOString().split('T')[0];

    const currentDayTxs = transactions.filter(t => t.timestamp.startsWith(selectedDate));
    const previousDayTxs = transactions.filter(t => t.timestamp.startsWith(prevDateStr));

    const daySummary = calculateDailySummary(currentDayTxs);
    const prevSummary = calculateDailySummary(previousDayTxs);

    // Calculate historical averages for better baselines
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

    return {
      currentSummary: daySummary,
      trends: {
        cashIn: calculateDynamicTrend(daySummary.totalCashIn, prevSummary.totalCashIn, avgVolume / 2),
        cashOut: calculateDynamicTrend(daySummary.totalCashOut, prevSummary.totalCashOut, avgVolume / 2),
        net: calculateDynamicTrend(daySummary.netPosition, prevSummary.netPosition, avgVolume / 4),
        count: calculateDynamicTrend(daySummary.transactionCount, prevSummary.transactionCount, avgCount)
      }
    };
  }, [transactions, selectedDate]);

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
    volDesc: language === 'en' ? 'Cash movement volume analysis' : 'নগদ প্রবাহ ভলিউম বিশ্লেষণ',
    freqDesc: language === 'en' ? 'Transaction frequency and count analysis' : 'লেনদেনের ফ্রিকোয়েন্সি এবং সংখ্যা বিশ্লেষণ',
  };

  return (
    <div className="space-y-10">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Chart Section */}
      <div className="bg-white dark:bg-[#1E293B] p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-md transition-theme">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{t.perfTrend}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isVolume ? t.volDesc : t.freqDesc}
            </p>
          </div>
          <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-transparent dark:border-slate-700">
             <button 
                onClick={() => setActiveMetric('volume')}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all hover-wobble ${
                  activeMetric === 'volume' 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                }`}
             >
                {t.volume}
             </button>
             <button 
                onClick={() => setActiveMetric('frequency')}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all hover-wobble ${
                  activeMetric === 'frequency' 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                }`}
             >
                {t.frequency}
             </button>
          </div>
        </div>
        <div className="h-[360px] w-full">
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
                  tick={{fill: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 11, fontWeight: 700}} 
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 11, fontWeight: 700}}
                  dx={-10}
                />
                <Tooltip 
                  cursor={{ stroke: themeColor, strokeWidth: 2 }}
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF', 
                    borderColor: isDarkMode ? '#334155' : '#E2E8F0',
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    borderWidth: '1px',
                    padding: '12px'
                  }}
                  labelStyle={{ fontWeight: 900, marginBottom: '4px', fontSize: '12px', color: isDarkMode ? '#FFFFFF' : '#1A1A1A' }}
                  itemStyle={{ fontWeight: 800, color: themeColor, fontSize: '12px' }}
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
              <BarChart data={MOCK_CHART_DATA} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#E2E8F0'} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 11, fontWeight: 700}} 
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 11, fontWeight: 700}}
                  dx={-10}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF', 
                    borderColor: isDarkMode ? '#334155' : '#E2E8F0',
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    borderWidth: '1px',
                    padding: '12px'
                  }}
                  labelStyle={{ fontWeight: 900, marginBottom: '4px', fontSize: '12px', color: isDarkMode ? '#FFFFFF' : '#1A1A1A' }}
                  itemStyle={{ fontWeight: 800, color: themeColor, fontSize: '12px' }}
                />
                <Bar 
                  dataKey="frequency" 
                  radius={[12, 12, 0, 0]} 
                  animationDuration={1500}
                  barSize={40}
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
    <div className="bg-white dark:bg-[#1E293B] p-7 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-300 group">
      <div className="flex items-center justify-between mb-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 ${colorMap[color] || colorMap.slate} ${
          color === 'blue' ? 'shadow-lg shadow-blue-500/40' : 
          color === 'rose' ? 'shadow-lg shadow-rose-500/30' : 
          color === 'emerald' ? 'shadow-lg shadow-emerald-500/20' : ''
        }`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full ${trendClasses[activeTrendColor]}`}>
            {trend}
          </div>
        )}
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest">{title}</p>
      <h4 className="text-2xl font-black mt-2 text-slate-900 dark:text-white tracking-tight">{value}</h4>
    </div>
  );
};
