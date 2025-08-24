const express = require('express');
const router = express.Router();
const {
  processRadiusOrder,
  processSemprisOrder,
  processPSOnlineOrder,
  processSublyticsOrder,
  processMIOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getMyOrders
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

// Base order routes
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

// Project-specific order routes
router.post('/sempris', protect, processSemprisOrder);
router.post('/radius', protect, processRadiusOrder);
router.post('/psonline', protect, processPSOnlineOrder);
router.post('/sublytics', protect, processSublyticsOrder);
router.post('/mi', protect, processMIOrder);

// Admin only routes
router.get('/', protect, authorize('admin'), getOrders);
router.put('/:id', protect, authorize('admin'), updateOrder);
router.delete('/:id', protect, authorize('admin'), deleteOrder);

module.exports = router; 