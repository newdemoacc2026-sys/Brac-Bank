
import React, { useState } from 'react';
import { PlusCircle, X } from 'lucide-react';
import { TransactionType } from '../types';

interface TransactionFormProps {
  onAddTransaction: (tx: { amount: number; type: TransactionType }) => void;
  onClose?: () => void;
  language: 'en' | 'bn';
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onAddTransaction, onClose, language }) => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.CD);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    onAddTransaction({
      amount: parseFloat(amount),
      type,
    });

    setAmount('');
  };

  const t = {
    title: language === 'en' ? 'Create Transaction' : 'নতুন লেনদেন তৈরি করুন',
    desc: language === 'en' ? 'Add a new financial record to the ledger.' : 'লেজারে একটি নতুন আর্থিক রেকর্ড যুক্ত করুন।',
    amountLabel: language === 'en' ? 'Transaction Amount (৳)' : 'লেনদেনের পরিমাণ (৳)',
    typeLabel: language === 'en' ? 'Select Operation Type' : 'অপারেশনের ধরন নির্বাচন করুন',
    discard: language === 'en' ? 'Discard' : 'বাতিল করুন',
    confirm: language === 'en' ? 'Confirm Entry' : 'কনফার্ম করুন',
  };

  return (
    <div className="bg-white dark:bg-[#1E293B] p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl relative transition-theme">
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-slate-50 dark:bg-slate-800 p-1.5 rounded-full"
        >
          <X size={20} />
        </button>
      )}
      <div className="mb-8">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <PlusCircle size={24} />
          </div>
          {t.title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-13 font-medium">{t.desc}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2.5 ml-1">
            {t.amountLabel}
          </label>
          <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none dark:text-white"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2.5 ml-1">
            {t.typeLabel}
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(Object.keys(TransactionType) as Array<keyof typeof TransactionType>).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setType(TransactionType[key])}
                className={`px-3 py-3 rounded-xl text-xs font-black transition-all border ${
                  type === TransactionType[key] 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-500/20' 
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-blue-300 dark:hover:border-blue-800'
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
          {onClose && (
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold py-4 rounded-2xl transition-all"
            >
              {t.discard}
            </button>
          )}
          <button 
            type="submit"
            className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xl shadow-blue-500/30"
          >
            {t.confirm}
          </button>
        </div>
      </form>
    </div>
  );
};
