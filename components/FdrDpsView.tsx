
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Plus, User, Phone, Hash, Calendar, Trash2, X, 
  AlertCircle, ChevronLeft, ChevronRight, Check, ChevronDown,
  PiggyBank, ArrowUpRight, ArrowDownRight, Layers, Pencil,
  ArrowRight, Calculator, Landmark, ShieldCheck, TrendingUp,
  Briefcase, Tag, Percent
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
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Track the visible month/year in the calendar popup
  const [calViewDate, setCalViewDate] = useState(new Date());
  
  const datePickerRef = useRef<HTMLDivElement>(null);
  const officerRef = useRef<HTMLDivElement>(null);
  const productRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState<Omit<FdrDps, 'id'>>({
    accountTitle: '',
    accountNumber: '',
    dpsAccountNumber: '',
    fdrAccountNumber: '',
    mobileNumber: '',
    type: 'FDR',
    accountCategory: 'Retail',
    productName: 'AB ABIRAM FIXED DEPOSIT',
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
    fdrAccNo: language === 'en' ? 'FDR Acc No' : 'এফডিআর অ্যাকাউন্ট নম্বর',
    mobile: language === 'en' ? 'Mobile Number' : 'মোবাইল নম্বর',
    accType: language === 'en' ? 'Account Type' : 'অ্যাকাউন্টের ধরন',
    product: language === 'en' ? 'Product Name' : 'প্রোডাক্টের নাম',
    tenor: language === 'en' ? 'Tenor (Months)' : 'মেয়াদ (মাস)',
    installment: language === 'en' ? 'Installment Amount' : 'কিস্তির পরিমাণ',
    rate: language === 'en' ? 'Interest Rate' : 'মুনাফার হার',
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
    errNumbersNotAllowed: language === 'en' ? 'Numbers are not allowed' : 'সংখ্যা অনুমোদিত নয়',
    errLettersNotAllowed: language === 'en' ? 'Letters are not allowed' : 'অক্ষর অনুমোদিত নয়',
    fdrCountLabel: language === 'en' ? 'Total FDR Schemes' : 'মোট এফডিআর স্কিম',
    dpsCountLabel: language === 'en' ? 'Total DPS Schemes' : 'মোট ডিপিএস স্কিম',
  };

  // Product Lists
  const fdrRetailProducts = ['AB ABIRAM FIXED DEPOSIT', 'AB GENERAL FIXED DEPOSIT'];
  const fdrCurrentProducts = ['FD SME DIPTO REPUBLIC FREEDOM', 'FD SME PRACHURJO', 'FD SME UDDIPON REPUBLIC ABIRAM'];
  const dpsRetailProducts = ['AB FLEXI DPS', 'TARA AB FLEXI DPS'];
  const dpsCurrentProducts = ['DPS SHONCHOY SME', 'DPS TARA SHONCHOY SME'];

  const getAvailableProducts = (type: 'FDR' | 'DPS', category: 'Retail' | 'Current') => {
    if (type === 'FDR') {
      return category === 'Retail' ? fdrRetailProducts : fdrCurrentProducts;
    }
    return category === 'Retail' ? dpsRetailProducts : dpsCurrentProducts;
  };

  // Tenor Options: 1 month to 240 months (20 Years)
  const tenorOptions = Array.from({ length: 240 }, (_, i) => i + 1);

  useEffect(() => {
    const tenor = formData.tenor || 12;
    let rate = 8.5;

    const open = new Date(formData.openingDate);
    const maturity = new Date(open);
    maturity.setMonth(maturity.getMonth() + tenor);
    const maturityDateStr = maturity.toISOString().split('T')[0];

    if (formData.type === 'DPS') {
      // Dynamic logic for DPS rates
      if (formData.productName?.includes('TARA')) {
        rate = 9.25;
        if (tenor >= 60) rate = 9.5;
      } else {
        rate = 8.5;
        if (tenor >= 24) rate = 8.75;
        if (tenor >= 60) rate = 9.0;
      }

      const totalDep = (formData.installmentAmount || 0) * tenor;

      setFormData(prev => ({
        ...prev,
        interestRate: rate,
        principalAmount: totalDep,
        maturityDate: maturityDateStr,
        endDate: maturityDateStr
      }));
    } else {
      // Logic for FDR rates
      rate = 8.25;
      if (tenor >= 36) rate = 8.5;
      if (tenor >= 60) rate = 9.0;
      setFormData(prev => ({ 
        ...prev, 
        interestRate: rate,
        maturityDate: maturityDateStr,
        endDate: maturityDateStr
      }));
    }
  }, [formData.tenor, formData.installmentAmount, formData.openingDate, formData.type, formData.productName]);

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
    setIsProductOpen(false);
    setValidationErrors({});
    setFormData({
      accountTitle: '',
      accountNumber: '',
      dpsAccountNumber: '',
      fdrAccountNumber: '',
      mobileNumber: '',
      type: 'FDR',
      accountCategory: 'Retail',
      productName: fdrRetailProducts[0],
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
    const category = formData.accountCategory || 'Retail';
    const products = getAvailableProducts(type, category);
    setFormData(prev => ({ 
      ...prev, 
      type,
      productName: products[0],
      loanOfficer: loanOfficers[0] || ''
    }));
    setModalStage('form');
  };

  const handleCategoryChange = (category: 'Retail' | 'Current') => {
    const products = getAvailableProducts(formData.type, category);
    setFormData(prev => ({
      ...prev,
      accountCategory: category,
      productName: products[0]
    }));
  };

  const handleValidatedInputChange = (name: keyof typeof formData, value: string) => {
    let sanitizedValue = value;
    let error = '';

    if (name === 'accountTitle') {
      sanitizedValue = value.replace(/[0-9]/g, '');
      if (value !== sanitizedValue) {
        error = t.errNumbersNotAllowed;
      }
    } else if (name === 'mobileNumber' || name === 'dpsAccountNumber' || name === 'accountNumber' || name === 'fdrAccountNumber') {
      sanitizedValue = value.replace(/[^0-9]/g, '');
      if (value !== sanitizedValue) {
        error = t.errLettersNotAllowed;
      }
    }

    setValidationErrors(prev => ({ ...prev, [name]: error }));
    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setActiveDatePicker(null);
      }
      if (officerRef.current && !officerRef.current.contains(event.target as Node)) {
        setIsOfficerOpen(false);
      }
      if (productRef.current && !productRef.current.contains(event.target as Node)) {
        setIsProductOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderCalendar = (field: 'openingDate' | 'maturityDate') => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const year = calViewDate.getFullYear();
    const month = calViewDate.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const startOffset = new Date(year, month, 1).getDay();
    const days = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let d = 1; d <= totalDays; d++) days.push(d);
    const selectedDate = new Date(formData[field] || '');

    return (
      <div className="p-3 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-[99999] w-64 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-black dark:text-white uppercase tracking-wider">{monthNames[month]} {year}</span>
          <div className="flex gap-1">
            <button type="button" onClick={() => setCalViewDate(new Date(year, month - 1, 1))} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><ChevronLeft size={14}/></button>
            <button type="button" onClick={() => setCalViewDate(new Date(year, month + 1, 1))} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><ChevronRight size={14}/></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <div key={i} className="text-[9px] font-black text-slate-400 text-center uppercase py-0.5">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => (
            <div key={i} className="aspect-square flex items-center justify-center">
              {day ? (
                <button
                  type="button"
                  onClick={() => {
                    const newDate = new Date(year, month, day);
                    setFormData(prev => ({ ...prev, [field]: newDate.toISOString().split('T')[0] }));
                    setActiveDatePicker(null);
                  }}
                  className={`w-full h-full flex items-center justify-center rounded-xl text-[11px] font-bold transition-all ${
                    day === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear()
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {day}
                </button>
              ) : <div />}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) onUpdate(editingId, formData);
    else onAdd(formData);
    handleClose();
  };

  const fdrCount = entries.filter(e => e.type === 'FDR').length;
  const dpsCount = entries.filter(e => e.type === 'DPS').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
            {t.title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            {language === 'en' ? 'Manage your bank deposits and pension schemes' : 'আপনার ব্যাংক আমানত এবং পেনশন স্কিম পরিচালনা করুন'}
          </p>
        </div>
        <button 
          onClick={() => setModalStage('selection')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-2xl shadow-xl shadow-blue-500/30 transition-all active:scale-95 h-[48px]"
        >
          <Plus size={20} strokeWidth={3} />
          <span>{language === 'en' ? 'New Deposit' : 'নতুন ডিপোজিট'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SummaryCard 
          title={t.fdrCountLabel} 
          value={fdrCount.toString()} 
          icon={<Layers size={22}/>} 
          color="blue" 
        />
        <SummaryCard 
          title={t.dpsCountLabel} 
          value={dpsCount.toString()} 
          icon={<PiggyBank size={22}/>} 
          color="emerald" 
        />
      </div>

      <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden transition-theme">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                <th className="px-6 py-5">{t.accTitle}</th>
                <th className="px-6 py-5">{language === 'en' ? 'Scheme Type' : 'স্কিমের ধরন'}</th>
                <th className="px-6 py-5">{t.totalDeposit}</th>
                <th className="px-6 py-5">{t.maturityAmt}</th>
                <th className="px-6 py-5">{t.openDate}</th>
                <th className="px-6 py-5 text-right">{language === 'en' ? 'Actions' : 'অ্যাকশন'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {entries.length > 0 ? (
                entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{entry.accountTitle}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <Hash size={10} /> {entry.accountNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black tracking-tighter shadow-sm ${
                        entry.type === 'FDR' ? 'bg-blue-100 text-blue-700 dark:bg-blue-700/20 dark:text-blue-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-700/20 dark:text-purple-400'
                      }`}>
                        {entry.type}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-700 dark:text-slate-300">{formatCurrency(entry.principalAmount)}</td>
                    <td className="px-6 py-5 text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(entry.maturityAmount)}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                         <Calendar size={14} className="text-slate-400" />
                         <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{entry.openingDate}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(entry)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"><Pencil size={16} /></button>
                        <button onClick={() => onDelete(entry.id)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-bold italic">
                    {language === 'en' ? 'No deposit records found' : 'কোন ডিপোজিট রেকর্ড পাওয়া যায়নি'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalStage === 'selection' && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-[#1E293B] rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 p-6">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{t.selectionTitle}</h3>
                <button onClick={handleClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white"><X size={16} /></button>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <button onClick={() => handleSelectType('FDR')} className="group p-5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left">
                 <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3 group-hover:scale-110 transition-transform"><Landmark size={20} /></div>
                 <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{t.fdrTitle}</h4>
                 <p className="text-[10px] text-slate-500 dark:text-slate-400">{language === 'en' ? 'Single deposit with higher interest' : 'এককালীন আমানত এবং উচ্চ মুনাফা'}</p>
               </button>
               <button onClick={() => handleSelectType('DPS')} className="group p-5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-purple-500 hover:bg-purple-50/50 transition-all text-left">
                 <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-3 group-hover:scale-110 transition-transform"><PiggyBank size={20} /></div>
                 <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{t.dpsTitle}</h4>
                 <p className="text-[10px] text-slate-500 dark:text-slate-400">{language === 'en' ? 'Monthly savings scheme' : 'মাসিক সঞ্চয় স্কিম'}</p>
               </button>
             </div>
          </div>
        </div>
      )}

      {modalStage === 'form' && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto pt-4 sm:pt-8">
          <div className="w-full max-w-xl bg-white dark:bg-[#1E293B] rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 mb-6">
            <div className="sticky top-0 z-[10000] px-6 py-4 bg-white dark:bg-[#1E293B] border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className={`p-2 rounded-xl ${formData.type === 'FDR' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                    {formData.type === 'FDR' ? <Landmark size={18}/> : <PiggyBank size={18}/>}
                 </div>
                 <h3 className="text-lg font-black text-slate-900 dark:text-white">{editingId ? t.update : t.save} - {formData.type}</h3>
              </div>
              <button onClick={handleClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white"><X size={16} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="relative group">
                    <input 
                      required 
                      type="text" 
                      value={formData.accountTitle} 
                      onChange={e => handleValidatedInputChange('accountTitle', e.target.value)} 
                      placeholder={t.accTitle}
                      className={`w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-4 py-3.5 text-[13px] font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-black placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest ${
                        validationErrors.accountTitle ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'
                      }`} 
                    />
                    {validationErrors.accountTitle && (
                      <p className="flex items-center gap-1 text-[9px] font-black text-rose-500 mt-1 ml-1 animate-in fade-in slide-in-from-top-1">
                        <AlertCircle size={10} strokeWidth={3} /> {validationErrors.accountTitle}
                      </p>
                    )}
                  </div>
                  <div className="relative group">
                    <input 
                      required 
                      type="tel" 
                      value={formData.mobileNumber} 
                      onChange={e => handleValidatedInputChange('mobileNumber', e.target.value)} 
                      placeholder={t.mobile}
                      className={`w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-4 py-3.5 text-[13px] font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-black placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest ${
                        validationErrors.mobileNumber ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'
                      }`} 
                    />
                    {validationErrors.mobileNumber && (
                      <p className="flex items-center gap-1 text-[9px] font-black text-rose-500 mt-1 ml-1 animate-in fade-in slide-in-from-top-1">
                        <AlertCircle size={10} strokeWidth={3} /> {validationErrors.mobileNumber}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 relative">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{language === 'en' ? 'Savings/Current Acc No' : 'সেভিংস/কারেন্ট নম্বর'}</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.accountNumber} 
                      onChange={e => handleValidatedInputChange('accountNumber', e.target.value)} 
                      className={`w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-4 py-2 text-[13px] font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all dark:text-white ${
                        validationErrors.accountNumber ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'
                      }`} 
                    />
                    {validationErrors.accountNumber && (
                      <p className="flex items-center gap-1 text-[9px] font-black text-rose-500 mt-1 ml-1 animate-in fade-in slide-in-from-top-1">
                        <AlertCircle size={10} strokeWidth={3} /> {validationErrors.accountNumber}
                      </p>
                    )}
                  </div>
                  {formData.type === 'DPS' && (
                    <div className="space-y-1 relative">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t.dpsAccNo}</label>
                      <input 
                        required 
                        type="text" 
                        value={formData.dpsAccountNumber} 
                        onChange={e => handleValidatedInputChange('dpsAccountNumber', e.target.value)} 
                        className={`w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-4 py-2 text-[13px] font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all dark:text-white ${
                          validationErrors.dpsAccountNumber ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'
                        }`} 
                      />
                      {validationErrors.dpsAccountNumber && (
                        <p className="flex items-center gap-1 text-[9px] font-black text-rose-500 mt-1 ml-1 animate-in fade-in slide-in-from-top-1">
                          <AlertCircle size={10} strokeWidth={3} /> {validationErrors.dpsAccountNumber}
                        </p>
                      )}
                    </div>
                  )}
                  {formData.type === 'FDR' && (
                    <div className="space-y-1 relative">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t.fdrAccNo}</label>
                      <input 
                        required 
                        type="text" 
                        value={formData.fdrAccountNumber} 
                        onChange={e => handleValidatedInputChange('fdrAccountNumber', e.target.value)} 
                        className={`w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-4 py-2 text-[13px] font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all dark:text-white ${
                          validationErrors.fdrAccountNumber ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'
                        }`} 
                      />
                      {validationErrors.fdrAccountNumber && (
                        <p className="flex items-center gap-1 text-[9px] font-black text-rose-500 mt-1 ml-1 animate-in fade-in slide-in-from-top-1">
                          <AlertCircle size={10} strokeWidth={3} /> {validationErrors.fdrAccountNumber}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Account Category Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 block">{t.accType}</label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <button 
                      type="button"
                      onClick={() => handleCategoryChange('Retail')}
                      className={`py-2.5 rounded-xl text-[11px] font-black transition-all ${
                        formData.accountCategory === 'Retail' 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {t.retail}
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleCategoryChange('Current')}
                      className={`py-2.5 rounded-xl text-[11px] font-black transition-all ${
                        formData.accountCategory === 'Current' 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {t.current}
                    </button>
                  </div>
                </div>

                {/* Custom Product Selection Dropdown */}
                <div className="space-y-1.5 relative" ref={productRef}>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5">
                    <Tag size={12}/> {t.product}
                  </label>
                  
                  <button 
                    type="button"
                    onClick={() => setIsProductOpen(!isProductOpen)}
                    className={`w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-[13px] font-bold text-left dark:text-white flex justify-between items-center transition-all ${
                      isProductOpen ? 'ring-4 ring-blue-500/10 border-blue-500' : ''
                    }`}
                  >
                    <span className="truncate">{formData.productName}</span>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isProductOpen ? 'rotate-180' : ''}`}/>
                  </button>

                  {isProductOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-[99999] animate-in fade-in zoom-in-95 duration-150">
                      {getAvailableProducts(formData.type, formData.accountCategory || 'Retail').map(prod => (
                        <button 
                          key={prod} 
                          type="button" 
                          onClick={() => { setFormData({...formData, productName: prod}); setIsProductOpen(false); }} 
                          className={`w-full px-5 py-3 text-left text-[13px] font-bold transition-all flex items-center justify-between ${
                            formData.productName === prod 
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          {prod}
                          {formData.productName === prod && <Check size={14} className="flex-shrink-0" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t.tenor}</label>
                    <select 
                      value={formData.tenor} 
                      onChange={e => setFormData({...formData, tenor: parseInt(e.target.value)})} 
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-[13px] font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:text-white transition-all max-h-48"
                    >
                      {tenorOptions.map(opt => (
                        <option key={opt} value={opt}>
                          {opt} {opt === 1 ? 'Month' : 'Months'} 
                          {opt % 12 === 0 ? ` (${opt / 12} ${opt / 12 === 1 ? 'Year' : 'Years'})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  {formData.type === 'DPS' && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t.installment}</label>
                      <input required type="number" value={formData.installmentAmount || ''} onChange={e => setFormData({...formData, installmentAmount: parseFloat(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-[13px] font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:text-white text-blue-600 transition-all" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t.totalDeposit}</label>
                    <input required type="number" value={formData.principalAmount || ''} onChange={e => setFormData({...formData, principalAmount: parseFloat(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-[13px] font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:text-white transition-all" />
                  </div>
                  
                  {/* Editable Interest Rate Field */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t.rate}</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        step="0.01"
                        value={formData.interestRate || ''} 
                        onChange={e => setFormData({...formData, interestRate: parseFloat(e.target.value)})} 
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-[13px] font-black text-indigo-600 dark:text-indigo-400 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all pr-10" 
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-60 pointer-events-none text-indigo-600 dark:text-indigo-400">
                        <Percent size={12} strokeWidth={3} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t.maturityAmt}</label>
                    <input required type="number" value={formData.maturityAmount || ''} onChange={e => setFormData({...formData, maturityAmount: parseFloat(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-[13px] font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:text-white text-emerald-600 transition-all" />
                  </div>
                  <div className="space-y-1 relative" ref={officerRef}>
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t.officer}</label>
                     <button type="button" onClick={() => setIsOfficerOpen(!isOfficerOpen)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-[13px] font-bold text-left dark:text-white flex justify-between items-center transition-all">
                       <span className="truncate">{formData.loanOfficer || t.selectOfficer}</span>
                       <ChevronDown size={14} className="text-slate-400 flex-shrink-0 ml-1"/>
                     </button>
                     {isOfficerOpen && (
                       <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-1 z-[99999] max-h-36 overflow-y-auto custom-scrollbar">
                          {loanOfficers.map(off => (
                            <button key={off} type="button" onClick={() => { setFormData({...formData, loanOfficer: off}); setIsOfficerOpen(false); }} className="w-full px-4 py-2 text-left text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white transition-colors">{off}</button>
                          ))}
                       </div>
                     )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 relative" ref={datePickerRef}>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t.openDate}</label>
                    <button type="button" onClick={() => { setActiveDatePicker(activeDatePicker === 'opening' ? null : 'opening'); setCalViewDate(new Date(formData.openingDate)); }} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-[13px] font-bold text-left dark:text-white flex justify-between items-center group transition-all">
                      {formData.openingDate}
                      <Calendar size={14} className="text-blue-500 flex-shrink-0" />
                    </button>
                    {activeDatePicker === 'opening' && (
                      <div className="absolute bottom-full left-0 z-[99999] mb-2">
                         {renderCalendar('openingDate')}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t.maturityDate}</label>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-[13px] font-bold text-slate-500 flex justify-between items-center cursor-not-allowed">
                       {formData.maturityDate}
                       <Calendar size={14} className="opacity-40" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button type="button" onClick={handleClose} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl transition-all text-sm hover:bg-slate-200 dark:hover:bg-slate-700">{t.cancel}</button>
                <button type="submit" className="flex-[2] py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 text-sm uppercase tracking-wider">{editingId ? t.update : t.save}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
      `}</style>
    </div>
  );
};

const SummaryCard: React.FC<{ title: string, value: string, icon: React.ReactNode, color: 'blue' | 'emerald' }> = ({ title, value, icon, color }) => (
  <div className="bg-white dark:bg-[#1E293B] p-7 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-md group">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${color === 'blue' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/40'}`}>{icon}</div>
    <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">{title}</p>
    <h4 className="text-2xl font-black mt-1 text-slate-900 dark:text-white tracking-tight">{value}</h4>
  </div>
);
