const router = require('express').Router();
const { Course, Video, Enrollment, Category } = require('../models');
const VALID_LEVELS = new Set(['beginner','intermediate','advanced']);

// GET all published courses (grouped by category)
router.get('/', async (req, res) => {
  try {
    const { category, level, price, paid } = req.query;
    const filter = { isPublished: true, isComing: false };
    if (typeof category === 'string' && category) {
      // Validate category against DB (allow any active category slug)
      const validCat = await Category.findOne({ slug: category, isActive: true });
      if (validCat) filter.category = category;
    }
    if (typeof level === 'string' && VALID_LEVELS.has(level)) filter.level = level;
    if (price === '0') filter.price = 0;          // free courses
    if (paid === '1') filter.price = { $gt: 0 };  // paid courses

    const courses = await Course.find(filter)
      .populate('trainer', 'name photo specializations role')
      .select('-__v')
      .sort({ order: 1, createdAt: -1 });
    const safeCourses = courses.map(c => {
      const obj = c.toObject();
      // Only null out trainer if the assigned user has an unrecognized role
      if (obj.trainer && !['trainer', 'admin'].includes(obj.trainer?.role)) obj.trainer = null;
      return obj;
    });
    res.json({ success: true, courses: safeCourses });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET coming soon courses
router.get('/coming-soon', async (req, res) => {
  try {
    const courses = await Course.find({ isComing: true })
      .select('title category description thumbnail level')
      .sort({ order: 1 });
    res.json({ success: true, courses });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET single course by slug
router.get('/:slug', async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug, isPublished: true })
      .populate('trainer', 'name photo bio specializations socialLinks role');

    if (!course) return res.status(404).json({ error: 'Course not found' });

    // Get video list (no encrypted IDs sent to client)
    const videos = await Video.find({ course: course._id, isPublished: true })
      .select('title description weekNumber order duration')
      .sort({ weekNumber: 1, order: 1 });

    const courseObj = course.toObject();
    if (courseObj.trainer && !['trainer', 'admin'].includes(courseObj.trainer?.role)) courseObj.trainer = null;

    res.json({ success: true, course: courseObj, videos });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── Enrollment Route ─────────────────────────────
router.post('/enrollments', async (req, res) => {
  try {
    const { name, email, mobile, courseId, courseName } = req.body;

    if (!name || !email || !mobile || !courseId) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const enrollment = await Enrollment.create({
      name,
      email,
      mobile,
      courseId,
      courseName
    });

    res.status(201).json({
      success: true,
      enrollment
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
