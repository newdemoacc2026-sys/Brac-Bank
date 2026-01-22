
import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronDown, Check, ChevronLeft, ChevronRight } from 'lucide-react';

interface AdvancedDatePickerProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export const AdvancedDatePicker: React.FC<AdvancedDatePickerProps> = ({ selectedDate, onDateChange }) => {
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isDayOpen, setIsDayOpen] = useState(false);
  
  const monthRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);
  const dayRef = useRef<HTMLDivElement>(null);

  const date = new Date(selectedDate);
  const currentYear = date.getFullYear();
  const currentMonth = date.getMonth();
  const currentDay = date.getDate();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 21 }, (_, i) => new Date().getFullYear() - 10 + i);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (monthRef.current && !monthRef.current.contains(event.target as Node)) setIsMonthOpen(false);
      if (yearRef.current && !yearRef.current.contains(event.target as Node)) setIsYearOpen(false);
      if (dayRef.current && !dayRef.current.contains(event.target as Node)) setIsDayOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMonthSelect = (mIndex: number) => {
    const newDate = new Date(date);
    newDate.setMonth(mIndex);
    const lastDayOfMonth = new Date(newDate.getFullYear(), mIndex + 1, 0).getDate();
    if (newDate.getDate() > lastDayOfMonth) {
      newDate.setDate(lastDayOfMonth);
    }
    onDateChange(newDate.toISOString().split('T')[0]);
    setIsMonthOpen(false);
  };

  const handleYearSelect = (year: number) => {
    const newDate = new Date(date);
    newDate.setFullYear(year);
    onDateChange(newDate.toISOString().split('T')[0]);
    setIsYearOpen(false);
  };

  const handleDaySelect = (day: number) => {
    const newDate = new Date(date);
    newDate.setDate(day);
    onDateChange(newDate.toISOString().split('T')[0]);
    setIsDayOpen(false);
  };

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const calendarDays = [];
  const totalDays = daysInMonth(currentYear, currentMonth);
  const startOffset = firstDayOfMonth(currentYear, currentMonth);

  for (let i = 0; i < startOffset; i++) calendarDays.push(null);
  for (let d = 1; d <= totalDays; d++) calendarDays.push(d);

  return (
    <div className="flex items-center gap-1.5 bg-white dark:bg-[#1E293B] p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-lg">
      
      <div className="flex items-center justify-center w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
        <CalendarIcon size={18} />
      </div>

      <div className="flex items-center gap-1 h-10">
        
        {/* Custom Month Dropdown - Set to open upwards */}
        <div className="relative h-full" ref={monthRef}>
          <button 
            onClick={() => { setIsMonthOpen(!isMonthOpen); setIsYearOpen(false); setIsDayOpen(false); }}
            className={`flex items-center justify-between gap-2 px-3 h-full rounded-xl text-sm font-bold transition-all ${
              isMonthOpen 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {months[currentMonth]}
            <ChevronDown size={14} className={`transition-transform duration-200 ${isMonthOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isMonthOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-[9999] animate-in fade-in zoom-in-95 duration-100 max-h-64 overflow-y-auto custom-scrollbar">
              {months.map((m, i) => (
                <button
                  key={m}
                  onClick={() => handleMonthSelect(i)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold transition-colors ${
                    i === currentMonth 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {m}
                  {i === currentMonth && <Check size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-800 mx-0.5" />

        {/* Custom Year Dropdown - Set to open upwards */}
        <div className="relative h-full" ref={yearRef}>
          <button 
            onClick={() => { setIsYearOpen(!isYearOpen); setIsMonthOpen(false); setIsDayOpen(false); }}
            className={`flex items-center justify-between gap-2 px-3 h-full rounded-xl text-sm font-bold transition-all ${
              isYearOpen 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {currentYear}
            <ChevronDown size={14} className={`transition-transform duration-200 ${isYearOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isYearOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-32 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-[9999] animate-in fade-in zoom-in-95 duration-100 max-h-64 overflow-y-auto custom-scrollbar">
              {years.map(y => (
                <button
                  key={y}
                  onClick={() => handleYearSelect(y)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold transition-colors ${
                    y === currentYear 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {y}
                  {y === currentYear && <Check size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-800 mx-0.5" />

        {/* Custom Day Calendar Picker - Set to open upwards */}
        <div className="relative h-full" ref={dayRef}>
          <button 
            onClick={() => { setIsDayOpen(!isDayOpen); setIsMonthOpen(false); setIsYearOpen(false); }}
            className={`flex items-center px-4 h-full rounded-xl text-sm font-black transition-all border ${
              isDayOpen 
                ? 'bg-blue-600 border-blue-600 text-white' 
                : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-transparent hover:bg-blue-100 dark:hover:bg-blue-900/40'
            }`}
          >
            {currentDay.toString().padStart(2, '0')}
          </button>
          
          {isDayOpen && (
            <div className="absolute bottom-full right-0 mb-2 w-72 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-[1.5rem] shadow-2xl p-4 z-[9999] animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between mb-4 px-1">
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {months[currentMonth]} {currentYear}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => handleMonthSelect((currentMonth - 1 + 12) % 12)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={() => handleMonthSelect((currentMonth + 1) % 12)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['S','M','T','W','T','F','S'].map((d, i) => (
                  <div key={i} className="text-[10px] font-black text-slate-400 text-center uppercase py-1">{d}</div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, i) => (
                  <div key={i} className="aspect-square flex items-center justify-center">
                    {day ? (
                      <button
                        onClick={() => handleDaySelect(day)}
                        className={`w-full h-full flex items-center justify-center rounded-xl text-xs font-bold transition-all ${
                          day === currentDay 
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
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button 
                  onClick={() => {
                    const today = new Date();
                    onDateChange(today.toISOString().split('T')[0]);
                    setIsDayOpen(false);
                  }}
                  className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
                >
                  Select Today
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
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
