
import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, User, Phone, Hash, Briefcase, Calendar, Trash2, X, 
  AlertCircle, ChevronLeft, ChevronRight, Check 
} from 'lucide-react';
import { Disbursement } from '../types';
import { formatCurrency } from '../utils/finance';

interface DisbursementViewProps {
  disbursements: Disbursement[];
  onAddDisbursement: (dis: Omit<Disbursement, 'id'>) => void;
  onDeleteDisbursement: (id: string) => void;
  language: 'en' | 'bn';
}

export const DisbursementView: React.FC<DisbursementViewProps> = ({ 
  disbursements, 
  onAddDisbursement, 
  onDeleteDisbursement,
  language 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  
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

  // Calendar logic helpers
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const currentPickerDate = new Date(formData.date);
  const [viewDate, setViewDate] = useState(new Date(formData.date));

  const t = {
    title: language === 'en' ? 'Disbursement Management' : 'ডিসবার্সমেন্ট ম্যানেজমেন্ট',
    subtitle: language === 'en' ? 'Manage and track all loan disbursements' : 'সমস্ত লোন ডিসবার্সমেন্ট ম্যানেজ এবং ট্র্যাক করুন',
    addBtn: language === 'en' ? 'New Disbursement' : 'নতুন ডিসবার্সমেন্ট',
    accTitle: language === 'en' ? 'Account Title' : 'অ্যাকাউন্টের নাম',
    accNo: language === 'en' ? 'Account Number' : 'অ্যাকাউন্ট নম্বর',
    mobile: language === 'en' ? 'Mobile Number' : 'মোবাইল নম্বর',
    loanAmt: language === 'en' ? 'Total Loan Amount' : 'মোট লোনের পরিমাণ',
    disAmt: language === 'en' ? 'Disbursement Amount' : 'ডিসবার্সমেন্টের পরিমাণ',
    officer: language === 'en' ? 'Loan Officer' : 'লোন অফিসার',
    date: language === 'en' ? 'Disbursement Date' : 'ডিসবার্সমেন্টের তারিখ',
    actions: language === 'en' ? 'Actions' : 'অ্যাকশন',
    noData: language === 'en' ? 'No disbursements recorded yet' : 'এখনও কোন ডিসবার্সমেন্ট রেকর্ড করা হয়নি',
    save: language === 'en' ? 'Save Record' : 'রেকর্ড সংরক্ষণ',
    cancel: language === 'en' ? 'Cancel' : 'বাতিল',
    confirmDelete: language === 'en' ? 'Delete this record?' : 'এই রেকর্ডটি মুছবেন?',
    errWordsOnly: language === 'en' ? 'Only words are allowed' : 'শুধুমাত্র অক্ষর ব্যবহার করুন',
    errNumbersOnly: language === 'en' ? 'Only numbers are allowed' : 'শুধুমাত্র সংখ্যা ব্যবহার করুন',
    selectToday: language === 'en' ? 'Today' : 'আজ',
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (name: string, value: any) => {
    if (name === 'accountTitle') {
      const sanitized = value.replace(/[0-9]/g, '');
      if (value !== sanitized) {
        setErrors(prev => ({ ...prev, accountTitle: t.errWordsOnly }));
      } else {
        setErrors(prev => ({ ...prev, accountTitle: '' }));
      }
      setFormData(prev => ({ ...prev, [name]: sanitized }));
    } else if (name === 'accountNumber' || name === 'mobileNumber') {
      const sanitized = value.replace(/[^0-9]/g, '');
      if (value !== sanitized) {
        setErrors(prev => ({ ...prev, [name]: t.errNumbersOnly }));
      } else {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
      setFormData(prev => ({ ...prev, [name]: sanitized }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isTitleValid = !/[0-9]/.test(formData.accountTitle);
    const isAccValid = !/[^0-9]/.test(formData.accountNumber);
    const isMobValid = !/[^0-9]/.test(formData.mobileNumber);

    if (isTitleValid && isAccValid && isMobValid) {
      onAddDisbursement(formData);
      setIsModalOpen(false);
      setFormData({
        accountTitle: '',
        accountNumber: '',
        mobileNumber: '',
        loanAmount: 0,
        disbursementAmount: 0,
        loanOfficer: '',
        date: new Date().toISOString().split('T')[0]
      });
      setErrors({});
    }
  };

  const TakaIcon = () => (
    <span className="font-bold text-[14px] leading-none">৳</span>
  );

  // Calendar render functions
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const renderCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startOffset = firstDayOfMonth(year, month);
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
            {t.title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            {t.subtitle}
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-2xl shadow-xl shadow-blue-500/30 transition-all active:scale-95"
        >
          <Plus size={20} strokeWidth={3} />
          {t.addBtn}
        </button>
      </div>

      <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden transition-theme">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                <th className="px-6 py-5">{t.accTitle}</th>
                <th className="px-6 py-5">{t.accNo}</th>
                <th className="px-6 py-5">{t.loanAmt}</th>
                <th className="px-6 py-5">{t.disAmt}</th>
                <th className="px-6 py-5">{t.officer}</th>
                <th className="px-6 py-5 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {disbursements.length > 0 ? (
                disbursements.map((dis) => (
                  <tr key={dis.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{dis.accountTitle}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone size={10} /> {dis.mobileNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <code className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-400">
                        {dis.accountNumber}
                      </code>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(dis.loanAmount)}
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(dis.disbursementAmount)}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">
                          {dis.loanOfficer.charAt(0)}
                        </div>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{dis.loanOfficer}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => onDeleteDisbursement(dis.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-bold italic">
                    {t.noData}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-[#1E293B] rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 pt-8 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">{t.addBtn}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{language === 'en' ? 'Quick Entry' : 'দ্রুত এন্ট্রি'}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-4">
                
                {/* Account Title */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5">
                    <User size={12} /> {t.accTitle}
                  </label>
                  <input 
                    required
                    type="text" 
                    value={formData.accountTitle}
                    onChange={e => handleInputChange('accountTitle', e.target.value)}
                    placeholder="e.g. Rahim Ahmed"
                    className={`w-full bg-slate-50 dark:bg-slate-900/50 border rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all outline-none dark:text-white ${
                      errors.accountTitle ? 'border-rose-500 ring-4 ring-rose-500/10' : 'border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500'
                    }`}
                  />
                  {errors.accountTitle && (
                    <p className="flex items-center gap-1 text-[10px] font-bold text-rose-500 ml-1">
                      <AlertCircle size={10} /> {errors.accountTitle}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Account Number */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5">
                      <Hash size={12} /> {t.accNo}
                    </label>
                    <input 
                      required
                      type="text" 
                      inputMode="numeric"
                      value={formData.accountNumber}
                      onChange={e => handleInputChange('accountNumber', e.target.value)}
                      placeholder="Numbers Only"
                      className={`w-full bg-slate-50 dark:bg-slate-900/50 border rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all outline-none dark:text-white ${
                        errors.accountNumber ? 'border-rose-500 ring-4 ring-rose-500/10' : 'border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500'
                      }`}
                    />
                    {errors.accountNumber && (
                      <p className="flex items-center gap-1 text-[10px] font-bold text-rose-500 ml-1">
                        <AlertCircle size={10} /> {errors.accountNumber}
                      </p>
                    )}
                  </div>

                  {/* Mobile Number */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5">
                      <Phone size={12} /> {t.mobile}
                    </label>
                    <input 
                      required
                      type="tel" 
                      inputMode="numeric"
                      value={formData.mobileNumber}
                      onChange={e => handleInputChange('mobileNumber', e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className={`w-full bg-slate-50 dark:bg-slate-900/50 border rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all outline-none dark:text-white ${
                        errors.mobileNumber ? 'border-rose-500 ring-4 ring-rose-500/10' : 'border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500'
                      }`}
                    />
                    {errors.mobileNumber && (
                      <p className="flex items-center gap-1 text-[10px] font-bold text-rose-500 ml-1">
                        <AlertCircle size={10} /> {errors.mobileNumber}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Loan Amount */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5">
                      <TakaIcon /> {t.loanAmt}
                    </label>
                    <input 
                      required
                      type="number" 
                      value={formData.loanAmount || ''}
                      onChange={e => setFormData({...formData, loanAmount: parseFloat(e.target.value)})}
                      placeholder="0"
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none dark:text-white text-blue-600 font-black"
                    />
                  </div>

                  {/* Disbursement Amount */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5">
                      <TakaIcon /> {t.disAmt}
                    </label>
                    <input 
                      required
                      type="number" 
                      value={formData.disbursementAmount || ''}
                      onChange={e => setFormData({...formData, disbursementAmount: parseFloat(e.target.value)})}
                      placeholder="0"
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none dark:text-white text-emerald-600 font-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Loan Officer */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5">
                      <Briefcase size={12} /> {t.officer}
                    </label>
                    <input 
                      required
                      type="text" 
                      value={formData.loanOfficer}
                      onChange={e => setFormData({...formData, loanOfficer: e.target.value})}
                      placeholder="Name"
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none dark:text-white"
                    />
                  </div>

                  {/* Date Custom Picker */}
                  <div className="space-y-1.5 relative" ref={datePickerRef}>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5">
                      <Calendar size={12} /> {t.date}
                    </label>
                    <button 
                      type="button"
                      onClick={() => {
                        setIsDatePickerOpen(!isDatePickerOpen);
                        setViewDate(new Date(formData.date));
                      }}
                      className={`w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-semibold text-left transition-all outline-none flex items-center justify-between ${
                        isDatePickerOpen ? 'ring-4 ring-blue-500/10 border-blue-500' : ''
                      }`}
                    >
                      <span className={formData.date ? 'dark:text-white' : 'text-slate-400'}>
                        {formData.date || 'Select Date'}
                      </span>
                      <Calendar size={14} className="text-blue-500" />
                    </button>

                    {isDatePickerOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-[1.5rem] shadow-2xl p-4 z-[110] animate-in fade-in zoom-in-95 duration-150">
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
                        
                        {renderCalendar()}

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
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl transition-colors text-sm"
                >
                  {t.cancel}
                </button>
                <button 
                  type="submit"
                  className="flex-[1.5] py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/30 transition-all active:scale-95 text-sm"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
        }
      `}</style>
    </div>
  );
};
