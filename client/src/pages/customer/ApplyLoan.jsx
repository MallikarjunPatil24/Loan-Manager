import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import toast from 'react-hot-toast';
import { FilePlus, ShieldQuestion, HelpCircle, ArrowLeft } from 'lucide-react';

const ApplyLoan = () => {
  const [formData, setFormData] = useState({
    loan_type: 'personal',
    amount: '',
    tenure_months: '12',
    purpose: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const interestRates = {
    personal: '12.50% p.a.',
    home: '8.75% p.a.',
    auto: '9.50% p.a.',
    business: '14.00% p.a.',
    education: '7.50% p.a.',
    gold: '9.00% p.a.',
    agricultural: '6.50% p.a.',
    medical: '11.00% p.a.'
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { loan_type, amount, tenure_months, purpose } = formData;
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid loan amount.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/loans/apply', {
        loan_type,
        amount: parseFloat(amount),
        tenure_months: parseInt(tenure_months),
        purpose
      });
      
      const appID = res.data.loan?.id;
      toast.success(`Application submitted! ID: #UN-${appID}`);
      navigate('/customer/dashboard');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || 'Failed to submit application.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-brand-navy font-display">Apply for a Loan</h2>
          <p className="text-xs text-slate-500">Provide the required information to request loan options.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="loan_type" className="block text-sm font-semibold text-slate-700">
                Loan Category
              </label>
              <select
                id="loan_type"
                name="loan_type"
                value={formData.loan_type}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
              >
                <option value="personal">Personal Loan</option>
                <option value="home">Home Loan</option>
                <option value="auto">Auto Loan</option>
                <option value="business">Business Loan</option>
                <option value="education">Education Loan</option>
                <option value="gold">Gold Loan</option>
                <option value="agricultural">Agricultural Loan</option>
                <option value="medical">Medical Loan</option>
              </select>
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-semibold text-slate-700">
                Requested Amount (INR)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-400 text-sm">₹</span>
                </div>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  required
                  min="5000"
                  step="100"
                  value={formData.amount}
                  onChange={handleChange}
                  className="block w-full pl-8 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                  placeholder="e.g. 200000"
                />
              </div>
            </div>

            <div>
              <label htmlFor="tenure_months" className="block text-sm font-semibold text-slate-700">
                Tenure Duration
              </label>
              <select
                id="tenure_months"
                name="tenure_months"
                value={formData.tenure_months}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
              >
                <option value="6">6 Months</option>
                <option value="12">12 Months</option>
                <option value="24">24 Months</option>
                <option value="36">36 Months</option>
                <option value="48">48 Months</option>
                <option value="60">60 Months</option>
              </select>
            </div>

            <div>
              <label htmlFor="purpose" className="block text-sm font-semibold text-slate-700">
                Statement of Purpose
              </label>
              <textarea
                id="purpose"
                name="purpose"
                rows="4"
                required
                value={formData.purpose}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                placeholder="Briefly explain what the funds will be used for..."
              ></textarea>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-slate-950 bg-brand-gold hover:bg-brand-goldLight focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <span className="inline-block animate-spin mr-2 h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full"></span>
                ) : (
                  <FilePlus className="h-4 w-4 mr-2" />
                )}
                Submit Loan Application
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          {/* Information Card */}
          <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-sm relative overflow-hidden">
            <h3 className="font-bold text-sm uppercase tracking-wider text-brand-gold font-display mb-3">Estimated Interest Rates</h3>
            <div className="space-y-2">
              {Object.entries(interestRates).map(([type, rate]) => (
                <div key={type} className="flex justify-between border-b border-slate-800 pb-2 last:border-0 last:pb-0">
                  <span className="text-xs text-slate-400 capitalize">{type} Loan</span>
                  <span className="text-xs font-semibold text-white">{rate}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[10px] text-slate-500 leading-normal">
              * Rates shown are baseline percentages. Actual rates depend on your final credit assessment during verification by the bank manager.
            </p>
          </div>

          {/* Guidelines */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-2 text-slate-700 font-semibold text-sm mb-3">
              <HelpCircle className="h-4 w-4 text-brand-navy" />
              <span>Next Steps After Submission</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-2.5 list-disc pl-4 leading-relaxed">
              <li>Our bank managers will review details, purpose, and check profile credentials.</li>
              <li>Approval will automatically compute monthly EMIs based on the Reducing Balance Method.</li>
              <li>You can view status (Pending/Approved/Active) live on your dashboard.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyLoan;
