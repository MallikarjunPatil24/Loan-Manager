import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { 
  ArrowLeft, 
  User, 
  ShieldAlert, 
  Coins, 
  Calendar,
  CheckCircle, 
  XCircle, 
  CreditCard, 
  Plus, 
  Info,
  BadgeAlert
} from 'lucide-react';
import toast from 'react-hot-toast';

const LoanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [managerNote, setManagerNote] = useState('');
  const [rejecting, setRejecting] = useState(false);

  // Modal payment state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount_paid: '',
    emi_month: '1',
    payment_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const fetchDetails = async () => {
    try {
      const [loanRes, paymentsRes] = await Promise.all([
        apiClient.get(`/loans/${id}`),
        apiClient.get(`/payments/loan/${id}`).catch(() => ({ data: { payments: [] } }))
      ]);
      setLoan(loanRes.data.loan);
      setPayments(paymentsRes.data.payments || []);
      
      // Auto-suggest next EMI month
      const maxPaidMonth = paymentsRes.data.payments?.reduce((max, p) => Math.max(max, p.emi_month), 0) || 0;
      setPaymentData(prev => ({
        ...prev,
        emi_month: (maxPaidMonth + 1).toString(),
        amount_paid: loanRes.data.loan?.emi_amount || ''
      }));
    } catch (err) {
      console.error(err);
      toast.error('Failed to load loan details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleApprove = async () => {
    try {
      const res = await apiClient.patch(`/loans/${id}/approve`, { manager_note: managerNote || 'Approved by Manager' });
      toast.success(res.data.message || 'Loan approved.');
      fetchDetails();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to approve loan.');
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!managerNote) {
      toast.error('Please specify a rejection reason note.');
      return;
    }

    try {
      const res = await apiClient.patch(`/loans/${id}/reject`, { manager_note: managerNote });
      toast.success(res.data.message || 'Loan rejected.');
      setRejecting(false);
      fetchDetails();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reject loan.');
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    const { amount_paid, emi_month, payment_date, notes } = paymentData;

    if (!amount_paid || parseFloat(amount_paid) <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }

    try {
      const res = await apiClient.post('/payments/record', {
        loan_id: parseInt(id),
        amount_paid: parseFloat(amount_paid),
        emi_month: parseInt(emi_month),
        payment_date,
        notes
      });
      toast.success('Repayment recorded successfully.');
      setShowPaymentModal(false);
      setPaymentData(prev => ({
        ...prev,
        notes: ''
      }));
      fetchDetails();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to record payment.');
    }
  };

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
        <p className="text-slate-500 font-medium">Loan record not found.</p>
        <button onClick={() => navigate('/manager/loans')} className="mt-4 text-xs font-semibold text-brand-navy">
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
          onClick={() => navigate('/manager/loans')}
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-brand-navy font-display">Evaluate Loan Request</h2>
          <p className="text-xs text-slate-500">ID: #UN-{loan.id} &bull; Check user records, calculate terms, approve or log transactions.</p>
        </div>
      </div>

      {hasOverdueEmis && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex items-center space-x-3 shadow-sm">
          <BadgeAlert className="h-5 w-5 text-red-600 flex-shrink-0 animate-pulse" />
          <div>
            <p className="text-xs font-bold">Overdue Installments Flagged</p>
            <p className="text-[10px] text-red-600 font-medium">This active account has outstanding monthly payments past their due date. Please log a repayment log.</p>
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
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 font-display text-lg">Terms & Metrics</h3>
              {getStatusBadge(loan.status)}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Category type</span>
                <span className="text-sm font-bold text-slate-800 capitalize">{loan.loan_type}</span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Funding Requested</span>
                <span className="text-sm font-bold text-slate-900">₹{parseFloat(loan.amount).toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Term Duration</span>
                <span className="text-sm font-bold text-slate-800">{loan.tenure_months} Months</span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Interest Rate</span>
                <span className="text-sm font-bold text-slate-800">{loan.interest_rate}% p.a.</span>
              </div>
              {loan.emi_amount && (
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Calculated EMI</span>
                  <span className="text-sm font-bold text-brand-navy">₹{parseFloat(loan.emi_amount).toLocaleString('en-IN')}</span>
                </div>
              )}
              {loan.start_date && (
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Maturity Date</span>
                  <span className="text-sm font-bold text-slate-800">{new Date(loan.end_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Client Purpose Statement</span>
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg leading-relaxed border border-slate-100">{loan.purpose || 'No purpose listed.'}</p>
            </div>

            {loan.manager_note && (
              <div className="border-t border-slate-100 pt-4 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Decision remarks</span>
                <p className="text-xs text-slate-700 bg-amber-50/50 p-3 rounded-lg border border-amber-100 leading-relaxed italic">
                  "{loan.manager_note}"
                </p>
              </div>
            )}

            {/* Actions for Pending */}
            {loan.status === 'pending' && (
              <div className="border-t border-slate-100 pt-5 space-y-4">
                <h4 className="font-semibold text-sm text-slate-800">Underwriter Evaluation Actions</h4>
                
                {rejecting ? (
                  <form onSubmit={handleReject} className="space-y-3">
                    <label htmlFor="reason" className="block text-xs font-semibold text-slate-600">Rejection Reason (Required)</label>
                    <textarea
                      id="reason"
                      rows="2"
                      required
                      value={managerNote}
                      onChange={(e) => setManagerNote(e.target.value)}
                      placeholder="Specify rejection reason note for client feedback..."
                      className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-gold focus:border-transparent focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        Confirm Rejection
                      </button>
                      <button
                        type="button"
                        onClick={() => { setRejecting(false); setManagerNote(''); }}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col space-y-3">
                    <input
                      type="text"
                      value={managerNote}
                      onChange={(e) => setManagerNote(e.target.value)}
                      placeholder="Approval note (optional)..."
                      className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-gold focus:border-transparent focus:outline-none"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleApprove}
                        className="flex-1 flex justify-center items-center py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow transition-colors"
                      >
                        <CheckCircle className="h-4 w-4 mr-1.5" /> Approve & Activate Loan
                      </button>
                      <button
                        onClick={() => setRejecting(true)}
                        className="flex-1 flex justify-center items-center py-2.5 px-4 bg-slate-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-all"
                      >
                        <XCircle className="h-4 w-4 mr-1.5" /> Reject Request
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions for Active */}
            {loan.status === 'active' && (
              <div className="border-t border-slate-100 pt-4">
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="inline-flex items-center px-4 py-2.5 bg-brand-navy text-white hover:bg-brand-navyLight font-semibold text-xs rounded-lg shadow transition-colors"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Record Repayment
                </button>
              </div>
            )}
          </div>

          {/* EMI Schedule */}
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

        {/* Customer Information Panel & Payment History */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h4 className="font-bold text-slate-900 font-display border-b border-slate-100 pb-3 flex items-center">
              <User className="h-4 w-4 mr-2 text-brand-navy" />
              Client Profile
            </h4>
            
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Full Name</span>
                <span className="font-bold text-slate-800">{loan.customer_name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Email address</span>
                <span className="font-bold text-slate-800">{loan.customer_email}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Phone Number</span>
                <span className="font-bold text-slate-800">{loan.customer_phone || 'Not provided'}</span>
              </div>
            </div>
          </div>

          {/* Payment Logs */}
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

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 font-display text-sm">Record Installment Payment</h3>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">EMI Installment Month</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  max={loan.tenure_months}
                  value={paymentData.emi_month}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, emi_month: e.target.value }))}
                  className="mt-1 block w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Amount Paid (INR)</label>
                <input 
                  type="number" 
                  required
                  step="0.01"
                  value={paymentData.amount_paid}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, amount_paid: e.target.value }))}
                  className="mt-1 block w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Payment Date</label>
                <input 
                  type="date" 
                  required
                  value={paymentData.payment_date}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, payment_date: e.target.value }))}
                  className="mt-1 block w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Transaction Notes</label>
                <textarea 
                  rows="2"
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                  className="mt-1 block w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                  placeholder="e.g. Paid online, cheque clearance..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-brand-navy hover:bg-brand-navyLight text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Record
                </button>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanDetails;
