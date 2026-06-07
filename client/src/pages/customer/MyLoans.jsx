import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { Coins, Search, AlertCircle, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const MyLoans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const res = await apiClient.get('/loans/my');
        setLoans(res.data.loans || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load your loans.');
      } finally {
        setLoading(false);
      }
    };
    fetchLoans();
  }, []);

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      rejected: 'bg-rose-50 text-rose-700 border-rose-200',
      active: 'bg-sky-50 text-sky-700 border-sky-200',
      closed: 'bg-slate-100 text-slate-700 border-slate-200'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status] || styles.pending} capitalize`}>
        {status}
      </span>
    );
  };

  const filteredLoans = loans.filter((loan) => {
    const matchesSearch = 
      loan.id.toString().includes(searchTerm) || 
      loan.loan_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || loan.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-brand-navy font-display">My Loans Portfolio</h2>
        <p className="text-xs text-slate-500">View and track all your loan applications, statuses, and monthly schedules.</p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by ID or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
          />
        </div>

        <div className="flex gap-2 self-start md:self-auto overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['all', 'pending', 'active', 'rejected', 'closed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${
                filterStatus === status
                  ? 'bg-brand-navy text-white border-brand-navy'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center">
          <span className="inline-block animate-spin h-8 w-8 border-4 border-brand-navy border-t-transparent rounded-full"></span>
        </div>
      ) : filteredLoans.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-sm space-y-3">
          <AlertCircle className="h-12 w-12 text-slate-400 mx-auto" />
          <h4 className="font-semibold text-slate-700">No applications match filter criteria</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try resetting your search query or choosing a different status category to locate your portfolio logs.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLoans.map((loan) => (
            <RouterLink
              key={loan.id}
              to={`/customer/loans/${loan.id}`}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all overflow-hidden flex flex-col p-5 space-y-4 cursor-pointer group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Loan ID</span>
                  <h3 className="font-bold text-base text-brand-navy group-hover:text-brand-gold transition-colors font-display">#UN-{loan.id}</h3>
                </div>
                {getStatusBadge(loan.status)}
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-xs">
                <div>
                  <p className="text-slate-400 font-medium">Loan Type</p>
                  <p className="font-semibold text-slate-700 capitalize mt-0.5">{loan.loan_type}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Amount</p>
                  <p className="font-semibold text-slate-900 mt-0.5">₹{parseFloat(loan.amount).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Interest Rate</p>
                  <p className="font-semibold text-slate-700 mt-0.5">{loan.interest_rate}% p.a.</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Tenure</p>
                  <p className="font-semibold text-slate-700 mt-0.5">{loan.tenure_months} months</p>
                </div>
              </div>

              {loan.emi_amount && (
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Monthly EMI</span>
                  <span className="font-bold text-slate-800">₹{parseFloat(loan.emi_amount).toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-100 pt-3 mt-auto">
                <span className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  Applied: {new Date(loan.created_at).toLocaleDateString()}
                </span>
                <span className="text-brand-navy group-hover:translate-x-1 transition-transform font-semibold">
                  View Details &rarr;
                </span>
              </div>
            </RouterLink>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyLoans;
