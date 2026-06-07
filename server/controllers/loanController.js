const db = require('../config/db');

// Helper function to calculate EMI (Reducing Balance Method)
function calculateEMI(principal, annualRate, tenureMonths) {
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return principal / tenureMonths;
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  return parseFloat(emi.toFixed(2));
}

// Interest rates default based on type
const DEFAULT_INTEREST_RATES = {
  personal: 12.50,
  home: 8.75,
  auto: 9.50,
  business: 14.00,
  education: 7.50,
  gold: 9.00,
  agricultural: 6.50,
  medical: 11.00
};

// POST /api/loans/apply
exports.applyLoan = async (req, res) => {
  try {
    const { loan_type, amount, tenure_months, purpose } = req.body;
    const customer_id = req.user.id;

    if (!loan_type || !amount || !tenure_months) {
      return res.status(400).json({ error: 'Loan type, amount, and tenure are required.' });
    }

    const typeLower = loan_type.toLowerCase();
    const interest_rate = DEFAULT_INTEREST_RATES[typeLower] || 10.00;

    const result = await db.query(
      `INSERT INTO loans (customer_id, loan_type, amount, tenure_months, interest_rate, purpose, status) 
       VALUES ($1, $2, $3, $4, $5, $6, 'pending') 
       RETURNING *`,
      [customer_id, loan_type, amount, tenure_months, interest_rate, purpose]
    );

    return res.status(201).json({
      message: 'Loan application submitted successfully.',
      loan: result.rows[0]
    });
  } catch (error) {
    console.error('Apply loan error:', error);
    return res.status(500).json({ error: 'Server error.' });
  }
};

// GET /api/loans/my
exports.getMyLoans = async (req, res) => {
  try {
    const customer_id = req.user.id;
    const result = await db.query(
      'SELECT * FROM loans WHERE customer_id = $1 ORDER BY created_at DESC',
      [customer_id]
    );
    return res.status(200).json({ loans: result.rows });
  } catch (error) {
    console.error('Get my loans error:', error);
    return res.status(500).json({ error: 'Server error.' });
  }
};

// GET /api/loans
// Access: Bank Manager
exports.getAllLoans = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT l.*, u.full_name AS customer_name, u.email AS customer_email, u.phone AS customer_phone 
       FROM loans l
       JOIN users u ON l.customer_id = u.id
       ORDER BY l.created_at DESC`
    );
    return res.status(200).json({ loans: result.rows });
  } catch (error) {
    console.error('Get all loans error:', error);
    return res.status(500).json({ error: 'Server error.' });
  }
};

// GET /api/loans/:id
exports.getLoanById = async (req, res) => {
  try {
    const { id } = req.params;
    const queryStr = `
      SELECT l.*, u.full_name AS customer_name, u.email AS customer_email, u.phone AS customer_phone 
      FROM loans l
      JOIN users u ON l.customer_id = u.id
      WHERE l.id = $1
    `;
    const result = await db.query(queryStr, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Loan not found.' });
    }

    const loan = result.rows[0];

    // Authorization: customer can only see their own loans, bank manager can see any
    if (req.user.role === 'customer' && loan.customer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    return res.status(200).json({ loan });
  } catch (error) {
    console.error('Get loan by ID error:', error);
    return res.status(500).json({ error: 'Server error.' });
  }
};

// PATCH /api/loans/:id/approve
// Access: Bank Manager
exports.approveLoan = async (req, res) => {
  try {
    const { id } = req.params;
    const { manager_note } = req.body;
    const manager_id = req.user.id;

    // Fetch the loan first
    const loanResult = await db.query('SELECT * FROM loans WHERE id = $1', [id]);
    if (loanResult.rows.length === 0) {
      return res.status(404).json({ error: 'Loan not found.' });
    }

    const loan = loanResult.rows[0];
    if (loan.status !== 'pending') {
      return res.status(400).json({ error: 'Loan is not in pending status.' });
    }

    // Calculate EMI amount
    const emi_amount = calculateEMI(parseFloat(loan.amount), parseFloat(loan.interest_rate), parseInt(loan.tenure_months));

    // Update loan status to 'active', set EMI, start_date = today, end_date = today + tenure_months, and reviewer info
    const updateResult = await db.query(
      `UPDATE loans 
       SET status = 'active', 
           emi_amount = $1, 
           start_date = CURRENT_DATE, 
           end_date = CURRENT_DATE + ($2 || ' months')::INTERVAL,
           manager_note = $3,
           reviewed_by = $4,
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [emi_amount, loan.tenure_months, manager_note || 'Approved by Manager', manager_id, id]
    );

    return res.status(200).json({
      message: 'Loan approved and set active.',
      loan: updateResult.rows[0]
    });
  } catch (error) {
    console.error('Approve loan error:', error);
    return res.status(500).json({ error: 'Server error.' });
  }
};

// PATCH /api/loans/:id/reject
// Access: Bank Manager
exports.rejectLoan = async (req, res) => {
  try {
    const { id } = req.params;
    const { manager_note } = req.body;
    const manager_id = req.user.id;

    if (!manager_note) {
      return res.status(400).json({ error: 'Rejection reason note is required.' });
    }

    // Fetch loan
    const loanResult = await db.query('SELECT * FROM loans WHERE id = $1', [id]);
    if (loanResult.rows.length === 0) {
      return res.status(404).json({ error: 'Loan not found.' });
    }

    const loan = loanResult.rows[0];
    if (loan.status !== 'pending') {
      return res.status(400).json({ error: 'Loan is not in pending status.' });
    }

    const updateResult = await db.query(
      `UPDATE loans 
       SET status = 'rejected', 
           manager_note = $1,
           reviewed_by = $2,
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [manager_note, manager_id, id]
    );

    return res.status(200).json({
      message: 'Loan rejected successfully.',
      loan: updateResult.rows[0]
    });
  } catch (error) {
    console.error('Reject loan error:', error);
    return res.status(500).json({ error: 'Server error.' });
  }
};
