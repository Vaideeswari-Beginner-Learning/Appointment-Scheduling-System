const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const Requirement = require('../models/Requirement');
const Candidate = require('../models/Candidate');
const { auth, authorize } = require('../middleware/auth');

// --- CLIENTS ---
router.get('/clients', auth, async (req, res) => {
    try {
        const clients = await Client.find();
        res.json(clients);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/clients', [auth, authorize(['admin', 'hr'])], async (req, res) => {
    try {
        const client = new Client({ ...req.body, adminId: req.user.id });
        await client.save();
        res.status(201).json(client);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- REQUIREMENTS ---
router.get('/requirements', auth, async (req, res) => {
    try {
        const requirements = await Requirement.find().populate('clientId');
        res.json(requirements);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/requirements', [auth, authorize(['admin', 'hr'])], async (req, res) => {
    try {
        const requirement = new Requirement({ ...req.body, adminId: req.user.id });
        await requirement.save();
        res.status(201).json(requirement);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- CANDIDATES ---
router.get('/candidates', auth, async (req, res) => {
    try {
        const candidates = await Candidate.find().populate('requirementId');
        res.json(candidates);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/candidates', [auth, authorize(['admin', 'hr'])], async (req, res) => {
    try {
        const candidate = new Candidate({ ...req.body, adminId: req.user.id });
        await candidate.save();
        res.status(201).json(candidate);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- ANALYTICS ---
router.get('/stats/client/:id', auth, async (req, res) => {
    try {
        const client = await Client.findById(req.params.id);
        if (!client) return res.status(404).json({ message: 'Client not found' });

        const requirements = await Requirement.find({ clientId: req.params.id });
        const reqIds = requirements.map(r => r._id);
        const candidates = await Candidate.find({ requirementId: { $in: reqIds } });

        const stats = {
            totalRequirements: requirements.length,
            totalCandidates: candidates.length,
            statusBreakdown: {
                applied: candidates.filter(c => c.status === 'applied').length,
                interviewing: candidates.filter(c => c.status === 'interviewing').length,
                hired: candidates.filter(c => c.status === 'hired').length,
                rejected: candidates.filter(c => c.status === 'rejected').length
            },
            recentCandidates: candidates.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5)
        };
        res.json(stats);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
