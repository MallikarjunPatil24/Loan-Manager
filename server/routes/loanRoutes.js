const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

router.post('/apply', authenticateToken, requireRole('customer'), loanController.applyLoan);
router.get('/my', authenticateToken, requireRole('customer'), loanController.getMyLoans);
router.get('/', authenticateToken, requireRole('bank_manager'), loanController.getAllLoans);
router.get('/:id', authenticateToken, loanController.getLoanById);
router.patch('/:id/approve', authenticateToken, requireRole('bank_manager'), loanController.approveLoan);
router.patch('/:id/reject', authenticateToken, requireRole('bank_manager'), loanController.rejectLoan);

module.exports = router;
