const express = require('express');
const router = express.Router();
const { Comment, Video } = require('../models');

router.get('/:videoId', async (req, res) => {
  try {
    const comments = await Comment.find({
      video: req.params.videoId,
      isApproved: true
    }).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, comments });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  const { videoId, courseId, userName, userEmail, content, isDoubt } = req.body;

  if (!userName || !userName.trim()) return res.status(400).json({ error: 'Name is required' });
  if (!userEmail || !userEmail.trim()) return res.status(400).json({ error: 'Email is required' });
  if (!content || !content.trim()) return res.status(400).json({ error: 'Comment is required' });
  if (!videoId) return res.status(400).json({ error: 'Please select a video before commenting' });
  if (content.length > 2000) return res.status(400).json({ error: 'Comment too long' });

  try {
    // If courseId not passed, look it up from the video
    let resolvedCourseId = courseId || null;
    if (!resolvedCourseId && videoId) {
      const video = await Video.findById(videoId).select('course');
      if (video) resolvedCourseId = video.course;
    }

    await Comment.create({
      video: videoId,
      course: resolvedCourseId,
      userName: userName.trim().substring(0, 100),
      userEmail: userEmail.toLowerCase().trim(),
      content: content.trim(),
      isDoubt: !!isDoubt,
      isApproved: false,
    });
    res.status(201).json({ success: true, message: 'Comment submitted for review' });
  } catch (err) {
    console.error('Comment error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
