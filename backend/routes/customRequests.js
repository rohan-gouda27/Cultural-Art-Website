const express = require('express');
const customRequestController = require('../controllers/customRequestController');
const { protect, role } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');

const router = express.Router();

router.use(protect);
router.post('/', uploadMultiple, customRequestController.createRequest);
router.get('/my', customRequestController.getMyRequests);
router.get('/artist', role('artist'), customRequestController.getArtistRequests);
router.get('/:id', customRequestController.getRequestById);
router.post('/:id/accept', role('artist'), customRequestController.acceptRequest);
router.post('/:id/reject', role('artist'), customRequestController.rejectRequest);
router.put('/:id/status', role('artist'), customRequestController.updateRequestStatus);

module.exports = router;
