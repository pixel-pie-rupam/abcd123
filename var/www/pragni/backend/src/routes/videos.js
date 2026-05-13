const router = require('express').Router();
const { Video, Course } = require('../models');
const { generateStreamToken, verifyStreamToken, decryptResourceUrl } = require('../utils/crypto');


// =============================
// GET stream token
// =============================
router.get('/:videoId/token', async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);

    if (!video || !video.isPublished) {
      return res.status(404).json({ error: 'Not found' });
    }

    const token = generateStreamToken(video.encryptedVideoId);

    if (!token) {
      return res.status(500).json({ error: 'Token generation failed' });
    }

    // Prevent caching
    res.set('Cache-Control', 'no-store');

    res.json({
      token,
      expiresIn: 14400 // 4 hours
    });

  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


// =============================
// STREAM VIDEO (FIXED VERSION)
// =============================
router.get('/stream/:token', async (req, res) => {
  try {
    const ytId = verifyStreamToken(req.params.token);

    if (!ytId) {
      return res.status(401).send('<h3>Invalid or expired token</h3>');
    }

    // Security headers
    res.set('Cache-Control', 'no-store, no-cache');
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Content-Type', 'text/html');

    // Clean standalone HTML page
    res.send(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 100%; height: 100%; background: #000; overflow: hidden; }
  iframe { width: 100%; height: 100%; border: none; display: block; }
</style>
</head>
<body>
<iframe
  src="https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1&fs=1"
  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
  allowfullscreen
  loading="lazy">
</iframe>
</body>
</html>`);

  } catch (err) {
    res.status(500).send('Error');
  }
});


// =============================
// GET RESOURCES
// =============================
router.get('/:videoId/resources', async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);

    if (!video || !video.isPublished) {
      return res.status(404).json({ error: 'Not found' });
    }

    const resources = video.resources.map(r => ({
      type: r.type,
      title: r.title,
      url: decryptResourceUrl(r.encryptedUrl)
    }));

    res.set('Cache-Control', 'no-store');

    res.json({
      success: true,
      resources
    });

  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
