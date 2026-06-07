import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import toast from 'react-hot-toast';
import { ShieldCheck, Mail, Lock, KeyRound, ArrowLeft, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1 = input email, 2 = verify code & reset
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/auth/forgot-password', { email });
      toast.success(res.data.message, { duration: 6000 });
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to dispatch verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!code || !newPassword || !confirmPassword) {
      toast.error('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/auth/reset-password', {
        email,
        code,
        new_password: newPassword
      });
      toast.success(res.data.message || 'Password successfully updated.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-navy rounded-full blur-[120px] opacity-40"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-teal-900 rounded-full blur-[120px] opacity-30"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center items-center space-x-3 text-brand-gold">
          <svg className="h-10 w-10" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M64 8L112 28V68C112 96 92 116 64 124C36 116 16 68 16 68V28L64 8Z" fill="#1A2B4A" stroke="#D4A017" strokeWidth="6"/>
            <path d="M40 90V65C40 63.8954 40.8954 63 42 63H52C53.1046 63 54 63.8954 54 65V90" stroke="#F8FAFC" strokeWidth="4" strokeLinecap="round"/>
            <path d="M60 90V45C60 43.8954 60.8954 43 62 43H72C73.1046 43 74 43.8954 74 45V90" stroke="#F8FAFC" strokeWidth="4" strokeLinecap="round"/>
            <path d="M80 90V25C80 23.8954 80.8954 23 82 23H92C93.1046 23 94 23.8954 94 25V90" stroke="#D4A017" strokeWidth="4" strokeLinecap="round"/>
          </svg>
          <span className="text-2xl font-bold tracking-tight text-white font-display">Unnati Loan Services</span>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white font-display">
          Reset password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Securely recover access to your online banking portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        <div className="bg-slate-900 py-8 px-6 shadow-2xl rounded-2xl border border-slate-800 sm:px-10 space-y-6">
          
          {step === 1 ? (
            <form className="space-y-6" onSubmit={handleRequestCode}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                  Enter Registered Email Address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent sm:text-sm"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-slate-950 bg-brand-gold hover:bg-brand-goldLight focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold disabled:opacity-50 transition-all"
                >
                  {loading ? (
                    <span className="inline-block animate-spin mr-2 h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full"></span>
                  ) : null}
                  Send Verification Code
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={handleResetPassword}>
              <div className="bg-emerald-950/40 border border-emerald-900/60 rounded-lg p-3 text-xs text-emerald-400 flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-emerald-500 flex-shrink-0" />
                <p>
                  Verification code dispatched to your email! (Local dev warning: <strong>Check your backend server console logs</strong> to copy the 6-digit code).
                </p>
              </div>

              <div>
                <label htmlFor="code" className="block text-sm font-medium text-slate-300">
                  Verification Code
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    id="code"
                    type="text"
                    required
                    maxLength="6"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent sm:text-sm"
                    placeholder="123456"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-slate-300">
                  New Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    id="newPassword"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300">
                  Confirm Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-slate-950 bg-brand-gold hover:bg-brand-goldLight focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold disabled:opacity-50 transition-all"
                >
                  {loading ? (
                    <span className="inline-block animate-spin mr-2 h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full"></span>
                  ) : null}
                  Reset Password
                </button>
              </div>
            </form>
          )}

          <div className="flex justify-between items-center text-xs border-t border-slate-800 pt-5 mt-4">
            <Link to="/login" className="text-slate-400 hover:text-white flex items-center transition-colors">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Sign In
            </Link>
            <span className="text-slate-600">Unnati Protection Shield</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
