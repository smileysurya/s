const mongoose = require('mongoose');

const RFQSchema = new mongoose.Schema({
    rfqId: { type: String, required: true },
    company: { type: String, required: true },
    productService: { type: String, required: true },
    quantity: { type: Number, required: true },
    budget: { type: String, required: true },
    deadline: { type: String, required: true },
    status: { type: String, enum: ['Open', 'Quotation Received', 'Pending', 'Closed'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('RFQ', RFQSchema);
