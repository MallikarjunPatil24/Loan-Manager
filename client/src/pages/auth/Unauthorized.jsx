import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoBack = () => {
    if (!user) {
      navigate('/login');
    } else if (user.role === 'bank_manager') {
      navigate('/manager/dashboard');
    } else {
      navigate('/customer/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] bg-red-950 rounded-full blur-[100px] opacity-30"></div>

      <div className="text-center max-w-md z-10">
        <ShieldAlert className="h-20 w-20 text-red-500 mx-auto mb-6 animate-bounce" />
        <h1 className="text-4xl font-extrabold text-white font-display tracking-tight mb-2">Access Denied</h1>
        <p className="text-slate-400 text-base mb-8">
          You do not have permission to view this page. Restricted to authorized roles.
        </p>
        <button
          onClick={handleGoBack}
          className="inline-flex items-center justify-center px-6 py-3 border border-slate-800 rounded-lg text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-gold transition-all"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
