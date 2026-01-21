
import React from 'react';
import { 
  Bell, 
  ShieldCheck, 
  AlertTriangle, 
  Lightbulb, 
  ShieldAlert, 
  Info,
  ChevronRight
} from 'lucide-react';

interface AlertsViewProps {
  language: 'en' | 'bn';
}

export const AlertsView: React.FC<AlertsViewProps> = ({ language }) => {
  const t = {
    title: language === 'en' ? 'Security & Guidance' : 'নিরাপত্তা ও নির্দেশিকা',
    subtitle: language === 'en' ? 'Important system alerts and operational safety tips' : 'গুরুত্বপূর্ণ সিস্টেম সতর্কতা এবং অপারেশনাল নিরাপত্তা টিপস',
    safetyHeader: language === 'en' ? 'Financial Security' : 'আর্থিক নিরাপত্তা',
    guidanceHeader: language === 'en' ? 'Operational Guidance' : 'অপারেশনাল নির্দেশিকা',
    alertsHeader: language === 'en' ? 'System Notifications' : 'সিস্টেম বিজ্ঞপ্তি',
  };

  const securityTips = [
    {
      icon: <ShieldCheck className="text-emerald-500" />,
      title: language === 'en' ? 'Protect Your Password' : 'আপনার পাসওয়ার্ড রক্ষা করুন',
      desc: language === 'en' ? 'Change your system password every 3 months and use symbols for strength.' : 'প্রতি ৩ মাস অন্তর সিস্টেম পাসওয়ার্ড পরিবর্তন করুন এবং শক্তিশালী করতে সংকেত ব্যবহার করুন।'
    },
    {
      icon: <ShieldAlert className="text-rose-500" />,
      title: language === 'en' ? 'Confidentiality' : 'গোপনীয়তা',
      desc: language === 'en' ? 'Never share OTPs or customer private data with anyone outside the official process.' : 'অফিসিয়াল প্রক্রিয়ার বাইরে কারও সাথে ওটিপি বা গ্রাহকের ব্যক্তিগত তথ্য শেয়ার করবেন না।'
    },
    {
      icon: <ShieldCheck className="text-blue-500" />,
      title: language === 'en' ? 'Verified Connections' : 'যাচাইকৃত সংযোগ',
      desc: language === 'en' ? 'Always ensure you are using the official bank portal link to avoid phishing.' : 'ফিশিং এড়াতে সর্বদা অফিসিয়াল ব্যাংক পোর্টাল লিঙ্ক ব্যবহার করছেন তা নিশ্চিত করুন।'
    }
  ];

  const guidanceItems = [
    {
      icon: <Lightbulb className="text-amber-500" />,
      title: language === 'en' ? 'FDR/DPS Maturity' : 'এফডিআর/ডিপিএস পরিপক্কতা',
      desc: language === 'en' ? 'Check the maturity date field twice before saving to avoid data inconsistencies.' : 'ডেটা অসামঞ্জস্য এড়াতে সেভ করার আগে ম্যাচুরিটি ডেট ফিল্ড দুবার চেক করুন।'
    },
    {
      icon: <Info className="text-blue-400" />,
      title: language === 'en' ? 'Quick Ledger Search' : 'দ্রুত লেজার অনুসন্ধান',
      desc: language === 'en' ? 'Use the search bar at the top for instant transaction lookups by category.' : 'বিভাগ অনুযায়ী তাৎক্ষণিক লেনদেন অনুসন্ধানের জন্য উপরে সার্চ বারটি ব্যবহার করুন।'
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/30">
              <Bell size={28} />
            </div>
            {t.title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            {t.subtitle}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Security Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">{t.safetyHeader}</h2>
          </div>
          <div className="space-y-4">
            {securityTips.map((tip, idx) => (
              <div key={idx} className="bg-white dark:bg-[#1E293B] p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all group">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    {tip.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {tip.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      {tip.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Guidance Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">{t.guidanceHeader}</h2>
          </div>
          <div className="space-y-4">
            {guidanceItems.map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-[#1E293B] p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-0.5">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {item.desc}
                    </p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300 dark:text-slate-700 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </div>
            ))}

            {/* Warning Card */}
            <div className="p-8 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-[2.5rem] mt-4">
               <div className="flex items-center gap-3 mb-4">
                 <AlertTriangle className="text-amber-600 dark:text-amber-400" size={24} />
                 <h4 className="text-lg font-black text-amber-900 dark:text-amber-100 uppercase tracking-tight">
                   {language === 'en' ? 'Critical Reminder' : 'জরুরি অনুস্মারক'}
                 </h4>
               </div>
               <p className="text-sm text-amber-800 dark:text-amber-200/80 font-medium leading-relaxed">
                 {language === 'en' 
                    ? "In case of any data discrepancy or system error, please contact the IT support desk immediately. Avoid processing large disbursements until the issue is resolved." 
                    : "ডেটা অমিল বা সিস্টেম ত্রুটির ক্ষেত্রে, অনুগ্রহ করে অবিলম্বে আইটি সাপোর্ট ডেস্কের সাথে যোগাযোগ করুন। সমস্যা সমাধান না হওয়া পর্যন্ত বড় ডিসবার্সমেন্ট প্রসেস করা থেকে বিরত থাকুন।"}
               </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
