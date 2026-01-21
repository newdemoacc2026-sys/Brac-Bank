
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Plus, User, Phone, Hash, Calendar, Trash2, X, 
  AlertCircle, ChevronLeft, ChevronRight, Check, ChevronDown,
  PiggyBank, ArrowUpRight, ArrowDownRight, Layers, Pencil,
  ArrowRight, Calculator, Landmark, ShieldCheck, TrendingUp,
  Briefcase, Tag, Percent, Info, AlertTriangle, Search, Filter, UserCheck
} from 'lucide-react';
import { FdrDps } from '../types';
import { formatCurrency } from '../utils/finance';

interface FdrDpsViewProps {
  entries: FdrDps[];
  loanOfficers: string[];
  fdrRetailProducts: string[];
  fdrCurrentProducts: string[];
  dpsRetailProducts: string[];
  dpsCurrentProducts: string[];
  onAdd: (entry: Omit<FdrDps, 'id'>) => void;
  onUpdate: (id: string, entry: Omit<FdrDps, 'id'>) => void;
  onDelete: (id: string) => void;
  language: 'en' | 'bn';
}

type ModalStage = 'selection' | 'form' | null;
type SearchCriteria = 'accountNumber' | 'mobileNumber';

export const FdrDpsView: React.FC<FdrDpsViewProps> = ({ 
  entries, loanOfficers, 
  fdrRetailProducts, fdrCurrentProducts,
  dpsRetailProducts, dpsCurrentProducts,
  onAdd, onUpdate, onDelete, language 
}) => {
  const [modalStage, setModalStage] = useState<ModalStage>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeSegment, setActiveSegment] = useState<'FDR' | 'DPS'>('FDR');
  const [activeDatePicker, setActiveDatePicker] = useState<'opening' | 'maturity' | null>(null);
  const [isOfficerOpen, setIsOfficerOpen] = useState(false);
  const [isOfficerFilterOpen, setIsOfficerFilterOpen] = useState(false);
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>('accountNumber');
  const [officerFilter, setOfficerFilter] = useState<string>('ALL');
  const [calViewDate, setCalViewDate] = useState(new Date());
  
  const datePickerRef = useRef<HTMLDivElement>(null);
  const officerRef = useRef<HTMLDivElement>(null);
  const officerFilterRef = useRef<HTMLDivElement>(null);
  const productRef = useRef<HTMLDivElement>(null);
  
  const initialFormData: Omit<FdrDps, 'id'> = {
    accountTitle: '',
    accountNumber: '',
    dpsAccountNumber: '',
    fdrAccountNumber: '',
    mobileNumber: '',
    type: 'FDR',
    accountCategory: 'Retail',
    productName: '',
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
  };

  const [formData, setFormData] = useState<Omit<FdrDps, 'id'>>(initialFormData);

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
    allOfficers: language === 'en' ? 'All Officers' : 'সব অফিসার',
    selectOfficer: language === 'en' ? 'Select Officer' : 'অফিসার নির্বাচন করুন',
    errNumbersNotAllowed: language === 'en' ? 'Numbers are not allowed' : 'সংখ্যা অনুমোদিত নয়',
    errLettersNotAllowed: language === 'en' ? 'Letters are not allowed' : 'অক্ষর অনুমোদিত নয়',
    fdrCountLabel: language === 'en' ? 'Total FDR Schemes' : 'মোট এফডিআর স্কিম',
    dpsCountLabel: language === 'en' ? 'Total DPS Schemes' : 'মোট ডিপিএস স্কিম',
    confirmDelete: language === 'en' ? 'Are you sure you want to delete this record?' : 'আপনি কি নিশ্চিত যে আপনি এই রেকর্ডটি মুছে ফেলতে চান?',
    deleteAction: language === 'en' ? 'Delete Record' : 'রেকর্ড মুছুন',
    noFdr: language === 'en' ? 'No FDR records found' : 'কোন এফডিআর রেকর্ড পাওয়া যায়নি',
    noDps: language === 'en' ? 'No DPS records found' : 'কোন ডিপিএস রেকর্ড পাওয়া যায়নি',
    searchPlaceholder: language === 'en' ? 'Search records...' : 'রেকর্ড খুঁজুন...',
    criteriaAcc: language === 'en' ? 'Account No' : 'অ্যাকাউন্ট নম্বর',
    criteriaMob: language === 'en' ? 'Mobile No' : 'মোবাইল নম্বর',
    noSearchResults: language === 'en' ? 'No data found with this Account or Mobile number' : 'এই অ্যাকাউন্ট নম্বর বা মোবাইল নম্বর দিয়ে কোনো তথ্য পাওয়া যায়নি',
  };

  const getAvailableProducts = (type: 'FDR' | 'DPS', category: 'Retail' | 'Current') => {
    if (type === 'FDR') return category === 'Retail' ? fdrRetailProducts : fdrCurrentProducts;
    return category === 'Retail' ? dpsRetailProducts : dpsCurrentProducts;
  };

  const tenorOptions = Array.from({ length: 240 }, (_, i) => i + 1);

  // Math Engine
  useEffect(() => {
    const tenor = formData.tenor || 12;
    const rate = formData.interestRate || 8.5;
    const opening = new Date(formData.openingDate);
    const maturity = new Date(opening);
    maturity.setMonth(maturity.getMonth() + tenor);
    const maturityDateStr = maturity.toISOString().split('T')[0];

    let principal = formData.principalAmount || 0;
    if (formData.type === 'DPS') {
      principal = (formData.installmentAmount || 0) * tenor;
    }

    const totalInterest = (principal * (rate / 100) * (tenor / 12));
    const maturityAmount = principal + totalInterest;

    setFormData(prev => ({
      ...prev,
      principalAmount: principal,
      maturityAmount: Math.round(maturityAmount),
      totalInterest: Math.round(totalInterest),
      maturityDate: maturityDateStr,
      endDate: maturityDateStr
    }));
  }, [formData.tenor, formData.installmentAmount, formData.openingDate, formData.type, formData.interestRate, formData.principalAmount]);

  const handleEdit = (entry: FdrDps) => {
    setEditingId(entry.id);
    setFormData({ ...entry });
    setModalStage('form');
  };

  const confirmDelete = (id: string) => setDeletingId(id);

  const handlePerformDelete = () => {
    if (deletingId) {
      onDelete(deletingId);
      setDeletingId(null);
    }
  };

  const handleClose = () => {
    setModalStage(null);
    setEditingId(null);
    setActiveDatePicker(null);
    setIsOfficerOpen(false);
    setIsProductOpen(false);
    setValidationErrors({});
    setFormData(initialFormData);
  };

  const handleSelectType = (type: 'FDR' | 'DPS') => {
    const category = 'Retail';
    const products = getAvailableProducts(type, category);
    setFormData({
      ...initialFormData,
      type,
      productName: products[0] || '',
      loanOfficer: loanOfficers[0] || ''
    });
    setModalStage('form');
  };

  const handleCategoryChange = (category: 'Retail' | 'Current') => {
    const products = getAvailableProducts(formData.type, category);
    setFormData(prev => ({
      ...prev,
      accountCategory: category,
      productName: products[0] || ''
    }));
  };

  const handleValidatedInputChange = (name: keyof typeof formData, value: string) => {
    let sanitizedValue = value;
    let error = '';
    if (name === 'accountTitle') {
      sanitizedValue = value.replace(/[0-9]/g, '');
      if (value !== sanitizedValue) error = t.errNumbersNotAllowed;
    } else if (name === 'mobileNumber' || name === 'dpsAccountNumber' || name === 'accountNumber' || name === 'fdrAccountNumber') {
      sanitizedValue = value.replace(/[^0-9]/g, '');
      if (value !== sanitizedValue) error = t.errLettersNotAllowed;
    }
    setValidationErrors(prev => ({ ...prev, [name]: error }));
    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) setActiveDatePicker(null);
      if (officerRef.current && !officerRef.current.contains(event.target as Node)) setIsOfficerOpen(false);
      if (officerFilterRef.current && !officerFilterRef.current.contains(event.target as Node)) setIsOfficerFilterOpen(false);
      if (productRef.current && !productRef.current.contains(event.target as Node)) setIsProductOpen(false);
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
          {['S','M','T','W','T','F','S'].map((d, i) => <div key={i} className="text-[9px] font-black text-slate-400 text-center uppercase py-0.5">{d}</div>)}
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
    onAdd(formData);
    handleClose();
  };

  const filteredEntries = useMemo(() => {
    let results = entries;
    const query = searchQuery.trim();
    if (query) {
      results = results.filter(entry => {
        if (searchCriteria === 'accountNumber') {
          return entry.accountNumber?.includes(query) || entry.dpsAccountNumber?.includes(query) || entry.fdrAccountNumber?.includes(query);
        }
        return entry.mobileNumber?.includes(query);
      });
    }
    if (officerFilter !== 'ALL') results = results.filter(entry => entry.loanOfficer === officerFilter);
    return results;
  }, [entries, searchQuery, searchCriteria, officerFilter]);

  const fdrEntries = filteredEntries.filter(e => e.type === 'FDR');
  const dpsEntries = filteredEntries.filter(e => e.type === 'DPS');
  const displayItems = activeSegment === 'FDR' ? fdrEntries : dpsEntries;
  const isFiltered = searchQuery.trim().length > 0 || officerFilter !== 'ALL';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{t.title}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">{language === 'en' ? 'Manage your bank deposits' : 'আপনার ব্যাংক আমানত পরিচালনা করুন'}</p>
        </div>
        <button onClick={() => setModalStage('selection')} className="flex items-center gap-2 bg-blue-600 text-white font-black px-6 py-3 rounded-2xl shadow-xl h-[48px] transition-all active:scale-95"><Plus size={20} strokeWidth={3} /><span>{language === 'en' ? 'New Deposit' : 'নতুন ডিপোজিট'}</span></button>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-[#1E293B] p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
           <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder={t.searchPlaceholder} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold outline-none dark:text-white" />
           </div>
           <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <button onClick={() => setSearchCriteria('accountNumber')} className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${searchCriteria === 'accountNumber' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}><Hash size={12} /> {t.criteriaAcc}</button>
                <button onClick={() => setSearchCriteria('mobileNumber')} className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${searchCriteria === 'mobileNumber' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}><Phone size={12} /> {t.criteriaMob}</button>
              </div>
              <div className="relative" ref={officerFilterRef}>
                <button onClick={() => setIsOfficerFilterOpen(!isOfficerFilterOpen)} className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-[11px] font-black uppercase ${officerFilter !== 'ALL' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600'}`}><UserCheck size={14}/><span className="hidden sm:inline">{officerFilter === 'ALL' ? t.allOfficers : officerFilter}</span><ChevronDown size={14}/></button>
                {isOfficerFilterOpen && (
                  <div className="absolute top-full right-0 mt-3 w-56 bg-white dark:bg-slate-800 border rounded-2xl shadow-2xl py-2 z-[60]">{loanOfficers.map(off => (<button key={off} onClick={() => { setOfficerFilter(off); setIsOfficerFilterOpen(false); }} className={`w-full text-left px-4 py-2 text-xs font-black ${officerFilter === off ? 'text-blue-600' : 'text-slate-600'}`}>{off}</button>))}</div>
                )}
              </div>
           </div>
        </div>
      </div>

      <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit border border-slate-200 dark:border-slate-700">
        <button onClick={() => setActiveSegment('FDR')} className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${activeSegment === 'FDR' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>FDR</button>
        <button onClick={() => setActiveSegment('DPS')} className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${activeSegment === 'DPS' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500'}`}>DPS</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
        {displayItems.length > 0 ? displayItems.map(entry => (<EntryCard key={entry.id} entry={entry} language={language} onEdit={() => handleEdit(entry)} onDelete={() => confirmDelete(entry.id)} />)) : (<div className="col-span-full py-24 text-center bg-white dark:bg-[#1E293B] rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-md"><Search size={40} className="mx-auto mb-6 text-slate-300"/><p className="text-slate-400 font-bold italic">{isFiltered ? t.noSearchResults : (activeSegment === 'FDR' ? t.noFdr : t.noDps)}</p></div>)}
      </div>

      {modalStage === 'selection' && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-[#1E293B] rounded-[2rem] shadow-2xl p-6">
             <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-black text-slate-900 dark:text-white">{t.selectionTitle}</h3><button onClick={handleClose} className="p-2 text-slate-500"><X size={16} /></button></div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <button onClick={() => handleSelectType('FDR')} className="group p-5 bg-slate-50 dark:bg-slate-900/50 border rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left"><div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-3"><Landmark size={20} /></div><h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{t.fdrTitle}</h4></button>
               <button onClick={() => handleSelectType('DPS')} className="group p-5 bg-slate-50 dark:bg-slate-900/50 border rounded-2xl hover:border-purple-500 hover:bg-purple-50/50 transition-all text-left"><div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-3"><PiggyBank size={20} /></div><h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{t.dpsTitle}</h4></button>
             </div>
          </div>
        </div>
      )}

      {modalStage === 'form' && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto pt-8">
          <div className="w-full max-w-xl bg-white dark:bg-[#1E293B] rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-6">
            <div className="sticky top-0 z-[10000] px-6 py-4 bg-white dark:bg-[#1E293B] border-b border-slate-100 dark:border-slate-800 flex items-center justify-between"><div className="flex items-center gap-3"><div className={`p-2 rounded-xl ${formData.type === 'FDR' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>{formData.type === 'FDR' ? <Landmark size={18}/> : <PiggyBank size={18}/>}</div><h3 className="text-lg font-black text-slate-900 dark:text-white">{editingId ? t.update : t.save} - {formData.type}</h3></div><button onClick={handleClose} className="p-2 text-slate-500"><X size={16} /></button></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input required type="text" value={formData.accountTitle} onChange={e => handleValidatedInputChange('accountTitle', e.target.value)} placeholder={t.accTitle} className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-4 py-3.5 text-[13px] font-bold outline-none" />
                  <input required type="tel" value={formData.mobileNumber} onChange={e => handleValidatedInputChange('mobileNumber', e.target.value)} placeholder={t.mobile} className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-4 py-3.5 text-[13px] font-bold outline-none" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Savings Acc No</label><input required type="text" value={formData.accountNumber} onChange={e => handleValidatedInputChange('accountNumber', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-4 py-2 text-[13px] font-bold" /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">{formData.type === 'FDR' ? t.fdrAccNo : t.dpsAccNo}</label><input required type="text" value={formData.type === 'FDR' ? formData.fdrAccountNumber : formData.dpsAccountNumber} onChange={e => handleValidatedInputChange(formData.type === 'FDR' ? 'fdrAccountNumber' : 'dpsAccountNumber', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-4 py-2 text-[13px] font-bold" /></div>
                </div>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200">
                  <button type="button" onClick={() => handleCategoryChange('Retail')} className={`py-2.5 rounded-xl text-[11px] font-black ${formData.accountCategory === 'Retail' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>{t.retail}</button>
                  <button type="button" onClick={() => handleCategoryChange('Current')} className={`py-2.5 rounded-xl text-[11px] font-black ${formData.accountCategory === 'Current' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>{t.current}</button>
                </div>
                <div className="relative" ref={productRef}>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 block"><Tag size={12} className="inline mr-1" /> {t.product}</label>
                  <button type="button" onClick={() => setIsProductOpen(!isProductOpen)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-[13px] font-bold text-left flex justify-between items-center"><span className="truncate">{formData.productName || 'Select Product'}</span><ChevronDown size={16}/></button>
                  {isProductOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1E293B] border rounded-2xl shadow-2xl py-2 z-[99999] max-h-48 overflow-y-auto">
                      {getAvailableProducts(formData.type, formData.accountCategory || 'Retail').map(prod => (
                        <button key={prod} type="button" onClick={() => { setFormData({...formData, productName: prod}); setIsProductOpen(false); }} className={`w-full px-5 py-3 text-left text-[13px] font-bold ${formData.productName === prod ? 'bg-blue-50 text-blue-600' : 'text-slate-600'}`}>{prod}</button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Tenor</label><select value={formData.tenor} onChange={e => setFormData({...formData, tenor: parseInt(e.target.value)})} className="w-full bg-slate-50 border rounded-xl px-4 py-2 text-[13px] font-bold">{tenorOptions.map(opt => (<option key={opt} value={opt}>{opt} Months</option>))}</select></div>
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">{formData.type === 'FDR' ? 'Principal' : 'Installment'}</label><input required type="number" value={formData.type === 'FDR' ? formData.principalAmount : formData.installmentAmount} onChange={e => setFormData({...formData, [formData.type === 'FDR' ? 'principalAmount' : 'installmentAmount']: parseFloat(e.target.value)})} className="w-full bg-slate-50 border rounded-xl px-4 py-2 text-[13px] font-bold text-blue-600" /></div>
                </div>
              </div>
              <div className="flex gap-3 pt-3">
                <button type="button" onClick={handleClose} className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm">Cancel</button>
                <button type="submit" className="flex-[2] py-2.5 bg-blue-600 text-white font-black rounded-xl text-sm uppercase tracking-wider">{editingId ? t.update : t.save}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const EntryCard: React.FC<{ entry: FdrDps, language: 'en' | 'bn', onEdit: () => void, onDelete: () => void }> = ({ entry, language, onEdit, onDelete }) => {
  const isFdr = entry.type === 'FDR';
  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-md flex flex-col h-full group transition-all">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex justify-between items-start mb-4">
           <div className={`p-2.5 rounded-xl ${isFdr ? 'bg-blue-600' : 'bg-purple-600'} text-white shadow-lg`}>{isFdr ? <Landmark size={18}/> : <PiggyBank size={18}/>}</div>
           <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-600">{entry.type} • {entry.accountCategory}</span>
        </div>
        <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight mb-1 truncate">{entry.accountTitle}</h4>
        <p className="text-[11px] font-bold text-slate-500">{entry.accountNumber}</p>
      </div>
      <div className="p-6 flex-1 space-y-4">
        <div className="grid grid-cols-2 gap-4">
           <div><p className="text-[9px] font-black uppercase text-slate-400">Principal</p><p className="text-sm font-black text-slate-700 dark:text-slate-200">{formatCurrency(entry.principalAmount)}</p></div>
           <div><p className="text-[9px] font-black uppercase text-slate-400">Maturity</p><p className="text-sm font-black text-emerald-600">{formatCurrency(entry.maturityAmount)}</p></div>
        </div>
        <p className="text-[10px] font-bold text-slate-400 italic truncate"><Tag size={10} className="inline mr-1" />{entry.productName}</p>
      </div>
      <div className="p-4 bg-slate-50 dark:bg-slate-800/40 flex gap-2 border-t">
        <button onClick={onEdit} className="flex-1 py-2 rounded-xl bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider"><Pencil size={14} className="inline mr-1"/> Edit</button>
        <button onClick={onDelete} className="flex-1 py-2 rounded-xl bg-rose-50 text-rose-500 text-[10px] font-black uppercase tracking-wider"><Trash2 size={14} className="inline mr-1"/> Delete</button>
      </div>
    </div>
  );
};

const SummaryCard: React.FC<{ title: string, value: string, icon: React.ReactNode, color: 'blue' | 'purple', active?: boolean, onClick?: () => void }> = ({ title, value, icon, color, active, onClick }) => (
  <button onClick={onClick} className={`p-7 rounded-[2.5rem] border transition-all text-left w-full relative ${active ? (color === 'blue' ? 'bg-blue-600 border-blue-500 shadow-xl shadow-blue-500/30' : 'bg-purple-600 border-purple-500 shadow-xl shadow-purple-500/30') : 'bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 shadow-md'}`}>
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${active ? 'bg-white/20 text-white' : (color === 'blue' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white')}`}>{icon}</div>
    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${active ? 'text-white/70' : 'text-slate-500'}`}>{title}</p>
    <h4 className={`text-3xl font-black ${active ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{value}</h4>
  </button>
);
