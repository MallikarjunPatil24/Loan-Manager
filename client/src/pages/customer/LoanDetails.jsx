import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { 
  ArrowLeft, 
  Calendar, 
  CreditCard, 
  Info, 
  HelpCircle,
  FileText,
  BadgeAlert
} from 'lucide-react';
import toast from 'react-hot-toast';

const LoanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [loanRes, paymentsRes] = await Promise.all([
          apiClient.get(`/loans/${id}`),
          apiClient.get(`/payments/loan/${id}`).catch(() => ({ data: { payments: [] } }))
        ]);
        
        setLoan(loanRes.data.loan);
        setPayments(paymentsRes.data.payments || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load loan details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="p-16 text-center">
        <span className="inline-block animate-spin h-8 w-8 border-4 border-brand-navy border-t-transparent rounded-full"></span>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="bg-white p-8 text-center rounded-xl border border-slate-200 shadow-sm">
        <p className="text-slate-500 font-medium">Loan not found.</p>
        <button onClick={() => navigate('/customer/loans')} className="mt-4 text-xs font-semibold text-brand-navy">
          Back to list
        </button>
      </div>
    );
  }

  // Generate EMI Schedule based on tenure & payments
  const generateEmiSchedule = () => {
    if (!loan.start_date || !loan.emi_amount) return [];
    
    const schedule = [];
    const startDate = new Date(loan.start_date);
    const paidMonths = new Set(payments.map(p => p.emi_month));
    const today = new Date();

    for (let i = 1; i <= loan.tenure_months; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(startDate.getMonth() + i);

      let status = 'pending';
      if (paidMonths.has(i)) {
        status = 'paid';
      } else if (dueDate < today) {
        status = 'overdue';
      }

      schedule.push({
        month: i,
        dueDate,
        amount: parseFloat(loan.emi_amount),
        status
      });
    }

    return schedule;
  };

  const schedule = generateEmiSchedule();

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      rejected: 'bg-rose-50 text-rose-700 border-rose-200',
      active: 'bg-sky-50 text-sky-700 border-sky-200',
      closed: 'bg-slate-100 text-slate-700 border-slate-200',
      paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      overdue: 'bg-rose-50 text-rose-700 border-rose-200'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status] || styles.pending} capitalize`}>
        {status}
      </span>
    );
  };

  const getTimelineSteps = (status) => {
    if (status === 'rejected') {
      return [
        { label: 'Applied', completed: true, active: false },
        { label: 'Under Review', completed: true, active: false },
        { label: 'Rejected', completed: false, active: true, error: true }
      ];
    }

    const allSteps = [
      { label: 'Applied', statusKey: 'applied' },
      { label: 'Under Review', statusKey: 'pending' },
      { label: 'Approved', statusKey: 'approved' },
      { label: 'Active', statusKey: 'active' },
      { label: 'Closed', statusKey: 'closed' }
    ];

    let currentStepIndex = 0;
    if (status === 'pending') currentStepIndex = 1;
    else if (status === 'active') currentStepIndex = 3;
    else if (status === 'closed') currentStepIndex = 4;

    return allSteps.map((step, idx) => ({
      label: step.label,
      completed: idx < currentStepIndex,
      active: idx === currentStepIndex,
      error: false
    }));
  };

  const timelineSteps = getTimelineSteps(loan.status);
  const hasOverdueEmis = schedule.some(item => item.status === 'overdue');

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/customer/loans')}
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-brand-navy font-display">Loan Application Details</h2>
          <p className="text-xs text-slate-500">ID: #UN-{loan.id} &bull; Check status, payment schedule, and logged logs.</p>
        </div>
      </div>

      {hasOverdueEmis && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex items-center space-x-3 shadow-sm">
          <BadgeAlert className="h-5 w-5 text-red-600 flex-shrink-0 animate-pulse" />
          <div>
            <p className="text-xs font-bold">Overdue Installments Flagged</p>
            <p className="text-[10px] text-red-600 font-medium">You have outstanding monthly payments past their due date. Please contact the branch to record repayments.</p>
          </div>
        </div>
      )}

      {/* Visual Status Step Tracker */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-bold text-[10px] uppercase tracking-wider text-slate-400 mb-6 font-display">Loan status timeline</h3>
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 relative">
          <div className="absolute top-1/2 left-6 right-6 h-0.5 bg-slate-100 -translate-y-1/2 hidden md:block z-0"></div>
          
          {timelineSteps.map((step, idx) => {
            let circleColor = 'bg-white border-slate-200 text-slate-400';
            let textColor = 'text-slate-400';
            
            if (step.completed) {
              circleColor = 'bg-brand-navy border-brand-navy text-white z-10';
              textColor = 'text-slate-800 font-semibold';
            } else if (step.active) {
              if (step.error) {
                circleColor = 'bg-red-500 border-red-500 text-white z-10';
                textColor = 'text-red-600 font-bold';
              } else {
                circleColor = 'bg-brand-gold border-brand-gold text-slate-950 z-10';
                textColor = 'text-brand-navy font-bold';
              }
            }

            return (
              <div key={idx} className="flex flex-row md:flex-col items-center space-x-3 md:space-x-0 md:space-y-2 z-10 w-full md:w-auto">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-display text-xs shadow-sm font-semibold transition-all ${circleColor}`}>
                  {idx + 1}
                </div>
                <span className={`text-[11px] ${textColor}`}>{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Loan Info Detail Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 font-display text-lg">Agreement Overview</h3>
              {getStatusBadge(loan.status)}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Loan Type</span>
                <span className="text-sm font-bold text-slate-800 capitalize">{loan.loan_type}</span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Requested Amount</span>
                <span className="text-sm font-bold text-slate-900">₹{parseFloat(loan.amount).toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Tenure Duration</span>
                <span className="text-sm font-bold text-slate-800">{loan.tenure_months} Months</span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Interest Rate</span>
                <span className="text-sm font-bold text-slate-800">{loan.interest_rate}% p.a.</span>
              </div>
              {loan.emi_amount && (
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Monthly EMI</span>
                  <span className="text-sm font-bold text-brand-navy">₹{parseFloat(loan.emi_amount).toLocaleString('en-IN')}</span>
                </div>
              )}
              {loan.start_date && (
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Activation Date</span>
                  <span className="text-sm font-bold text-slate-800">{new Date(loan.start_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Purpose of Loan</span>
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg leading-relaxed border border-slate-100">{loan.purpose || 'No purpose listed.'}</p>
            </div>

            {loan.manager_note && (
              <div className="border-t border-slate-100 pt-4 space-y-2">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Manager Review Remarks</span>
                <p className="text-xs text-slate-700 bg-amber-50/50 p-3 rounded-lg border border-amber-100 leading-relaxed italic">
                  "{loan.manager_note}"
                </p>
              </div>
            )}
          </div>

          {/* EMI Schedule Table */}
          {loan.status !== 'pending' && loan.status !== 'rejected' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-200 bg-slate-50/50">
                <h4 className="font-bold text-slate-900 font-display">Repayment Schedule Plan</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Installment</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Due Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Emi Amount</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {schedule.map((row) => (
                      <tr key={row.month} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700">Month {row.month}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {row.dueDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                          ₹{row.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{getStatusBadge(row.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right side payment logs */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h4 className="font-bold text-slate-900 font-display border-b border-slate-100 pb-3 flex items-center">
              <CreditCard className="h-4 w-4 mr-2 text-brand-navy" />
              Logged Transactions
            </h4>

            {payments.length === 0 ? (
              <div className="text-center py-6 text-slate-400 space-y-2">
                <Info className="h-8 w-8 mx-auto opacity-70" />
                <p className="text-xs">No repayment transactions found.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {payments.map((p) => (
                  <div key={p.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-600">EMI Month {p.emi_month}</span>
                      <span className="text-slate-900">₹{parseFloat(p.amount_paid).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Paid on: {new Date(p.payment_date).toLocaleDateString()}</span>
                      <span className="italic">Ref: #{p.id}</span>
                    </div>
                    {p.notes && (
                      <div className="text-[10px] text-slate-500 border-t border-slate-100 pt-1 mt-1 font-medium">
                        Note: {p.notes}
                      </div>
                    )}
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

export default LoanDetails;
