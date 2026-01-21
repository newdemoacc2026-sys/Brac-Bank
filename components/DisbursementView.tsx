
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Plus, User, Phone, Hash, Briefcase, Calendar, Trash2, X, 
  AlertCircle, ChevronLeft, ChevronRight, Check, ChevronDown,
  Filter, CalendarDays, Pencil, Search, Users, LayoutGrid, List,
  AlertTriangle, FileQuestion, UserCheck, Clock
} from 'lucide-react';
import { Disbursement } from '../types';
import { formatCurrency } from '../utils/finance';
import { AdvancedDatePicker } from './AdvancedDatePicker';

interface DisbursementViewProps {
  disbursements: Disbursement[];
  loanOfficers: string[];
  onAddDisbursement: (dis: Omit<Disbursement, 'id'>) => void;
  onUpdateDisbursement: (id: string, dis: Omit<Disbursement, 'id'>) => void;
  onDeleteDisbursement: (id: string) => void;
  language: 'en' | 'bn';
}

type SearchCriteria = 'accountNumber' | 'mobileNumber';

export const DisbursementView: React.FC<DisbursementViewProps> = ({ 
  disbursements, 
  loanOfficers,
  onAddDisbursement, 
  onUpdateDisbursement,
  onDeleteDisbursement,
  language 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isOfficerOpen, setIsOfficerOpen] = useState(false);
  const [isOfficerFilterOpen, setIsOfficerFilterOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>('accountNumber');
  const [officerFilter, setOfficerFilter] = useState<string>('ALL');
  
  // Date filter state
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const datePickerRef = useRef<HTMLDivElement>(null);
  const officerRef = useRef<HTMLDivElement>(null);
  const officerFilterRef = useRef<HTMLDivElement>(null);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Omit<Disbursement, 'id'>>({
    accountTitle: '',
    accountNumber: '',
    mobileNumber: '',
    loanAmount: 0,
    disbursementAmount: 0,
    loanOfficer: '',
    date: new Date().toISOString().split('T')[0]
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', ' June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const currentPickerDate = new Date(formData.date);
  const [viewDate, setViewDate] = useState(new Date(formData.date));

  const t = {
    title: language === 'en' ? 'Disbursement Management' : 'ডিসবার্সমেন্ট ম্যানেজমেন্ট',
    subtitle: language === 'en' ? 'Manage and track all loan disbursements' : 'সমস্ত লোন ডিসবার্সমেন্ট ম্যানেজ এবং ট্র্যাক করুন',
    addBtn: language === 'en' ? 'New Disbursement' : 'নতুন ডিসবার্সমেন্ট',
    editBtn: language === 'en' ? 'Edit Disbursement' : 'ডিসবার্সমেন্ট সংশোধন',
    accTitle: language === 'en' ? 'Account Title' : 'অ্যাকাউন্টের নাম',
    accNo: language === 'en' ? 'Account Number' : 'অ্যাকাউন্ট নম্বর',
    mobile: language === 'en' ? 'Mobile Number' : 'মোবাইল নম্বর',
    loanAmt: language === 'en' ? 'Loan Amount' : 'লোনের পরিমাণ',
    disAmt: language === 'en' ? 'Disbursed' : 'ডিসবার্সমেন্ট',
    officer: language === 'en' ? 'Loan Officer' : 'লোন অফিসার',
    date: language === 'en' ? 'Disbursement Date' : 'ডিসবার্সমেন্টের তারিখ',
    actions: language === 'en' ? 'Actions' : 'অ্যাকশন',
    noData: language === 'en' ? 'No disbursements recorded for this date' : 'এই তারিখের জন্য কোন ডিসবার্সমেন্ট রেকর্ড করা হয়নি',
    save: language === 'en' ? 'Save Record' : 'রেকর্ড সংরক্ষণ',
    update: language === 'en' ? 'Update Record' : 'আপডেট করুন',
    cancel: language === 'en' ? 'Cancel' : 'বাতিল',
    errWordsOnly: language === 'en' ? 'Only words are allowed' : 'শুধুমাত্র অক্ষর ব্যবহার করুন',
    errNumbersOnly: language === 'en' ? 'Only numbers are allowed' : 'শুধুমাত্র সংখ্যা ব্যবহার করুন',
    selectToday: language === 'en' ? 'Today' : 'আজ',
    selectOfficer: language === 'en' ? 'Select Officer' : 'অফিসার নির্বাচন করুন',
    filterBy: language === 'en' ? 'Filter by Date' : 'তারিখ অনুযায়ী ফিল্টার',
    totalEntries: language === 'en' ? 'Total' : 'মোট',
    searchPlaceholder: language === 'en' ? 'Search records...' : 'রেকর্ড খুঁজুন...',
    criteriaAcc: language === 'en' ? 'Account No' : 'অ্যাকাউন্ট নম্বর',
    criteriaMob: language === 'en' ? 'Mobile No' : 'মোবাইল নম্বর',
    allOfficers: language === 'en' ? 'All Officers' : 'সব অফিসার',
    noDataFoundText: language === 'en' 
      ? 'No data found with this Account or Mobile number' 
      : 'এই অ্যাকাউন্ট নম্বর বা মোবাইল নম্বর দিয়ে কোনো তথ্য পাওয়া যায়নি',
    byOfficer: language === 'en' ? 'By Officer' : 'অফিসার ভিত্তিক',
    confirmDelete: language === 'en' ? 'Are you sure you want to delete this record?' : 'আপনি কি নিশ্চিত যে আপনি এই রেকর্ডটি মুছে ফেলতে চান?',
    deleteAction: language === 'en' ? 'Delete Record' : 'রেকর্ড মুছুন',
    recentHistory: language === 'en' ? 'Recent Disbursement History' : 'সাম্প্রতিক ডিসবার্সমেন্ট ইতিহাস',
    noRecent: language === 'en' ? 'No recent activity' : 'কোন সাম্প্রতিক কার্যকলাপ নেই'
  };

  // 1. Global Filter Logic
  const filteredBase = useMemo(() => {
    const query = searchQuery.trim();
    let results = [];
    
    if (query) {
      // GLOBAL SEARCH: Ignore the filterDate when searching
      results = disbursements.filter(d => {
        const valToSearch = searchCriteria === 'accountNumber' ? d.accountNumber : d.mobileNumber;
        return valToSearch?.includes(query);
      });
    } else {
      // DEFAULT VIEW: Filter by the currently selected date
      results = disbursements.filter(d => d.date === filterDate);
    }

    // Apply Officer Filter
    if (officerFilter !== 'ALL') {
      results = results.filter(d => d.loanOfficer === officerFilter);
    }

    return results;
  }, [disbursements, filterDate, searchQuery, searchCriteria, officerFilter]);

  // 2. Group results by Loan Officer
  const categorizedDisbursements = useMemo(() => {
    const groups: Record<string, Disbursement[]> = {};
    const isSearching = searchQuery.trim().length > 0 || officerFilter !== 'ALL';

    loanOfficers.forEach(officer => {
      // If an officer filter is active, only show that officer
      if (officerFilter !== 'ALL' && officer !== officerFilter) return;

      const officerItems = filteredBase.filter(d => d.loanOfficer === officer);
      // If searching, only include segments that actually have results
      if (!isSearching || (isSearching && officerItems.length > 0)) {
        groups[officer] = officerItems;
      }
    });

    // Handle any items with officers not in the official list (only if "ALL" is selected)
    if (officerFilter === 'ALL') {
      const others = filteredBase.filter(d => !loanOfficers.includes(d.loanOfficer));
      if (others.length > 0) {
        groups['Other Officers'] = others;
      }
    }
    
    return groups;
  }, [filteredBase, loanOfficers, searchQuery, officerFilter]);

  // 3. Recent History (Last 5 recorded items)
  const recentHistory = useMemo(() => {
    // We assume the end of the array contains the most recently added items
    return [...disbursements].slice(-5).reverse();
  }, [disbursements]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) setIsDatePickerOpen(false);
      if (officerRef.current && !officerRef.current.contains(event.target as Node)) setIsOfficerOpen(false);
      if (officerFilterRef.current && !officerFilterRef.current.contains(event.target as Node)) setIsOfficerFilterOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (name: string, value: any) => {
    if (name === 'accountTitle') {
      const sanitized = value.replace(/[0-9]/g, '');
      setErrors(prev => ({ ...prev, accountTitle: value !== sanitized ? t.errWordsOnly : '' }));
      setFormData(prev => ({ ...prev, [name]: sanitized }));
    } else if (name === 'accountNumber' || name === 'mobileNumber') {
      const sanitized = value.replace(/[^0-9]/g, '');
      setErrors(prev => ({ ...prev, [name]: value !== sanitized ? t.errNumbersOnly : '' }));
      setFormData(prev => ({ ...prev, [name]: sanitized }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEdit = (dis: Disbursement) => {
    setEditingId(dis.id);
    setFormData({ ...dis });
    setIsModalOpen(true);
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
  };

  const handlePerformDelete = () => {
    if (deletingId) {
      onDeleteDisbursement(deletingId);
      setDeletingId(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) onUpdateDisbursement(editingId, formData);
    else onAddDisbursement(formData);
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      accountTitle: '',
      accountNumber: '',
      mobileNumber: '',
      loanAmount: 0,
      disbursementAmount: 0,
      loanOfficer: loanOfficers[0] || '',
      date: filterDate
    });
    setErrors({});
  };

  const renderModalCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const startOffset = new Date(year, month, 1).getDay();
    const calendarDays = [];

    for (let i = 0; i < startOffset; i++) calendarDays.push(null);
    for (let d = 1; d <= totalDays; d++) calendarDays.push(d);

    return (
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, i) => (
          <div key={i} className="aspect-square flex items-center justify-center">
            {day ? (
              <button
                type="button"
                onClick={() => {
                  const newDate = new Date(year, month, day);
                  handleInputChange('date', newDate.toISOString().split('T')[0]);
                  setIsDatePickerOpen(false);
                }}
                className={`w-full h-full flex items-center justify-center rounded-xl text-xs font-bold transition-all ${
                  day === currentPickerDate.getDate() && month === currentPickerDate.getMonth() && year === currentPickerDate.getFullYear()
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {day}
              </button>
            ) : <div />}
          </div>
        ))}
      </div>
    );
  };

  const isSearching = searchQuery.trim().length > 0 || officerFilter !== 'ALL';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{t.title}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">{t.subtitle}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t.filterBy}</label>
            <AdvancedDatePicker selectedDate={filterDate} onDateChange={setFilterDate} />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-2xl shadow-xl shadow-blue-500/30 transition-all active:scale-95 h-[48px] self-end">
            <Plus size={20} strokeWidth={3} />
            <span className="hidden sm:inline">{t.addBtn}</span>
          </button>
        </div>
      </div>

      {/* Search Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-[#1E293B] p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-theme">
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
           {/* Global Text Search */}
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

           {/* Criteria & Officer Dropdown */}
           <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <button 
                  onClick={() => setSearchCriteria('accountNumber')} 
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${
                    searchCriteria === 'accountNumber' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                  }`}
                >
                  <Hash size={12} /> {t.criteriaAcc}
                </button>
                <button 
                  onClick={() => setSearchCriteria('mobileNumber')} 
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${
                    searchCriteria === 'mobileNumber' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                  }`}
                >
                  <Phone size={12} /> {t.criteriaMob}
                </button>
              </div>

              {/* Officer Selection Dropdown */}
              <div className="relative" ref={officerFilterRef}>
                 <button 
                  onClick={() => setIsOfficerFilterOpen(!isOfficerFilterOpen)}
                  className={`flex items-center gap-2 px-4 py-3.5 rounded-xl border transition-all text-[11px] font-black uppercase tracking-wider ${
                    officerFilter !== 'ALL' 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-400'
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

      {/* Categorized Content */}
      <div className="space-y-12">
        {Object.entries(categorizedDisbursements).map(([officer, items]) => (
          <div key={officer} className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
            {/* Officer Category Header */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                    <Users size={20} />
                 </div>
                 <div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">{officer}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.officer}</p>
                 </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.totalEntries}:</span>
                <span className="text-sm font-black text-blue-600 dark:text-blue-400">{items.length}</span>
              </div>
            </div>

            {/* Officer Disbursement Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.length > 0 ? (
                items.map(dis => (
                  <DisbursementCard 
                    key={dis.id} 
                    dis={dis} 
                    language={language} 
                    onEdit={() => handleEdit(dis)} 
                    onDelete={() => confirmDelete(dis.id)} 
                  />
                ))
              ) : (
                <div className="col-span-full py-8 px-6 bg-slate-50/50 dark:bg-slate-800/20 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 italic font-medium text-xs">
                  {isSearching ? t.noDataFoundText : `${t.noData} for ${officer}`}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Global Empty State - Shows only if EVERY officer group is empty */}
        {filteredBase.length === 0 && (
          <div className="py-24 text-center bg-white dark:bg-[#1E293B] rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl animate-in zoom-in-95 duration-500">
             <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 dark:text-slate-600">
                {isSearching ? <FileQuestion size={40} /> : <LayoutGrid size={40} />}
             </div>
             <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                {isSearching ? (language === 'en' ? 'No Matches Found' : 'কোন ফলাফল পাওয়া যায়নি') : (language === 'en' ? 'Empty Ledger' : 'লেজার খালি')}
             </h3>
             <p className="text-slate-400 dark:text-slate-500 font-bold italic px-8 max-w-md mx-auto">
                {isSearching ? t.noDataFoundText : t.noData}
             </p>
             {isSearching && (
               <button 
                 onClick={() => { setSearchQuery(''); setOfficerFilter('ALL'); }}
                 className="mt-6 text-xs font-black text-blue-600 dark:text-blue-400 hover:underline"
               >
                 {language === 'en' ? 'Clear All Filters' : 'সব ফিল্টার মুছুন'}
               </button>
             )}
          </div>
        )}
      </div>

      {/* Recent History Bar Section */}
      <div className="mt-16 space-y-6 animate-in slide-in-from-bottom-8 duration-700">
        <div className="flex items-center gap-3 px-2">
           <div className="p-2 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl">
              <Clock size={18} strokeWidth={3} />
           </div>
           <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{t.recentHistory}</h3>
        </div>
        <div className="flex overflow-x-auto pb-6 gap-4 custom-scrollbar snap-x no-scrollbar md:grid md:grid-cols-5 md:overflow-visible">
          {recentHistory.length > 0 ? (
            recentHistory.map(item => (
              <div key={item.id} className="min-w-[240px] md:min-w-0 bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm snap-start hover:shadow-md transition-all flex flex-col justify-between group">
                <div>
                   <div className="flex items-center justify-between mb-2">
                      <span className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">{item.date}</span>
                      <span className="text-[10px] font-black text-blue-600 dark:text-blue-400">৳{item.disbursementAmount.toLocaleString()}</span>
                   </div>
                   <h5 className="text-xs font-black text-slate-800 dark:text-white truncate group-hover:text-blue-600 transition-colors">{item.accountTitle}</h5>
                </div>
                <div className="mt-3 flex items-center justify-between">
                   <div className="flex items-center gap-1.5 opacity-60">
                      <User size={10} className="text-slate-400" />
                      <span className="text-[9px] font-bold text-slate-500 truncate max-w-[80px]">{item.loanOfficer}</span>
                   </div>
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-4 text-center text-[10px] font-bold text-slate-400 italic">
               {t.noRecent}
            </div>
          )}
        </div>
      </div>

      {/* Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-[#1E293B] rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 pt-8 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{editingId ? t.editBtn : t.addBtn}</h3>
              <button onClick={handleCloseModal} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5"><User size={12} /> {t.accTitle}</label>
                  <input required type="text" value={formData.accountTitle} onChange={e => handleInputChange('accountTitle', e.target.value)} className={`w-full bg-slate-50 dark:bg-slate-900/50 border rounded-2xl px-5 py-3.5 text-sm font-semibold outline-none transition-all dark:text-white ${errors.accountTitle ? 'border-rose-500 ring-4 ring-rose-500/10' : 'border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500'}`} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5"><Hash size={12} /> {t.accNo}</label>
                    <input required type="text" value={formData.accountNumber} onChange={e => handleInputChange('accountNumber', e.target.value)} className={`w-full bg-slate-50 dark:bg-slate-900/50 border rounded-2xl px-5 py-3.5 text-sm font-semibold outline-none dark:text-white ${errors.accountNumber ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500'}`} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5"><Phone size={12} /> {t.mobile}</label>
                    <input required type="tel" value={formData.mobileNumber} onChange={e => handleInputChange('mobileNumber', e.target.value)} className={`w-full bg-slate-50 dark:bg-slate-900/50 border rounded-2xl px-5 py-3.5 text-sm font-semibold outline-none dark:text-white ${errors.mobileNumber ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500'}`} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5">৳ {t.loanAmt}</label>
                    <input required type="number" value={formData.loanAmount || ''} onChange={e => setFormData({...formData, loanAmount: parseFloat(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-semibold text-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none dark:text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5">৳ {t.disAmt}</label>
                    <input required type="number" value={formData.disbursementAmount || ''} onChange={e => setFormData({...formData, disbursementAmount: parseFloat(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-semibold text-emerald-600 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none dark:text-white" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5 relative" ref={officerRef}>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5"><Briefcase size={12} /> {t.officer}</label>
                    <button type="button" onClick={() => setIsOfficerOpen(!isOfficerOpen)} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-semibold text-left dark:text-white flex items-center justify-between">{formData.loanOfficer || t.selectOfficer} <ChevronDown size={16} /></button>
                    {isOfficerOpen && (
                      <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl py-2 z-[110] max-h-40 overflow-y-auto custom-scrollbar">
                        {loanOfficers.map((off, idx) => (
                          <button key={idx} type="button" onClick={() => { setFormData({...formData, loanOfficer: off}); setIsOfficerOpen(false); }} className={`w-full px-5 py-2 text-left text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-white ${formData.loanOfficer === off ? 'text-blue-600 bg-blue-50' : ''}`}>{off}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5 relative" ref={datePickerRef}>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5"><Calendar size={12} /> {t.date}</label>
                    <button 
                      type="button"
                      onClick={() => {
                        setIsDatePickerOpen(!isDatePickerOpen);
                        setViewDate(new Date(formData.date));
                      }}
                      className={`w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-semibold text-left transition-all outline-none flex items-center justify-between ${
                        isDatePickerOpen ? 'ring-4 ring-blue-500/10 border-blue-500 shadow-sm' : ''
                      }`}
                    >
                      <span className={formData.date ? 'dark:text-white' : 'text-slate-400'}>
                        {formData.date || 'Select Date'}
                      </span>
                      <Calendar size={14} className="text-blue-500" />
                    </button>

                    {isDatePickerOpen && (
                      <div className="absolute bottom-full left-0 right-0 mb-4 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-[1.5rem] shadow-2xl p-4 z-[110] animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between mb-4 px-1">
                          <span className="text-sm font-black text-slate-900 dark:text-white">
                            {months[viewDate.getMonth()]} {viewDate.getFullYear()}
                          </span>
                          <div className="flex gap-1">
                            <button 
                              type="button"
                              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} 
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
                            >
                              <ChevronLeft size={16} />
                            </button>
                            <button 
                              type="button"
                              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} 
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {['S','M','T','W','T','F','S'].map((d, i) => (
                            <div key={i} className="text-[10px] font-black text-slate-400 text-center uppercase py-1">{d}</div>
                          ))}
                        </div>
                        
                        {renderModalCalendar()}

                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                          <button 
                            type="button"
                            onClick={() => {
                              const today = new Date();
                              handleInputChange('date', today.toISOString().split('T')[0]);
                              setIsDatePickerOpen(false);
                            }}
                            className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
                          >
                            {t.selectToday}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={handleCloseModal} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl transition-colors text-sm">{t.cancel}</button>
                <button type="submit" className="flex-[1.5] py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/30 transition-all active:scale-95 text-sm uppercase tracking-wider">{editingId ? t.update : t.save}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-sm bg-white dark:bg-[#1E293B] rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 p-8 text-center animate-in zoom-in-95 duration-200">
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

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

// Box Component for individual entries
const DisbursementCard: React.FC<{ 
  dis: Disbursement, 
  language: 'en' | 'bn', 
  onEdit: () => void, 
  onDelete: () => void 
}> = ({ dis, language, onEdit, onDelete }) => {
  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group h-full">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center justify-between mb-3">
           <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20">
              <LayoutGrid size={16} />
           </div>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
             <Calendar size={12}/> {dis.date}
           </span>
        </div>
        <h4 className="text-base font-black text-slate-900 dark:text-white leading-tight mb-1 truncate">{dis.accountTitle}</h4>
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
           <Hash size={12} className="opacity-50" /> {dis.accountNumber}
        </div>
      </div>

      <div className="p-6 flex-1 space-y-4">
         <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
               <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Loan Amount</p>
               <p className="text-sm font-black text-blue-600 dark:text-blue-400">{formatCurrency(dis.loanAmount)}</p>
            </div>
            <div className="space-y-1">
               <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Disbursed</p>
               <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(dis.disbursementAmount)}</p>
            </div>
         </div>
         <div className="pt-3 border-t border-slate-50 dark:border-slate-800/50 flex flex-col gap-2">
            <div className="flex items-center gap-2">
               <Briefcase size={12} className="text-blue-500" />
               <span className="text-[11px] font-black text-slate-700 dark:text-slate-200">{dis.loanOfficer}</span>
            </div>
            <div className="flex items-center gap-2">
               <Phone size={12} className="text-slate-400" />
               <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{dis.mobileNumber}</span>
            </div>
         </div>
      </div>

      <div className="p-4 bg-slate-50 dark:bg-slate-800/40 flex gap-2 border-t border-slate-100 dark:border-slate-800">
        <button onClick={onEdit} className="flex-1 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wider">
          <Pencil size={14} /> {language === 'en' ? 'Edit' : 'এডিট'}
        </button>
        <button onClick={onDelete} className="flex-1 py-2 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400 hover:bg-rose-100 transition-colors flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wider">
          <Trash2 size={14} /> {language === 'en' ? 'Delete' : 'মুছুন'}
        </button>
      </div>
    </div>
  );
};
