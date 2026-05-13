const router = require('express').Router();
const { Workshop, Registration } = require('../models');
const { decryptResourceUrl } = require('../utils/crypto');

// Public: get all active workshops (upcoming AND recent past 24h window)
// FIX #5: was filtering scheduledAt >= yesterday which caused newly created
// workshops to not appear if there was any clock/timezone discrepancy.
// Now returns ALL active workshops, sorted by date ascending.
router.get('/', async (req, res) => {
  try {
    const workshops = await Workshop.find({ isActive: true })
      .select('title description bannerImage scheduledAt durationMinutes category isActive registrationCount createdAt updatedAt')
      .sort({ scheduledAt: 1 });
    res.json({ success: true, workshops });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/join', async (req, res) => {
  const { name, email, mobile } = req.body;
  if (!name || !email || !mobile) return res.status(400).json({ error: 'Name, email and mobile required' });

  // Input validation
  const cleanName   = name.toString().trim().slice(0, 100);
  const cleanEmail  = email.toString().trim().toLowerCase().slice(0, 200);
  const cleanMobile = mobile.toString().trim().slice(0, 20);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  if (!/^[\d\s\+\-\(\)]{7,20}$/.test(cleanMobile)) {
    return res.status(400).json({ error: 'Invalid mobile number' });
  }

  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop || !workshop.isActive) return res.status(404).json({ error: 'Workshop not found' });

    const meetUrl = decryptResourceUrl(workshop.encryptedMeetLink);
    if (!meetUrl) return res.status(500).json({ error: 'Meet link not available yet' });

    await Registration.create({
      workshop: workshop._id,
      name: cleanName,
      email: cleanEmail,
      mobile: cleanMobile,
    });

    workshop.registrationCount = (workshop.registrationCount || 0) + 1;
    await workshop.save();

    res.set('Cache-Control', 'no-store');
    res.json({ success: true, meetUrl });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
