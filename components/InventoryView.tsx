import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, CreditCard, BookCopy, Hash, User, Phone, 
  Calendar, Trash2, X, ChevronDown, Check,
  ChevronLeft, ChevronRight, Briefcase, Filter, Search, Info,
  AlertCircle, Pencil, AlertTriangle
} from 'lucide-react';
import { ChequeBook, DebitCard } from '../types';

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
type ModalType = 'selection' | 'chequeForm' | 'cardForm' | 'deleteConfirm' | null;

export const InventoryView: React.FC<InventoryViewProps> = ({ 
  cheques, cards, loanOfficers, 
  onAddCheque, onUpdateCheque, onDeleteCheque, onAddCard, onUpdateCard, onDeleteCard, language 
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('cheques');
  const [modalType, setModalType] = useState<ModalType>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingInfo, setDeletingInfo] = useState<{ id: string, type: 'cheque' | 'card' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Cheque Form State
  const [chequeAccTitle, setChequeAccTitle] = useState('');
  const [chequeAccNo, setChequeAccNo] = useState('');
  const [chequeMobNo, setChequeMobNo] = useState('');
  const [chequeLeaves, setChequeLeaves] = useState<25 | 50 | 75 | 100 | 200>(25);
  const [chequeStart, setChequeStart] = useState('');
  const [chequeEnd, setChequeEnd] = useState('');
  const [chequeOfficer, setChequeOfficer] = useState(loanOfficers[0] || '');
  const [chequeRecvDate, setChequeRecvDate] = useState(new Date().toISOString().split('T')[0]);
  const [isOfficerOpen, setIsOfficerOpen] = useState(false);
  const [isLeavesOpen, setIsLeavesOpen] = useState(false);
  const [isChequeDateOpen, setIsChequeDateOpen] = useState(false);

  // Card Form State
  const [cardAcc, setCardAcc] = useState('');
  const [cardMob, setCardMob] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNo, setCardNo] = useState('');
  const [cardOfficer, setCardOfficer] = useState(loanOfficers[0] || '');
  const [cardDate, setCardDate] = useState(new Date().toISOString().split('T')[0]);
  const [isCardOfficerOpen, setIsCardOfficerOpen] = useState(false);
  const [isCardDateOpen, setIsCardDateOpen] = useState(false);
  
  // Shared View Date for Calendar
  const [viewDate, setViewDate] = useState(new Date());

  const officerRef = useRef<HTMLDivElement>(null);
  const leavesRef = useRef<HTMLDivElement>(null);
  const chequeDateRef = useRef<HTMLDivElement>(null);
  const cardOfficerRef = useRef<HTMLDivElement>(null);
  const cardDateRef = useRef<HTMLDivElement>(null);

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
    save: language === 'en' ? 'Save Record' : 'রেকর্ড সংরক্ষণ',
    update: language === 'en' ? 'Update Record' : 'আপডেট করুন',
    cancel: language === 'en' ? 'Cancel' : 'বাতিল',
    confirmDelete: language === 'en' ? 'Confirm Delete' : 'মুছে ফেলার নিশ্চিতকরণ',
    confirmText: language === 'en' ? 'Are you sure you want to delete this record?' : 'আপনি কি নিশ্চিত যে আপনি এই রেকর্ডটি মুছে ফেলতে চান?',
    delete: language === 'en' ? 'Delete' : 'মুছুন',
    searchPlaceholder: language === 'en' ? 'Search items...' : 'আইটেম খুঁজুন...',
    noData: language === 'en' ? 'No inventory records found' : 'কোন ইনভেন্টরি রেকর্ড পাওয়া যায়নি'
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (officerRef.current && !officerRef.current.contains(event.target as Node)) setIsOfficerOpen(false);
      if (leavesRef.current && !leavesRef.current.contains(event.target as Node)) setIsLeavesOpen(false);
      if (chequeDateRef.current && !chequeDateRef.current.contains(event.target as Node)) setIsChequeDateOpen(false);
      if (cardOfficerRef.current && !cardOfficerRef.current.contains(event.target as Node)) setIsCardOfficerOpen(false);
      if (cardDateRef.current && !cardDateRef.current.contains(event.target as Node)) setIsCardDateOpen(false);
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
      receivedDate: chequeRecvDate
    };
    if (editingId) {
      onUpdateCheque(editingId, data);
    } else {
      onAddCheque(data);
    }
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
      receivedDate: cardDate
    };
    if (editingId) {
      onUpdateCard(editingId, data);
    } else {
      onAddCard(data);
    }
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
  };

  const resetCardForm = () => {
    setCardAcc('');
    setCardMob('');
    setCardHolder('');
    setCardNo('');
    setCardOfficer(loanOfficers[0] || '');
    setCardDate(new Date().toISOString().split('T')[0]);
  };

  const filteredCheques = cheques.filter(c => 
    c.accountTitle.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.accountNumber.includes(searchQuery) || 
    c.mobileNumber.includes(searchQuery) || 
    c.startPage.includes(searchQuery) || 
    c.endPage.includes(searchQuery) || 
    c.loanOfficer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCards = cards.filter(c => 
    c.accountNumber.includes(searchQuery) || c.cardHolderName.toLowerCase().includes(searchQuery.toLowerCase()) || c.cardNumber.includes(searchQuery)
  );

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
                  className={`w-full h-full flex items-center justify-center rounded-lg text-[10px] font-bold transition-all ${
                    day === new Date(currentDate).getDate() && month === new Date(currentDate).getMonth() && year === new Date(currentDate).getFullYear()
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
      if (deletingInfo.type === 'cheque') {
        onDeleteCheque(deletingInfo.id);
      } else {
        onDeleteCard(deletingInfo.id);
      }
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
        <button 
          onClick={() => {
            setEditingId(null);
            setModalType('selection');
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-2xl shadow-xl shadow-blue-500/30 transition-all active:scale-95 h-[48px]"
        >
          <Plus size={20} strokeWidth={3} />
          <span>{t.addBtn}</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit border border-slate-200 dark:border-slate-700 h-fit">
          <button 
            onClick={() => setActiveTab('cheques')}
            className={`flex items-center gap-2 px-8 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'cheques' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <BookCopy size={16} /> {t.cheques}
          </button>
          <button 
            onClick={() => setActiveTab('cards')}
            className={`flex items-center gap-2 px-8 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'cards' 
                ? 'bg-purple-600 text-white shadow-lg' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <CreditCard size={16} /> {t.cards}
          </button>
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {activeTab === 'cheques' ? (
          filteredCheques.length > 0 ? (
            filteredCheques.map(c => (
              <ChequeCard 
                key={c.id} 
                cheque={c} 
                language={language} 
                onEdit={() => handleEditCheque(c)}
                onDelete={() => {
                  setDeletingInfo({ id: c.id, type: 'cheque' });
                  setModalType('deleteConfirm');
                }} 
              />
            ))
          ) : (
            <EmptyState message={t.noData} />
          )
        ) : (
          filteredCards.length > 0 ? (
            filteredCards.map(c => (
              <CardDisplay 
                key={c.id} 
                card={c} 
                language={language} 
                onEdit={() => handleEditCard(c)}
                onDelete={() => {
                  setDeletingInfo({ id: c.id, type: 'card' });
                  setModalType('deleteConfirm');
                }} 
              />
            ))
          ) : (
            <EmptyState message={t.noData} />
          )
        )}
      </div>

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
                <div className="space-y-1.5 relative" ref={officerRef}>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 block">{t.officer}</label>
                  <button type="button" onClick={() => setIsOfficerOpen(!isOfficerOpen)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 text-sm font-bold text-left dark:text-white flex justify-between items-center">
                    <span className="truncate">{chequeOfficer || 'Select Officer'}</span>
                    <ChevronDown size={18} className={`text-slate-400 transition-transform ${isOfficerOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOfficerOpen && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl py-2 z-50 max-h-48 overflow-y-auto custom-scrollbar">
                      {loanOfficers.map(off => (
                        <button key={off} type="button" onClick={() => { setChequeOfficer(off); setIsOfficerOpen(false); }} className="w-full px-5 py-3 text-left text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-white transition-colors flex justify-between">
                          {off} {chequeOfficer === off && <Check size={16} className="text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-1.5 relative" ref={chequeDateRef}>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 block">{t.recvDate}</label>
                  <button type="button" onClick={() => setIsChequeDateOpen(!isChequeDateOpen)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 text-sm font-bold text-left dark:text-white flex justify-between items-center">
                    <span>{chequeRecvDate}</span>
                    <Calendar size={16} className="text-blue-500" />
                  </button>
                  {isChequeDateOpen && (
                    <div className="absolute bottom-full right-0 mb-3 z-50">
                      {renderCalendar(chequeRecvDate, (d) => { setChequeRecvDate(d); setIsChequeDateOpen(false); })}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => { setModalType(null); setEditingId(null); }} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl transition-all text-sm">{t.cancel}</button>
                <button type="submit" className="flex-[2] py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/30 transition-all active:scale-95 text-sm uppercase tracking-wider">{editingId ? t.update : t.save}</button>
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
                <div className="space-y-1.5 relative" ref={cardOfficerRef}>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 block">{t.officer}</label>
                  <button type="button" onClick={() => setIsCardOfficerOpen(!isCardOfficerOpen)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-3 text-sm font-bold text-left dark:text-white flex justify-between items-center">
                    <span className="truncate">{cardOfficer || 'Select Officer'}</span>
                    <ChevronDown size={18} className={`text-slate-400 transition-transform ${isCardOfficerOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isCardOfficerOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl py-2 z-50 max-h-48 overflow-y-auto custom-scrollbar">
                      {loanOfficers.map(off => (
                        <button key={off} type="button" onClick={() => { setCardOfficer(off); setIsCardOfficerOpen(false); }} className="w-full px-5 py-3 text-left text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-white transition-colors flex justify-between">
                          {off} {cardOfficer === off && <Check size={16} className="text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-1.5 relative" ref={cardDateRef}>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 block">{t.recvDate}</label>
                  <button type="button" onClick={() => setIsCardDateOpen(!isCardDateOpen)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-3 text-sm font-bold text-left dark:text-white flex justify-between items-center">
                    <span>{cardDate}</span>
                    <Calendar size={16} className="text-blue-500" />
                  </button>
                  {isCardDateOpen && (
                    <div className="absolute bottom-full right-0 mb-3 z-50">
                      {renderCalendar(cardDate, (d) => { setCardDate(d); setIsCardDateOpen(false); })}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setModalType(null); setEditingId(null); }} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl transition-all text-sm"> {t.cancel} </button>
                <button type="submit" className="flex-[1.5] py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-2xl shadow-xl shadow-purple-500/30 transition-all active:scale-95 text-sm uppercase tracking-wider">{editingId ? t.update : t.save}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalType === 'deleteConfirm' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-[#1E293B] rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 p-8 text-center animate-in zoom-in-95 duration-200">
             <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} />
             </div>
             <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight mb-2">{t.confirmDelete}</h3>
             <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">{t.confirmText}</p>
             <div className="flex gap-3">
               <button onClick={() => { setModalType(null); setDeletingInfo(null); }} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition-colors text-xs">{t.cancel}</button>
               <button onClick={handleConfirmDelete} className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-500/20 transition-all text-xs uppercase tracking-wider">{t.delete}</button>
             </div>
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

const ChequeCard: React.FC<{ cheque: ChequeBook, language: 'en' | 'bn', onEdit: () => void, onDelete: () => void }> = ({ cheque, language, onEdit, onDelete }) => (
  <div className="bg-white dark:bg-[#1E293B] rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group h-full">
    <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-blue-50/30 dark:bg-blue-900/10">
      <div className="flex justify-between items-center mb-4">
        <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/30"><BookCopy size={20} /></div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{cheque.leaves} Leaves</span>
      </div>
      <h4 className="text-lg font-black text-slate-900 dark:text-white truncate leading-tight mb-1">{cheque.accountTitle}</h4>
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
         <Hash size={12} className="opacity-50" /> {cheque.accountNumber}
      </div>
    </div>
    <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Hash size={14} className="text-blue-500" />
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{cheque.startPage} <span className="text-slate-300">→</span> {cheque.endPage}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <Briefcase size={14} className="text-slate-400" />
            <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 truncate">{cheque.loanOfficer}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={14} className="text-slate-400" />
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{cheque.mobileNumber}</span>
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

const CardDisplay: React.FC<{ card: DebitCard, language: 'en' | 'bn', onEdit: () => void, onDelete: () => void }> = ({ card, language, onEdit, onDelete }) => (
  <div className="bg-white dark:bg-[#1E293B] rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group h-full">
    <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-purple-50/30 dark:bg-purple-900/10">
      <div className="flex justify-between items-center mb-4">
        <div className="p-3 bg-purple-600 text-white rounded-2xl shadow-lg shadow-purple-500/30"><CreditCard size={20} /></div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate max-w-[100px]">{card.loanOfficer}</span>
      </div>
      <h4 className="text-lg font-black text-slate-900 dark:text-white truncate">{card.cardHolderName}</h4>
      <p className="text-[11px] font-bold text-slate-400 mt-1 flex items-center gap-1.5"><Hash size={12}/> {card.cardNumber}</p>
    </div>
    <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Account</p>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{card.accountNumber}</p>
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Mobile</p>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{card.mobileNumber}</p>
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

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="col-span-full py-24 text-center bg-white dark:bg-[#1E293B] rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-md">
    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200 dark:text-slate-700"><Info size={40} /></div>
    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{message}</h3>
    <p className="text-slate-400 text-xs font-bold italic px-8">Register items to start monitoring your inventory.</p>
  </div>
);