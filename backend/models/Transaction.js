const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    type: { type: String, enum: ['Credit', 'Debit'], required: true },
    transactionId: { type: String, required: true },
    orderId: { type: String, required: true },
    partyName: { type: String, required: true }, // Client or Vendor name
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
