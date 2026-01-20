
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Plus, User, Phone, Hash, Calendar, Trash2, X, 
  AlertCircle, ChevronLeft, ChevronRight, Check, ChevronDown,
  PiggyBank, ArrowUpRight, ArrowDownRight, Layers, Pencil
} from 'lucide-react';
import { FdrDps } from '../types';
import { formatCurrency } from '../utils/finance';

interface FdrDpsViewProps {
  entries: FdrDps[];
  onAdd: (entry: Omit<FdrDps, 'id'>) => void;
  onUpdate: (id: string, entry: Omit<FdrDps, 'id'>) => void;
  onDelete: (id: string) => void;
  language: 'en' | 'bn';
}

export const FdrDpsView: React.FC<FdrDpsViewProps> = ({ entries, onAdd, onUpdate, onDelete, language }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [activeDatePicker, setActiveDatePicker] = useState<'opening' | 'maturity' | null>(null);
  
  const typeRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState<Omit<FdrDps, 'id'>>({
    accountTitle: '',
    accountNumber: '',
    mobileNumber: '',
    type: 'FDR',
    openingDate: new Date().toISOString().split('T')[0],
    maturityDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    principalAmount: 0,
    maturityAmount: 0,
    totalInterest: 0,
    status: 'Active'
  });

  const t = {
    title: language === 'en' ? 'FDR / DPS Management' : 'এফডিআর / ডিপিএস ম্যানেজমেন্ট',
    subtitle: language === 'en' ? 'Manage fixed deposits and pension schemes' : 'ফিক্সড ডিপোজিট এবং পেনশন স্কিম ম্যানেজ করুন',
    addBtn: language === 'en' ? 'New Record' : 'নতুন রেকর্ড',
    editBtn: language === 'en' ? 'Edit Record' : 'রেকর্ড সংশোধন',
    accTitle: language === 'en' ? 'Account Title' : 'অ্যাকাউন্টের নাম',
    accNo: language === 'en' ? 'Account Number' : 'অ্যাকাউন্ট নম্বর',
    mobile: language === 'en' ? 'Mobile' : 'মোবাইল',
    type: language === 'en' ? 'Scheme Type' : 'স্কিমের ধরন',
    openingDate: language === 'en' ? 'Opening Date' : 'খোলার তারিখ',
    maturityDate: language === 'en' ? 'Maturity Date' : 'মেয়াদ শেষের তারিখ',
    principal: language === 'en' ? 'Principal Amount' : 'মূল টাকা',
    maturityAmt: language === 'en' ? 'Maturity Amount' : 'পরিপক্কতা পরিমাণ',
    interest: language === 'en' ? 'Total Interest' : 'মোট মুনাফা',
    actions: language === 'en' ? 'Actions' : 'অ্যাকশন',
    noData: language === 'en' ? 'No records found' : 'কোন রেকর্ড পাওয়া যায়নি',
    save: language === 'en' ? 'Save Entry' : 'এন্ট্রি সংরক্ষণ',
    update: language === 'en' ? 'Update Entry' : 'আপডেট করুন',
    cancel: language === 'en' ? 'Cancel' : 'বাতিল',
    totalPrincipal: language === 'en' ? 'Total Principal' : 'মোট মূল টাকা',
    totalMaturity: language === 'en' ? 'Total Maturity' : 'মোট পরিপক্কতা',
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeRef.current && !typeRef.current.contains(event.target as Node)) setIsTypeOpen(false);
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) setActiveDatePicker(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalInv = useMemo(() => entries.reduce((acc, e) => acc + e.principalAmount, 0), [entries]);
  const totalMat = useMemo(() => entries.reduce((acc, e) => acc + e.maturityAmount, 0), [entries]);

  const handleEdit = (entry: FdrDps) => {
    setEditingId(entry.id);
    setFormData({ ...entry });
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      accountTitle: '',
      accountNumber: '',
      mobileNumber: '',
      type: 'FDR',
      openingDate: new Date().toISOString().split('T')[0],
      maturityDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      principalAmount: 0,
      maturityAmount: 0,
      totalInterest: 0,
      status: 'Active'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdate(editingId, formData);
    } else {
      onAdd(formData);
    }
    handleClose();
  };

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const [viewDate, setViewDate] = useState(new Date());

  const renderCalendar = (field: 'openingDate' | 'maturityDate') => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const startOffset = new Date(year, month, 1).getDay();
    const currentSelected = new Date(formData[field]);
    
    const days = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let d = 1; d <= totalDays; d++) days.push(d);

    return (
      <div className="p-4 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-[1.5rem] shadow-2xl z-[120]">
        <div className="flex items-center justify-between mb-4 px-1">
          <span className="text-sm font-black text-slate-900 dark:text-white">{months[month]} {year}</span>
          <div className="flex gap-1">
            <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><ChevronLeft size={16}/></button>
            <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><ChevronRight size={16}/></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-[10px] font-black text-slate-400 text-center py-1">{d}</div>)}
          {days.map((day, i) => (
            <div key={i} className="aspect-square">
              {day ? (
                <button
                  type="button"
                  onClick={() => {
                    setFormData({...formData, [field]: new Date(year, month, day).toISOString().split('T')[0]});
                    setActiveDatePicker(null);
                  }}
                  className={`w-full h-full rounded-xl text-xs font-bold ${
                    day === currentSelected.getDate() && month === currentSelected.getMonth() && year === currentSelected.getFullYear()
                      ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {day}
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{t.title}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">{t.subtitle}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-2xl shadow-xl shadow-blue-500/30 transition-all active:scale-95"
        >
          <Plus size={20} strokeWidth={3} />
          {t.addBtn}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SummaryCard title={t.totalPrincipal} value={formatCurrency(totalInv)} icon={<Layers size={22}/>} color="blue" />
        <SummaryCard title={t.totalMaturity} value={formatCurrency(totalMat)} icon={<PiggyBank size={22}/>} color="emerald" />
      </div>

      <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden transition-theme">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                <th className="px-6 py-5">{t.accTitle}</th>
                <th className="px-6 py-5">{t.type}</th>
                <th className="px-6 py-5">{t.principal}</th>
                <th className="px-6 py-5">{t.maturityDate}</th>
                <th className="px-6 py-5 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {entries.length > 0 ? (
                entries.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{e.accountTitle}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{e.accountNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${
                        e.type === 'FDR' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
                      }`}>
                        {e.type}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-700 dark:text-slate-200">{formatCurrency(e.principalAmount)}</td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-500">{e.maturityDate}</td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(e)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"><Pencil size={16}/></button>
                        <button onClick={() => onDelete(e.id)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-bold italic">{t.noData}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-[#1E293B] rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 my-8 animate-in zoom-in-95 duration-200 relative">
            <div className="px-8 pt-8 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">{editingId ? t.editBtn : t.addBtn}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Manage Investment Record</p>
              </div>
              <button onClick={handleClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white"><X size={18}/></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t.accTitle}</label>
                  <input required type="text" value={formData.accountTitle} onChange={e => setFormData({...formData, accountTitle: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-semibold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:text-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t.accNo}</label>
                  <input required type="text" value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-semibold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:text-white" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t.mobile}</label>
                  <input required type="tel" value={formData.mobileNumber} onChange={e => setFormData({...formData, mobileNumber: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-semibold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:text-white" />
                </div>
                <div className="space-y-1.5 relative" ref={typeRef}>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t.type}</label>
                  <button type="button" onClick={() => setIsTypeOpen(!isTypeOpen)} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-semibold text-left dark:text-white flex items-center justify-between">
                    {formData.type} <ChevronDown size={16} className={`transition-transform ${isTypeOpen ? 'rotate-180' : ''}`}/>
                  </button>
                  {isTypeOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50">
                      {['FDR', 'DPS'].map(type => (
                        <button key={type} type="button" onClick={() => { setFormData({...formData, type: type as any}); setIsTypeOpen(false); }} className="w-full px-5 py-3 text-sm font-bold text-left hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white">{type}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 relative">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t.openingDate}</label>
                  <button type="button" onClick={() => setActiveDatePicker('opening')} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-semibold text-left dark:text-white flex items-center justify-between">
                    {formData.openingDate} <Calendar size={16}/>
                  </button>
                  {activeDatePicker === 'opening' && <div className="absolute top-full left-0 z-[120]" ref={datePickerRef}>{renderCalendar('openingDate')}</div>}
                </div>
                <div className="space-y-1.5 relative">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t.maturityDate}</label>
                  <button type="button" onClick={() => setActiveDatePicker('maturity')} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-semibold text-left dark:text-white flex items-center justify-between">
                    {formData.maturityDate} <Calendar size={16}/>
                  </button>
                  {activeDatePicker === 'maturity' && <div className="absolute top-full left-0 z-[120]" ref={datePickerRef}>{renderCalendar('maturityDate')}</div>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t.principal}</label>
                  <input required type="number" value={formData.principalAmount || ''} onChange={e => setFormData({...formData, principalAmount: parseFloat(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-black text-blue-600 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t.maturityAmt}</label>
                  <input required type="number" value={formData.maturityAmount || ''} onChange={e => setFormData({...formData, maturityAmount: parseFloat(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-black text-emerald-600 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t.interest}</label>
                  <input required type="number" value={formData.totalInterest || ''} onChange={e => setFormData({...formData, totalInterest: parseFloat(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-black text-amber-600 outline-none" />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={handleClose} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl">{t.cancel}</button>
                <button type="submit" className="flex-[2] py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/30 active:scale-95">{editingId ? t.update : t.save}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryCard: React.FC<{ title: string, value: string, icon: React.ReactNode, color: 'blue' | 'emerald' }> = ({ title, value, icon, color }) => (
  <div className="bg-white dark:bg-[#1E293B] p-7 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-md group">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${color === 'blue' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/40'}`}>
      {icon}
    </div>
    <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">{title}</p>
    <h4 className="text-2xl font-black mt-1 text-slate-900 dark:text-white tracking-tight">{value}</h4>
  </div>
);
