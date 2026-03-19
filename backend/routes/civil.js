const express = require('express');
const router = express.Router();
const AIProject = require('../models/Project');
const auth = require('../middleware/auth');
const multer = require('multer');
const Groq = require('groq-sdk');
const path = require('path');
const fs = require('fs');
const https = require('https');
const dbFallback = require('../utils/dbFallback');

const fallbackProjects = dbFallback('projects');

const upload = multer({ storage: multer.memoryStorage() });
const pdfParse = require('pdf-parse');
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

console.log('✅ CIVIL ROUTES V2.7 - HARD BUDGET OVERRIDE & TURBO RENDERS');

// Helper: Fast Image Generation with Fallback
async function generateAIImage(prompt, filename) {
    return new Promise((resolve) => {
        const seed = Math.floor(Math.random() * 1000000);
        const encodedPrompt = encodeURIComponent(prompt + ", ultra realistic architecture photography, white and neon accents");
        // Turbo is 10x faster than Flux and avoids 530 errors
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=768&nologo=true&seed=${seed}&model=turbo`;

        const savePath = path.join(__dirname, '..', 'public', 'renders', filename);

        const req = https.get(imageUrl, (res) => {
            if (res.statusCode === 200) {
                const fileStream = fs.createWriteStream(savePath);
                res.pipe(fileStream);
                fileStream.on('finish', () => {
                    fileStream.close();
                    resolve(`http://localhost:5000/renders/${filename}`);
                });
            } else {
                resolve(null);
            }
        });

        req.on('error', () => resolve(null));
        req.setTimeout(8000, () => {
            req.abort();
            resolve(null);
        });
    });
}

async function extractTextFromBuffer(buffer) {
    try {
        const data = await pdfParse(buffer);
        return (data.text || '').slice(0, 8000);
    } catch (e) { return 'Empty document context.'; }
}

// ======================
// Get all Civil Projects
// ======================
router.get('/projects', auth, async (req, res) => {
    try {
        let projects;
        if (req.isMongoConnected) {
            projects = await AIProject.find().sort({ createdAt: -1 });
        } else {
            projects = await fallbackProjects.find();
        }
        res.json(projects);
    } catch (err) { res.status(500).send('Server Error'); }
});

// ======================
// Clear all demo/old projects
// ======================
router.delete('/projects/clear', auth, async (req, res) => {
    try {
        if (req.isMongoConnected) {
            await AIProject.deleteMany({});
        } else {
            await fallbackProjects.deleteMany({});
        }
        res.json({ message: 'All projects cleared' });
    } catch (err) { res.status(500).send('Server Error'); }
});

// ======================
// Real AI File Upload & Parsing using Groq + Pollinations
// ======================
router.post('/ai-analyze', [auth, upload.single('blueprint')], async (req, res) => {
    try {
        console.log('--- NEW ANALYSIS REQUEST ---');
        let manualMeta = {};
        if (req.body.manualMetadata) {
            manualMeta = JSON.parse(req.body.manualMetadata);
        }

        // FORCE BUDGET - NO AI INFLUENCE
        const rawBudget = String(manualMeta.budget || "5000000").replace(/[^\d]/g, '');
        const FINAL_BUDGET = parseInt(rawBudget, 10);

        console.log('MANUAL INPUT BUDGET:', manualMeta.budget);
        console.log('FINAL FORCED BUDGET:', FINAL_BUDGET);

        let extractedText = req.file ? await extractTextFromBuffer(req.file.buffer) : "Generic project analysis request.";
        const filename = req.file ? req.file.originalname : "Digital Blueprint";

        const floors = parseInt(manualMeta.floors || 2);
        const style = floors <= 2 ? "Modern Residential Bungalow" : "Commercial Multi-story Skyscraper";

        const prompt = `
Generate a Civil Construction Report for a ${floors}-story ${style}.
PROJECT: ${manualMeta.projectName || "New Civil Project"}
BUDGET: ₹${FINAL_BUDGET}

Return ONLY valid JSON:
{
  "projectName": "${manualMeta.projectName || "Digital Project"}",
  "clientName": "${manualMeta.clientName || "Direct Client"}",
  "location": "${manualMeta.location || "India"}",
  "budget": ${FINAL_BUDGET},
  "status": "Planning",
  "progress": 5,
  "summary": "Technical construction roadmap for a ${floors}-story ${style} within ₹${FINAL_BUDGET}.",
  "imagePrompt": "A high-quality architectural render of ${manualMeta.projectName || 'a building'}, ${floors} levels, photorealistic",
  "boq": [
    { "item": "Foundation & Plinth", "quantityStr": "Core", "amount": ${Math.floor(FINAL_BUDGET * 0.25)} },
    { "item": "RCC Framework", "quantityStr": "Bulk", "amount": ${Math.floor(FINAL_BUDGET * 0.45)} },
    { "item": "Finishing & MEP", "quantityStr": "Premium", "amount": ${Math.floor(FINAL_BUDGET * 0.3)} }
  ],
  "materials": [
    { "material": "High Grade Cement", "totalStock": 1000, "used": 0, "unit": "bags" },
    { "material": "Reinforcement Steel", "totalStock": 50, "used": 0, "unit": "tons" }
  ],
  "workforce": { "engineers": 2, "laborers": 25, "supervisors": 2, "estimatedDays": 210 },
  "totalExpenses": 0
}
`;

        let aiData;
        if (groq) {
            const completion = await groq.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.1
            });
            aiData = JSON.parse(completion.choices[0].message.content.replace(/```json|```/g, '').trim());
        } else {
             // Mock AI response if no key
             aiData = {
                projectName: manualMeta.projectName || "Digital Project",
                clientName: manualMeta.clientName || "Direct Client",
                location: manualMeta.location || "India",
                budget: FINAL_BUDGET,
                status: "Planning",
                progress: 5,
                summary: "Mock analysis results (API key missing).",
                imagePrompt: "Architectural render",
                boq: [],
                materials: [],
                workforce: { engineers: 0, laborers: 0, supervisors: 0, estimatedDays: 0 },
                totalExpenses: 0
             };
        }

        // Final sanity check - Force database consistency
        aiData.budget = FINAL_BUDGET;

        const ts = Date.now();
        const renderPrompt = `${aiData.imagePrompt}, architectural photography, professional lighting, white theme`;

        // Instant URL for the client
        const instantUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(renderPrompt)}?width=1024&height=768&nologo=true&seed=${ts}&model=turbo`;

        // Background Save
        generateAIImage(renderPrompt, `render_${ts}.png`).catch(() => { });

        const projectPayload = {
            ...aiData,
            renderUrls: [instantUrl],
            createdAt: new Date()
        };

        let finalProject;
        if (req.isMongoConnected) {
            finalProject = new AIProject(projectPayload);
            await finalProject.save();
        } else {
            finalProject = await fallbackProjects.save(projectPayload);
        }

        res.json(finalProject);

        console.log('--- ANALYSIS COMPLETE ---');
    } catch (err) {
        console.error('SERVER ERROR:', err.message);
        res.status(500).send('Analysis failed: ' + err.message);
    }
});

// ======================
// Dashboard Metrics
// ======================
router.get('/dashboard', auth, async (req, res) => {
    try {
        let projects;
        if (req.isMongoConnected) {
            projects = await AIProject.find();
        } else {
            projects = await fallbackProjects.find();
        }
        res.json({
            totalProjects: projects.length,
            activeSites: projects.filter(p => p.status === 'Ongoing').length,
            totalBudget: projects.reduce((acc, curr) => acc + curr.budget, 0),
            totalExpenses: projects.reduce((acc, curr) => acc + curr.totalExpenses, 0)
        });
    } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;
