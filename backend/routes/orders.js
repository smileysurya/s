const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const dbFallback = require('../utils/dbFallback');

const fallbackOrders = dbFallback('orders');

// Get User Orders
router.get('/', auth, async (req, res) => {
    try {
        let orders;
        if (req.isMongoConnected) {
            orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
        } else {
            orders = await fallbackOrders.find({ user: req.user.id });
        }
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create an Order
router.post('/', auth, async (req, res) => {
    try {
        const { items, totalAmount } = req.body;

        const orderData = {
            user: req.user.id,
            items,
            totalAmount
        };

        let order;
        if (req.isMongoConnected) {
            const newOrder = new Order(orderData);
            order = await newOrder.save();
        } else {
            order = await fallbackOrders.save(orderData);
        }
        res.json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
