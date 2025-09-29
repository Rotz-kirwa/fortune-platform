// routes/orders.js
const express = require('express');
const ordersController = require('../controllers/ordersController');
const router = express.Router();

router.get('/', ordersController.getOrders);
router.get('/:id', ordersController.getOrderById);
router.post('/', ordersController.createOrder);
router.put('/:id/status', ordersController.updateOrderStatus);

module.exports = router;
