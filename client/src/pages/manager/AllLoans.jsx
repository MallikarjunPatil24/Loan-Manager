import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { Search, AlertCircle, Coins, Calendar, User } from 'lucide-react';
import toast from 'react-hot-toast';

const AllLoans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const res = await apiClient.get('/loans');
        setLoans(res.data.loans || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to retrieve loans database.');
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
      loan.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.loan_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || loan.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-brand-navy font-display">Manage Loan Applications</h2>
        <p className="text-xs text-slate-500">Search database records, perform audit reviews, and log transaction repayments.</p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search customer, ID, or type..."
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
          <h4 className="font-semibold text-slate-700">No applications match criteria</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting filters or typing another keyword name to browse records.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Loan ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer Details</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tenure / Rate</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Applied Date</th>
                  <th scope="col" className="relative px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-brand-navy">#UN-{loan.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2.5">
                        <div className="bg-slate-100 p-1.5 rounded-full text-slate-600">
                          <User className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{loan.customer_name}</p>
                          <p className="text-[10px] text-slate-400">{loan.customer_email} &bull; {loan.customer_phone || 'No phone'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 capitalize">{loan.loan_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                      ₹{parseFloat(loan.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {loan.tenure_months} mo / {loan.interest_rate}% p.a.
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{getStatusBadge(loan.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                      {new Date(loan.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold">
                      <Link
                        to={`/manager/loans/${loan.id}`}
                        className="inline-flex items-center px-3 py-1.5 bg-slate-100 hover:bg-brand-gold hover:text-slate-950 rounded-lg text-slate-700 transition-colors"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllLoans;
