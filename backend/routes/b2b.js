const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');
const RFQ = require('../models/RFQ');
const BulkOrder = require('../models/BulkOrder');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const dbFallback = require('../utils/dbFallback');

const fallbackVendors = dbFallback('vendors');
const fallbackRFQs = dbFallback('rfqs');
const fallbackBulkOrders = dbFallback('bulkorders');
const fallbackTransactions = dbFallback('transactions');

// ======================
// VENDORS
// ======================
router.post('/vendors', auth, async (req, res) => {
    try {
        let vendor;
        if (req.isMongoConnected) {
            const newVendor = new Vendor(req.body);
            vendor = await newVendor.save();
        } else {
            vendor = await fallbackVendors.save(req.body);
        }
        res.json(vendor);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.get('/vendors', auth, async (req, res) => {
    try {
        let vendors;
        if (req.isMongoConnected) {
            vendors = await Vendor.find().sort({ createdAt: -1 });
        } else {
            vendors = await fallbackVendors.find();
        }
        res.json(vendors);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.delete('/vendors/:id', auth, async (req, res) => {
    try {
        if (req.isMongoConnected) {
            const vendor = await Vendor.findByIdAndDelete(req.params.id);
            if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
        } else {
            await fallbackVendors.deleteMany({ _id: req.params.id });
        }
        res.json({ message: 'Vendor deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// ======================
// RFQs
// ======================
router.post('/rfqs', auth, async (req, res) => {
    try {
        let count;
        if (req.isMongoConnected) {
            count = await RFQ.countDocuments();
        } else {
            const rfqs = await fallbackRFQs.find();
            count = rfqs.length;
        }

        const rfqId = `RFQ-${2000 + count}`;
        const company = req.body.company || 'My Company';

        const rfqData = {
            ...req.body,
            rfqId,
            company
        };

        let rfq;
        if (req.isMongoConnected) {
            const newRFQ = new RFQ(rfqData);
            rfq = await newRFQ.save();
        } else {
            rfq = await fallbackRFQs.save(rfqData);
        }
        res.json(rfq);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.get('/rfqs', auth, async (req, res) => {
    try {
        let rfqs;
        if (req.isMongoConnected) {
            rfqs = await RFQ.find().sort({ createdAt: -1 });
        } else {
            rfqs = await fallbackRFQs.find();
        }
        res.json(rfqs);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.put('/rfqs/:id', auth, async (req, res) => {
    try {
        const { status } = req.body;
        let rfq;
        if (req.isMongoConnected) {
            rfq = await RFQ.findByIdAndUpdate(req.params.id, { status }, { new: true });
        } else {
            // Update not implemented in fallback, just return found
            rfq = await fallbackRFQs.findOne({ _id: req.params.id });
            if (rfq) rfq.status = status;
        }
        res.json(rfq);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// ======================
// BULK ORDERS
// ======================
router.get('/bulkorders', auth, async (req, res) => {
    try {
        let orders;
        if (req.isMongoConnected) {
            orders = await BulkOrder.find().sort({ createdAt: -1 });
        } else {
            orders = await fallbackBulkOrders.find();
        }
        res.json(orders);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.post('/bulkorders', auth, async (req, res) => {
    try {
        let count;
        if (req.isMongoConnected) {
            count = await BulkOrder.countDocuments();
        } else {
            const orders = await fallbackBulkOrders.find();
            count = orders.length;
        }

        const orderId = `ORD-${3000 + count}`;
        const orderData = { ...req.body, orderId };

        let order;
        if (req.isMongoConnected) {
            const newBulkOrder = new BulkOrder(orderData);
            order = await newBulkOrder.save();
        } else {
            order = await fallbackBulkOrders.save(orderData);
        }
        res.json(order);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.put('/bulkorders/:id', auth, async (req, res) => {
    try {
        const { status } = req.body;
        let order;
        if (req.isMongoConnected) {
            order = await BulkOrder.findByIdAndUpdate(req.params.id, { status }, { new: true });
        } else {
            order = await fallbackBulkOrders.findOne({ _id: req.params.id });
            if (order) order.status = status;
        }
        res.json(order);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// ======================
// FINANCE (Live Transactions)
// ======================
router.get('/finance', auth, async (req, res) => {
    try {
        let transactions;
        if (req.isMongoConnected) {
            transactions = await Transaction.find().sort({ createdAt: -1 });
        } else {
            transactions = await fallbackTransactions.find();
        }
        res.json(transactions);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.post('/finance/seed', auth, async (req, res) => {
    try {
        if (req.isMongoConnected) {
            await Transaction.deleteMany({});
        } else {
            await fallbackTransactions.deleteMany({});
        }

        const demoTransactions = [
            { type: 'Credit', transactionId: 'PMT-1032', orderId: 'ORD-2025', partyName: 'Global Mart', amount: 35000 },
            { type: 'Credit', transactionId: 'PMT-1031', orderId: 'ORD-2024', partyName: 'Tech Solutions', amount: 65000 },
            { type: 'Credit', transactionId: 'PMT-1030', orderId: 'ORD-2023', partyName: 'Elite Traders', amount: 20500 },
            { type: 'Debit', transactionId: 'TRF-5001', orderId: 'ORD-1011', partyName: 'XYZ Enterprises', amount: 15000 },
            { type: 'Debit', transactionId: 'TRF-5002', orderId: 'ORD-1012', partyName: 'ABC Traders', amount: 25000 }
        ];

        if (req.isMongoConnected) {
            await Transaction.insertMany(demoTransactions);
        } else {
            for (let item of demoTransactions) {
                await fallbackTransactions.save(item);
            }
        }

        const allTransactions = req.isMongoConnected 
            ? await Transaction.find().sort({ createdAt: -1 })
            : await fallbackTransactions.find();

        res.json(allTransactions);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// ======================
// DASHBOARD METRICS
// ======================
router.get('/dashboard', auth, async (req, res) => {
    try {
        let vendors, orders, rfqs, credits;
        if (req.isMongoConnected) {
            vendors = await Vendor.countDocuments();
            orders = await BulkOrder.countDocuments({ status: { $in: ['Processing', 'Shipped', 'Pending'] } });
            rfqs = await RFQ.countDocuments({ status: 'Pending' });
            credits = await Transaction.find({ type: 'Credit' });
        } else {
            vendors = (await fallbackVendors.find()).length;
            orders = (await fallbackBulkOrders.find()).filter(p => ['Processing', 'Shipped', 'Pending'].includes(p.status)).length;
            rfqs = (await fallbackRFQs.find()).filter(p => p.status === 'Pending').length;
            credits = (await fallbackTransactions.find()).filter(p => p.type === 'Credit');
        }

        const liveMonthlyRevenue = credits.reduce((acc, trans) => acc + trans.amount, 0);

        res.json({
            totalVendors: vendors,
            activeOrders: orders,
            pendingRFQs: rfqs,
            monthlyRevenue: liveMonthlyRevenue
        });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
