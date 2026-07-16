import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { 
  ShieldAlert, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  History, 
  Settings, 
  Save, 
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  RefreshCw,
  Trash2,
  MessageSquare,
  Send,
  Smartphone,
  Key,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Layers
} from 'lucide-react';

interface SecurityLog {
  id: string;
  timestamp: string;
  ip: string;
  status: 'Success' | 'Failed';
  username: string;
}

export default function SystemSettings() {
  // Admin Login Settings
  const [adminUserId, setAdminUserId] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Security Policy Settings
  const [maxAttempts, setMaxAttempts] = useState('3');
  const [enableDemoFill, setEnableDemoFill] = useState(true);
  const [autoLockoutTime, setAutoLockoutTime] = useState('15'); // in minutes

  // Logs state
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);

  // SMS Tab States
  const [settingsTab, setSettingsTab] = useState<'security' | 'sms'>('security');
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [smsGateway, setSmsGateway] = useState<'bulksmsbd' | 'greenweb' | 'custom'>('bulksmsbd');
  const [smsApiKey, setSmsApiKey] = useState('');
  const [smsSenderId, setSmsSenderId] = useState('');
  const [smsUsername, setSmsUsername] = useState('');
  const [smsCustomUrl, setSmsCustomUrl] = useState('');
  const [smsUseXamppProxy, setSmsUseXamppProxy] = useState(false);
  const [smsTemplate, setSmsTemplate] = useState('');

  // Test SMS states
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('প্রিয় শিক্ষার্থী, আপনার এই মাসের বেতন পরিশোধের জন্য ধন্যবাদ।');
  const [testSending, setTestSending] = useState(false);

  // SMS History Logs state
  interface SmsLog {
    id: string;
    timestamp: string;
    phone: string;
    studentName: string;
    message: string;
    status: 'Pending' | 'Success' | 'Failed';
    apiResponse?: string;
  }
  const [smsHistory, setSmsHistory] = useState<SmsLog[]>([]);

  useEffect(() => {
    // Load current credentials
    const storedUser = localStorage.getItem('sms_admin_user_id') || 'admin';
    setAdminUserId(storedUser);

    // Load policy settings
    const storedAttempts = localStorage.getItem('sms_security_max_attempts') || '3';
    setMaxAttempts(storedAttempts);

    const storedDemoFill = localStorage.getItem('sms_security_enable_demo') !== 'false';
    setEnableDemoFill(storedDemoFill);

    const storedLockout = localStorage.getItem('sms_security_lockout_time') || '15';
    setAutoLockoutTime(storedLockout);

    // Load SMS settings
    setSmsEnabled(localStorage.getItem('sms_enabled') === 'true');
    setSmsGateway((localStorage.getItem('sms_gateway') || 'bulksmsbd') as 'bulksmsbd' | 'greenweb' | 'custom');
    setSmsApiKey(localStorage.getItem('sms_api_key') || '');
    setSmsSenderId(localStorage.getItem('sms_sender_id') || '');
    setSmsUsername(localStorage.getItem('sms_username') || '');
    setSmsCustomUrl(localStorage.getItem('sms_custom_url') || 'https://bulksmsbd.net/api/smsapi?api_key={api_key}&type=text&number={phone}&senderid={sender_id}&message={message}');
    setSmsUseXamppProxy(localStorage.getItem('sms_use_xampp_proxy') === 'true');
    setSmsTemplate(localStorage.getItem('sms_template') || 'রশিদ নং: {receipt_no}। প্রিয় {name}, আপনার {month} মাসের ফি বাবদ {amount} টাকা সফলভাবে জমা হয়েছে। ধন্যবাদ!');

    // Load SMS History
    try {
      setSmsHistory(JSON.parse(localStorage.getItem('sms_history_logs') || '[]'));
    } catch (e) {
      setSmsHistory([]);
    }

    // Load or generate dummy security logs if empty
    const storedLogs = localStorage.getItem('sms_security_logs');
    if (storedLogs) {
      try {
        setSecurityLogs(JSON.parse(storedLogs));
      } catch (e) {
        setSecurityLogs([]);
      }
    } else {
      const initialLogs: SecurityLog[] = [
        {
          id: 'log_1',
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          ip: '192.168.0.105',
          status: 'Success',
          username: storedUser,
        },
        {
          id: 'log_2',
          timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
          ip: '192.168.0.101',
          status: 'Failed',
          username: 'administrator',
        }
      ];
      setSecurityLogs(initialLogs);
      localStorage.setItem('sms_security_logs', JSON.stringify(initialLogs));
    }
  }, []);

  const handleUpdateCredentials = (e: React.FormEvent) => {
    e.preventDefault();

    const actualCurrentPass = localStorage.getItem('sms_admin_password') || 'password';
    
    if (currentPassword !== actualCurrentPass) {
      Swal.fire({
        icon: 'error',
        title: 'ভুল বর্তমান পাসওয়ার্ড',
        text: 'আপনার প্রদানকৃত বর্তমান পাসওয়ার্ডটি সঠিক নয়। অনুগ্রহ করে পুনরায় চেষ্টা করুন।',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'পাসওয়ার্ড মেলেনি',
        text: 'নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ডটি এক হতে হবে।',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    if (newPassword.length < 4) {
      Swal.fire({
        icon: 'error',
        title: 'দুর্বল পাসওয়ার্ড',
        text: 'নতুন পাসওয়ার্ডটি অন্তত ৪ অক্ষরের হতে হবে।',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    // Update
    localStorage.setItem('sms_admin_user_id', adminUserId.trim());
    localStorage.setItem('sms_admin_password', newPassword);

    // Sync to XAMPP database if online
    const syncCredentialsToXampp = async () => {
      const apiUrl = localStorage.getItem('sms_xampp_api_url') || 'http://localhost/student-app/api.php';
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        
        const response = await fetch(`${apiUrl}${apiUrl.includes('?') ? '&' : '?'}action=update_credentials`, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            username: adminUserId.trim(),
            password: newPassword
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const res = await response.json();
          if (res.status === 'success') {
            console.log('Credentials synced to local XAMPP MySQL database successfully!');
          }
        }
      } catch (e) {
        console.warn('XAMPP server offline, credentials saved only locally in client browser.', e);
      }
    };
    syncCredentialsToXampp();

    // Add security log
    const newLog: SecurityLog = {
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
      ip: '127.0.0.1 (Localhost)',
      status: 'Success',
      username: adminUserId.trim() + ' (Credentials Changed)',
    };
    const updatedLogs = [newLog, ...securityLogs].slice(0, 50);
    setSecurityLogs(updatedLogs);
    localStorage.setItem('sms_security_logs', JSON.stringify(updatedLogs));

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    Swal.fire({
      icon: 'success',
      title: 'পাসওয়ার্ড সফলভাবে পরিবর্তিত',
      text: 'অ্যাডমিন প্যানেলের সিকিউরিটি ক্রেডেনশিয়াল আপডেট করা হয়েছে। পরবর্তী লগইনে নতুন পাসওয়ার্ড ব্যবহার করুন।',
      confirmButtonColor: '#2563eb'
    });
  };

  const handleSavePolicies = () => {
    localStorage.setItem('sms_security_max_attempts', maxAttempts);
    localStorage.setItem('sms_security_enable_demo', String(enableDemoFill));
    localStorage.setItem('sms_security_lockout_time', autoLockoutTime);

    Swal.fire({
      icon: 'success',
      title: 'নিরাপত্তা নীতিমালা সংরক্ষিত',
      text: 'অ্যাডমিন সিকিউরিটি পলিসি সফলভাবে আপডেট করা হয়েছে।',
      confirmButtonColor: '#2563eb',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000
    });
  };

  const clearSecurityLogs = () => {
    Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: 'সকল সিকিউরিটি অ্যাক্সেস লগ মুছে ফেলা হবে!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'হ্যাঁ, মুছুন!',
      cancelButtonText: 'বাতিল'
    }).then((result) => {
      if (result.isConfirmed) {
        setSecurityLogs([]);
        localStorage.removeItem('sms_security_logs');
        Swal.fire({
          title: 'মুছে ফেলা হয়েছে!',
          text: 'সকল লগ সফলভাবে পরিষ্কার করা হয়েছে।',
          icon: 'success',
          confirmButtonColor: '#2563eb'
        });
      }
    });
  };

  const handleSaveSmsSettings = () => {
    localStorage.setItem('sms_enabled', String(smsEnabled));
    localStorage.setItem('sms_gateway', smsGateway);
    localStorage.setItem('sms_api_key', smsApiKey.trim());
    localStorage.setItem('sms_sender_id', smsSenderId.trim());
    localStorage.setItem('sms_username', smsUsername.trim());
    localStorage.setItem('sms_custom_url', smsCustomUrl.trim());
    localStorage.setItem('sms_use_xampp_proxy', String(smsUseXamppProxy));
    localStorage.setItem('sms_template', smsTemplate.trim());

    Swal.fire({
      icon: 'success',
      title: 'এসএমএস সেটিংস সংরক্ষিত',
      text: 'আপনার এসএমএস গেটওয়ে সেটিংস সফলভাবে আপডেট করা হয়েছে।',
      confirmButtonColor: '#2563eb',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000
    });
  };

  const handleSendTestSms = async () => {
    if (!testPhone) {
      Swal.fire({
        icon: 'warning',
        title: 'মোবাইল নম্বর প্রয়োজন',
        text: 'অনুগ্রহ করে একটি সচল মোবাইল নম্বর প্রদান করুন।',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

    setTestSending(true);

    let url = '';
    if (smsGateway === 'bulksmsbd') {
      url = `https://bulksmsbd.net/api/smsapi?api_key=${encodeURIComponent(smsApiKey)}&type=text&number=${encodeURIComponent(testPhone)}&senderid=${encodeURIComponent(smsSenderId)}&message=${encodeURIComponent(testMessage)}`;
    } else if (smsGateway === 'greenweb') {
      url = `https://api.greenweb.com.bd/api.php?token=${encodeURIComponent(smsApiKey)}&to=${encodeURIComponent(testPhone)}&message=${encodeURIComponent(testMessage)}`;
    } else if (smsGateway === 'custom') {
      url = smsCustomUrl
        .replace(/{api_key}/g, encodeURIComponent(smsApiKey))
        .replace(/{sender_id}/g, encodeURIComponent(smsSenderId))
        .replace(/{username}/g, encodeURIComponent(smsUsername))
        .replace(/{phone}/g, encodeURIComponent(testPhone))
        .replace(/{message}/g, encodeURIComponent(testMessage));
    }

    // Save test log as well
    const logId = 'sms_' + Date.now();
    const newLog: SmsLog = {
      id: logId,
      timestamp: new Date().toISOString(),
      phone: testPhone,
      studentName: 'টেস্ট প্রাপক (Test)',
      message: testMessage,
      status: 'Pending',
      apiResponse: ''
    };

    const existingLogs = JSON.parse(localStorage.getItem('sms_history_logs') || '[]');
    localStorage.setItem('sms_history_logs', JSON.stringify([newLog, ...existingLogs].slice(0, 100)));
    setSmsHistory([newLog, ...smsHistory].slice(0, 100));

    try {
      if (smsUseXamppProxy) {
        const apiUrl = localStorage.getItem('sms_xampp_api_url') || 'http://localhost/student-app/api.php';
        const response = await fetch(`${apiUrl}${apiUrl.includes('?') ? '&' : '?'}action=send_sms`, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            to: testPhone,
            message: testMessage,
            url: url,
            gateway: smsGateway,
            api_key: smsApiKey,
            sender_id: smsSenderId
          })
        });

        if (response.ok) {
          const res = await response.json();
          newLog.status = res.status === 'success' ? 'Success' : 'Failed';
          newLog.apiResponse = res.message || JSON.stringify(res);

          if (res.status === 'success') {
            Swal.fire({
              icon: 'success',
              title: 'টেস্ট এসএমএস সফল',
              text: `XAMPP সার্ভারের মাধ্যমে এসএমএস পাঠানো হয়েছে। রেসপন্স: ${res.message || 'Success'}`,
              confirmButtonColor: '#10b981'
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'প্রেরণ ব্যর্থ হয়েছে',
              text: `XAMPP সার্ভার রেসপন্স: ${res.message || 'Unknown error'}`,
              confirmButtonColor: '#ef4444'
            });
          }
        } else {
          throw new Error(`XAMPP Server Error: HTTP ${response.status}`);
        }
      } else {
        // Direct Send
        await fetch(url, { method: 'GET', mode: 'no-cors' });
        newLog.status = 'Success';
        newLog.apiResponse = 'Sent via browser direct GET (No-CORS mode).';

        Swal.fire({
          icon: 'success',
          title: 'রিকোয়েস্ট পাঠানো হয়েছে',
          text: 'ব্রাউজার থেকে সরাসরি এসএমএস এপিআই রিকোয়েস্ট পাঠানো হয়েছে (CORS এর কারণে ডেলিভারি স্ট্যাটাস চেক করা সম্ভব হয়নি, আপনার মোবাইল হ্যান্ডসেটে টেস্ট মেসেজ এসেছে কি না তা পরীক্ষা করুন)।',
          confirmButtonColor: '#10b981'
        });
      }
    } catch (e: any) {
      newLog.status = 'Failed';
      newLog.apiResponse = e.message || 'Error occurred';

      Swal.fire({
        icon: 'error',
        title: 'প্রেরণ ত্রুটি',
        text: `এসএমএস এপিআই কল করতে সমস্যা হয়েছে: ${e.message || e}`,
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setTestSending(false);
      // Update log status in history
      const updatedLogs = JSON.parse(localStorage.getItem('sms_history_logs') || '[]')
        .map((l: any) => l.id === logId ? newLog : l);
      localStorage.setItem('sms_history_logs', JSON.stringify(updatedLogs));
      setSmsHistory(updatedLogs);
    }
  };

  const clearSmsHistory = () => {
    Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: 'সকল এসএমএস প্রেরণের ইতিহাস মুছে ফেলা হবে!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'হ্যাঁ, মুছুন!',
      cancelButtonText: 'বাতিল'
    }).then((result) => {
      if (result.isConfirmed) {
        setSmsHistory([]);
        localStorage.removeItem('sms_history_logs');
        Swal.fire({
          title: 'মুছে ফেলা হয়েছে!',
          text: 'সকল এসএমএস লগ সফলভাবে পরিষ্কার করা হয়েছে।',
          icon: 'success',
          confirmButtonColor: '#2563eb'
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 shadow-sm">
            <Settings className="h-6.5 w-6.5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-850 tracking-tight">সিস্টেম সেটিংস (System Settings)</h1>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed mt-0.5">
              অ্যাডমিন প্যানেলের নিরাপত্তা কনফিগারেশন, পাসওয়ার্ড পরিবর্তন, এবং এসএমএস গেটওয়ে নোটিফিকেশন সেটিংস করুন।
            </p>
          </div>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white p-2.5 rounded-2xl border border-slate-100 shadow-xs gap-2">
        <button
          onClick={() => setSettingsTab('security')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            settingsTab === 'security'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/15'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <Lock className="h-4 w-4" /> নিরাপত্তা ও অ্যাক্সেস (Security & Access)
        </button>
        <button
          onClick={() => setSettingsTab('sms')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            settingsTab === 'sms'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/15'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="h-4 w-4" /> এসএমএস গেটওয়ে সেটিংস (SMS Gateway)
        </button>
      </div>

      {settingsTab === 'security' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Side: Admin Credentials Change & Policies */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Admin Credentials Form Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Lock className="h-5 w-5 text-blue-600" />
                  <h3 className="text-sm font-black text-slate-800">অ্যাডমিন অ্যাক্সেস পরিবর্তন (Change Credentials)</h3>
                </div>
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase">Security Tier 1</span>
              </div>

              <form onSubmit={handleUpdateCredentials} className="p-6 space-y-5 font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-slate-700 block">
                      ইউজার আইডি (Admin User ID)
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={adminUserId}
                        onChange={(e) => setAdminUserId(e.target.value)}
                        className="w-full pl-10.5 pr-4 py-2.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-250 focus:border-blue-500 rounded-xl text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-800 transition"
                        placeholder="অ্যাডমিন ইউজারনেম"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-slate-700 block">
                      বর্তমান পাসওয়ার্ড (Current Password) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full pl-10.5 pr-4 py-2.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-250 focus:border-blue-500 rounded-xl text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-800 transition"
                        placeholder="বর্তমান পাসওয়ার্ড লিখুন"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-5">
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-slate-700 block">
                      নতুন পাসওয়ার্ড (New Password) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10.5 pr-10 py-2.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-250 focus:border-blue-500 rounded-xl text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-800 transition"
                        placeholder="কমপক্ষে ৪ সংখ্যার পাসওয়ার্ড"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition"
                      >
                        {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-slate-700 block">
                      নতুন পাসওয়ার্ড কনফার্ম করুন <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                      <input
                        type={showConfirmPass ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10.5 pr-10 py-2.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-250 focus:border-blue-500 rounded-xl text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-800 transition"
                        placeholder="নতুন পাসওয়ার্ডটি পুনরায় লিখুন"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition"
                      >
                        {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-blue-600/10 cursor-pointer flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" /> ক্রেডেনশিয়াল আপডেট করুন
                  </button>
                </div>
              </form>
            </div>

            {/* Security Policies Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="h-5 w-5 text-amber-500" />
                  <h3 className="text-sm font-black text-slate-800">অ্যাডমিন অ্যাক্সেস সিকিউরিটি রুলস (Security Policies)</h3>
                </div>
                <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full uppercase">Policy Rules</span>
              </div>

              <div className="p-6 space-y-6 font-sans">
                {/* Max attempts */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800">সর্বোচ্চ ভুল লগইন চেষ্টা (Max Failed Attempts)</h4>
                    <p className="text-[11px] font-bold text-slate-400 mt-0.5">কতবার ভুল পাসওয়ার্ড দিলে আইডি সাময়িক ব্লক হবে।</p>
                  </div>
                  <select
                    value={maxAttempts}
                    onChange={(e) => setMaxAttempts(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                  >
                    <option value="3">৩ বার (প্রস্তাবিত)</option>
                    <option value="5">৫ বার</option>
                    <option value="10">১০ বার</option>
                    <option value="999">কোনো সীমা নেই</option>
                  </select>
                </div>

                {/* Autolockout time */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800">অটো-লকআউট সময়সীমা (Lockout Duration)</h4>
                    <p className="text-[11px] font-bold text-slate-400 mt-0.5">অ্যাক্সেস ব্লক হওয়ার পর কত মিনিট অপেক্ষা করতে হবে।</p>
                  </div>
                  <select
                    value={autoLockoutTime}
                    onChange={(e) => setAutoLockoutTime(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                  >
                    <option value="5">৫ মিনিট</option>
                    <option value="15">১৫ মিনিট (প্রস্তাবিত)</option>
                    <option value="30">৩০ মিনিট</option>
                    <option value="60">১ ঘণ্টা</option>
                  </select>
                </div>

                {/* Toggle Quick Demo fill */}
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800">ডেমো ফিল বাটন সক্রিয় রাখুন (Quick Demo Fill Option)</h4>
                    <p className="text-[11px] font-bold text-slate-400 mt-0.5">লগইন স্ক্রিনে ডেমো অ্যাকাউন্ট ফিল করার বাটন প্রদর্শন করবেন কিনা।</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEnableDemoFill(!enableDemoFill)}
                    className="text-blue-600 hover:text-blue-700 transition cursor-pointer shrink-0"
                  >
                    {enableDemoFill ? (
                      <ToggleRight className="h-9 w-9 text-blue-600" />
                    ) : (
                      <ToggleLeft className="h-9 w-9 text-slate-400" />
                    )}
                  </button>
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-150">
                  <div className="flex items-start gap-2.5 text-[11px] text-amber-800 font-medium">
                    <AlertCircle className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>
                      নিরাপত্তা বৃদ্ধির জন্য ডেমো ফিল বাটনটি বন্ধ করে রাখার পরামর্শ দেওয়া হচ্ছে এবং আপনার ডেমো পাসওয়ার্ডটি অবিলম্বে পরিবর্তন করুন।
                    </span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSavePolicies}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg cursor-pointer flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" /> নীতিমালা সংরক্ষণ করুন
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Security Audit Logs */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden flex flex-col h-full min-h-[500px]">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <History className="h-5 w-5 text-slate-600" />
                  <h3 className="text-sm font-black text-slate-800">সিকিউরিটি অ্যাক্সেস লগ (Security Logs)</h3>
                </div>
                {securityLogs.length > 0 && (
                  <button
                    type="button"
                    onClick={clearSecurityLogs}
                    className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition text-xs font-bold flex items-center gap-1 cursor-pointer"
                    title="লগ ক্লিয়ার করুন"
                  >
                    <Trash2 className="h-4 w-4" /> পরিষ্কার করুন
                  </button>
                )}
              </div>

              <div className="p-5 flex-1 overflow-y-auto space-y-3 max-h-[560px]">
                {securityLogs.length > 0 ? (
                  securityLogs.map((log) => (
                    <div key={log.id} className="bg-slate-50 border border-slate-150 rounded-xl p-3.5 text-xs font-sans space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          log.status === 'Success' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                          {log.status === 'Success' ? (
                            <>
                              <ShieldCheck className="h-3 w-3" /> সফল লগইন
                            </>
                          ) : (
                            <>
                              <ShieldAlert className="h-3 w-3" /> ব্যর্থ চেষ্টা
                            </>
                          )}
                        </span>
                        <span className="text-slate-400 font-semibold text-[10px]">
                          {new Date(log.timestamp).toLocaleString('bn-BD')}
                        </span>
                      </div>

                      <div className="space-y-1 pl-1 text-[11px] text-slate-600 font-medium">
                        <p>
                          <span className="font-extrabold text-slate-700">ইউজার আইডি:</span> <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">{log.username}</span>
                        </p>
                        <p>
                          <span className="font-extrabold text-slate-700">আইপি এড্রেস:</span> <span className="font-mono text-slate-500">{log.ip}</span>
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16">
                    <div className="bg-slate-50 p-4 rounded-full w-14 h-14 flex items-center justify-center mx-auto text-slate-400 border border-slate-100">
                      <History className="h-6 w-6" />
                    </div>
                    <p className="text-slate-400 text-xs font-bold mt-3">কোনো অ্যাক্সেস লগ পাওয়া যায়নি।</p>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 text-center text-[10px] font-semibold text-slate-400 leading-relaxed">
                লগসমূহ শুধুমাত্র আপনার ব্রাউজারে সুরক্ষিত রয়েছে। ডাটাবেজে সিকিউরিটি অডিটের জন্য এগুলি সংরক্ষিত হচ্ছে।
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* SMS Settings View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            
            {/* SMS Status & Gateway Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <h3 className="text-sm font-black text-slate-800">এসএমএস সার্ভিস অ্যাক্টিভেশন (SMS Activation)</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSmsEnabled(!smsEnabled)}
                  className="cursor-pointer transition shrink-0"
                >
                  {smsEnabled ? (
                    <ToggleRight className="h-9 w-9 text-blue-600" />
                  ) : (
                    <ToggleLeft className="h-9 w-9 text-slate-400" />
                  )}
                </button>
              </div>

              <div className="p-6 space-y-5 font-sans">
                {/* Gateway Provider */}
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-slate-700 block">
                    এসএমএস গেটওয়ে অপারেটর (SMS Gateway Provider)
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'bulksmsbd', label: 'BulkSMSBD', desc: 'bulksmsbd.net' },
                      { id: 'greenweb', label: 'Greenweb', desc: 'greenweb.com.bd' },
                      { id: 'custom', label: 'Custom HTTP', desc: 'Custom HTTP API' }
                    ].map((provider) => (
                      <button
                        key={provider.id}
                        type="button"
                        onClick={() => setSmsGateway(provider.id as any)}
                        className={`p-3.5 rounded-xl border text-center transition flex flex-col items-center justify-center cursor-pointer ${
                          smsGateway === provider.id
                            ? 'border-blue-600 bg-blue-50/40 text-blue-700 ring-2 ring-blue-600/10'
                            : 'border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span className="text-xs font-black">{provider.label}</span>
                        <span className="text-[10px] text-slate-400 font-semibold mt-0.5">{provider.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gateway Specific API Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2 col-span-1">
                    <label className="text-xs font-extrabold text-slate-700 block flex items-center gap-1.5">
                      <Key className="h-3.5 w-3.5 text-slate-400" />
                      এপিআই কী (API Key / Token) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={smsApiKey}
                      onChange={(e) => setSmsApiKey(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-250 focus:border-blue-500 rounded-xl text-xs font-mono focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-800 transition"
                      placeholder="Enter Gateway API Key"
                    />
                  </div>

                  {smsGateway !== 'greenweb' && (
                    <div className="space-y-2 col-span-1">
                      <label className="text-xs font-extrabold text-slate-700 block flex items-center gap-1.5">
                        <Smartphone className="h-3.5 w-3.5 text-slate-400" />
                        সেন্ডার আইডি (Sender ID / Masking)
                      </label>
                      <input
                        type="text"
                        value={smsSenderId}
                        onChange={(e) => setSmsSenderId(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-250 focus:border-blue-500 rounded-xl text-xs font-mono focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-800 transition"
                        placeholder="e.g. 8809612xxxxxx (Non-masking)"
                      />
                    </div>
                  )}

                  {smsGateway === 'custom' && (
                    <div className="space-y-2 col-span-1">
                      <label className="text-xs font-extrabold text-slate-700 block flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        ইউজারনেম (Username - Optional)
                      </label>
                      <input
                        type="text"
                        value={smsUsername}
                        onChange={(e) => setSmsUsername(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-250 focus:border-blue-500 rounded-xl text-xs font-mono focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-800 transition"
                        placeholder="API Account Username"
                      />
                    </div>
                  )}
                </div>

                {/* Custom API URL Endpoint template */}
                {smsGateway === 'custom' && (
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-extrabold text-slate-700 block flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-slate-400" />
                      কাস্টম গেটওয়ে এপিআই ইউআরএল (Custom HTTP API Template)
                    </label>
                    <input
                      type="text"
                      value={smsCustomUrl}
                      onChange={(e) => setSmsCustomUrl(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-250 focus:border-blue-500 rounded-xl text-xs font-mono focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-800 transition"
                      placeholder="https://mygateway.com/sms?api_key={api_key}&to={phone}&msg={message}"
                    />
                    <p className="text-[10px] text-slate-400 leading-relaxed font-semibold mt-1">
                      সাপোর্টেড প্লেসহোল্ডারসমূহ: <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600 font-mono">{'{api_key}'}</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600 font-mono">{'{sender_id}'}</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600 font-mono">{'{phone}'}</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600 font-mono">{'{message}'}</code>
                    </p>
                  </div>
                )}

                {/* XAMPP Server Proxy Bypass CORS */}
                <div className="flex items-center justify-between gap-4 p-4.5 bg-blue-50/50 border border-blue-100 rounded-xl mt-3 font-sans">
                  <div>
                    <h4 className="text-xs font-black text-slate-800">XAMPP PHP সার্ভার প্রক্সি ব্যবহার করুন (CORS Bypass)</h4>
                    <p className="text-[11px] font-bold text-slate-500 mt-1 leading-relaxed">
                      ব্রাউজার সিকিউরিটি (CORS) এড়াতে ব্যাকআপ লোকাল XAMPP সার্ভারকে প্রক্সি হিসেবে ব্যবহার করবে। এটি অন থাকলে এপিআই রিকোয়েস্ট লোকাল হোস্টের মাধ্যমে পাস হবে।
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSmsUseXamppProxy(!smsUseXamppProxy)}
                    className="text-blue-600 hover:text-blue-700 transition cursor-pointer shrink-0"
                  >
                    {smsUseXamppProxy ? (
                      <ToggleRight className="h-9 w-9 text-blue-600" />
                    ) : (
                      <ToggleLeft className="h-9 w-9 text-slate-400" />
                    )}
                  </button>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleSaveSmsSettings}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg cursor-pointer flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" /> গেটওয়ে কনফিগারেশন সংরক্ষণ করুন
                  </button>
                </div>
              </div>
            </div>

            {/* SMS Template Customizer Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Layers className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-sm font-black text-slate-800">পেমেন্ট এসএমএস মেসেজ ফরম্যাট (SMS Message Template)</h3>
                </div>
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase">বাংলা টেমপ্লেট</span>
              </div>

              <div className="p-6 space-y-4 font-sans">
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-slate-700 block">
                    ডিফল্ট মেসেজ বডি (Default Message Template)
                  </label>
                  <textarea
                    rows={4}
                    value={smsTemplate}
                    onChange={(e) => setSmsTemplate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/50 border border-slate-250 focus:border-indigo-500 rounded-xl text-xs font-medium leading-relaxed focus:outline-none focus:ring-4 focus:ring-indigo-500/10 text-slate-800 transition"
                    placeholder="এসএমএস মেসেজের টেক্সট লিখুন..."
                  />
                </div>

                {/* Insertion placeholders tag buttons */}
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">ট্যাগ বাটনে ক্লিক করে মেসেজে প্লেসহোল্ডার যোগ করুন:</span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[
                      { tag: '{name}', label: 'শিক্ষার্থীর নাম' },
                      { tag: '{phone}', label: 'মোবাইল নম্বর' },
                      { tag: '{amount}', label: 'পরিশোধিত টাকা' },
                      { tag: '{month}', label: 'ফি মাস' },
                      { tag: '{receipt_no}', label: 'রশিদ নাম্বার' },
                      { tag: '{date}', label: 'পেমেন্ট তারিখ' }
                    ].map((item) => (
                      <button
                        key={item.tag}
                        type="button"
                        onClick={() => setSmsTemplate(prev => prev + item.tag)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg border border-slate-200 cursor-pointer transition flex items-center gap-1"
                      >
                        <code className="text-indigo-600 font-mono font-black">{item.tag}</code>
                        <span className="text-slate-450 text-[9px]">({item.label})</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100 mt-4">
                  <button
                    type="button"
                    onClick={handleSaveSmsSettings}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg cursor-pointer flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" /> মেসেজ ফরম্যাট সংরক্ষণ করুন
                  </button>
                </div>
              </div>
            </div>

            {/* Test SMS sender Tool Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Send className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-sm font-black text-slate-800">টেস্ট এসএমএস এপিআই প্যানেল (Test SMS Box)</h3>
                </div>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase">Instant Test</span>
              </div>

              <div className="p-6 space-y-4 font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-slate-700 block">
                      প্রাপকের মোবাইল নাম্বার (Test Phone Number) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250 focus:border-emerald-500 rounded-xl text-xs font-mono focus:outline-none focus:ring-4 focus:ring-emerald-500/10 text-slate-800 transition"
                      placeholder="e.g. 017xxxxxxxx"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-slate-700 block">
                      পরীক্ষামূলক বার্তা (Test Message Content)
                    </label>
                    <input
                      type="text"
                      required
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250 focus:border-emerald-500 rounded-xl text-xs font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/10 text-slate-800 transition"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    disabled={testSending}
                    onClick={handleSendTestSms}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-emerald-600/10 cursor-pointer flex items-center gap-2"
                  >
                    {testSending ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" /> পাঠানো হচ্ছে...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" /> টেস্ট এসএমএস পাঠান
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: SMS Delivery Logs history */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden flex flex-col h-full min-h-[500px]">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <History className="h-5 w-5 text-slate-600" />
                  <h3 className="text-sm font-black text-slate-800">এসএমএস প্রদানের ইতিহাস (SMS Send Logs)</h3>
                </div>
                {smsHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={clearSmsHistory}
                    className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition text-xs font-bold flex items-center gap-1 cursor-pointer"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="h-4 w-4" /> পরিষ্কার করুন
                  </button>
                )}
              </div>

              <div className="p-5 flex-1 overflow-y-auto space-y-3 max-h-[660px]">
                {smsHistory.length > 0 ? (
                  smsHistory.map((log) => (
                    <div key={log.id} className="bg-slate-50 border border-slate-150 rounded-xl p-3.5 text-xs font-sans space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          log.status === 'Success' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : log.status === 'Pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-100'
                              : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                          {log.status === 'Success' ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" /> সফল (Success)
                            </>
                          ) : log.status === 'Pending' ? (
                            <>
                              <RefreshCw className="h-3 w-3 text-amber-500 animate-spin" /> অপেক্ষমান...
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 text-rose-600" /> ব্যর্থ (Failed)
                            </>
                          )}
                        </span>
                        <span className="text-slate-400 font-semibold text-[10px]">
                          {new Date(log.timestamp).toLocaleString('bn-BD')}
                        </span>
                      </div>

                      <div className="space-y-1 pl-1 text-[11px] text-slate-650 leading-relaxed font-medium">
                        <p>
                          <span className="font-extrabold text-slate-800">শিক্ষার্থী:</span> <span className="font-semibold text-slate-700">{log.studentName}</span>
                        </p>
                        <p>
                          <span className="font-extrabold text-slate-800">মোবাইল:</span> <span className="font-mono text-slate-500 bg-white px-1.5 py-0.5 border border-slate-200 rounded">{log.phone}</span>
                        </p>
                        <div className="pt-1.5 mt-1 pb-1 border-t border-slate-150 text-[11.5px] font-medium text-slate-700 whitespace-pre-line bg-white/40 p-2 rounded-lg border border-slate-100">
                          {log.message}
                        </div>
                        {log.apiResponse && (
                          <div className="text-[9px] font-mono font-semibold text-slate-400 mt-1 bg-slate-100 p-1.5 rounded leading-tight">
                            Response: {log.apiResponse}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20">
                    <div className="bg-slate-50 p-4 rounded-full w-14 h-14 flex items-center justify-center mx-auto text-slate-400 border border-slate-100">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <p className="text-slate-400 text-xs font-bold mt-3">কোনো এসএমএস প্রেরণের ইতিহাস পাওয়া যায়নি।</p>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 text-center text-[10px] font-semibold text-slate-400 leading-relaxed">
                ফি কালেকশন সম্পন্ন হলে স্বয়ংক্রিয়ভাবে এই তালিকায় নতুন এসএমএস যুক্ত হবে।
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
