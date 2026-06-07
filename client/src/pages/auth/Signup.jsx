import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import toast from 'react-hot-toast';
import { ShieldCheck, User, Mail, Phone, Lock, UserCheck } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer'
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { full_name, email, phone, password, role } = formData;
    if (!full_name || !email || !password) {
      toast.error('Name, email, and password are required.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/auth/signup', {
        full_name,
        email,
        phone,
        password,
        role
      });
      const { user, token } = response.data;
      
      login(user, token);
      toast.success(`Welcome to Unnati Loan Services, ${user.full_name}!`);
      
      if (user.role === 'bank_manager') {
        navigate('/manager/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (error) {
      const msg = error.response?.data?.error || 'Registration failed. Please check details.';
      toast.error(msg);
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
          Create a new account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Or{' '}
          <Link to="/login" className="font-medium text-brand-gold hover:text-brand-goldLight transition-colors">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        <div className="bg-slate-900 py-8 px-6 shadow-2xl rounded-2xl border border-slate-800 sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-slate-300">
                Full Name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent sm:text-sm"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent sm:text-sm"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-300">
                Phone Number (Optional)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  value={formData.phone}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent sm:text-sm"
                  placeholder="e.g. +91 9876543210"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-300">
                I am a...
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCheck className="h-5 w-5 text-slate-500" />
                </div>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent sm:text-sm"
                >
                  <option value="customer" className="bg-slate-900 text-slate-100">Customer</option>
                  <option value="bank_manager" className="bg-slate-900 text-slate-100">Bank Manager</option>
                </select>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-slate-950 bg-brand-gold hover:bg-brand-goldLight focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <span className="inline-block animate-spin mr-2 h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full"></span>
                ) : null}
                Sign Up
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
            Empowering Growth, One Loan at a Time
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
