const express = require('express');
const router = express.Router();
const HealthEntry = require('../models/HealthEntry');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const entries = await HealthEntry.find({ user: req.user.id }).sort({ date: -1 }).limit(30);
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const entry = new HealthEntry({ user: req.user.id, ...req.body });
    await entry.save();
    res.status(201).json({ message: 'Health entry saved!', entry });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/stats', auth, async (req, res) => {
  try {
    const entries = await HealthEntry.find({ user: req.user.id });
    if (entries.length === 0) return res.json({ message: 'No entries yet' });
    const avgWeight = entries.reduce((sum, e) => sum + e.weight, 0) / entries.length;
    const avgBMI = entries.reduce((sum, e) => sum + (e.bmi || 0), 0) / entries.length;
    const avgSteps = entries.reduce((sum, e) => sum + (e.steps || 0), 0) / entries.length;
    const avgSleep = entries.reduce((sum, e) => sum + (e.sleepHours || 0), 0) / entries.length;
    res.json({
      totalEntries: entries.length,
      avgWeight: avgWeight.toFixed(1),
      avgBMI: avgBMI.toFixed(1),
      avgSteps: Math.round(avgSteps),
      avgSleep: avgSleep.toFixed(1)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const entry = await HealthEntry.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;