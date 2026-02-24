const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journal.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Customer routes
router.post('/', protect, authorize('customer'), journalController.createJournal);
router.get('/', protect, authorize('customer'), journalController.getMyJournals);
router.get('/stats', protect, authorize('customer'), journalController.getEmotionStats);
router.get('/:id', protect, journalController.getJournalById);
router.put('/:id', protect, authorize('customer'), journalController.updateJournal);
router.delete('/:id', protect, authorize('customer'), journalController.deleteJournal);
router.put('/:id/share', protect, authorize('customer'), journalController.shareJournal);

// Doctor routes
router.get('/patient/:patientId', protect, authorize('doctor'), journalController.getPatientJournals);

module.exports = router;
