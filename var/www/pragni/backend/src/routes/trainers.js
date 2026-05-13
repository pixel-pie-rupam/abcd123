const router = require('express').Router();
const { User } = require('../models');

router.get('/', async (req, res) => {
  try {
    const trainers = await User.find({
      isActive: true,
      role: 'trainer',
      showOnPublicPage: { $ne: false }, // show unless explicitly hidden
    })
      .select('name photo bio specializations socialLinks role')
      .sort({ createdAt: 1 });
    res.json({ success: true, trainers });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
