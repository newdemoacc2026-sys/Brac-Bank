
import React, { useState, useRef } from 'react';
import { Building2, UserCircle, Languages, Check, Pencil, Save, X, Upload, Camera, Globe, Briefcase, Plus, Trash2 } from 'lucide-react';

interface SettingsProps {
  bankName: string;
  setBankName: (name: string) => void;
  bankLogo: string | null;
  setBankLogo: (logo: string | null) => void;
  userName: string;
  setUserName: (name: string) => void;
  userAvatar: string | null;
  setUserAvatar: (avatar: string | null) => void;
  loanOfficers: string[];
  setLoanOfficers: (officers: string[]) => void;
  language: 'en' | 'bn';
  setLanguage: (lang: 'en' | 'bn') => void;
}

export const Settings: React.FC<SettingsProps> = ({
  bankName,
  setBankName,
  bankLogo,
  setBankLogo,
  userName,
  setUserName,
  userAvatar,
  setUserAvatar,
  loanOfficers,
  setLoanOfficers,
  language,
  setLanguage
}) => {
  // Local state for editing flow
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [tempBankName, setTempBankName] = useState(bankName);

  const [isEditingUser, setIsEditingUser] = useState(false);
  const [tempUserName, setTempUserName] = useState(userName);

  const [newOfficerName, setNewOfficerName] = useState('');

  const bankLogoInputRef = useRef<HTMLInputElement>(null);
  const userAvatarInputRef = useRef<HTMLInputElement>(null);

  const handleBankSave = () => {
    setBankName(tempBankName);
    setIsEditingBank(false);
  };

  const handleUserSave = () => {
    setUserName(tempUserName);
    setIsEditingUser(false);
  };

  const handleAddOfficer = () => {
    if (newOfficerName.trim()) {
      setLoanOfficers([...loanOfficers, newOfficerName.trim()]);
      setNewOfficerName('');
    }
  };

  const handleRemoveOfficer = (index: number) => {
    setLoanOfficers(loanOfficers.filter((_, i) => i !== index));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const t = {
    title: language === 'en' ? 'System Settings' : 'সিস্টেম সেটিংস',
    desc: language === 'en' ? 'Customize your dashboard experience and brand identity.' : 'আপনার ড্যাশবোর্ড অভিজ্ঞতা এবং ব্র্যান্ড পরিচিতি কাস্টমাইজ করুন।',
    bankId: language === 'en' ? 'Bank Identity' : 'ব্যাংক পরিচিতি',
    instName: language === 'en' ? 'Institution Name' : 'প্রতিষ্ঠানের নাম',
    instLogo: language === 'en' ? 'Institution Logo' : 'প্রতিষ্ঠানের লোগো',
    logoDesc: language === 'en' ? 'Recommended size: 512x512px (PNG, SVG)' : 'প্রস্তাবিত আকার: ৫১২x৫১২ পিক্সেল (পিএনজি, এসভিজি)',
    removeLogo: language === 'en' ? 'Remove Logo' : 'লোগো সরান',
    profile: language === 'en' ? 'Profile Details' : 'প্রোফাইল বিবরণ',
    profilePic: language === 'en' ? 'Profile Picture' : 'প্রোফাইল ছবি',
    picDesc: language === 'en' ? 'Used for identification and headers.' : 'শনাক্তকরণ এবং হেডারের জন্য ব্যবহৃত হয়।',
    removePic: language === 'en' ? 'Remove Picture' : 'ছবি সরান',
    displayName: language === 'en' ? 'Account Display Name' : 'অ্যাকাউন্ট প্রদর্শনের নাম',
    lang: language === 'en' ? 'Language' : 'ভাষা',
    realTime: language === 'en' ? 'Changes are applied in real-time' : 'পরিবর্তনগুলি রিয়েল-টাইমে প্রয়োগ করা হয়',
    save: language === 'en' ? 'Save' : 'সংরক্ষণ',
    cancel: language === 'en' ? 'Cancel' : 'বাতিল',
    edit: language === 'en' ? 'Edit' : 'সম্পাদনা',
    placeholderBank: language === 'en' ? "Enter Bank Name" : "ব্যাংকের নাম লিখুন",
    placeholderUser: language === 'en' ? "Enter Your Name" : "আপনার নাম লিখুন",
    officers: language === 'en' ? 'Manage Loan Officers' : 'লোন অফিসার ম্যানেজমেন্ট',
    officersDesc: language === 'en' ? 'The names below will appear in the disbursement dropdown.' : 'নিচের নামগুলো ডিসবার্সমেন্ট ড্রপডাউন-এ দেখা যাবে।',
    addOfficer: language === 'en' ? 'Add Officer' : 'অফিসার যোগ করুন',
    noOfficers: language === 'en' ? 'No officers added yet.' : 'এখনও কোনো অফিসার যোগ করা হয়নি।',
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 mb-20 relative">
      
      {/* Compact Language Switcher in the Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {t.title}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            {t.desc}
          </p>
        </div>

        <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm h-fit self-start sm:self-center">
          <div className="px-2 text-slate-400">
             <Globe size={16} />
          </div>
          <button 
            onClick={() => setLanguage('en')}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${
              language === 'en' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            EN
          </button>
          <button 
            onClick={() => setLanguage('bn')}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${
              language === 'bn' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            BN
          </button>
        </div>
      </div>

      {/* Bank Identity Section */}
      <section className="bg-white dark:bg-[#1E293B] rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
              <Building2 size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {t.bankId}
            </h3>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-8 py-4 border-y border-slate-50 dark:border-slate-800/50">
          <div className="relative group">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 dark:border-slate-800 overflow-hidden">
              {bankLogo ? (
                <img src={bankLogo} alt="Bank Logo" className="w-full h-full object-cover" />
              ) : (
                <Building2 size={40} />
              )}
              <button 
                onClick={() => bankLogoInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
              >
                <Camera size={24} />
              </button>
            </div>
            <input 
              type="file" 
              ref={bankLogoInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={(e) => handleImageUpload(e, setBankLogo)}
            />
            <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-xl shadow-lg cursor-pointer" onClick={() => bankLogoInputRef.current?.click()}>
              <Upload size={14} strokeWidth={3} />
            </div>
          </div>
          
          <div className="flex-1 space-y-1 text-center sm:text-left">
            <h4 className="font-bold text-slate-900 dark:text-white">{t.instLogo}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.logoDesc}
            </p>
            {bankLogo && (
              <button onClick={() => setBankLogo(null)} className="text-[10px] font-black uppercase text-rose-500 hover:text-rose-600 tracking-widest mt-2">
                {t.removeLogo}
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">
            {t.instName}
          </label>
          <div className="relative group">
            <input
              type="text"
              readOnly={!isEditingBank}
              value={isEditingBank ? tempBankName : bankName}
              onChange={(e) => setTempBankName(e.target.value)}
              className={`w-full bg-slate-50 dark:bg-slate-900/50 border rounded-2xl px-5 py-4 pr-24 text-sm font-semibold transition-all outline-none dark:text-white ${
                isEditingBank 
                  ? 'border-blue-500 ring-4 ring-blue-500/10 cursor-text' 
                  : 'border-slate-200 dark:border-slate-700 cursor-default group-hover:border-slate-300 dark:group-hover:border-slate-600'
              }`}
              placeholder={t.placeholderBank}
            />
            
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
              {isEditingBank ? (
                <>
                  <button
                    onClick={() => { setIsEditingBank(false); setTempBankName(bankName); }}
                    className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                  >
                    <X size={16} />
                  </button>
                  <button
                    onClick={handleBankSave}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95"
                  >
                    <Save size={14} />
                    {t.save}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setIsEditingBank(true); setTempBankName(bankName); }}
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow transition-all"
                >
                  <Pencil size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Loan Officers Management Section */}
      <section className="bg-white dark:bg-[#1E293B] rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Briefcase size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {t.officers}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.officersDesc}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newOfficerName}
              onChange={(e) => setNewOfficerName(e.target.value)}
              placeholder={language === 'en' ? "Officer Name" : "অফিসারের নাম"}
              className="flex-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm font-semibold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 dark:text-white"
            />
            <button
              onClick={handleAddOfficer}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all active:scale-95 flex items-center gap-2"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">{t.addOfficer}</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {loanOfficers.length > 0 ? (
              loanOfficers.map((officer, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 group transition-all hover:border-emerald-500/50"
                >
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{officer}</span>
                  <button 
                    onClick={() => handleRemoveOfficer(index)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            ) : (
              /* Fix: Use 't.noOfficers' instead of 't.noData' which was not defined in the translation object */
              <p className="text-sm text-slate-400 italic py-2">{t.noOfficers}</p>
            )}
          </div>
        </div>
      </section>

      {/* Profile Section */}
      <section className="bg-white dark:bg-[#1E293B] rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl">
            <UserCircle size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {t.profile}
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-8 py-4 border-y border-slate-50 dark:border-slate-800/50">
          <div className="relative group">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 dark:border-slate-800 overflow-hidden">
              {userAvatar ? (
                <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserCircle size={40} />
              )}
              <button 
                onClick={() => userAvatarInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
              >
                <Camera size={24} />
              </button>
            </div>
            <input 
              type="file" 
              ref={userAvatarInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={(e) => handleImageUpload(e, setUserAvatar)}
            />
            <div className="absolute -bottom-1 -right-1 bg-purple-600 text-white p-2 rounded-full shadow-lg cursor-pointer" onClick={() => userAvatarInputRef.current?.click()}>
              <Upload size={14} strokeWidth={3} />
            </div>
          </div>
          
          <div className="flex-1 space-y-1 text-center sm:text-left">
            <h4 className="font-bold text-slate-900 dark:text-white">{t.profilePic}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.picDesc}
            </p>
            {userAvatar && (
              <button onClick={() => setUserAvatar(null)} className="text-[10px] font-black uppercase text-rose-500 hover:text-rose-600 tracking-widest mt-2">
                {t.removePic}
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">
            {t.displayName}
          </label>
          <div className="relative group">
            <input
              type="text"
              readOnly={!isEditingUser}
              value={isEditingUser ? tempUserName : userName}
              onChange={(e) => setTempUserName(e.target.value)}
              className={`w-full bg-slate-50 dark:bg-slate-900/50 border rounded-2xl px-5 py-4 pr-24 text-sm font-semibold transition-all outline-none dark:text-white ${
                isEditingUser 
                  ? 'border-purple-500 ring-4 ring-purple-500/10 cursor-text' 
                  : 'border-slate-200 dark:border-slate-700 cursor-default group-hover:border-slate-300 dark:group-hover:border-slate-600'
              }`}
              placeholder={t.placeholderUser}
            />
            
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
              {isEditingUser ? (
                <>
                  <button
                    onClick={() => { setIsEditingUser(false); setTempUserName(userName); }}
                    className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                  >
                    <X size={16} />
                  </button>
                  <button
                    onClick={handleUserSave}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-lg shadow-purple-500/30 hover:bg-purple-700 transition-all active:scale-95"
                  >
                    <Save size={14} />
                    {t.save}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setIsEditingUser(true); setTempUserName(userName); }}
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow transition-all"
                >
                  <Pencil size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-end pt-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {t.realTime}
        </p>
      </div>
    </div>
  );
};
