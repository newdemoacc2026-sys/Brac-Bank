
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Plus, User, Phone, Hash, Calendar, Trash2, X, 
  AlertCircle, ChevronLeft, ChevronRight, Check, ChevronDown,
  PiggyBank, ArrowUpRight, ArrowDownRight, Layers, Pencil,
  ArrowRight, Calculator, Landmark, ShieldCheck, TrendingUp,
  Briefcase
} from 'lucide-react';
import { FdrDps } from '../types';
import { formatCurrency } from '../utils/finance';

interface FdrDpsViewProps {
  entries: FdrDps[];
  loanOfficers: string[];
  onAdd: (entry: Omit<FdrDps, 'id'>) => void;
  onUpdate: (id: string, entry: Omit<FdrDps, 'id'>) => void;
  onDelete: (id: string) => void;
  language: 'en' | 'bn';
}

type ModalStage = 'selection' | 'form' | null;

export const FdrDpsView: React.FC<FdrDpsViewProps> = ({ entries, loanOfficers, onAdd, onUpdate, onDelete, language }) => {
  const [modalStage, setModalStage] = useState<ModalStage>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeDatePicker, setActiveDatePicker] = useState<'opening' | 'maturity' | null>(null);
  const [isOfficerOpen, setIsOfficerOpen] = useState(false);
  
  // Track the visible month/year in the calendar popup
  const [calViewDate, setCalViewDate] = useState(new Date());
  
  const datePickerRef = useRef<HTMLDivElement>(null);
  const officerRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState<Omit<FdrDps, 'id'>>({
    accountTitle: '',
    accountNumber: '',
    dpsAccountNumber: '',
    mobileNumber: '',
    type: 'FDR',
    accountCategory: 'Retail',
    productName: 'AB FLEXI DPS',
    tenor: 12,
    installmentAmount: 0,
    openingDate: new Date().toISOString().split('T')[0],
    maturityDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    principalAmount: 0,
    maturityAmount: 0,
    totalInterest: 0,
    interestRate: 8.5,
    status: 'Active',
    loanOfficer: ''
  });

  const t = {
    title: language === 'en' ? 'Deposit Management' : 'ডিপোজিট ম্যানেজমেন্ট',
    selectionTitle: language === 'en' ? 'Select Scheme Type' : 'স্কিমের ধরন নির্বাচন করুন',
    fdrTitle: language === 'en' ? 'Fixed Deposit (FDR)' : 'ফিক্সড ডিপোজিট (এফডিআর)',
    dpsTitle: language === 'en' ? 'Pension Scheme (DPS)' : 'পেনশন স্কিম (ডিপিএস)',
    accTitle: language === 'en' ? 'Account Title' : 'অ্যাকাউন্টের নাম',
    dpsAccNo: language === 'en' ? 'DPS Acc No' : 'ডিপিএস অ্যাকাউন্ট নম্বর',
    mobile: language === 'en' ? 'Mobile Number' : 'মোবাইল নম্বর',
    accType: language === 'en' ? 'Account Type' : 'অ্যাকাউন্টের ধরন',
    product: language === 'en' ? 'Product Name' : 'প্রোডাক্টের নাম',
    tenor: language === 'en' ? 'Tenor (Months)' : 'মেয়াদ (মাস)',
    installment: language === 'en' ? 'Installment Amount' : 'কিস্তির পরিমাণ',
    rate: language === 'en' ? 'Interest Rate (%)' : 'মুনাফার হার (%)',
    openDate: language === 'en' ? 'Opening Date' : 'খোলার তারিখ',
    maturityDate: language === 'en' ? 'Maturity Date' : 'পরিপক্কতার তারিখ',
    totalDeposit: language === 'en' ? 'Total Deposit' : 'মোট জমা',
    maturityAmt: language === 'en' ? 'Maturity Amount' : 'পরিপক্কতা পরিমাণ',
    interest: language === 'en' ? 'Total Interest' : 'মোট মুনাফা',
    save: language === 'en' ? 'Save Record' : 'রেকর্ড সংরক্ষণ',
    update: language === 'en' ? 'Update Record' : 'আপডেট করুন',
    cancel: language === 'en' ? 'Cancel' : 'বাতিল',
    retail: language === 'en' ? 'Retail' : 'রিটেইল',
    current: language === 'en' ? 'Current' : 'কারেন্ট',
    officer: language === 'en' ? 'Loan Officer' : 'লোন অফিসার',
    selectOfficer: language === 'en' ? 'Select Officer' : 'অফিসার নির্বাচন করুন',
  };

  const tenorOptions = [12, 24, 36, 48, 60, 72, 84, 96, 108, 120];

  const getProductOptions = (category: 'Retail' | 'Current') => {
    return category === 'Retail' 
      ? ['AB FLEXI DPS', 'TARA AB FLEXI DPS'] 
      : ['DPS SHONCHOY SME', 'DPS TARA SHONCHOY SME'];
  };

  // Partially automatic logic for DPS: Only Total Deposit and Interest Rate
  useEffect(() => {
    if (formData.type === 'DPS') {
      const tenor = formData.tenor || 12;
      
      // Calculate Rate based on requirements
      let rate = 9.0;
      if (tenor === 12) rate = 8.5;
      else if (tenor === 24) rate = 8.75;
      
      // Calculate Dates (Maturity Date remains automatic for convenience)
      const open = new Date(formData.openingDate);
      const maturity = new Date(open);
      maturity.setMonth(maturity.getMonth() + tenor);
      const maturityDateStr = maturity.toISOString().split('T')[0];

      // Financial Math: Only principalAmount is automatic
      const totalDep = (formData.installmentAmount || 0) * tenor;

      setFormData(prev => ({
        ...prev,
        interestRate: rate,
        principalAmount: totalDep,
        maturityDate: maturityDateStr,
        endDate: maturityDateStr
      }));
    }
  }, [formData.tenor, formData.installmentAmount, formData.openingDate, formData.type]);

  const handleEdit = (entry: FdrDps) => {
    setEditingId(entry.id);
    setFormData({ ...entry });
    setModalStage('form');
  };

  const handleClose = () => {
    setModalStage(null);
    setEditingId(null);
    setActiveDatePicker(null);
    setIsOfficerOpen(false);
    setFormData({
      accountTitle: '',
      accountNumber: '',
      dpsAccountNumber: '',
      mobileNumber: '',
      type: 'FDR',
      accountCategory: 'Retail',
      productName: 'AB FLEXI DPS',
      tenor: 12,
      installmentAmount: 0,
      openingDate: new Date().toISOString().split('T')[0],
      maturityDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      principalAmount: 0,
      maturityAmount: 0,
      totalInterest: 0,
      interestRate: 8.5,
      status: 'Active',
      loanOfficer: ''
    });
  };

  const handleSelectType = (type: 'FDR' | 'DPS') => {
    setFormData(prev => ({ 
      ...prev, 
      type,
      productName: type === 'DPS' ? 'AB FLEXI DPS' : '',
      loanOfficer: loanOfficers[0] || ''
    }));
    setModalStage('form');
  };

  // Close selectors when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setActiveDatePicker(null);
      }
      if (officerRef.current && !officerRef.current.contains(event.target as Node)) {
        setIsOfficerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderCalendar = (field: 'openingDate' | 'maturityDate') => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const year = calViewDate.getFullYear();
    const month = calViewDate.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const startOffset = new Date(year, month, 1).getDay();
    
    const days = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let d = 1; d <= totalDays; d++) days.push(d);

    const selectedDate = new Date(formData[field] || '');

    return (
      <div className="p-4 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-[150] w-64 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-black dark:text-white uppercase">{months[month]} {year}</span>
          <div className="flex gap-1">
            <button type="button" onClick={() => setCalViewDate(new Date(year, month - 1, 1))} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><ChevronLeft size={14}/></button>
            <button type="button" onClick={() => setCalViewDate(new Date(year, month + 1, 1))} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><ChevronRight size={14}/></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-[10px] font-black text-slate-400 text-center">{d}</div>)}
          {days.map((day, i) => ( day ? (
            <button 
              key={i} 
              type="button" 
              onClick={() => { 
                setFormData({...formData, [field]: new Date(year, month, day).toISOString().split('T')[0]}); 
                setActiveDatePicker(null); 
              }} 
              className={`aspect-square rounded-lg text-[10px] font-bold transition-all ${selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year ? 'bg-blue-600 text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-300'}`}
            >
              {day}
            </button>
          ) : <div key={i} /> ))}
        </div>
        <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800">
           <button 
            type="button"
            onClick={() => {
              const today = new Date();
              setFormData({...formData, [field]: today.toISOString().split('T')[0]});
              setActiveDatePicker(null);
            }}
            className="w-full py-2 text-[9px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
           >
             Select Today
           </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
            <Landmark className="text-blue-600" size={32} />
            {t.title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            {language === 'en' ? 'Manage your long-term bank investments' : 'আপনার দীর্ঘমেয়াদী ব্যাংক বিনিয়োগ পরিচালনা করুন'}
          </p>
        </div>
        <button onClick={() => setModalStage('selection')} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-2xl shadow-xl shadow-blue-500/30 transition-all active:scale-95">
          <Plus size={20} strokeWidth={3} />
          {language === 'en' ? 'New Record' : 'নতুন রেকর্ড'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SummaryCard title={language === 'en' ? 'Total FDR Value' : 'মোট এফডিআর মূল্য'} value={formatCurrency(entries.filter(e => e.type === 'FDR').reduce((acc, e) => acc + e.principalAmount, 0))} icon={<Layers size={22}/>} color="blue" />
        <SummaryCard title={language === 'en' ? 'Total DPS Value' : 'মোট ডিপিএস জমা'} value={formatCurrency(entries.filter(e => e.type === 'DPS').reduce((acc, e) => acc + e.principalAmount, 0))} icon={<PiggyBank size={22}/>} color="emerald" />
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden transition-theme">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                <th className="px-6 py-5">{t.accTitle}</th>
                <th className="px-6 py-5">{language === 'en' ? 'Type' : 'ধরন'}</th>
                <th className="px-6 py-5">{language === 'en' ? 'Product' : 'প্রোডাক্ট'}</th>
                <th className="px-6 py-5">{language === 'en' ? 'Value' : 'মূল্য'}</th>
                <th className="px-6 py-5 text-right">{language === 'en' ? 'Actions' : 'অ্যাকশন'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {entries.length > 0 ? (
                entries.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{e.accountTitle}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{e.dpsAccountNumber || 'No Account No'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${e.type === 'FDR' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 'bg-purple-50 text-purple-600 dark:bg-purple-900/20'}`}>
                        {e.type}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        {e.productName || 'N/A'}
                        {e.tenor && <span className="ml-2 opacity-50">({e.tenor}M)</span>}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-800 dark:text-slate-100">{formatCurrency(e.principalAmount)}</td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(e)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"><Pencil size={16}/></button>
                        <button onClick={() => onDelete(e.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-bold italic">{language === 'en' ? 'No records' : 'কোন রেকর্ড নেই'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Stage Controller */}
      {modalStage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className={`w-full ${modalStage === 'selection' ? 'max-w-xl' : 'max-w-3xl'} bg-white dark:bg-[#1E293B] rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 my-8 animate-in zoom-in-95 duration-200 relative`}>
            
            <div className="px-8 pt-8 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {modalStage === 'selection' ? t.selectionTitle : `${t.save} (${formData.type})`}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {modalStage === 'selection' ? 'Choose your investment vehicle' : 'Fill in the detailed banking credentials'}
                </p>
              </div>
              <button onClick={handleClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white"><X size={18} /></button>
            </div>

            {modalStage === 'selection' && (
              <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectionCard icon={<Layers size={24}/>} title={t.fdrTitle} desc="Lump-sum fixed term investment" color="blue" onClick={() => handleSelectType('FDR')} />
                <SelectionCard icon={<PiggyBank size={24}/>} title={t.dpsTitle} desc="Monthly installment savings plan" color="purple" onClick={() => handleSelectType('DPS')} />
              </div>
            )}

            {modalStage === 'form' && (
              <form onSubmit={(e) => { e.preventDefault(); editingId ? onUpdate(editingId, formData) : onAdd(formData); handleClose(); }} className="p-8 space-y-6">
                
                {/* Account Details Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <ShieldCheck size={14} className="text-blue-600" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account Information</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t.accTitle}</label>
                      <input required type="text" value={formData.accountTitle} onChange={e => setFormData({...formData, accountTitle: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-semibold outline-none focus:border-blue-500 dark:text-white" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t.mobile}</label>
                      <input required type="tel" value={formData.mobileNumber} onChange={e => setFormData({...formData, mobileNumber: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-semibold outline-none focus:border-blue-500 dark:text-white" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t.dpsAccNo}</label>
                      <input required type="text" value={formData.dpsAccountNumber} onChange={e => setFormData({...formData, dpsAccountNumber: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-semibold outline-none focus:border-blue-500 dark:text-white" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t.accType}</label>
                      <div className="flex bg-slate-50 dark:bg-slate-900 rounded-2xl p-1 border border-slate-200 dark:border-slate-700">
                        {['Retail', 'Current'].map((cat) => (
                          <button key={cat} type="button" onClick={() => setFormData({...formData, accountCategory: cat as any, productName: getProductOptions(cat as any)[0]})} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${formData.accountCategory === cat ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600' : 'text-slate-400'}`}>
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scheme Config Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <Calculator size={14} className="text-purple-600" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Scheme Configuration</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t.product}</label>
                      <select value={formData.productName} onChange={e => setFormData({...formData, productName: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none dark:text-white">
                        {getProductOptions(formData.accountCategory as any).map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    
                    <div className="space-y-1.5 relative" ref={officerRef}>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5">
                        <Briefcase size={12} /> {t.officer}
                      </label>
                      <button 
                        type="button"
                        onClick={() => setIsOfficerOpen(!isOfficerOpen)}
                        className={`w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-semibold text-left transition-all outline-none flex items-center justify-between ${
                          isOfficerOpen ? 'ring-4 ring-blue-500/10 border-blue-500' : ''
                        }`}
                      >
                        <span className={formData.loanOfficer ? 'dark:text-white' : 'text-slate-400'}>
                          {formData.loanOfficer || t.selectOfficer}
                        </span>
                        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isOfficerOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isOfficerOpen && (
                        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-[1.5rem] shadow-2xl py-2 z-[160] animate-in fade-in zoom-in-95 duration-150 max-h-48 overflow-y-auto custom-scrollbar">
                          {loanOfficers.length > 0 ? (
                            loanOfficers.map((officer, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setFormData({...formData, loanOfficer: officer});
                                  setIsOfficerOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-5 py-3 text-sm font-semibold transition-colors ${
                                  formData.loanOfficer === officer 
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                              >
                                {officer}
                                {formData.loanOfficer === officer && <Check size={14} />}
                              </button>
                            ))
                          ) : (
                            <div className="px-5 py-3 text-xs text-slate-400 italic">
                              No officers found in settings
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t.tenor}</label>
                      <select value={formData.tenor} onChange={e => setFormData({...formData, tenor: parseInt(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none dark:text-white">
                        {tenorOptions.map(m => <option key={m} value={m}>{m} Months</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t.rate}</label>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-black text-purple-600">
                        {formData.interestRate}%
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 relative">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t.openDate}</label>
                      <button 
                        type="button" 
                        onClick={() => {
                          setCalViewDate(new Date(formData.openingDate));
                          setActiveDatePicker('opening');
                        }} 
                        className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-bold text-left dark:text-white flex justify-between items-center group"
                      >
                        {formData.openingDate} 
                        <Calendar size={14} className="text-blue-500 group-hover:scale-110 transition-transform" />
                      </button>
                      {activeDatePicker === 'opening' && (
                        <div className="absolute bottom-full left-0 mb-2 z-[160]" ref={datePickerRef}>
                          {renderCalendar('openingDate')}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1.5 relative">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t.maturityDate}</label>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-500 flex justify-between items-center">
                        {formData.maturityDate} <Calendar size={14}/>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financials Section */}
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 space-y-6">
                   <div className="flex items-center gap-2 px-1">
                    <TrendingUp size={14} className="text-emerald-600" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Financial Projections</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t.installment}</label>
                      <input required type="number" value={formData.installmentAmount || ''} onChange={e => setFormData({...formData, installmentAmount: parseFloat(e.target.value)})} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-black text-blue-600 outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t.totalDeposit}</label>
                      <div className="w-full bg-slate-100 dark:bg-slate-900/50 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center h-[52px]">
                        {formatCurrency(formData.principalAmount)}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t.interest}</label>
                      <input 
                        required 
                        type="number" 
                        value={formData.totalInterest || ''} 
                        onChange={e => setFormData({...formData, totalInterest: parseFloat(e.target.value)})} 
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-black text-amber-600 outline-none" 
                        placeholder="Manual Input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t.maturityAmt}</label>
                      <input 
                        required 
                        type="number" 
                        value={formData.maturityAmount || ''} 
                        onChange={e => setFormData({...formData, maturityAmount: parseFloat(e.target.value)})} 
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-black text-emerald-600 outline-none" 
                        placeholder="Manual Input"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={handleClose} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl">{t.cancel}</button>
                  <button type="submit" className="flex-[2] py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/30 active:scale-95 transition-all">{editingId ? t.update : t.save}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const SelectionCard: React.FC<{ icon: React.ReactNode, title: string, desc: string, color: 'blue' | 'purple', onClick: () => void }> = ({ icon, title, desc, color, onClick }) => (
  <button onClick={onClick} className={`p-8 text-left bg-slate-50 dark:bg-slate-900/50 border-2 border-transparent hover:border-${color}-500 rounded-[2.5rem] transition-all group hover:shadow-2xl`}>
    <div className={`w-14 h-14 bg-${color}-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-${color}-500/30`}>{icon}</div>
    <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2">{title}</h4>
    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{desc}</p>
    <div className={`flex items-center gap-2 text-${color}-600 font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all`}>Open New Scheme <ArrowRight size={14} /></div>
  </button>
);

const SummaryCard: React.FC<{ title: string, value: string, icon: React.ReactNode, color: 'blue' | 'emerald' }> = ({ title, value, icon, color }) => (
  <div className="bg-white dark:bg-[#1E293B] p-7 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-md group">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${color === 'blue' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/40'}`}>{icon}</div>
    <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">{title}</p>
    <h4 className="text-2xl font-black mt-1 text-slate-900 dark:text-white tracking-tight">{value}</h4>
  </div>
);
