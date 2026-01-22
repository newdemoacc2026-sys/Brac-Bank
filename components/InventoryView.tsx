import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Plus, CreditCard, BookCopy, Hash, User, Phone, 
  Calendar, Trash2, X, ChevronDown, Check,
  ChevronLeft, ChevronRight, Briefcase, Filter, Search, Info,
  AlertCircle, Pencil, AlertTriangle, Truck, Clock, CheckCircle2,
  UserCheck, ShieldCheck, Activity, History, PieChart, ArrowDownToLine, TruckIcon
} from 'lucide-react';
import { ChequeBook, DebitCard } from '../types';
import { AdvancedDatePicker } from './AdvancedDatePicker';

interface InventoryViewProps {
  cheques: ChequeBook[];
  cards: DebitCard[];
  loanOfficers: string[];
  onAddCheque: (cheque: Omit<ChequeBook, 'id'>) => void;
  onUpdateCheque: (id: string, cheque: Omit<ChequeBook, 'id'>) => void;
  onDeleteCheque: (id: string) => void;
  onAddCard: (card: Omit<DebitCard, 'id'>) => void;
  onUpdateCard: (id: string, card: Omit<DebitCard, 'id'>) => void;
  onDeleteCard: (id: string) => void;
  language: 'en' | 'bn';
}

type Tab = 'cheques' | 'cards';
type ModalType = 'selection' | 'chequeForm' | 'cardForm' | 'deleteConfirm' | 'dailyReport' | null;
type SearchCriteria = 'title' | 'account' | 'mobile';
type StatusFilter = 'ALL' | 'Pending' | 'Submitted';

export const InventoryView: React.FC<InventoryViewProps> = ({ 
  cheques, cards, loanOfficers, 
  onAddCheque, onUpdateCheque, onDeleteCheque, onAddCard, onUpdateCard, onDeleteCard, language 
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('cheques');
  const [modalType, setModalType] = useState<ModalType>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingInfo, setDeletingInfo] = useState<{ id: string, type: 'cheque' | 'card' } | null>(null);
  
  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>('account');
  const [officerFilter, setOfficerFilter] = useState<string>('ALL');
  const [isOfficerFilterOpen, setIsOfficerFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [reportDate, setReportDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Cheque Form State
  const [chequeAccTitle, setChequeAccTitle] = useState('');
  const [chequeAccNo, setChequeAccNo] = useState('');
  const [chequeMobNo, setChequeMobNo] = useState('');
  const [chequeLeaves, setChequeLeaves] = useState<25 | 50 | 75 | 100 | 200>(25);
  const [chequeStart, setChequeStart] = useState('');
  const [chequeEnd, setChequeEnd] = useState('');
  const [chequeOfficer, setChequeOfficer] = useState(loanOfficers[0] || '');
  const [chequeRecvDate, setChequeRecvDate] = useState(new Date().toISOString().split('T')[0]);
  const [chequeStatus, setChequeStatus] = useState<'Pending' | 'Submitted'>('Pending');
  const [chequeDeliveryDate, setChequeDeliveryDate] = useState<string>('');
  
  const [isOfficerOpen, setIsOfficerOpen] = useState(false);
  const [isLeavesOpen, setIsLeavesOpen] = useState(false);
  const [isChequeDateOpen, setIsChequeDateOpen] = useState(false);
  const [isDeliveryDateOpen, setIsDeliveryDateOpen] = useState(false);

  // Card Form State
  const [cardAcc, setCardAcc] = useState('');
  const [cardMob, setCardMob] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNo, setCardNo] = useState('');
  const [cardOfficer, setCardOfficer] = useState(loanOfficers[0] || '');
  const [cardDate, setCardDate] = useState(new Date().toISOString().split('T')[0]);
  const [cardStatus, setCardStatus] = useState<'Pending' | 'Submitted'>('Pending');
  const [cardDeliveryDate, setCardDeliveryDate] = useState<string>('');
  const [isCardOfficerOpen, setIsCardOfficerOpen] = useState(false);
  const [isCardDateOpen, setIsCardDateOpen] = useState(false);
  const [isCardDeliveryDateOpen, setIsCardDeliveryDateOpen] = useState(false);
  
  // Shared View Date for Calendar
  const [viewDate, setViewDate] = useState(new Date());

  const officerRef = useRef<HTMLDivElement>(null);
  const leavesRef = useRef<HTMLDivElement>(null);
  const chequeDateRef = useRef<HTMLDivElement>(null);
  const deliveryDateRef = useRef<HTMLDivElement>(null);
  const cardOfficerRef = useRef<HTMLDivElement>(null);
  const cardDateRef = useRef<HTMLDivElement>(null);
  const cardDeliveryDateRef = useRef<HTMLDivElement>(null);
  const officerFilterRef = useRef<HTMLDivElement>(null);

  const t = {
    title: language === 'en' ? 'Inventory Tracking' : 'ইনভেন্টরি ট্র্যাকিং',
    subtitle: language === 'en' ? 'Monitor cheque books and debit cards received' : 'প্রাপ্ত চেক বুক এবং ডেবিট কার্ডের তথ্য রাখুন',
    cheques: language === 'en' ? 'Cheque Books' : 'চেক বুক',
    cards: language === 'en' ? 'Debit Cards' : 'ডেবিট কার্ড',
    addBtn: language === 'en' ? 'New Record' : 'নতুন রেকর্ড',
    selectionTitle: language === 'en' ? 'What would you like to add?' : 'আপনি কী যুক্ত করতে চান?',
    chequeDesc: language === 'en' ? 'Register new cheque book leaves' : 'নতুন চেক বুক লিভস নিবন্ধন করুন',
    cardDesc: language === 'en' ? 'Register received debit cards' : 'প্রাপ্ত ডেবিট কার্ড নিবন্ধন করুন',
    leaves: language === 'en' ? 'Number of Leaves' : 'পাতার সংখ্যা',
    startPage: language === 'en' ? 'Start Page Number' : 'শুরু পাতার নম্বর',
    endPage: language === 'en' ? 'End Page Number' : 'শেষ পাতার নম্বর',
    officer: language === 'en' ? 'Loan Officer' : 'লোন অফিসার',
    accNo: language === 'en' ? 'Account Number' : 'অ্যাকাউন্ট নম্বর',
    accTitle: language === 'en' ? 'Account Title' : 'অ্যাকাউন্ট টাইটেল',
    mobNo: language === 'en' ? 'Mobile Number' : 'মোবাইল নম্বর',
    holder: language === 'en' ? 'Card Holder Name' : 'কার্ড হোল্ডারের নাম',
    cardNo: language === 'en' ? 'Card Number' : 'কার্ড নম্বর',
    recvDate: language === 'en' ? 'Received Date' : 'প্রাপ্তির তারিখ',
    delvDate: language === 'en' ? 'Delivery Date' : 'ডেলিভারি তারিখ',
    status: language === 'en' ? 'Status' : 'অবস্থা',
    pending: language === 'en' ? 'Pending' : 'পেন্ডিং',
    submitted: language === 'en' ? 'Submitted' : 'সাবমিটেড',
    save: language === 'en' ? 'Save Record' : 'রেকর্ড সংরক্ষণ',
    update: language === 'en' ? 'Update Record' : 'আপডেট করুন',
    cancel: language === 'en' ? 'Cancel' : 'বাতিল',
    confirmDelete: language === 'en' ? 'Confirm Delete' : 'মুছে ফেলার নিশ্চিতকরণ',
    confirmText: language === 'en' ? 'Are you sure you want to delete this record?' : 'আপনি কি নিশ্চিত যে আপনি এই রেকর্ডটি মুছে ফেলতে চান?',
    delete: language === 'en' ? 'Delete' : 'মুছুন',
    searchPlaceholder: language === 'en' ? 'Search items...' : 'আইটেম খুঁজুন...',
    noData: language === 'en' ? 'No inventory records found' : 'কোন ইনভেন্টরি রেকর্ড পাওয়া যায়নি',
    critTitle: language === 'en' ? 'Title' : 'নাম',
    critAcc: language === 'en' ? 'Acc No' : 'অ্যাকাউন্ট',
    critMob: language === 'en' ? 'Mobile' : 'মোবাইল',
    allOfficers: language === 'en' ? 'All Officers' : 'সব অফিসার',
    total: language === 'en' ? 'Total' : 'মোট',
    recentHistory: language === 'en' ? 'Recent Inventory Activity' : 'সাম্প্রতিক ইনভেন্টরি কার্যক্রম',
    noRecent: language === 'en' ? 'No recent activity recorded' : 'কোন সাম্প্রতিক কার্যক্রম নেই',
    dailyReport: language === 'en' ? 'Daily Insights' : 'দৈনিক ইনসাইট',
    reportTitle: language === 'en' ? 'Inventory Summary for' : 'ইনভেন্টরি সারাংশ -',
    recvCount: language === 'en' ? 'Received' : 'প্রাপ্ত',
    delvCount: language === 'en' ? 'Delivered' : 'ডেলিভারি',
    summaryTab: language === 'en' ? 'Activity Log' : 'অ্যাক্টিভিটি লগ'
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (officerRef.current && !officerRef.current.contains(event.target as Node)) setIsOfficerOpen(false);
      if (leavesRef.current && !leavesRef.current.contains(event.target as Node)) setIsLeavesOpen(false);
      if (chequeDateRef.current && !chequeDateRef.current.contains(event.target as Node)) setIsChequeDateOpen(false);
      if (deliveryDateRef.current && !deliveryDateRef.current.contains(event.target as Node)) setIsDeliveryDateOpen(false);
      if (cardOfficerRef.current && !cardOfficerRef.current.contains(event.target as Node)) setIsCardOfficerOpen(false);
      if (cardDateRef.current && !cardDateRef.current.contains(event.target as Node)) setIsCardDateOpen(false);
      if (cardDeliveryDateRef.current && !cardDeliveryDateRef.current.contains(event.target as Node)) setIsCardDeliveryDateOpen(false);
      if (officerFilterRef.current && !officerFilterRef.current.contains(event.target as Node)) setIsOfficerFilterOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddCheque = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      accountTitle: chequeAccTitle,
      accountNumber: chequeAccNo,
      mobileNumber: chequeMobNo,
      leaves: chequeLeaves,
      startPage: chequeStart,
      endPage: chequeEnd,
      loanOfficer: chequeOfficer,
      receivedDate: chequeRecvDate,
      status: chequeStatus,
      deliveryDate: chequeDeliveryDate || undefined
    };
    if (editingId) onUpdateCheque(editingId, data);
    else onAddCheque(data);
    setModalType(null);
    setEditingId(null);
    resetChequeForm();
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      accountNumber: cardAcc,
      mobileNumber: cardMob,
      cardHolderName: cardHolder,
      cardNumber: cardNo,
      loanOfficer: cardOfficer,
      receivedDate: cardDate,
      status: cardStatus,
      deliveryDate: cardDeliveryDate || undefined
    };
    if (editingId) onUpdateCard(editingId, data);
    else onAddCard(data);
    setModalType(null);
    setEditingId(null);
    resetCardForm();
  };

  const handleEditCheque = (cheque: ChequeBook) => {
    setEditingId(cheque.id);
    setChequeAccTitle(cheque.accountTitle);
    setChequeAccNo(cheque.accountNumber);
    setChequeMobNo(cheque.mobileNumber);
    setChequeLeaves(cheque.leaves);
    setChequeStart(cheque.startPage);
    setChequeEnd(cheque.endPage);
    setChequeOfficer(cheque.loanOfficer);
    setChequeRecvDate(cheque.receivedDate);
    setChequeStatus(cheque.status || 'Pending');
    setChequeDeliveryDate(cheque.deliveryDate || '');
    setModalType('chequeForm');
  };

  const handleEditCard = (card: DebitCard) => {
    setEditingId(card.id);
    setCardAcc(card.accountNumber);
    setCardMob(card.mobileNumber);
    setCardHolder(card.cardHolderName);
    setCardNo(card.cardNumber);
    setCardOfficer(card.loanOfficer);
    setCardDate(card.receivedDate);
    setCardStatus(card.status || 'Pending');
    setCardDeliveryDate(card.deliveryDate || '');
    setModalType('cardForm');
  };

  const resetChequeForm = () => {
    setChequeAccTitle('');
    setChequeAccNo('');
    setChequeMobNo('');
    setChequeLeaves(25);
    setChequeStart('');
    setChequeEnd('');
    setChequeOfficer(loanOfficers[0] || '');
    setChequeRecvDate(new Date().toISOString().split('T')[0]);
    setChequeStatus('Pending');
    setChequeDeliveryDate('');
  };

  const resetCardForm = () => {
    setCardAcc('');
    setCardMob('');
    setCardHolder('');
    setCardNo('');
    setCardOfficer(loanOfficers[0] || '');
    setCardDate(new Date().toISOString().split('T')[0]);
    setCardStatus('Pending');
    setCardDeliveryDate('');
  };

  // Base Filter Logic (Search + Officer)
  const baseFilteredCheques = useMemo(() => {
    return cheques.filter(c => {
      const q = searchQuery.toLowerCase().trim();
      const matchesOfficer = officerFilter === 'ALL' || c.loanOfficer === officerFilter;
      if (!matchesOfficer) return false;
      if (!q) return true;
      if (searchCriteria === 'title') return c.accountTitle.toLowerCase().includes(q);
      if (searchCriteria === 'account') return c.accountNumber.includes(q);
      if (searchCriteria === 'mobile') return c.mobileNumber.includes(q);
      return false;
    });
  }, [cheques, searchQuery, searchCriteria, officerFilter]);

  const baseFilteredCards = useMemo(() => {
    return cards.filter(c => {
      const q = searchQuery.toLowerCase().trim();
      const matchesOfficer = officerFilter === 'ALL' || c.loanOfficer === officerFilter;
      if (!matchesOfficer) return false;
      if (!q) return true;
      if (searchCriteria === 'title') return c.cardHolderName.toLowerCase().includes(q);
      if (searchCriteria === 'account') return c.accountNumber.includes(q);
      if (searchCriteria === 'mobile') return c.mobileNumber.includes(q);
      return false;
    });
  }, [cards, searchQuery, searchCriteria, officerFilter]);

  // Derived Stats based on Context (Search + Officer Filter)
  const activeStats = useMemo(() => {
    const currentList = activeTab === 'cheques' ? baseFilteredCheques : baseFilteredCards;
    const pending = currentList.filter(i => i.status === 'Pending').length;
    const submitted = currentList.filter(i => i.status === 'Submitted').length;
    return { total: currentList.length, pending, submitted };
  }, [baseFilteredCheques, baseFilteredCards, activeTab]);

  // Final Filter (Applying Clickable Status Filter)
  const finalFilteredCheques = useMemo(() => {
    if (statusFilter === 'ALL') return baseFilteredCheques;
    return baseFilteredCheques.filter(c => c.status === statusFilter);
  }, [baseFilteredCheques, statusFilter]);

  const finalFilteredCards = useMemo(() => {
    if (statusFilter === 'ALL') return baseFilteredCards;
    return baseFilteredCards.filter(c => c.status === statusFilter);
  }, [baseFilteredCards, statusFilter]);

  // Daily Report Data Logic
  const dailyReportData = useMemo(() => {
    const chequesReceived = cheques.filter(c => c.receivedDate === reportDate);
    const chequesDelivered = cheques.filter(c => c.deliveryDate === reportDate);
    const cardsReceived = cards.filter(c => c.receivedDate === reportDate);
    const cardsDelivered = cards.filter(c => c.deliveryDate === reportDate);

    return {
      chequesReceived,
      chequesDelivered,
      cardsReceived,
      cardsDelivered,
      totalReceived: chequesReceived.length + cardsReceived.length,
      totalDelivered: chequesDelivered.length + cardsDelivered.length
    };
  }, [cheques, cards, reportDate]);

  // Unified Recent History
  const recentInventoryHistory = useMemo(() => {
    const combined = [
      ...cheques.map(c => ({ ...c, itemType: 'cheque' as const })),
      ...cards.map(c => ({ ...c, itemType: 'card' as const }))
    ];
    return combined.slice(-6).reverse();
  }, [cheques, cards]);

  const renderCalendar = (currentDate: string, onSelect: (date: string) => void) => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const totalDays = new Date(year, month + 1, 0).getDate();
    const startOffset = new Date(year, month, 1).getDay();
    const days = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let d = 1; d <= totalDays; d++) days.push(d);

    return (
      <div className="p-3 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-56 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-[10px] font-black dark:text-white uppercase tracking-wider">{monthNames[month]} {year}</span>
          <div className="flex gap-1">
            <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><ChevronLeft size={14}/></button>
            <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><ChevronRight size={14}/></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => (
            <div key={i} className="aspect-square flex items-center justify-center">
              {day ? (
                <button
                  type="button"
                  onClick={() => {
                    const newDate = new Date(year, month, day);
                    onSelect(newDate.toISOString().split('T')[0]);
                  }}
                  className={`w-full h-full flex items-center justify-center rounded-xl text-[10px] font-bold transition-all ${
                    day === new Date(currentDate || new Date()).getDate() && month === new Date(currentDate || new Date()).getMonth() && year === new Date(currentDate || new Date()).getFullYear()
                      ? 'bg-blue-600 text-white shadow-md' 
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

  const handleConfirmDelete = () => {
    if (deletingInfo) {
      if (deletingInfo.type === 'cheque') onDeleteCheque(deletingInfo.id);
      else onDeleteCard(deletingInfo.id);
      setDeletingInfo(null);
      setModalType(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{t.title}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">{t.subtitle}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Daily Insights Button */}
          <button 
            onClick={() => setModalType('dailyReport')}
            className="flex items-center gap-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black px-6 py-3 rounded-2xl shadow-xl hover:scale-105 transition-all active:scale-95 h-[48px]"
          >
            <PieChart size={18} strokeWidth={3} />
            <span className="hidden sm:inline">{t.dailyReport}</span>
          </button>

          {/* Officer Filter Selection */}
          <div className="relative" ref={officerFilterRef}>
            <button 
              onClick={() => setIsOfficerFilterOpen(!isOfficerFilterOpen)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl border transition-all text-[11px] font-black uppercase tracking-wider h-[48px] ${
                officerFilter !== 'ALL' 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-blue-400'
              }`}
            >
               <UserCheck size={16} strokeWidth={3} />
               <span className="hidden sm:inline">{officerFilter === 'ALL' ? t.allOfficers : officerFilter}</span>
               <ChevronDown size={14} className={`transition-transform duration-300 ${isOfficerFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOfficerFilterOpen && (
              <div className="absolute top-full right-0 mt-3 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-[60] animate-in fade-in zoom-in-95 duration-150">
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

          <div className="flex items-center gap-2 bg-white dark:bg-[#1E293B] p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm min-w-[320px] lg:min-w-[420px]">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button 
                onClick={() => setSearchCriteria('title')}
                className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${searchCriteria === 'title' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}
              >
                {t.critTitle}
              </button>
              <button 
                onClick={() => setSearchCriteria('account')}
                className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${searchCriteria === 'account' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}
              >
                {t.critAcc}
              </button>
              <button 
                onClick={() => setSearchCriteria('mobile')}
                className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${searchCriteria === 'mobile' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}
              >
                {t.critMob}
              </button>
            </div>
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none pl-9 pr-2 py-1.5 text-sm font-bold outline-none dark:text-white placeholder:text-slate-400"
              />
            </div>
          </div>

          <button 
            onClick={() => { setEditingId(null); setModalType('selection'); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-2xl shadow-xl shadow-blue-500/30 transition-all active:scale-95 h-[48px]"
          >
            <Plus size={20} strokeWidth={3} />
            <span className="hidden sm:inline">{t.addBtn}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit border border-slate-200 dark:border-slate-700 h-fit">
          <button 
            onClick={() => setActiveTab('cheques')}
            className={`flex items-center gap-2 px-8 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'cheques' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <BookCopy size={16} /> {t.cheques}
          </button>
          <button 
            onClick={() => setActiveTab('cards')}
            className={`flex items-center gap-2 px-8 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'cards' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <CreditCard size={16} /> {t.cards}
          </button>
        </div>

        {/* Dynamic Status Counter Bar - Interactive */}
        <div className="flex items-center bg-white dark:bg-slate-800/50 p-1 rounded-[1.25rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
           <button 
            onClick={() => setStatusFilter('ALL')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              statusFilter === 'ALL' 
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md' 
                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
           >
             <Activity size={14} className={statusFilter === 'ALL' ? 'text-blue-400 dark:text-blue-600' : 'text-slate-400'} />
             <span className="text-[10px] font-black uppercase tracking-widest">{t.total}:</span>
             <span className="text-sm font-black">{activeStats.total}</span>
           </button>
           
           <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700 mx-1" />
           
           <button 
            onClick={() => setStatusFilter('Pending')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              statusFilter === 'Pending' 
                ? 'bg-amber-500 text-white shadow-md' 
                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
           >
             <Clock size={14} className={statusFilter === 'Pending' ? 'text-white' : 'text-amber-500'} />
             <span className="text-[10px] font-black uppercase tracking-widest">{t.pending}:</span>
             <span className="text-sm font-black">{activeStats.pending}</span>
           </button>
           
           <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700 mx-1" />
           
           <button 
            onClick={() => setStatusFilter('Submitted')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              statusFilter === 'Submitted' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
           >
             <ShieldCheck size={14} className={statusFilter === 'Submitted' ? 'text-white' : 'text-emerald-500'} />
             <span className="text-[10px] font-black uppercase tracking-widest">{t.submitted}:</span>
             <span className="text-sm font-black">{activeStats.submitted}</span>
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'cheques' ? (
          finalFilteredCheques.length > 0 ? (
            finalFilteredCheques.map(c => (
              <ChequeCard key={c.id} cheque={c} language={language} onEdit={() => handleEditCheque(c)} onDelete={() => { setDeletingInfo({ id: c.id, type: 'cheque' }); setModalType('deleteConfirm'); }} />
            ))
          ) : <EmptyState message={t.noData} />
        ) : (
          finalFilteredCards.length > 0 ? (
            finalFilteredCards.map(c => (
              <CardDisplay key={c.id} card={c} language={language} onEdit={() => handleEditCard(c)} onDelete={() => { setDeletingInfo({ id: c.id, type: 'card' }); setModalType('deleteConfirm'); }} />
            ))
          ) : <EmptyState message={t.noData} />
        )}
      </div>

      {/* RECENT ACTIVITY HISTORY SECTION */}
      <div className="mt-20 space-y-6 animate-in slide-in-from-bottom-8 duration-700">
        <div className="flex items-center gap-3 px-2">
           <div className="p-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl">
              <History size={18} strokeWidth={3} />
           </div>
           <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{t.recentHistory}</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-hidden">
          {recentInventoryHistory.length > 0 ? (
            recentInventoryHistory.map((item, idx) => {
              const isCheque = item.itemType === 'cheque';
              const isSubmitted = item.status === 'Submitted';
              return (
                <div key={idx} className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between h-32">
                   <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-1.5 rounded-lg ${isCheque ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                          {isCheque ? <BookCopy size={12} /> : <CreditCard size={12} />}
                        </div>
                        <div className={`w-1.5 h-1.5 rounded-full ${isSubmitted ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]'}`} />
                      </div>
                      <h5 className="text-[11px] font-black text-slate-800 dark:text-white truncate leading-tight group-hover:text-blue-500 transition-colors">
                        {isCheque ? (item as any).accountTitle : (item as any).cardHolderName}
                      </h5>
                      <p className="text-[9px] font-bold text-slate-400 mt-1">{(item as any).accountNumber}</p>
                   </div>
                   <div className="mt-3 pt-2 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between opacity-60">
                      <span className="text-[8px] font-black uppercase text-slate-400">{item.receivedDate}</span>
                      <span className={`text-[8px] font-black uppercase ${isSubmitted ? 'text-emerald-500' : 'text-amber-500'}`}>{item.status}</span>
                   </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-8 text-center text-[11px] font-bold text-slate-400 italic bg-slate-50/50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
               {t.noRecent}
            </div>
          )}
        </div>
      </div>

      {/* DAILY REPORT MODAL */}
      {modalType === 'dailyReport' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-white dark:bg-[#1E293B] rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
             <div className="px-8 pt-8 pb-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex-1">
                   <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                     <PieChart size={24} className="text-blue-600" />
                     {t.reportTitle} {reportDate}
                   </h3>
                   <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1 uppercase tracking-widest">Select date to view performance logs</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-56 sm:w-64">
                    <AdvancedDatePicker selectedDate={reportDate} onDateChange={setReportDate} />
                  </div>
                  <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block" />
                  <button onClick={() => setModalType(null)} className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95 shadow-sm">
                    <X size={20} />
                  </button>
                </div>
             </div>
             
             <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* Daily Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                   <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/30">
                      <div className="flex justify-between items-center mb-3">
                        <ArrowDownToLine size={20} className="text-blue-600" />
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{t.recvCount} Cheques</span>
                      </div>
                      <p className="text-3xl font-black text-blue-900 dark:text-blue-100">{dailyReportData.chequesReceived.length}</p>
                   </div>
                   <div className="bg-purple-50/50 dark:bg-purple-900/10 p-6 rounded-3xl border border-purple-100 dark:border-purple-900/30">
                      <div className="flex justify-between items-center mb-3">
                        <ArrowDownToLine size={20} className="text-purple-600" />
                        <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest">{t.recvCount} Cards</span>
                      </div>
                      <p className="text-3xl font-black text-purple-900 dark:text-purple-100">{dailyReportData.cardsReceived.length}</p>
                   </div>
                   <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/30">
                      <div className="flex justify-between items-center mb-3">
                        <TruckIcon size={20} className="text-emerald-600" />
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{t.delvCount} Cheques</span>
                      </div>
                      <p className="text-3xl font-black text-emerald-900 dark:text-emerald-100">{dailyReportData.chequesDelivered.length}</p>
                   </div>
                   <div className="bg-orange-50/50 dark:bg-orange-900/10 p-6 rounded-3xl border border-orange-100 dark:border-orange-900/30">
                      <div className="flex justify-between items-center mb-3">
                        <TruckIcon size={20} className="text-orange-600" />
                        <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{t.delvCount} Cards</span>
                      </div>
                      <p className="text-3xl font-black text-orange-900 dark:text-orange-100">{dailyReportData.cardsDelivered.length}</p>
                   </div>
                </div>

                {/* Detailed Logs Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-2">
                     <History size={16} className="text-slate-400" />
                     <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{t.summaryTab}</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Received Column */}
                    <div className="space-y-3">
                       <h5 className="text-xs font-black text-slate-500 dark:text-slate-400 px-2 flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {t.recvCount} Today
                       </h5>
                       <div className="space-y-2">
                          {[...dailyReportData.chequesReceived, ...dailyReportData.cardsReceived].length > 0 ? (
                            [...dailyReportData.chequesReceived, ...dailyReportData.cardsReceived].map((item, i) => (
                              <div key={i} className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between group hover:border-blue-400 transition-all">
                                 <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${'accountTitle' in item ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                      {'accountTitle' in item ? <BookCopy size={14} /> : <CreditCard size={14} />}
                                    </div>
                                    <div>
                                       <p className="text-[11px] font-black text-slate-800 dark:text-white truncate">{'accountTitle' in item ? (item as any).accountTitle : (item as any).cardHolderName}</p>
                                       <p className="text-[9px] font-bold text-slate-400">{(item as any).accountNumber}</p>
                                    </div>
                                 </div>
                                 <div className="text-right">
                                    <span className="text-[9px] font-black text-slate-500 truncate block">{item.loanOfficer}</span>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase">{item.receivedDate}</span>
                                 </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-[10px] text-slate-400 italic text-center py-4 bg-slate-50/30 dark:bg-slate-900/20 rounded-2xl border border-dashed border-slate-100 dark:border-slate-800">No arrivals recorded.</p>
                          )}
                       </div>
                    </div>

                    {/* Delivered Column */}
                    <div className="space-y-3">
                       <h5 className="text-xs font-black text-slate-500 dark:text-slate-400 px-2 flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {t.delvCount} Today
                       </h5>
                       <div className="space-y-2">
                          {[...dailyReportData.chequesDelivered, ...dailyReportData.cardsDelivered].length > 0 ? (
                            [...dailyReportData.chequesDelivered, ...dailyReportData.cardsDelivered].map((item, i) => (
                              <div key={i} className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between group hover:border-emerald-400 transition-all">
                                 <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${'accountTitle' in item ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                      {'accountTitle' in item ? <BookCopy size={14} /> : <CreditCard size={14} />}
                                    </div>
                                    <div>
                                       <p className="text-[11px] font-black text-slate-800 dark:text-white truncate">{'accountTitle' in item ? (item as any).accountTitle : (item as any).cardHolderName}</p>
                                       <p className="text-[9px] font-bold text-slate-400">{(item as any).accountNumber}</p>
                                    </div>
                                 </div>
                                 <div className="text-right">
                                    <span className="text-[9px] font-black text-slate-500 truncate block">{item.loanOfficer}</span>
                                    <span className="text-[8px] font-bold text-emerald-500 uppercase">{item.deliveryDate}</span>
                                 </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-[10px] text-slate-400 italic text-center py-4 bg-slate-50/30 dark:bg-slate-900/20 rounded-2xl border border-dashed border-slate-100 dark:border-slate-800">No deliveries recorded.</p>
                          )}
                       </div>
                    </div>
                  </div>
                </div>
             </div>
             
             <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button 
                  onClick={() => setModalType(null)} 
                  className="px-8 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black rounded-xl text-xs"
                >
                  Close Insights
                </button>
             </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {modalType === 'selection' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-[#1E293B] rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden p-8 animate-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{t.selectionTitle}</h3>
                <button onClick={() => setModalType(null)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white"><X size={18} /></button>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <button onClick={() => { setModalType('chequeForm'); resetChequeForm(); }} className="group p-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[2rem] hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left">
                 <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform"><BookCopy size={24} /></div>
                 <h4 className="font-black text-slate-900 dark:text-white text-base mb-1">{t.cheques}</h4>
                 <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed">{t.chequeDesc}</p>
               </button>
               <button onClick={() => { setModalType('cardForm'); resetCardForm(); }} className="group p-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[2rem] hover:border-purple-500 hover:bg-purple-50/50 transition-all text-left">
                 <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4 group-hover:scale-110 transition-transform"><CreditCard size={24} /></div>
                 <h4 className="font-black text-slate-900 dark:text-white text-base mb-1">{t.cards}</h4>
                 <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed">{t.cardDesc}</p>
               </button>
             </div>
          </div>
        </div>
      )}

      {modalType === 'chequeForm' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto pt-10 pb-10">
          <div className="w-full max-w-lg bg-white dark:bg-[#1E293B] rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 pt-8 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{editingId ? t.update : t.cheques}</h3>
              <button onClick={() => { setModalType(null); setEditingId(null); }} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleAddCheque} className="p-8 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 block">{t.accTitle}</label>
                <input required type="text" value={chequeAccTitle} onChange={e => setChequeAccTitle(e.target.value.replace(/[0-9]/g, ''))} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 block">{t.accNo}</label>
                  <input required type="text" value={chequeAccNo} onChange={e => setChequeAccNo(e.target.value.replace(/[^0-9]/g, ''))} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 block">{t.mobNo}</label>
                  <input required type="tel" value={chequeMobNo} onChange={e => setChequeMobNo(e.target.value.replace(/[^0-9]/g, ''))} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10" />
                </div>
              </div>
              <div className="space-y-1.5 relative" ref={leavesRef}>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 block">{t.leaves}</label>
                <button type="button" onClick={() => setIsLeavesOpen(!isLeavesOpen)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 text-sm font-bold text-left dark:text-white flex justify-between items-center">
                  <span>{chequeLeaves} Leaves</span>
                  <ChevronDown size={18} className={`text-slate-400 transition-transform ${isLeavesOpen ? 'rotate-180' : ''}`} />
                </button>
                {isLeavesOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl py-2 z-50">
                    {[25, 50, 75, 100, 200].map(val => (
                      <button key={val} type="button" onClick={() => { setChequeLeaves(val as any); setIsLeavesOpen(false); }} className="w-full px-5 py-3 text-left text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-white transition-colors flex justify-between">
                        {val} Leaves {chequeLeaves === val && <Check size={16} className="text-blue-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 block">{t.startPage}</label>
                  <input required type="text" value={chequeStart} onChange={e => setChequeStart(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 block">{t.endPage}</label>
                  <input required type="text" value={chequeEnd} onChange={e => setChequeEnd(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 block">{t.status}</label>
                  <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <button type="button" onClick={() => setChequeStatus('Pending')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${chequeStatus === 'Pending' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}>{t.pending}</button>
                    <button type="button" onClick={() => setChequeStatus('Submitted')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${chequeStatus === 'Submitted' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}>{t.submitted}</button>
                  </div>
                </div>
                <div className="space-y-1.5 relative" ref={officerRef}>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 block">{t.officer}</label>
                  <button type="button" onClick={() => setIsOfficerOpen(!isOfficerOpen)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm font-bold text-left dark:text-white flex justify-between items-center transition-all">
                    <span className="truncate">{chequeOfficer || 'Select Officer'}</span>
                    <ChevronDown size={18} className={`text-slate-400 transition-transform ${isOfficerOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOfficerOpen && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl py-2 z-50 max-h-48 overflow-y-auto">
                      {loanOfficers.map(off => (<button key={off} type="button" onClick={() => { setChequeOfficer(off); setIsOfficerOpen(false); }} className="w-full px-5 py-3 text-left text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white transition-colors">{off}</button>))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 relative" ref={chequeDateRef}>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 block">{t.recvDate}</label>
                  <button type="button" onClick={() => setIsChequeDateOpen(!isChequeDateOpen)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 text-sm font-bold text-left dark:text-white flex justify-between items-center transition-all">
                    <span>{chequeRecvDate}</span>
                    <Calendar size={16} className="text-blue-500" />
                  </button>
                  {isChequeDateOpen && <div className="absolute bottom-full right-0 mb-3 z-50">{renderCalendar(chequeRecvDate, (d) => { setChequeRecvDate(d); setIsChequeDateOpen(false); })}</div>}
                </div>
                <div className="space-y-1.5 relative" ref={deliveryDateRef}>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 block">{t.delvDate}</label>
                  <button type="button" onClick={() => setIsDeliveryDateOpen(!isDeliveryDateOpen)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 text-sm font-bold text-left dark:text-white flex justify-between items-center transition-all">
                    <span className={chequeDeliveryDate ? '' : 'opacity-40'}>{chequeDeliveryDate || 'Not Delivered'}</span>
                    <Truck size={16} className="text-emerald-500" />
                  </button>
                  {isDeliveryDateOpen && <div className="absolute bottom-full right-0 mb-3 z-50">{renderCalendar(chequeDeliveryDate, (d) => { setChequeDeliveryDate(d); setIsDeliveryDateOpen(false); })}</div>}
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => { setModalType(null); setEditingId(null); }} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl transition-all text-sm hover:bg-slate-200">{t.cancel}</button>
                <button type="submit" className="flex-[2] py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/30 transition-all text-sm uppercase tracking-wider">{editingId ? t.update : t.save}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalType === 'cardForm' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-[#1E293B] rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 pt-8 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{editingId ? t.update : t.cards}</h3>
              <button onClick={() => { setModalType(null); setEditingId(null); }} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleAddCard} className="p-8 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 block">{t.accNo}</label>
                  <input required type="text" value={cardAcc} onChange={e => setCardAcc(e.target.value.replace(/[^0-9]/g, ''))} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3 text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 block">{t.mobNo}</label>
                  <input required type="tel" value={cardMob} onChange={e => setCardMob(e.target.value.replace(/[^0-9]/g, ''))} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3 text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 block">{t.holder}</label>
                <input required type="text" value={cardHolder} onChange={e => setCardHolder(e.target.value.replace(/[0-9]/g, ''))} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3 text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 block">{t.cardNo}</label>
                <input required type="text" value={cardNo} onChange={e => setCardNo(e.target.value.replace(/[^0-9]/g, ''))} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3 text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 block">{t.status}</label>
                  <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <button type="button" onClick={() => setCardStatus('Pending')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${cardStatus === 'Pending' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}>{t.pending}</button>
                    <button type="button" onClick={() => setCardStatus('Submitted')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${cardStatus === 'Submitted' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}>{t.submitted}</button>
                  </div>
                </div>
                <div className="space-y-1.5 relative" ref={cardOfficerRef}>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 block">{t.officer}</label>
                  <button type="button" onClick={() => setIsCardOfficerOpen(!isCardOfficerOpen)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3 text-sm font-bold text-left dark:text-white flex justify-between items-center transition-all">
                    <span className="truncate">{cardOfficer || 'Select Officer'}</span>
                    <ChevronDown size={18} className={`text-slate-400 transition-transform ${isCardOfficerOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isCardOfficerOpen && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl py-2 z-50 max-h-48 overflow-y-auto">
                      {loanOfficers.map(off => (<button key={off} type="button" onClick={() => { setCardOfficer(off); setIsCardOfficerOpen(false); }} className="w-full px-5 py-3 text-left text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white transition-colors">{off}</button>))}
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 relative" ref={cardDateRef}>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 block">{t.recvDate}</label>
                  <button type="button" onClick={() => setIsCardDateOpen(!isCardDateOpen)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3 text-sm font-bold text-left dark:text-white flex justify-between items-center transition-all">
                    <span>{cardDate}</span><Calendar size={16} className="text-blue-500" />
                  </button>
                  {isCardDateOpen && <div className="absolute bottom-full right-0 mb-3 z-50">{renderCalendar(cardDate, (d) => { setCardDate(d); setIsCardDateOpen(false); })}</div>}
                </div>
                <div className="space-y-1.5 relative" ref={cardDeliveryDateRef}>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 block">{t.delvDate}</label>
                  <button type="button" onClick={() => setIsCardDeliveryDateOpen(!isCardDeliveryDateOpen)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3 text-sm font-bold text-left dark:text-white flex justify-between items-center transition-all">
                    <span className={cardDeliveryDate ? '' : 'opacity-40'}>{cardDeliveryDate || 'Not Delivered'}</span>
                    <Truck size={16} className="text-emerald-500" />
                  </button>
                  {isCardDeliveryDateOpen && <div className="absolute bottom-full right-0 mb-3 z-50">{renderCalendar(cardDeliveryDate, (d) => { setCardDeliveryDate(d); setIsCardDeliveryDateOpen(false); })}</div>}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setModalType(null); setEditingId(null); }} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl transition-all text-sm hover:bg-slate-200">{t.cancel}</button>
                <button type="submit" className="flex-[1.5] py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-2xl shadow-xl shadow-purple-500/30 transition-all text-sm uppercase tracking-wider">{editingId ? t.update : t.save}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalType === 'deleteConfirm' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-[#1E293B] rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 p-8 text-center animate-in zoom-in-95 duration-200">
             <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6"><AlertTriangle size={32} /></div>
             <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight mb-2">{t.confirmDelete}</h3>
             <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">{t.confirmText}</p>
             <div className="flex gap-3">
               <button onClick={() => { setModalType(null); setDeletingInfo(null); }} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition-colors text-xs">{t.cancel}</button>
               <button onClick={handleConfirmDelete} className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-500/20 transition-all text-xs uppercase tracking-wider">{t.delete}</button>
             </div>
          </div>
        </div>
      )}

      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; } .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }`}</style>
    </div>
  );
};

const ChequeCard: React.FC<{ cheque: ChequeBook, language: 'en' | 'bn', onEdit: () => void, onDelete: () => void }> = ({ cheque, language, onEdit, onDelete }) => {
  const isSubmitted = cheque.status === 'Submitted';
  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group h-full">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-blue-50/30 dark:bg-blue-900/10">
        <div className="flex justify-between items-center mb-4">
          <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/30"><BookCopy size={20} /></div>
          <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${isSubmitted ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
            {isSubmitted ? <CheckCircle2 size={10} /> : <Clock size={10} />}{isSubmitted ? (language === 'en' ? 'Submitted' : 'সাবমিটেড') : (language === 'en' ? 'Pending' : 'পেন্ডিং')}
          </div>
        </div>
        <h4 className="text-lg font-black text-slate-900 dark:text-white truncate leading-tight mb-1">{cheque.accountTitle}</h4>
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400"><Hash size={12} className="opacity-50" /> {cheque.accountNumber}</div>
      </div>
      <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3"><Hash size={14} className="text-blue-500" /><span className="text-sm font-bold text-slate-700 dark:text-slate-300">{cheque.startPage} <span className="text-slate-300">→</span> {cheque.endPage}</span></div>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center gap-2"><Briefcase size={14} className="text-slate-400" /><span className="text-[11px] font-black text-slate-700 dark:text-slate-300 truncate">{cheque.loanOfficer}</span></div>
            <div className="flex items-center gap-2"><Phone size={14} className="text-slate-400" /><span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{cheque.mobileNumber}</span></div>
            <div className="mt-2 pt-2 border-t border-slate-50 dark:border-slate-800/50 flex items-center gap-2">
              <Truck size={14} className={cheque.deliveryDate ? "text-emerald-600 dark:text-emerald-400" : "text-slate-300"} />
              <div><p className="text-[8px] font-black uppercase text-slate-400 tracking-tighter leading-none mb-0.5">{language === 'en' ? 'Delivery Date' : 'ডেলিভারি তারিখ'}</p><p className={`text-[10px] font-black ${cheque.deliveryDate ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 italic font-medium'}`}>{cheque.deliveryDate || (language === 'en' ? 'Awaiting Delivery' : 'ডেলিভারির অপেক্ষায়')}</p></div>
            </div>
          </div>
        </div>
        <div className="pt-4 border-t border-slate-50 dark:border-slate-800/50 flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5"><Calendar size={12}/> {cheque.receivedDate}</span>
          <div className="flex gap-1">
            <button onClick={onEdit} className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"><Pencil size={16} /></button>
            <button onClick={onDelete} className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"><Trash2 size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CardDisplay: React.FC<{ card: DebitCard, language: 'en' | 'bn', onEdit: () => void, onDelete: () => void }> = ({ card, language, onEdit, onDelete }) => {
  const isSubmitted = card.status === 'Submitted';
  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group h-full">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-purple-50/30 dark:bg-purple-900/10">
        <div className="flex justify-between items-center mb-4">
          <div className="p-3 bg-purple-600 text-white rounded-2xl shadow-lg shadow-purple-500/30"><CreditCard size={20} /></div>
          <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${isSubmitted ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
            {isSubmitted ? <CheckCircle2 size={10} /> : <Clock size={10} />}{isSubmitted ? (language === 'en' ? 'Submitted' : 'সাবমিটেড') : (language === 'en' ? 'Pending' : 'পেন্ডিং')}
          </div>
        </div>
        <h4 className="text-lg font-black text-slate-900 dark:text-white truncate">{card.cardHolderName}</h4>
        <p className="text-[11px] font-bold text-slate-400 mt-1 flex items-center gap-1.5"><Hash size={12}/> {card.cardNumber}</p>
      </div>
      <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Account</p><p className="text-xs font-bold text-slate-700 dark:text-slate-200">{card.accountNumber}</p></div>
          <div><p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Mobile</p><p className="text-xs font-bold text-slate-700 dark:text-slate-200">{card.mobileNumber}</p></div>
        </div>
        <div className="pt-3 border-t border-slate-50 dark:border-slate-800/50 flex flex-col gap-2">
          <div className="flex items-center gap-2"><Briefcase size={12} className="text-purple-500" /><span className="text-[10px] font-black text-slate-700 dark:text-slate-300">{card.loanOfficer}</span></div>
          <div className="flex items-center gap-2">
            <Truck size={14} className={card.deliveryDate ? "text-emerald-600 dark:text-emerald-400" : "text-slate-300"} />
            <div><p className="text-[8px] font-black uppercase text-slate-400 tracking-tighter leading-none mb-0.5">{language === 'en' ? 'Delivery' : 'ডেলিভারি'}</p><p className={`text-[10px] font-black ${card.deliveryDate ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 italic font-medium'}`}>{card.deliveryDate || (language === 'en' ? 'Awaiting Delivery' : 'অপেক্ষমাণ')}</p></div>
          </div>
        </div>
        <div className="pt-4 border-t border-slate-50 dark:border-slate-800/50 flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5"><Calendar size={12}/> {card.receivedDate}</span>
          <div className="flex gap-1">
            <button onClick={onEdit} className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"><Pencil size={16} /></button>
            <button onClick={onDelete} className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"><Trash2 size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="col-span-full py-24 text-center bg-white dark:bg-[#1E293B] rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-md">
    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200 dark:text-slate-700"><Info size={40} /></div>
    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{message}</h3>
    <p className="text-slate-400 text-xs font-bold italic px-8">Register items to start monitoring your inventory.</p>
  </div>
);