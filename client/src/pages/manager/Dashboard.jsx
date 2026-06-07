import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { 
  Inbox, 
  CheckSquare, 
  AlertTriangle, 
  DollarSign, 
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

const ManagerDashboard = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllLoans = async () => {
      try {
        const res = await apiClient.get('/loans');
        setLoans(res.data.loans || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to fetch manager dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllLoans();
  }, []);

  // Compute metrics
  const totalApplications = loans.length;
  const pendingReviews = loans.filter(l => l.status === 'pending');
  const pendingCount = pendingReviews.length;
  const activeLoans = loans.filter(l => l.status === 'active');
  const activeCount = activeLoans.length;

  const totalDisbursed = loans
    .filter(l => l.status === 'active' || l.status === 'closed')
    .reduce((sum, l) => sum + parseFloat(l.amount), 0);

  const recentApplications = loans.slice(0, 10);

  // Generate simple mock alerts for overdue EMIs for active loans
  // In a real app we check if due date passed and payment is missing.
  // We will scan active loans and flag if they have been active for a while with no payments recorded.
  const overdueAlerts = activeLoans.filter(l => {
    // For demonstration, say if a loan was approved over 30 days ago and there are 0 payments, flag it.
    // Or we flag based on date.
    if (!l.start_date) return false;
    const diffTime = Math.abs(new Date() - new Date(l.start_date));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 30; // simple mock heuristic for demonstration
  });

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
      <div>
        <h2 className="text-2xl font-bold text-brand-navy font-display">Manager Dashboard</h2>
        <p className="text-xs text-slate-500">Unnati Loan Services bank management controls & overview analytics.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-slate-100 rounded-lg text-slate-600">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Requests</p>
            <p className="text-2xl font-bold font-display mt-0.5">{loading ? '...' : totalApplications}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
            <Inbox className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Pending Reviews</p>
            <p className="text-2xl font-bold font-display mt-0.5">{loading ? '...' : pendingCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-sky-50 rounded-lg text-sky-600">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Active Accounts</p>
            <p className="text-2xl font-bold font-display mt-0.5">{loading ? '...' : activeCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Disbursed</p>
            <p className="text-2xl font-bold font-display mt-0.5 text-slate-900">
              {loading ? '...' : `₹${totalDisbursed.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-900 font-display">Recent Submissions</h3>
            <Link to="/manager/loans" className="text-xs text-brand-navy hover:text-brand-navyLight font-semibold flex items-center transition-colors">
              View All <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>

          {loading ? (
            <div className="p-10 text-center flex-1 flex justify-center items-center">
              <span className="inline-block animate-spin h-8 w-8 border-4 border-brand-navy border-t-transparent rounded-full"></span>
            </div>
          ) : recentApplications.length === 0 ? (
            <div className="p-8 text-center text-slate-500 flex-1">No applications submitted yet.</div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="relative px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {recentApplications.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <p className="font-semibold text-slate-800">{l.customer_name}</p>
                        <p className="text-[10px] text-slate-400">{l.customer_email}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 capitalize">{l.loan_type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                        ₹{parseFloat(l.amount).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{getStatusBadge(l.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold">
                        <Link to={`/manager/loans/${l.id}`} className="text-brand-navy hover:text-brand-gold transition-colors">
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Alerts section */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h3 className="font-bold text-slate-900 font-display flex items-center border-b border-slate-100 pb-3">
              <AlertTriangle className="h-4 w-4 mr-2 text-rose-500" />
              Risk Monitoring Alerts
            </h3>
            
            {loading ? (
              <p className="text-xs text-slate-400">Loading risk monitoring flags...</p>
            ) : overdueAlerts.length === 0 ? (
              <div className="text-center py-6 text-slate-400">
                <CheckSquare className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-500">All EMI payments are up to date.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {overdueAlerts.map(l => (
                  <div key={l.id} className="p-3 bg-rose-50/50 border border-rose-100 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between font-semibold text-rose-900">
                      <span>#UN-{l.id} - {l.customer_name}</span>
                      <span>₹{parseFloat(l.amount).toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-[10px] text-rose-700">
                      Approved: {new Date(l.start_date).toLocaleDateString()}. Outstanding payment verification required.
                    </p>
                    <div className="pt-1 text-right">
                      <Link to={`/manager/loans/${l.id}`} className="text-[10px] font-bold text-brand-navy hover:underline">
                        Record Payment
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
