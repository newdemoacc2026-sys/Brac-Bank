
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Plus, User, Phone, Hash, Calendar, Trash2, X, 
  ChevronDown, Check, Briefcase, Search, Filter, 
  LayoutGrid, UserPlus, Users, GraduationCap, Sprout,
  UsersRound, ChevronRight, AlertCircle, Pencil, ExternalLink,
  BookCopy, CreditCard, HandCoins, Activity, AlertTriangle,
  Landmark
} from 'lucide-react';
import { BankAccount, AccountCategory, AccountSubCategory, ChequeBook, DebitCard, Disbursement } from '../types';
import { AdvancedDatePicker } from './AdvancedDatePicker';
import { formatCurrency } from '../utils/finance';

interface AccountInquiryViewProps {
  accounts: BankAccount[];
  loanOfficers: string[];
  inventoryCheques: ChequeBook[];
  inventoryCards: DebitCard[];
  disbursements: Disbursement[];
  retailAccountTypes: string[];
  currentAccountTypes: string[];
  onAddAccount: (acc: Omit<BankAccount, 'id'>) => void;
  onUpdateAccount: (id: string, acc: Omit<BankAccount, 'id'>) => void;
  onDeleteAccount: (id: string) => void;
  onNavigateToFiltered: (view: 'inventory' | 'disbursements', accountNo: string) => void;
  language: 'en' | 'bn';
}

type ModalStage = 'selection' | 'subSelection' | 'form' | null;

export const AccountInquiryView: React.FC<AccountInquiryViewProps> = ({ 
  accounts, 
  loanOfficers, 
  inventoryCheques,
  inventoryCards,
  disbursements,
  retailAccountTypes,
  currentAccountTypes,
  onAddAccount, 
  onUpdateAccount, 
  onDeleteAccount, 
  onNavigateToFiltered,
  language 
}) => {
  const [stage, setStage] = useState<ModalStage>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AccountCategory>('Retail');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOfficerOpen, setIsOfficerOpen] = useState(false);
  const officerRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<Omit<BankAccount, 'id'>>({
    accountTitle: '',
    accountNumber: '',
    mobileNumber: '',
    nomineeMobileNumber: '',
    category: 'Retail',
    subCategory: 'Savings',
    createDate: new Date().toISOString().split('T')[0],
    loanOfficer: loanOfficers[0] || ''
  });

  const t = {
    title: language === 'en' ? 'Account Inquiry' : 'অ্যাকাউন্ট অনুসন্ধান',
    subtitle: language === 'en' ? 'Central database for all customer bank accounts' : 'গ্রাহকের সকল ব্যাংক অ্যাকাউন্টের কেন্দ্রীয় তথ্যশালা',
    addBtn: language === 'en' ? 'Add Account' : 'অ্যাকাউন্ট যোগ করুন',
    selectCat: language === 'en' ? 'Select Account Category' : 'অ্যাকাউন্ট ক্যাটাগরি নির্বাচন করুন',
    selectSub: language === 'en' ? 'Select Account Type' : 'অ্যাকাউন্টের ধরন নির্বাচন করুন',
    details: language === 'en' ? 'Account Details' : 'অ্যাকাউন্ট বিবরণ',
    retail: language === 'en' ? 'Retail' : 'রিটেইল',
    current: language === 'en' ? 'Current' : 'কারেন্ট',
    student: language === 'en' ? 'Student' : 'স্টুডেন্ট',
    farmer: language === 'en' ? 'Farmer' : 'ফার্মার',
    accTitle: language === 'en' ? 'Account Title' : 'অ্যাকাউন্ট টাইটেল',
    accNo: language === 'en' ? 'Account Number' : 'অ্যাকাউন্ট নম্বর',
    mobile: language === 'en' ? 'Mobile Number' : 'মোবাইল নম্বর',
    nomineeMob: language === 'en' ? 'Nominee Mobile' : 'নমিনী মোবাইল নম্বর',
    officer: language === 'en' ? 'Loan Officer' : 'লোন অফিসার',
    date: language === 'en' ? 'Create Date' : 'তৈরির তারিখ',
    save: language === 'en' ? 'Save Account' : 'অ্যাকাউন্ট সংরক্ষণ',
    update: language === 'en' ? 'Update Account' : 'আপডেট করুন',
    cancel: language === 'en' ? 'Cancel' : 'বাতিল',
    search: language === 'en' ? 'Search by name or number...' : 'নাম বা নম্বর দিয়ে খুঁজুন...',
    noData: language === 'en' ? 'No accounts found in this category' : 'এই বিভাগে কোন অ্যাকাউন্ট পাওয়া যায়নি',
    deleteConfirmTitle: language === 'en' ? 'Confirm Deletion' : 'মুছে ফেলার নিশ্চিতকরণ',
    deleteConfirmText: language === 'en' ? 'Are you sure you want to delete this account? All local linked view references will be lost.' : 'আপনি কি নিশ্চিত যে আপনি এই অ্যাকাউন্টটি মুছে ফেলতে চান? সংশ্লিষ্ট সব রেফারেন্স হারিয়ে যাবে।',
    delete: language === 'en' ? 'Delete' : 'মুছুন',
    viewDetails: language === 'en' ? 'View Activity' : 'কার্যক্রম দেখুন',
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (officerRef.current && !officerRef.current.contains(event.target as Node)) setIsOfficerOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenSelection = () => {
    setEditingId(null);
    setStage('selection');
  };

  const handleSelectCategory = (cat: AccountCategory) => {
    setFormData(prev => ({ ...prev, category: cat, subCategory: 'Standard' }));
    if (cat === 'Retail' || cat === 'Current') {
      setStage('subSelection');
    } else {
      setStage('form');
    }
  };

  const handleSelectSubCategory = (sub: string) => {
    setFormData(prev => ({ ...prev, subCategory: sub }));
    setStage('form');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) onUpdateAccount(editingId, formData);
    else onAddAccount(formData);
    handleClose();
  };

  const handleEdit = (acc: BankAccount) => {
    setEditingId(acc.id);
    setFormData({ ...acc });
    setStage('form');
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
  };

  const handlePerformDelete = () => {
    if (deletingId) {
      onDeleteAccount(deletingId);
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      accountTitle: '',
      accountNumber: '',
      mobileNumber: '',
      nomineeMobileNumber: '',
      category: 'Retail',
      subCategory: 'Savings',
      createDate: new Date().toISOString().split('T')[0],
      loanOfficer: loanOfficers[0] || ''
    });
  };

  const handleClose = () => {
    setStage(null);
    setEditingId(null);
    resetForm();
  };

  const filteredAccounts = useMemo(() => {
    return accounts.filter(acc => {
      const matchesTab = acc.category === activeTab;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = q === '' || 
        acc.accountTitle.toLowerCase().includes(q) || 
        acc.accountNumber.includes(q) || 
        acc.mobileNumber.includes(q);
      return matchesTab && matchesSearch;
    });
  }, [accounts, activeTab, searchQuery]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{t.title}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">{t.subtitle}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder={t.search} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-11 pr-4 py-2.5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white"
            />
          </div>
          <button onClick={handleOpenSelection} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-2xl shadow-xl shadow-blue-500/30 transition-all active:scale-95 h-[48px]">
            <UserPlus size={20} strokeWidth={3} />
            <span className="hidden sm:inline">{t.addBtn}</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl w-fit border border-slate-200 dark:border-slate-800">
        {(['Retail', 'Current', 'Student', 'Farmer'] as AccountCategory[]).map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === cat 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {cat === 'Retail' ? t.retail : cat === 'Current' ? t.current : cat === 'Student' ? t.student : t.farmer}
          </button>
        ))}
      </div>

      {/* List Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAccounts.length > 0 ? (
          filteredAccounts.map(acc => (
            <AccountCard 
              key={acc.id} 
              acc={acc} 
              language={language} 
              inventoryCheques={inventoryCheques}
              inventoryCards={inventoryCards}
              disbursements={disbursements}
              onEdit={() => handleEdit(acc)} 
              onDelete={() => handleDeleteClick(acc.id)} 
              onViewLinked={(view) => onNavigateToFiltered(view, acc.accountNumber)}
            />
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[3rem]">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Users size={32} />
            </div>
            <p className="text-slate-400 font-bold italic">{t.noData}</p>
          </div>
        )}
      </div>

      {/* MODALS */}
      {stage === 'selection' && (
        <ModalWrapper onClose={handleClose}>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">{t.selectCat}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectionCard icon={<UsersRound size={24}/>} title={t.retail} color="blue" onClick={() => handleSelectCategory('Retail')} />
            {/* Added Landmark icon import to lucide-react above and using it below */}
            <SelectionCard icon={<Landmark size={24}/>} title={t.current} color="purple" onClick={() => handleSelectCategory('Current')} />
            <SelectionCard icon={<GraduationCap size={24}/>} title={t.student} color="emerald" onClick={() => handleSelectCategory('Student')} />
            <SelectionCard icon={<Sprout size={24}/>} title={t.farmer} color="orange" onClick={() => handleSelectCategory('Farmer')} />
          </div>
        </ModalWrapper>
      )}

      {stage === 'subSelection' && (
        <ModalWrapper onClose={() => setStage('selection')}>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">{t.selectSub}</h3>
          <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
            {formData.category === 'Retail' ? (
              retailAccountTypes.map(type => (
                <SubOption key={type} title={type} onClick={() => handleSelectSubCategory(type)} />
              ))
            ) : (
              currentAccountTypes.map(type => (
                <SubOption key={type} title={type} onClick={() => handleSelectSubCategory(type)} />
              ))
            )}
          </div>
        </ModalWrapper>
      )}

      {stage === 'form' && (
        <ModalWrapper onClose={handleClose}>
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
             <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                <UserPlus size={20} />
             </div>
             <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white leading-none">{editingId ? t.update : t.addBtn}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{formData.category} / {formData.subCategory}</p>
             </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
             <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.accTitle}</label>
                <input required type="text" value={formData.accountTitle} onChange={e => setFormData({...formData, accountTitle: e.target.value.replace(/[0-9]/g, '')})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10" />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.accNo}</label>
                   <input required type="text" value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value.replace(/[^0-9]/g, '')})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.mobile}</label>
                   <input required type="tel" value={formData.mobileNumber} onChange={e => setFormData({...formData, mobileNumber: e.target.value.replace(/[^0-9]/g, '')})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10" />
                </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.nomineeMob}</label>
                   <input required type="tel" value={formData.nomineeMobileNumber} onChange={e => setFormData({...formData, nomineeMobileNumber: e.target.value.replace(/[^0-9]/g, '')})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10" />
                </div>
                <div className="space-y-1.5 relative">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.officer}</label>
                   <button type="button" onClick={() => setIsOfficerOpen(!isOfficerOpen)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm font-bold text-left dark:text-white flex justify-between items-center transition-all">
                     <span className="truncate">{formData.loanOfficer}</span>
                     <ChevronDown size={18} className={`text-slate-400 transition-transform ${isOfficerOpen ? 'rotate-180' : ''}`} />
                   </button>
                   {isOfficerOpen && (
                     <div ref={officerRef} className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl py-2 z-[110] max-h-48 overflow-y-auto">
                        {loanOfficers.map(off => (
                          <button key={off} type="button" onClick={() => { setFormData({...formData, loanOfficer: off}); setIsOfficerOpen(false); }} className={`w-full px-5 py-3 text-left text-sm font-bold transition-colors ${formData.loanOfficer === off ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-white'}`}>{off}</button>
                        ))}
                     </div>
                   )}
                </div>
             </div>
             <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.date}</label>
                <AdvancedDatePicker selectedDate={formData.createDate} onDateChange={(d) => setFormData(prev => ({...prev, createDate: d}))} />
             </div>
             <div className="flex gap-3 pt-6">
                <button type="button" onClick={handleClose} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 transition-colors text-sm">{t.cancel}</button>
                <button type="submit" className="flex-[2] py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/30 transition-all text-sm uppercase tracking-wider">{editingId ? t.update : t.save}</button>
             </div>
          </form>
        </ModalWrapper>
      )}

      {deletingId && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-[#1E293B] rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 p-8 text-center animate-in zoom-in-95 duration-200">
             <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} />
             </div>
             <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight mb-2">{t.deleteConfirmTitle}</h3>
             <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">{t.deleteConfirmText}</p>
             <div className="flex gap-3">
               <button onClick={() => setDeletingId(null)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition-colors text-xs">{t.cancel}</button>
               <button onClick={handlePerformDelete} className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-500/20 transition-all text-xs uppercase tracking-wider">{t.delete}</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ModalWrapper: React.FC<{ children: React.ReactNode, onClose: () => void }> = ({ children, onClose }) => (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
    <div className="w-full max-w-lg bg-white dark:bg-[#1E293B] rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-visible animate-in zoom-in-95 duration-200 p-8 relative">
       <button onClick={onClose} className="absolute right-6 top-6 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors z-[100]"><X size={18} /></button>
       {children}
    </div>
  </div>
);

const SelectionCard: React.FC<{ icon: React.ReactNode, title: string, color: string, onClick: () => void }> = ({ icon, title, color, onClick }) => (
  <button onClick={onClick} className="group p-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[2rem] hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left">
    <div className={`w-12 h-12 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform shadow-sm`}>{icon}</div>
    <h4 className="font-black text-slate-900 dark:text-white text-base">{title}</h4>
    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Select Category</p>
  </button>
);

const SubOption: React.FC<{ title: string, onClick: () => void }> = ({ title, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all group">
    <span className="font-bold text-slate-800 dark:text-white">{title}</span>
    <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
  </button>
);

const AccountCard: React.FC<{ 
  acc: BankAccount, 
  language: 'en' | 'bn', 
  inventoryCheques: ChequeBook[], 
  inventoryCards: DebitCard[], 
  disbursements: Disbursement[],
  onEdit: () => void, 
  onDelete: () => void,
  onViewLinked: (view: 'inventory' | 'disbursements') => void
}> = ({ acc, language, inventoryCheques, inventoryCards, disbursements, onEdit, onDelete, onViewLinked }) => {
  const linkedCheques = useMemo(() => inventoryCheques.filter(c => c.accountNumber === acc.accountNumber), [inventoryCheques, acc.accountNumber]);
  const linkedCards = useMemo(() => inventoryCards.filter(c => c.accountNumber === acc.accountNumber), [inventoryCards, acc.accountNumber]);
  const linkedLoans = useMemo(() => disbursements.filter(d => d.accountNumber === acc.accountNumber), [disbursements, acc.accountNumber]);
  const totalLoanAmount = useMemo(() => linkedLoans.reduce((sum, item) => sum + item.loanAmount, 0), [linkedLoans]);

  const t = {
    viewDetails: language === 'en' ? 'View Activity' : 'কার্যক্রম দেখুন',
    loan: language === 'en' ? 'Total Loan' : 'মোট লোন',
    inv: language === 'en' ? 'Inventory' : 'ইনভেন্টরি',
  };

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group h-full">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center justify-between mb-4">
           <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-[9px] font-black uppercase tracking-widest">{acc.subCategory}</div>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Calendar size={10}/> {acc.createDate}</span>
        </div>
        <h4 className="text-base font-black text-slate-900 dark:text-white leading-tight mb-1 truncate">{acc.accountTitle}</h4>
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
           <Hash size={12} className="opacity-50" /> {acc.accountNumber}
        </div>
      </div>
      <div className="p-6 flex-1 space-y-6">
         <div className="space-y-3">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-400" />
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{acc.mobileNumber}</span>
               </div>
               <p className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">Mobile</p>
            </div>
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <Users size={14} className="text-slate-400" />
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{acc.nomineeMobileNumber}</span>
               </div>
               <p className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">Nominee</p>
            </div>
            <div className="pt-3 border-t border-slate-50 dark:border-slate-800/50 flex items-center gap-2">
               <Briefcase size={14} className="text-blue-500" />
               <span className="text-[10px] font-black text-slate-700 dark:text-slate-200">{acc.loanOfficer}</span>
            </div>
         </div>
         <div className="space-y-4">
            <div className="flex items-center gap-2">
               <Activity size={12} className="text-blue-600" />
               <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Linked Records</h5>
            </div>
            <div className="grid grid-cols-2 gap-3">
               <button onClick={() => onViewLinked('inventory')} className="flex flex-col items-start p-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl hover:border-blue-400 transition-all text-left group/btn">
                  <div className="flex items-center gap-2 mb-1.5">
                     <BookCopy size={12} className="text-blue-600" />
                     <span className="text-[9px] font-black uppercase text-blue-600">{t.inv}</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 leading-tight">{linkedCheques.length} Cheques<br/>{linkedCards.length} Cards</p>
                  <div className="mt-2 text-[8px] font-black text-blue-700 flex items-center gap-1 opacity-0 group-hover/btn:opacity-100 transition-opacity">{t.viewDetails} <ExternalLink size={8} /></div>
               </button>
               <button onClick={() => onViewLinked('disbursements')} className="flex flex-col items-start p-3 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl hover:border-emerald-400 transition-all text-left group/btn">
                  <div className="flex items-center gap-2 mb-1.5">
                     <HandCoins size={12} className="text-emerald-600" />
                     <span className="text-[9px] font-black uppercase text-emerald-600">{t.loan}</span>
                  </div>
                  <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400">{formatCurrency(totalLoanAmount)}</p>
                  <div className="mt-2 text-[8px] font-black text-emerald-700 flex items-center gap-1 opacity-0 group-hover/btn:opacity-100 transition-opacity">{t.viewDetails} <ExternalLink size={8} /></div>
               </button>
            </div>
         </div>
      </div>
      <div className="p-4 bg-slate-50 dark:bg-slate-800/40 flex gap-2 border-t border-slate-100 dark:border-slate-800">
        <button onClick={onEdit} className="flex-1 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wider"><Pencil size={14} /> Edit</button>
        <button onClick={onDelete} className="flex-1 py-2 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400 hover:bg-rose-100 transition-colors flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wider"><Trash2 size={14} /> Delete</button>
      </div>
    </div>
  );
};
