const db = require('../config/db');

// POST /api/payments/record
// Access: Bank Manager
exports.recordPayment = async (req, res) => {
  try {
    const { loan_id, amount_paid, emi_month, notes, payment_date } = req.body;
    const manager_id = req.user.id;

    if (!loan_id || !amount_paid || !emi_month) {
      return res.status(400).json({ error: 'Loan ID, amount paid, and EMI month number are required.' });
    }

    // Check if loan exists
    const loanResult = await db.query('SELECT * FROM loans WHERE id = $1', [loan_id]);
    if (loanResult.rows.length === 0) {
      return res.status(404).json({ error: 'Loan not found.' });
    }

    const loan = loanResult.rows[0];
    if (loan.status !== 'active') {
      return res.status(400).json({ error: 'Payments can only be recorded for active loans.' });
    }

    // Insert payment
    const payDate = payment_date || new Date().toISOString().split('T')[0];
    const result = await db.query(
      `INSERT INTO payments (loan_id, amount_paid, emi_month, payment_date, status, recorded_by, notes) 
       VALUES ($1, $2, $3, $4, 'paid', $5, $6) 
       RETURNING *`,
      [loan_id, amount_paid, emi_month, payDate, manager_id, notes]
    );

    const newPayment = result.rows[0];

    // Auto close loan if all EMIs are paid
    // e.g. if the emi_month reaches or exceeds the tenure_months
    if (parseInt(emi_month) >= parseInt(loan.tenure_months)) {
      await db.query(
        "UPDATE loans SET status = 'closed', updated_at = NOW() WHERE id = $1",
        [loan_id]
      );
    }

    return res.status(201).json({
      message: 'Payment recorded successfully.',
      payment: newPayment
    });
  } catch (error) {
    console.error('Record payment error:', error);
    return res.status(500).json({ error: 'Server error.' });
  }
};

// GET /api/payments/loan/:loanId
// Access: Both (Customer can only see their own loan's payments)
exports.getPaymentsByLoanId = async (req, res) => {
  try {
    const { loanId } = req.params;

    // Check if loan exists
    const loanResult = await db.query('SELECT customer_id FROM loans WHERE id = $1', [loanId]);
    if (loanResult.rows.length === 0) {
      return res.status(404).json({ error: 'Loan not found.' });
    }

    const loan = loanResult.rows[0];

    // Authorization guard
    if (req.user.role === 'customer' && loan.customer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Fetch payments
    const paymentsResult = await db.query(
      `SELECT p.*, u.full_name AS manager_name 
       FROM payments p
       LEFT JOIN users u ON p.recorded_by = u.id
       WHERE p.loan_id = $1
       ORDER BY p.emi_month ASC`,
      [loanId]
    );

    return res.status(200).json({ payments: paymentsResult.rows });
  } catch (error) {
    console.error('Get payments error:', error);
    return res.status(500).json({ error: 'Server error.' });
  }
};
