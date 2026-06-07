import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  ArrowRight,
  PlusCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const res = await apiClient.get('/loans/my');
        setLoans(res.data.loans || []);
      } catch (err) {
        console.error('Error fetching dashboard loans', err);
        toast.error('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchLoans();
  }, []);

  // Calculate statistics
  const totalLoansCount = loans.length;
  const activeLoans = loans.filter(l => l.status === 'active');
  const activeLoansCount = activeLoans.length;
  const pendingLoansCount = loans.filter(l => l.status === 'pending').length;
  const totalEmiDue = activeLoans.reduce((sum, l) => sum + parseFloat(l.emi_amount || 0), 0);

  const recentLoans = loans.slice(0, 5);

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

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-navy to-brand-navyLight text-white rounded-2xl p-6 md:p-8 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-brand-gold opacity-10 rounded-full blur-[60px] translate-x-20 -translate-y-20"></div>
        <div className="relative z-10 space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold font-display">Welcome, {user?.full_name}!</h2>
          <p className="text-slate-300 text-sm max-w-xl">
            Track your active plans, apply for new loans, and keep an eye on upcoming EMIs easily. We are committed to your financial growth.
          </p>
          <div className="pt-2">
            <Link
              to="/customer/apply"
              className="inline-flex items-center bg-brand-gold text-slate-950 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-brand-goldLight transition-all shadow-md hover:shadow-lg"
            >
              <PlusCircle className="h-4 w-4 mr-1.5" />
              Apply for Loan
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-slate-100 rounded-lg text-slate-600">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Applications</p>
            <p className="text-2xl font-bold font-display mt-0.5">{loading ? '...' : totalLoansCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-sky-50 rounded-lg text-sky-600">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Active Loans</p>
            <p className="text-2xl font-bold font-display mt-0.5">{loading ? '...' : activeLoansCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Pending Approvals</p>
            <p className="text-2xl font-bold font-display mt-0.5">{loading ? '...' : pendingLoansCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Monthly EMI</p>
            <p className="text-2xl font-bold font-display mt-0.5 text-slate-900">
              {loading ? '...' : `₹${totalEmiDue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </p>
          </div>
        </div>
      </div>

      {/* Main Sections */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-900 font-display">Recent Applications</h3>
          <Link to="/customer/loans" className="text-xs text-brand-navy hover:text-brand-navyLight font-semibold flex items-center transition-colors">
            View All Loans <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </div>

        {loading ? (
          <div className="p-10 text-center">
            <span className="inline-block animate-spin h-8 w-8 border-4 border-brand-navy border-t-transparent rounded-full"></span>
          </div>
        ) : recentLoans.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <AlertCircle className="h-10 w-10 text-slate-400 mx-auto" />
            <h4 className="font-semibold text-slate-700">No loans found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You have not submitted any loan applications yet. Start your journey by clicking "Apply for Loan".
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Loan ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tenure</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Rate</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="relative px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {recentLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-brand-navy">#UN-{loan.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 capitalize">{loan.loan_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                      ₹{parseFloat(loan.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{loan.tenure_months} months</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{loan.interest_rate}% p.a.</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{getStatusBadge(loan.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold">
                      <Link to={`/customer/loans/${loan.id}`} className="text-brand-navy hover:text-brand-gold transition-colors">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
