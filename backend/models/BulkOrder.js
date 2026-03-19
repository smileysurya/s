const mongoose = require('mongoose');

const BulkOrderSchema = new mongoose.Schema({
    orderId: { type: String, required: true },
    client: { type: String, required: true },
    quantity: { type: String, required: true },
    orderValue: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Completed'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('BulkOrder', BulkOrderSchema);
