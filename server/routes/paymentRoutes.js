const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

router.post('/record', authenticateToken, requireRole('bank_manager'), paymentController.recordPayment);
router.get('/loan/:loanId', authenticateToken, paymentController.getPaymentsByLoanId);

module.exports = router;
