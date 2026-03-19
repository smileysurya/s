const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const dbFallback = require('../utils/dbFallback');

const fallbackGeneric = dbFallback('generic');

// Define a unified schema for generic modules 
const GenericModuleSchema = new mongoose.Schema({
    moduleType: { type: String, required: true }, // e.g., 'Rental', 'Lease', 'Interior', 'ShopOffice'
    title: { type: String, required: true },
    description: String,
    price: Number,
    status: { type: String, default: 'Available' },
    data: mongoose.Schema.Types.Mixed // Flexible payload for different structures
}, { timestamps: true });

// Prevent mongoose overwrite model error
const GenericItem = mongoose.models.GenericItem || mongoose.model('GenericItem', GenericModuleSchema);

// GET items by module type
router.get('/:moduleType', async (req, res) => {
    try {
        const moduleType = req.params.moduleType.toLowerCase();
        let items;
        if (req.isMongoConnected) {
             items = await GenericItem.find({ moduleType }).sort({ createdAt: -1 });
        } else {
             items = await fallbackGeneric.find({ moduleType });
        }
        res.json(items);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// POST new item
router.post('/:moduleType', async (req, res) => {
    try {
        const moduleType = req.params.moduleType.toLowerCase();
        const payload = {
            moduleType,
            ...req.body
        };

        let savedItem;
        if (req.isMongoConnected) {
            const newItem = new GenericItem(payload);
            savedItem = await newItem.save();
        } else {
            savedItem = await fallbackGeneric.save(payload);
        }
        res.json(savedItem);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Seed data route for quick testing
router.post('/:moduleType/seed', async (req, res) => {
    try {
        const moduleType = req.params.moduleType.toLowerCase();
        
        if (req.isMongoConnected) {
            await GenericItem.deleteMany({ moduleType });
        } else {
            await fallbackGeneric.deleteMany({ moduleType });
        }
        
        const dummyData = [
            { moduleType, title: `Dummy ${moduleType} Item 1`, price: 100, status: 'Active', data: {} },
            { moduleType, title: `Dummy ${moduleType} Item 2`, price: 250, status: 'Pending', data: {} }
        ];

        if (req.isMongoConnected) {
            await GenericItem.insertMany(dummyData);
        } else {
            for (let item of dummyData) {
                await fallbackGeneric.save(item);
            }
        }
        res.json({ message: `${moduleType} seeded successfully.` });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Secure AI route for Manpower Module
const { Groq } = require('groq-sdk');
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

router.post('/ai/analyze-resume', async (req, res) => {
    try {
        if (!groq) return res.status(500).json({ error: { message: 'Groq API Key missing on server.' } });
        
        const { text, jobDescription } = req.body;
        if (!text) return res.status(400).json({ error: { message: 'No resume text provided.' } });

        const promptTemplate = `You are an expert HR Recruitment AI. You analyze resumes and return ONLY a valid JSON object.
Do not output any markdown formatting, no \`\`\`json, just the raw JSON object.
${jobDescription && jobDescription.trim() ?
            `Based on the resume, evaluate how well the candidate matches the following exact Job Description provided by the user:\n\n"""\n${jobDescription}\n"""\nAlso provide a second alternative role that they might be fit for based on their resume.`
            :
            `Based on the resume, provide realistic fit scores assessing how well the candidate matches these two common roles: "Marketing Specialist" and "Sales Manager".`}
Also calculate an overall general "fitScore" representing their overall employability (0-100).
Output format EXACTLY like this (ensure valid JSON):
{
  "fitScore": 75,
  "roles": [
    { "title": "${jobDescription && jobDescription.trim() ? "Custom Job Match" : "Marketing Specialist"}", "match": 80, "skills": 85, "exp": 75 },
    { "title": "${jobDescription && jobDescription.trim() ? "[Insert Recommended Alternative Role]" : "Sales Manager"}", "match": 60, "skills": 65, "exp": 55 }
  ]
}`;

        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: promptTemplate },
                { role: 'user', content: `Resume text:\n\n${text.substring(0, 5000)}` }
            ]
        });

        res.json({ result: completion.choices[0].message.content });

    } catch (err) {
        console.error('Resume Analysis Error:', err);
        res.status(500).json({ error: { message: err.message } });
    }
});

module.exports = router;
