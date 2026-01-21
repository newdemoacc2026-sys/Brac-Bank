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
  entries, 
  loanOfficers, 
  fdrRetailProducts, 
  fdrCurrentProducts, 
  dpsRetailProducts, 
  dpsCurrentProducts, 
  onAdd, 
  onUpdate, 
  onDelete, 
  language 
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
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>('accountNumber');
  const [officerFilter, setOfficerFilter] = useState<string>('ALL');
  
  // Track the visible month/year in the calendar popup
  const [calViewDate, setCalViewDate] = useState(new Date());
  
  const datePickerRef = useRef<HTMLDivElement>(null);
  const officerRef = useRef<HTMLDivElement>(null);
  const officerFilterRef = useRef<HTMLDivElement>(null);
  const productRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState<Omit<FdrDps, 'id'>>({
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
    if (type === 'FDR') {
      return category === 'Retail' ? fdrRetailProducts : fdrCurrentProducts;
    }
    return category === 'Retail' ? dpsRetailProducts : dpsCurrentProducts;
  };

  const tenorOptions = Array.from({ length: 240 }, (_, i) => i + 1);

  useEffect(() => {
    const tenor = formData.tenor || 12;
    let rate = 8.5;

    const open = new Date(formData.openingDate);
    const maturity = new Date(open);
    maturity.setMonth(maturity.getMonth() + tenor);
    const maturityDateStr = maturity.toISOString().split('T')[0];

    if (formData.type === 'DPS') {
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

  const confirmDelete = (id: string) => {
    setDeletingId(id);
  };

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
    setFormData({
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
    });
  };

  const handleSelectType = (type: 'FDR' | 'DPS') => {
    const category = formData.accountCategory || 'Retail';
    const products = getAvailableProducts(type, category);
    setFormData(prev => ({ 
      ...prev, 
      type,
      productName: products[0] || '',
      loanOfficer: loanOfficers[0] || ''
    }));
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
    if (editingId) onUpdate(editingId, formData);
    else onAdd(formData);
    handleClose();
  };

  // Filtered Entries logic
  const filteredEntries = useMemo(() => {
    let results = entries;
    const query = searchQuery.trim();

    // 1. Filter by Search Query (Corrected to include all account fields)
    if (query) {
      results = results.filter(entry => {
        if (searchCriteria === 'accountNumber') {
          return (
            entry.accountNumber?.includes(query) || 
            entry.dpsAccountNumber?.includes(query) || 
            entry.fdrAccountNumber?.includes(query)
          );
        }
        return entry.mobileNumber?.includes(query);
      });
    }

    // 2. Filter by Loan Officer
    if (officerFilter !== 'ALL') {
      results = results.filter(entry => entry.loanOfficer === officerFilter);
    }

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

      {/* Search & Filter Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-[#1E293B] p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-theme">
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
           {/* Search Input */}
           <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white"
              />
           </div>
           
           <div className="flex items-center gap-2">
              {/* Criteria Selector */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <button 
                  onClick={() => setSearchCriteria('accountNumber')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${
                    searchCriteria === 'accountNumber'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                  }`}
                >
                  <Hash size={12} /> {t.criteriaAcc}
                </button>
                <button 
                  onClick={() => setSearchCriteria('mobileNumber')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${
                    searchCriteria === 'mobileNumber'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                  }`}
                >
                  <Phone size={12} /> {t.criteriaMob}
                </button>
              </div>

              {/* Officer Filter Selection */}
              <div className="relative" ref={officerFilterRef}>
                <button 
                  onClick={() => setIsOfficerFilterOpen(!isOfficerFilterOpen)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all text-[11px] font-black uppercase tracking-wider h-[44px] ${
                    officerFilter !== 'ALL' 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                   <UserCheck size={14} strokeWidth={3} />
                   <span className="hidden sm:inline">{officerFilter === 'ALL' ? t.allOfficers : officerFilter}</span>
                   <ChevronDown size={14} className={`transition-transform duration-300 ${isOfficerFilterOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOfficerFilterOpen && (
                  <div className="absolute top-full right-0 mt-3 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl py-2 z-[60] animate-in fade-in zoom-in-95 duration-150">
                     <button 
                       onClick={() => { setOfficerFilter('ALL'); setIsOfficerFilterOpen(false); }}
                       className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-black transition-all ${
                         officerFilter === 'ALL' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                       }`}
                     >
                       {t.allOfficers}
                       {officerFilter === 'ALL' && <Check size={14} />}
                     </button>
                     <div className="h-[1px] bg-slate-100 dark:bg-slate-700 my-1 mx-2" />
                     {loanOfficers.map(off => (
                       <button 
                         key={off}
                         onClick={() => { setOfficerFilter(off); setIsOfficerFilterOpen(false); }}
                         className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-black transition-all ${
                           officerFilter === off ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                         }`}
                       >
                         {off}
                         {officerFilter === off && <Check size={14} />}
                       </button>
                     ))}
                  </div>
                )}
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SummaryCard 
          title={t.fdrCountLabel} 
          value={fdrEntries.length.toString()} 
          icon={<Layers size={22}/>} 
          color="blue" 
          active={activeSegment === 'FDR'}
          onClick={() => setActiveSegment('FDR')}
        />
        <SummaryCard 
          title={t.dpsCountLabel} 
          value={dpsEntries.length.toString()} 
          icon={<PiggyBank size={22}/>} 
          color="purple" 
          active={activeSegment === 'DPS'}
          onClick={() => setActiveSegment('DPS')}
        />
      </div>

      {/* Segment Navigation */}
      <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit border border-slate-200 dark:border-slate-700">
        <button 
          onClick={() => setActiveSegment('FDR')}
          className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeSegment === 'FDR' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          FDR
        </button>
        <button 
          onClick={() => setActiveSegment('DPS')}
          className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeSegment === 'DPS' 
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          DPS
        </button>
      </div>

      {/* Box View (Card-based Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
        {displayItems.length > 0 ? (
          displayItems.map(entry => (
            <EntryCard 
              key={entry.id} 
              entry={entry} 
              language={language} 
              onEdit={() => handleEdit(entry)} 
              onDelete={() => confirmDelete(entry.id)} 
            />
          ))
        ) : (
          <div className="col-span-full py-24 text-center bg-white dark:bg-[#1E293B] rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-md animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 dark:text-slate-600">
              {isFiltered ? <Search size={40} /> : <Info size={40} />}
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
              {isFiltered ? (language === 'en' ? 'No Matches Found' : 'কোন মিল পাওয়া যায়নি') : (activeSegment === 'FDR' ? t.noFdr : t.noDps)}
            </h3>
            <p className="text-slate-400 font-bold italic px-8 max-w-md mx-auto">
              {isFiltered ? t.noSearchResults : (activeSegment === 'FDR' ? t.noFdr : t.noDps)}
            </p>
            {isFiltered && (
              <button 
                onClick={() => { setSearchQuery(''); setOfficerFilter('ALL'); }}
                className="mt-6 text-xs font-black text-blue-600 dark:text-blue-400 hover:underline"
              >
                {language === 'en' ? 'Clear all filters' : 'সব ফিল্টার মুছুন'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-[#1E293B] rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 p-8 text-center animate-in zoom-in-95 duration-200">
             <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} />
             </div>
             <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight mb-2">{language === 'en' ? 'Confirm Deletion' : 'মুছে ফেলার নিশ্চিতকরণ'}</h3>
             <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">{t.confirmDelete}</p>
             <div className="flex gap-3">
               <button onClick={() => setDeletingId(null)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition-colors text-xs">{t.cancel}</button>
               <button onClick={handlePerformDelete} className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-500/20 transition-all text-xs uppercase tracking-wider">{t.deleteAction}</button>
             </div>
          </div>
        </div>
      )}

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
                    <input required type="text" value={formData.accountTitle} onChange={e => handleValidatedInputChange('accountTitle', e.target.value)} placeholder={t.accTitle} className={`w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-4 py-3.5 text-[13px] font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-black placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest ${validationErrors.accountTitle ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'}`} />
                    {validationErrors.accountTitle && <p className="flex items-center gap-1 text-[9px] font-black text-rose-500 mt-1 ml-1 animate-in fade-in slide-in-from-top-1"><AlertCircle size={10} strokeWidth={3} /> {validationErrors.accountTitle}</p>}
                  </div>
                  <div className="relative group">
                    <input required type="tel" value={formData.mobileNumber} onChange={e => handleValidatedInputChange('mobileNumber', e.target.value)} placeholder={t.mobile} className={`w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-4 py-3.5 text-[13px] font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-black placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest ${validationErrors.mobileNumber ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'}`} />
                    {validationErrors.mobileNumber && <p className="flex items-center gap-1 text-[9px] font-black text-rose-500 mt-1 ml-1 animate-in fade-in slide-in-from-top-1"><AlertCircle size={10} strokeWidth={3} /> {validationErrors.mobileNumber}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 relative">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{language === 'en' ? 'Savings/Current Acc No' : 'সেভিংস/কারেন্ট নম্বর'}</label>
                    <input required type="text" value={formData.accountNumber} onChange={e => handleValidatedInputChange('accountNumber', e.target.value)} className={`w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-4 py-2 text-[13px] font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all dark:text-white ${validationErrors.accountNumber ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'}`} />
                    {validationErrors.accountNumber && <p className="flex items-center gap-1 text-[9px] font-black text-rose-500 mt-1 ml-1 animate-in fade-in slide-in-from-top-1"><AlertCircle size={10} strokeWidth={3} /> {validationErrors.accountNumber}</p>}
                  </div>
                  {formData.type === 'DPS' && (
                    <div className="space-y-1 relative">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t.dpsAccNo}</label>
                      <input required type="text" value={formData.dpsAccountNumber} onChange={e => handleValidatedInputChange('dpsAccountNumber', e.target.value)} className={`w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-4 py-2 text-[13px] font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all dark:text-white ${validationErrors.dpsAccountNumber ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'}`} />
                      {validationErrors.dpsAccountNumber && <p className="flex items-center gap-1 text-[9px] font-black text-rose-500 mt-1 ml-1 animate-in fade-in slide-in-from-top-1"><AlertCircle size={10} strokeWidth={3} /> {validationErrors.dpsAccountNumber}</p>}
                    </div>
                  )}
                  {formData.type === 'FDR' && (
                    <div className="space-y-1 relative">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t.fdrAccNo}</label>
                      <input required type="text" value={formData.fdrAccountNumber} onChange={e => handleValidatedInputChange('fdrAccountNumber', e.target.value)} className={`w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-4 py-2 text-[13px] font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all dark:text-white ${validationErrors.fdrAccountNumber ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'}`} />
                      {validationErrors.fdrAccountNumber && <p className="flex items-center gap-1 text-[9px] font-black text-rose-500 mt-1 ml-1 animate-in fade-in slide-in-from-top-1"><AlertCircle size={10} strokeWidth={3} /> {validationErrors.fdrAccountNumber}</p>}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 block">{t.accType}</label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <button type="button" onClick={() => handleCategoryChange('Retail')} className={`py-2.5 rounded-xl text-[11px] font-black transition-all ${formData.accountCategory === 'Retail' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{t.retail}</button>
                    <button type="button" onClick={() => handleCategoryChange('Current')} className={`py-2.5 rounded-xl text-[11px] font-black transition-all ${formData.accountCategory === 'Current' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{t.current}</button>
                  </div>
                </div>
                <div className="space-y-1.5 relative" ref={productRef}>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5"><Tag size={12}/> {t.product}</label>
                  <button type="button" onClick={() => setIsProductOpen(!isProductOpen)} className={`w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-[13px] font-bold text-left dark:text-white flex justify-between items-center transition-all ${isProductOpen ? 'ring-4 ring-blue-500/10 border-blue-500' : ''}`}><span className="truncate">{formData.productName || 'Select Product'}</span><ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isProductOpen ? 'rotate-180' : ''}`}/></button>
                  {isProductOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-[99999] animate-in fade-in zoom-in-95 duration-150">
                      {getAvailableProducts(formData.type, formData.accountCategory || 'Retail').map(prod => (
                        <button key={prod} type="button" onClick={() => { setFormData({...formData, productName: prod}); setIsProductOpen(false); }} className={`w-full px-5 py-3 text-left text-[13px] font-bold transition-all flex items-center justify-between ${formData.productName === prod ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>{prod} {formData.productName === prod && <Check size={14} className="flex-shrink-0" />}</button>
                      ))}
                      {getAvailableProducts(formData.type, formData.accountCategory || 'Retail').length === 0 && (
                        <p className="px-5 py-3 text-xs text-slate-400 italic">No products found. Add them in Settings.</p>
                      )}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t.tenor}</label>
                    <select value={formData.tenor} onChange={e => setFormData({...formData, tenor: parseInt(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-[13px] font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:text-white transition-all max-h-48">{tenorOptions.map(opt => (<option key={opt} value={opt}>{opt} {opt === 1 ? 'Month' : 'Months'} {opt % 12 === 0 ? ` (${opt / 12} ${opt / 12 === 1 ? 'Year' : 'Years'})` : ''}</option>))}</select>
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
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t.rate}</label>
                    <div className="relative">
                      <input type="number" step="0.01" value={formData.interestRate || ''} onChange={e => setFormData({...formData, interestRate: parseFloat(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-[13px] font-black text-indigo-600 dark:text-indigo-400 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all pr-10" />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-60 pointer-events-none text-indigo-600 dark:text-indigo-400"><Percent size={12} strokeWidth={3} /></div>
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
                     <button type="button" onClick={() => setIsOfficerOpen(!isOfficerOpen)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-[13px] font-bold text-left dark:text-white flex justify-between items-center transition-all"><span className="truncate">{formData.loanOfficer || t.selectOfficer}</span><ChevronDown size={14} className="text-slate-400 flex-shrink-0 ml-1"/></button>
                     {isOfficerOpen && (
                       <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-1 z-[99999] max-h-36 overflow-y-auto custom-scrollbar">{loanOfficers.map(off => (<button key={off} type="button" onClick={() => { setFormData({...formData, loanOfficer: off}); setIsOfficerOpen(false); }} className="w-full px-4 py-2 text-left text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white transition-colors">{off}</button>))}</div>
                     )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 relative" ref={datePickerRef}>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t.openDate}</label>
                    <button type="button" onClick={() => { setActiveDatePicker(activeDatePicker === 'opening' ? null : 'opening'); setCalViewDate(new Date(formData.openingDate)); }} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-[13px] font-bold text-left dark:text-white flex justify-between items-center group transition-all">{formData.openingDate}<Calendar size={14} className="text-blue-500 flex-shrink-0" /></button>
                    {activeDatePicker === 'opening' && <div className="absolute bottom-full left-0 z-[99999] mb-2">{renderCalendar('openingDate')}</div>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t.maturityDate}</label>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-[13px] font-bold text-slate-500 flex justify-between items-center cursor-not-allowed">{formData.maturityDate}<Calendar size={14} className="opacity-40" /></div>
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

// Sub-component for individual card view
const EntryCard: React.FC<{ 
  entry: FdrDps, 
  language: 'en' | 'bn', 
  onEdit: () => void, 
  onDelete: () => void 
}> = ({ entry, language, onEdit, onDelete }) => {
  const isRetail = entry.accountCategory === 'Retail';
  const isFdr = entry.type === 'FDR';
  const t = {
    accNo: language === 'en' ? 'Acc No' : 'অ্যাকাউন্ট',
    mobile: language === 'en' ? 'Mobile' : 'মোবাইল',
    tenor: language === 'en' ? 'Tenor' : 'মেয়াদ',
    principal: language === 'en' ? 'Principal' : 'আসল',
    maturity: language === 'en' ? 'Maturity' : 'পরিপক্কতা',
    months: language === 'en' ? 'Mo' : 'মাস',
    rate: language === 'en' ? 'Rate' : 'হার',
  };

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group h-full">
      {/* Card Header */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex justify-between items-start mb-4">
           <div className={`p-2.5 rounded-xl ${isFdr ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'}`}>
              {isFdr ? <Landmark size={18}/> : <PiggyBank size={18}/>}
           </div>
           <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
              isRetail 
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-700/20 dark:text-emerald-400' 
                : 'bg-orange-100 text-orange-700 dark:bg-orange-700/20 dark:text-orange-400'
           }`}>
             {isRetail ? (language === 'en' ? 'Retail' : 'রিটেইল') : (language === 'en' ? 'Current' : 'কারেন্ট')}
           </span>
        </div>
        <h4 className="text-lg font-black text-slate-900 dark:text-white truncate leading-tight mb-1">{entry.accountTitle}</h4>
        <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
          <Hash size={12} className="opacity-50" /> {entry.accountNumber}
        </p>
      </div>

      {/* Card Body */}
      <div className="p-6 flex-1 space-y-5">
        <div className="grid grid-cols-2 gap-4">
           <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{t.principal}</p>
              <p className="text-sm font-black text-slate-700 dark:text-slate-200">{formatCurrency(entry.principalAmount)}</p>
           </div>
           <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{t.maturity}</p>
              <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(entry.maturityAmount)}</p>
           </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
           <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{t.tenor}</p>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                {entry.tenor} {t.months}
                <span className="opacity-40 font-medium ml-1">({(entry.tenor || 12) / 12}y)</span>
              </p>
           </div>
           <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{t.rate}</p>
              <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
                {entry.interestRate}% <Percent size={10} strokeWidth={3} />
              </p>
           </div>
        </div>
        <div className="pt-4 border-t border-slate-50 dark:border-slate-800/50 flex flex-col gap-2">
           <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                 <Calendar size={12} /> {entry.openingDate}
              </span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-300">
                 → {entry.maturityDate}
              </span>
           </div>
           {entry.loanOfficer && (
             <div className="flex items-center gap-2 mt-1">
                <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[8px] font-black text-slate-500">
                   <Briefcase size={10} />
                </div>
                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 truncate">{entry.loanOfficer}</span>
             </div>
           )}
           <div className="flex items-center gap-1.5 mt-1 text-[10px] font-bold text-slate-400">
              <Phone size={10} /> {entry.mobileNumber}
           </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/40 flex gap-2 border-t border-slate-100 dark:border-slate-800">
        <button onClick={onEdit} className="flex-1 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5 text-[11px] font-black uppercase tracking-wider">
          <Pencil size={14} /> Edit
        </button>
        <button onClick={onDelete} className="flex-1 py-2 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400 hover:bg-rose-100 transition-colors flex items-center justify-center gap-1.5 text-[11px] font-black uppercase tracking-wider">
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </div>
  );
};

const SummaryCard: React.FC<{ 
  title: string, 
  value: string, 
  icon: React.ReactNode, 
  color: 'blue' | 'purple',
  active?: boolean,
  onClick?: () => void
}> = ({ title, value, icon, color, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`p-7 rounded-[2.5rem] border transition-all duration-300 flex flex-col items-start text-left w-full group relative ${
      active 
        ? (color === 'blue' ? 'bg-blue-600 border-blue-500 shadow-xl shadow-blue-500/30' : 'bg-purple-600 border-purple-500 shadow-xl shadow-purple-500/30')
        : 'bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg'
    }`}
  >
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${
      active 
        ? 'bg-white/20 text-white' 
        : (color === 'blue' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' : 'bg-purple-600 text-white shadow-lg shadow-purple-500/40')
    }`}>
      {icon}
    </div>
    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${active ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'}`}>{title}</p>
    <h4 className={`text-3xl font-black tracking-tight ${active ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{value}</h4>
    {active && (
      <div className="absolute top-6 right-6 w-2 h-2 bg-white rounded-full animate-ping" />
    )}
  </button>
);