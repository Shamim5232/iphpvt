import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  BookOpen,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  Users,
  CalendarCheck,
  CreditCard,
  Award,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { Student } from '../types';

interface LoginProps {
  onLoginSuccess: (role: 'admin' | 'student', studentId?: string) => void;
  students: Student[];
}

const normalizePhone = (phone: string): string => {
  const bToE: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  let englishPhone = phone.split('').map(char => bToE[char] || char).join('');
  englishPhone = englishPhone.replace(/\D/g, '');
  if (englishPhone.startsWith('880')) {
    englishPhone = englishPhone.substring(3);
  } else if (englishPhone.startsWith('0')) {
    englishPhone = englishPhone.substring(1);
  }
  return englishPhone;
};

const normalizeRoll = (roll: string): string => {
  const bToE: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  return roll.split('').map(char => bToE[char] || char).join('').trim();
};

export default function Login({ onLoginSuccess, students }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState(0);
  const [showDemoBtn, setShowDemoBtn] = useState(true);

  // Initialize credentials in localStorage if they don't exist
  useEffect(() => {
    const storedUser = localStorage.getItem('sms_admin_user_id');
    const storedPass = localStorage.getItem('sms_admin_password');
    if (!storedUser || !storedPass) {
      localStorage.setItem('sms_admin_user_id', 'admin');
      localStorage.setItem('sms_admin_password', 'password');
    }

    // Check if demo fill is enabled
    const demoEnabled = localStorage.getItem('sms_security_enable_demo') !== 'false';
    setShowDemoBtn(demoEnabled);

    // Check lockout status
    const lockoutUntil = localStorage.getItem('sms_login_lockout_until');
    if (lockoutUntil) {
      const untilTime = parseInt(lockoutUntil, 10);
      if (untilTime > Date.now()) {
        setIsLocked(true);
        const secondsLeft = Math.ceil((untilTime - Date.now()) / 1000);
        setLockoutTimeLeft(secondsLeft);
      } else {
        localStorage.removeItem('sms_login_lockout_until');
        localStorage.removeItem('sms_failed_attempts');
      }
    }
  }, []);

  // Lockout countdown timer
  useEffect(() => {
    if (!isLocked || lockoutTimeLeft <= 0) return;
    const interval = setInterval(() => {
      setLockoutTimeLeft((prev) => {
        if (prev <= 1) {
          setIsLocked(false);
          localStorage.removeItem('sms_login_lockout_until');
          localStorage.removeItem('sms_failed_attempts');
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isLocked, lockoutTimeLeft]);

  const addSecurityLog = (status: 'Success' | 'Failed', attemptedUser: string) => {
    try {
      const storedLogs = localStorage.getItem('sms_security_logs') || '[]';
      let logs = [];
      try {
        logs = JSON.parse(storedLogs);
        if (!Array.isArray(logs)) logs = [];
      } catch (e) {
        logs = [];
      }
      const newLog = {
        id: 'log_' + Date.now(),
        timestamp: new Date().toISOString(),
        ip: '127.0.0.1 (Localhost)',
        status,
        username: attemptedUser,
      };
      const updatedLogs = [newLog, ...logs].slice(0, 50);
      localStorage.setItem('sms_security_logs', JSON.stringify(updatedLogs));
    } catch (err) {
      console.warn('Error saving login security log:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check if currently locked out
    const lockoutUntil = localStorage.getItem('sms_login_lockout_until');
    if (lockoutUntil && parseInt(lockoutUntil, 10) > Date.now()) {
      setError('নিরাপত্তাজনিত কারণে সাময়িকভাবে ব্লক করা হয়েছে। অনুগ্রহ করে অপেক্ষা করুন।');
      return;
    }

    setLoading(true);

    const enteredUser = username.trim();
    const maxAllowed = parseInt(localStorage.getItem('sms_security_max_attempts') || '3', 10);
    const lockoutDuration = parseInt(localStorage.getItem('sms_security_lockout_time') || '15', 10);

    const checkAndRunServerLogin = async () => {
      const apiUrl = localStorage.getItem('sms_xampp_api_url') || 'http://localhost/student-app/api.php';
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 seconds timeout
        
        const response = await fetch(`${apiUrl}${apiUrl.includes('?') ? '&' : '?'}action=login&_t=${Date.now()}`, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            username: enteredUser,
            password: password
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const res = await response.json();
          if (res.status === 'success') {
            return { success: true };
          } else {
            return { success: false, message: res.message || 'ভুল পাসওয়ার্ড!' };
          }
        } else {
          try {
            const res = await response.json();
            return { success: false, message: res.message || 'ভুল ইউজার আইডি অথবা পাসওয়ার্ড!' };
          } catch (e) {
            return { success: false, message: 'সার্ভার থেকে ভুল পাসওয়ার্ড বা ইউজার আইডি রেসপন্স এসেছে।' };
          }
        }
      } catch (e) {
        // Server offline
        return { success: null };
      }
    };

    // Attempt server login first
    const serverResult = await checkAndRunServerLogin();

    // Short timeout to simulate authentication feel
    setTimeout(() => {
      let isSuccess = false;
      let customErrMessage = '';

      if (serverResult.success === true) {
        isSuccess = true;
        // Sync local storage backup with the working online credentials
        localStorage.setItem('sms_admin_user_id', enteredUser);
        localStorage.setItem('sms_admin_password', password);
      } else if (serverResult.success === false) {
        isSuccess = false;
        customErrMessage = serverResult.message || '';
      } else {
        // Fallback to local storage (server is offline / error)
        const storedUser = localStorage.getItem('sms_admin_user_id') || 'admin';
        const storedPass = localStorage.getItem('sms_admin_password') || 'password';
        
        if (enteredUser === storedUser && password === storedPass) {
          isSuccess = true;
        } else {
          isSuccess = false;
        }
      }

      if (isSuccess) {
        localStorage.removeItem('sms_failed_attempts');
        localStorage.removeItem('sms_login_lockout_until');
        sessionStorage.setItem('sms_is_authenticated', 'true');
        addSecurityLog('Success', enteredUser);
        onLoginSuccess('admin');
      } else {
        addSecurityLog('Failed', enteredUser || 'Unknown');
        
        // Track failed attempts
        let failedCount = parseInt(localStorage.getItem('sms_failed_attempts') || '0', 10) + 1;
        localStorage.setItem('sms_failed_attempts', String(failedCount));

        if (failedCount >= maxAllowed) {
          const blockUntil = Date.now() + lockoutDuration * 60 * 1000;
          localStorage.setItem('sms_login_lockout_until', String(blockUntil));
          setIsLocked(true);
          setLockoutTimeLeft(lockoutDuration * 60);
          setError(`ভুল পাসওয়ার্ড! সর্বোচ্চ চেষ্টা (${maxAllowed} বার) অতিক্রম করায় অ্যাকাউন্টটি ${lockoutDuration} মিনিটের জন্য লক করা হয়েছে।`);
        } else {
          setError(customErrMessage || `ভুল ইউজার আইডি অথবা পাসওয়ার্ড! চেষ্টা বাকি আছে: ${maxAllowed - failedCount} বার।`);
        }
        setLoading(false);
      }
    }, 400);
  };

  const handleDemoFill = () => {
    const storedUser = localStorage.getItem('sms_admin_user_id') || 'admin';
    const storedPass = localStorage.getItem('sms_admin_password') || 'password';
    setUsername(storedUser);
    setPassword(storedPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-10 font-sans">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 min-h-[600px] border border-slate-100">
        
        {/* Left Side: Modern Interactive Feature Panel (Desktop only) */}
        <div className="hidden lg:flex lg:col-span-5 bg-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
          {/* Accent Blobs */}
          <div className="absolute -left-12 -top-12 w-48 h-48 bg-blue-600/30 rounded-full blur-[60px]"></div>
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-[60px]"></div>

          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-500/25">
                <BookOpen className="h-6 w-6" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-blue-400 font-display">
                SMS <span className="text-white">PRO</span>
              </span>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-black leading-tight text-slate-100">
                স্মার্ট ইন্সটিটিউশন ম্যানেজমেন্ট সিস্টেম
              </h2>
              <p className="text-slate-400 text-xs leading-relaxed">
                আপনার কোচিং বা একাডেমির সকল একাডেমিক ও প্রাতিষ্ঠানিক কার্যাবলী এক প্ল্যাটফর্মে ডিজিটালি পরিচালনা করুন।
              </p>
            </div>

            {/* Feature lists */}
            <div className="space-y-4 pt-4">
              {[
                { icon: Users, text: 'স্মার্ট ছাত্র-ভর্তি ও অটো-রোল সিস্টেম' },
                { icon: CalendarCheck, text: 'ডিজিটাল ক্লাস উপস্থিতি ও রেকর্ড ট্র্যাকিং' },
                { icon: CreditCard, text: 'রশিদ প্রিন্টসহ বকেয়া ফি ম্যানেজমেন্ট' },
                { icon: Award, text: 'মডেল টেস্ট রেজাল্ট ও মেধা তালিকা বিশ্লেষণ' },
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3.5 group">
                  <div className="bg-slate-800 p-2 rounded-lg text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <feature.icon className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Copyright section */}
          <div className="relative z-10 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            সংস্করণ ২.৬ • সর্বস্বত্ব সংরক্ষিত © ২০২৬
          </div>
        </div>

        {/* Right Side: Elegant Login Form */}
        <div className="lg:col-span-7 p-8 md:p-14 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto space-y-6">
            
            {/* Form Header */}
            <div className="space-y-2.5 text-center lg:text-left">
              <div className="lg:hidden flex items-center justify-center gap-2 mb-2">
                <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md">
                  <BookOpen className="h-5 w-5" />
                </div>
                <span className="text-xl font-black tracking-tighter text-blue-600 font-display">
                  SMS <span className="text-slate-900">PRO</span>
                </span>
              </div>

              <span className="text-xs font-black text-blue-600 uppercase tracking-widest inline-flex items-center gap-1.5 bg-blue-50 px-3 py-1 rounded-full">
                <Sparkles className="h-3.5 w-3.5 text-blue-500 animate-spin-slow" />
                নিরাপদ অ্যাডমিন প্যানেল
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                স্বাগতম, লগইন করুন
              </h2>
              <p className="text-slate-400 text-xs font-medium">
                আপনার সঠিক ইউজার আইডি ও পাসওয়ার্ড ব্যবহার করে ড্যাশবোর্ডে প্রবেশ করুন।
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-50 border border-rose-100 text-rose-700 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2.5"
              >
                <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></div>
                {error}
              </motion.div>
            )}

            {/* Main Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-700 block">
                  ইউজার আইডি (User ID)
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="যেমন: admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10.5 pr-4 py-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-4 focus:border-blue-500 focus:ring-blue-500/10 text-slate-800 transition"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-700 block">
                    পাসওয়ার্ড (Password)
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10.5 pr-12 py-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-800 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 p-0.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || isLocked}
                className="w-full text-white font-black py-3.5 rounded-2xl text-xs tracking-wider transition duration-150 shadow-lg cursor-pointer active:scale-98 flex items-center justify-center gap-2.5 disabled:opacity-70 disabled:pointer-events-none bg-blue-600 hover:bg-blue-700 shadow-blue-600/15"
              >
                {isLocked ? (
                  `লকডাউন রয়েছে (অপেক্ষা করুন: ${lockoutTimeLeft} সে.)`
                ) : loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    ভেরিফাই করা হচ্ছে...
                  </>
                ) : (
                  'ড্যাশবোর্ডে প্রবেশ করুন'
                )}
              </button>

              {showDemoBtn && (
                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={handleDemoFill}
                    className="text-xs hover:underline font-bold transition inline-flex items-center gap-1 cursor-pointer px-4 py-2 rounded-xl text-blue-600 hover:text-blue-800 bg-blue-50/70 hover:bg-blue-50"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-blue-500" />{' '}
                    ডেমো অ্যাডমিন তথ্য অটো-ফিল করুন
                  </button>
                </div>
              )}
            </form>

            {/* Developer Credit Footer */}
            <div className="pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400 font-medium tracking-wide">
                Developed By <span className="font-bold text-blue-600">ICT PVT HOME (Shamim)</span>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
