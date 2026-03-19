const mongoose = require('mongoose');

const AIProjectSchema = new mongoose.Schema({
    projectName: { type: String, required: true },
    clientName: { type: String, required: true },
    location: { type: String, required: true },
    budget: { type: Number, required: true },
    status: { type: String, enum: ['Planning', 'Ongoing', 'Completed'], default: 'Planning' },
    progress: { type: Number, default: 0 },

    // AI Parsed Data
    imageUrl: { type: String }, // Blueprint image
    renderUrls: [{ type: String }], // AI generated 3D renders

    boq: [{
        item: String,
        quantityStr: String,
        amount: Number
    }],

    materials: [{
        material: String,
        totalStock: Number,
        used: Number,
        unit: String
    }],

    totalExpenses: { type: Number, default: 0 },

    workforce: {
        engineers: { type: Number, default: 0 },
        laborers: { type: Number, default: 0 },
        supervisors: { type: Number, default: 0 },
        estimatedDays: { type: Number, default: 0 }
    }
}, { timestamps: true });

module.exports = mongoose.model('AIProject', AIProjectSchema);
