const router = require('express').Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const {
  User, Course, Video, Workshop, Comment, Registration,
  Enrollment, Category, Banner, Settings, Seo, Contact,
  ContactMessage, Coupon, Bundle, JourneySlide, TeamMember, SiteContent
} = require('../models');

const { protect, adminOnly, trainerOrAdmin, hasPermission } = require('../middleware/auth');
const { encryptVideoId, encryptResourceUrl, decryptVideoId, decryptResourceUrl } = require('../utils/crypto');

const isValidId = (id) => mongoose.isValidObjectId(id);

// ── Input sanitization helpers ──────────────────────────────────────────────
const sanitizeStr = (s, maxLen = 500) =>
  typeof s === 'string' ? s.trim().slice(0, maxLen) : '';

const sanitizeEmail = (e) => {
  if (typeof e !== 'string') return '';
  const clean = e.trim().toLowerCase().slice(0, 200);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean) ? clean : '';
};

const sanitizeUrl = (u) => {
  if (typeof u !== 'string') return '';
  const t = u.trim().slice(0, 500);
  if (!t) return '';
  if (/^https?:\/\//i.test(t) || t.startsWith('/')) return t;
  return 'https://' + t;
};


// ─── PUBLIC ROUTES (MUST BE ABOVE protect) ─────────────────────────────

router.get('/categories/public', async (req, res) => {
  try {
    const cats = await Category.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, categories: cats });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/settings/logo', async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: 'logoUrl' });
    res.json({ success: true, logoUrl: setting ? setting.value : '' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/banner/active', async (req, res) => {
  try {
    const banner = await Banner.findOne({ isActive: true });
    res.json({ success: true, banner: banner || null });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Fix #5 — Public coupon validate (for enrollment form after registration)
router.post('/coupons/validate', async (req, res) => {
  try {
    const code = sanitizeStr(req.body.code, 50).toUpperCase();
    if (!code) return res.status(400).json({ error: 'Coupon code required' });

    const coupon = await Coupon.findOne({ code, isActive: true });
    if (!coupon) return res.status(404).json({ error: 'Invalid coupon code' });

    if (coupon.expiresAt && new Date() > coupon.expiresAt)
      return res.status(400).json({ error: 'Coupon expired' });

    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses)
      return res.status(400).json({ error: 'Coupon usage limit reached' });

    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        description: coupon.description,
      }
    });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});


// ─── AUTH ─────────────────────────────────────────────────────────────

router.post('/auth/login', async (req, res) => {
  const email = sanitizeEmail(req.body.email);
  const password = sanitizeStr(req.body.password, 200);
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const user = await User.findOne({ email });
    if (!user || !user.isActive) return res.status(401).json({ error: 'Invalid credentials' });

    if (!await user.matchPassword(password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_ADMIN_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions || [],
        photo: user.photo
      }
    });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});


// 🔐 PROTECTED ROUTES
router.use(protect);


// ─── PROFILE ──────────────────────────────────────────────────────────

router.put('/profile', trainerOrAdmin, async (req, res) => {
  try {
    const { photo, bio, name, specializations, socialLinks } = req.body;
    const update = {};

    if (photo !== undefined) update.photo = sanitizeUrl(photo);
    if (bio !== undefined) update.bio = sanitizeStr(bio, 2000);
    if (name !== undefined) update.name = sanitizeStr(name, 100);
    if (socialLinks !== undefined) update.socialLinks = {
      linkedin: sanitizeUrl(socialLinks.linkedin || ''),
      github:   sanitizeUrl(socialLinks.github   || ''),
      twitter:  sanitizeUrl(socialLinks.twitter  || ''),
    };

    if (specializations !== undefined) {
      update.specializations = Array.isArray(specializations)
        ? specializations.map(s => sanitizeStr(s, 100)).filter(Boolean)
        : sanitizeStr(specializations, 1000).split(',').map(s => s.trim()).filter(Boolean);
    }

    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true }).select('-password');
    res.json({ success: true, user });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});


// ─── DASHBOARD STATS ───────────────────────────────────────────────────

router.get('/stats', adminOnly, async (req, res) => {
  try {
    const [courses, videos, workshops, trainers, pendingComments, unreadMessages, bundles, couponLeads] = await Promise.all([
      Course.countDocuments(),
      Video.countDocuments(),
      Workshop.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'trainer', isActive: true }),
      Comment.countDocuments({ isApproved: false }),
      ContactMessage.countDocuments({ isRead: false }),
      Bundle.countDocuments({ isActive: true }),
      Enrollment.countDocuments({ couponCode: { $exists: true, $ne: '' } }),
    ]);
    res.json({ success: true, stats: { courses, videos, workshops, trainers, pendingComments, unreadMessages, bundles, couponLeads } });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});


// ─── CATEGORY ADMIN ───────────────────────────────────────────────────

router.get('/categories', trainerOrAdmin, async (req, res) => {
  const cats = await Category.find().sort({ order: 1 });
  res.json({ success: true, categories: cats });
});

router.post('/categories', adminOnly, async (req, res) => {
  try {
    const cat = await Category.create({
      slug:  sanitizeStr(req.body.slug, 100),
      label: sanitizeStr(req.body.label, 100),
      icon:  sanitizeStr(req.body.icon, 10) || '📁',
      color: sanitizeStr(req.body.color, 30) || '#7b5ea7',
      glow:  sanitizeStr(req.body.glow, 60) || 'rgba(123,94,167,0.2)',
      order: parseInt(req.body.order) || 0,
      isActive: req.body.isActive !== false,
    });
    res.status(201).json({ success: true, category: cat });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/categories/:id', adminOnly, async (req, res) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, category: cat });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/categories/:id', adminOnly, async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});


// ─── BANNER ADMIN ─────────────────────────────────────────────────────

router.get('/banner', adminOnly, async (req, res) => {
  const banners = await Banner.find().sort({ createdAt: -1 });
  res.json({ success: true, banners });
});

router.post('/banner', adminOnly, async (req, res) => {
  try {
    if (req.body.isActive) await Banner.updateMany({}, { isActive: false });
    const banner = await Banner.create(req.body);
    res.status(201).json({ success: true, banner });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/banner/:id', adminOnly, async (req, res) => {
  try {
    if (req.body.isActive) {
      await Banner.updateMany({ _id: { $ne: req.params.id } }, { isActive: false });
    }
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, banner });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/banner/:id', adminOnly, async (req, res) => {
  await Banner.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});


// ─── TRAINERS ADMIN ────────────────────────────────────────────────────

router.get('/trainers', adminOnly, async (req, res) => {
  try {
    // Fix #7: include inactive trainers so admin can reactivate
    const trainers = await User.find({ role: { $in: ['trainer', 'admin', 'semi-admin'] } })
      .select('-password')
      .sort({ createdAt: 1 });
    res.json({ success: true, trainers });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/trainers', adminOnly, async (req, res) => {
  const name     = sanitizeStr(req.body.name, 100);
  const email    = sanitizeEmail(req.body.email);
  const password = sanitizeStr(req.body.password, 200);
  const role     = ['trainer', 'semi-admin'].includes(req.body.role) ? req.body.role : 'trainer';
  const permissions = Array.isArray(req.body.permissions) ? req.body.permissions.map(p => sanitizeStr(p, 50)) : [];

  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password required' });
  try {
    const user = await User.create({
      name, email, password,
      role,
      permissions,
      bio: sanitizeStr(req.body.bio, 2000),
      photo: sanitizeUrl(req.body.photo || ''),
      specializations: Array.isArray(req.body.specializations) ? req.body.specializations.map(s => sanitizeStr(s, 100)) : [],
      socialLinks: {
        linkedin: sanitizeUrl(req.body.socialLinks?.linkedin || ''),
        github:   sanitizeUrl(req.body.socialLinks?.github   || ''),
        twitter:  sanitizeUrl(req.body.socialLinks?.twitter  || ''),
      },
      createdBy: req.user._id,
    });
    const out = user.toObject();
    delete out.password;
    res.status(201).json({ success: true, trainer: out });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'Email already exists' });
    res.status(400).json({ error: err.message });
  }
});

router.put('/trainers/:id', adminOnly, async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid ID' });
  const { name, email, password, role, bio, photo, specializations, socialLinks, permissions } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Trainer not found' });

    if (name  !== undefined) user.name  = sanitizeStr(name, 100);
    if (req.body.showOnPublicPage !== undefined) user.showOnPublicPage = !!req.body.showOnPublicPage;
    if (email !== undefined) user.email = sanitizeEmail(email);
    if (role  !== undefined && ['trainer', 'semi-admin'].includes(role)) user.role = role;
    if (bio   !== undefined) user.bio   = sanitizeStr(bio, 2000);
    if (photo !== undefined) user.photo = sanitizeUrl(photo);
    if (Array.isArray(permissions)) user.permissions = permissions.map(p => sanitizeStr(p, 50));
    if (specializations !== undefined)
      user.specializations = Array.isArray(specializations)
        ? specializations.map(s => sanitizeStr(s, 100))
        : [];
    if (socialLinks !== undefined) user.socialLinks = {
      linkedin: sanitizeUrl(socialLinks.linkedin || ''),
      github:   sanitizeUrl(socialLinks.github   || ''),
      twitter:  sanitizeUrl(socialLinks.twitter  || ''),
    };
    if (password) user.password = password;

    await user.save();
    const out = user.toObject();
    delete out.password;
    res.json({ success: true, trainer: out });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Fix #7 — Deactivate (soft delete)
router.patch('/trainers/:id/deactivate', adminOnly, async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid ID' });
  await User.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true });
});

// Fix #7 — Reactivate
router.patch('/trainers/:id/reactivate', adminOnly, async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid ID' });
  await User.findByIdAndUpdate(req.params.id, { isActive: true });
  res.json({ success: true });
});

// Fix #7 — Hard delete
router.delete('/trainers/:id', adminOnly, async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid ID' });
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});


// ─── COMMENTS ADMIN ────────────────────────────────────────────────────

router.get('/comments', trainerOrAdmin, async (req, res) => {
  try {
    const comments = await Comment.find()
      .sort({ createdAt: -1 })
      .populate('video', 'title')
      .populate('course', 'title')
      .populate('repliedBy', 'name');
    res.json({ success: true, comments });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/comments/:id', trainerOrAdmin, async (req, res) => {
  try {
    const update = {};
    if (req.body.isApproved !== undefined) update.isApproved = req.body.isApproved;
    if (req.body.isResolved !== undefined) update.isResolved = req.body.isResolved;
    if (req.body.reply !== undefined) {
      update.reply = sanitizeStr(req.body.reply, 2000);
      update.repliedBy = req.user._id;
    }
    const c = await Comment.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ success: true, comment: c });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/comments/:id', trainerOrAdmin, async (req, res) => {
  await Comment.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});


// ─── COURSES ADMIN ─────────────────────────────────────────────────────

router.get('/courses', trainerOrAdmin, async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('trainer', 'name photo role')
      .sort({ createdAt: -1 });
    res.json({ success: true, courses });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/courses', trainerOrAdmin, async (req, res) => {
  try {
    const { trainerId, ...rest } = req.body;
    const courseData = { ...rest };
    if (trainerId) courseData.trainer = trainerId;
    // Sanitize key fields
    if (courseData.title) courseData.title = sanitizeStr(courseData.title, 300);
    if (courseData.slug)  courseData.slug  = sanitizeStr(courseData.slug, 300).toLowerCase().replace(/[^a-z0-9-]/g, '-');
    if (courseData.description) courseData.description = sanitizeStr(courseData.description, 5000);
    const course = await Course.create(courseData);
    res.status(201).json({ success: true, course });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/courses/:id', trainerOrAdmin, async (req, res) => {
  try {
    const { trainerId, ...rest } = req.body;
    const update = { ...rest };
    if (trainerId !== undefined) update.trainer = trainerId || null;
    if (update.title) update.title = sanitizeStr(update.title, 300);
    if (update.description) update.description = sanitizeStr(update.description, 5000);
    const course = await Course.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json({ success: true, course });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/courses/:id', adminOnly, async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});


// ─── VIDEOS ADMIN ──────────────────────────────────────────────────────

router.get('/courses/:courseId/videos', trainerOrAdmin, async (req, res) => {
  if (!isValidId(req.params.courseId)) return res.status(400).json({ error: 'Invalid course ID' });
  try {
    const videos = await Video.find({ course: req.params.courseId })
      .sort({ weekNumber: 1, order: 1 })
      .populate('uploadedBy', 'name');
    const out = videos.map(v => {
      const obj = v.toObject();
      obj.youtubeId = v.encryptedVideoId ? (decryptVideoId(v.encryptedVideoId) || '') : '';
      obj.resources = (v.resources || []).map(r => ({
        ...r.toObject(),
        url: r.encryptedUrl ? (decryptResourceUrl(r.encryptedUrl) || '') : '',
      }));
      return obj;
    });
    res.json({ success: true, videos: out });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/courses/:courseId/videos', trainerOrAdmin, async (req, res) => {
  if (!isValidId(req.params.courseId)) return res.status(400).json({ error: 'Invalid course ID' });
  const { youtubeId } = req.body;
  if (!youtubeId) return res.status(400).json({ error: 'YouTube video ID required' });
  try {
    const encryptedVideoId = encryptVideoId(sanitizeStr(youtubeId, 50));
    const resources = (req.body.resources || []).map(r => ({
      type: r.type,
      title: sanitizeStr(r.title, 200),
      encryptedUrl: r.url ? encryptResourceUrl(r.url) : '',
    }));
    const video = await Video.create({
      title: sanitizeStr(req.body.title, 300),
      description: sanitizeStr(req.body.description || '', 2000),
      course: req.params.courseId,
      encryptedVideoId,
      videoType: ['unlisted','listed'].includes(req.body.videoType) ? req.body.videoType : 'unlisted',
      weekNumber: parseInt(req.body.weekNumber) || 1,
      order: parseInt(req.body.order) || 0,
      duration: sanitizeStr(req.body.duration || '', 50),
      isPublished: !!req.body.isPublished,
      uploadedBy: req.user._id,
      resources,
    });
    res.status(201).json({ success: true, video });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/videos/:id', trainerOrAdmin, async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid ID' });
  const { youtubeId, resources, ...rest } = req.body;
  const update = { ...rest };
  if (update.title) update.title = sanitizeStr(update.title, 300);
  if (update.description) update.description = sanitizeStr(update.description || '', 2000);
  if (youtubeId) update.encryptedVideoId = encryptVideoId(sanitizeStr(youtubeId, 50));
  if (['unlisted','listed'].includes(rest.videoType)) update.videoType = rest.videoType;
  if (resources) {
    update.resources = resources.map(r => ({
      type: r.type,
      title: sanitizeStr(r.title, 200),
      encryptedUrl: r.url ? encryptResourceUrl(r.url) : '',
    }));
  }
  try {
    const video = await Video.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!video) return res.status(404).json({ error: 'Video not found' });
    res.json({ success: true, video });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/videos/:id', trainerOrAdmin, async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid ID' });
  await Video.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});


// ─── WORKSHOPS ADMIN ───────────────────────────────────────────────────

router.get('/workshops', trainerOrAdmin, async (req, res) => {
  try {
    // Fix #6: Return ALL workshops (not just active/upcoming) for admin
    const workshops = await Workshop.find().sort({ scheduledAt: -1 });
    res.json({ success: true, workshops });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/workshops', trainerOrAdmin, async (req, res) => {
  const { meetLink, ...rest } = req.body;
  try {
    const workshopData = {
      title: sanitizeStr(rest.title, 300),
      description: sanitizeStr(rest.description || '', 3000),
      bannerImage: sanitizeUrl(rest.bannerImage || ''),
      scheduledAt: rest.scheduledAt,
      durationMinutes: parseInt(rest.durationMinutes) || 60,
      category: sanitizeStr(rest.category || 'general', 100),
      isActive: rest.isActive !== false,
    };
    if (meetLink) workshopData.encryptedMeetLink = encryptResourceUrl(meetLink);
    const workshop = await Workshop.create(workshopData);
    res.status(201).json({ success: true, workshop });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/workshops/:id', trainerOrAdmin, async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid ID' });
  const { meetLink, ...rest } = req.body;
  const update = { ...rest };
  if (meetLink) update.encryptedMeetLink = encryptResourceUrl(meetLink);
  try {
    const workshop = await Workshop.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!workshop) return res.status(404).json({ error: 'Workshop not found' });
    res.json({ success: true, workshop });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/workshops/:id', adminOnly, async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid ID' });
  await Workshop.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

router.get('/workshops/:id/registrations', trainerOrAdmin, async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid ID' });
  try {
    const registrations = await Registration.find({ workshop: req.params.id }).sort({ createdAt: -1 });
    res.json({ success: true, registrations });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/registrations/export/:workshopId', adminOnly, async (req, res) => {
  if (!isValidId(req.params.workshopId)) return res.status(400).json({ error: 'Invalid ID' });
  try {
    const registrations = await Registration.find({ workshop: req.params.workshopId }).sort({ createdAt: -1 });
    const rows = [
      'Name,Email,Mobile,Registered At',
      ...registrations.map(r =>
        `"${r.name}","${r.email}","${r.mobile || ''}","${new Date(r.createdAt).toISOString()}"`
      ),
    ];
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=registrations-${req.params.workshopId}.csv`);
    res.send(rows.join('\n'));
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});


// ─── ENROLLMENTS ADMIN ─────────────────────────────────────────────────

router.get('/enrollments', adminOnly, async (req, res) => {
  try {
    const enrollmentsRaw = await Enrollment.find()
      .populate('courseId', 'title price')
      .sort({ createdAt: -1 });
    const enrollments = enrollmentsRaw.map((e) => {
      const item = e.toObject();
      const originalPrice = Number(item.courseId?.price || 0);
      const discountValue = Number(item.couponDiscount || 0);
      const discountAmount = item.couponDiscountType === 'percent'
        ? Math.max(0, (originalPrice * discountValue) / 100)
        : (item.couponDiscountType === 'fixed' ? Math.max(0, discountValue) : 0);
      const finalPayable = Math.max(0, originalPrice - discountAmount);
      return { ...item, originalPrice, discountAmount, finalPayable };
    });
    res.json({ success: true, enrollments });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update enrollment (student tracking fields)
router.patch('/enrollments/:id', adminOnly, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid ID' });
  try {
    const allowed = ['altEmail','altPhone','notes','contacted','contactStatus','name','email','mobile'];
    const update = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
    const enrollment = await Enrollment.findByIdAndUpdate(req.params.id, update, { new: true }).populate('courseId','title price');
    if (!enrollment) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, enrollment });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete enrollment
router.delete('/enrollments/:id', adminOnly, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid ID' });
  await Enrollment.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

router.get('/enrollments/export', adminOnly, async (req, res) => {
  try {
    const filter = req.query.courseId ? { courseId: req.query.courseId } : {};
    const enrollments = await Enrollment.find(filter)
      .populate('courseId', 'title price')
      .sort({ createdAt: -1 });
    const rows = [
      'Name,Email,Mobile,Course,OriginalPrice,CouponCode,DiscountType,DiscountValue,DiscountAmount,FinalPayable,Submitted At',
      ...enrollments.map(e => {
        const originalPrice = Number(e.courseId?.price || 0);
        const discountValue = Number(e.couponDiscount || 0);
        const discountAmount = e.couponDiscountType === 'percent'
          ? Math.max(0, (originalPrice * discountValue) / 100)
          : (e.couponDiscountType === 'fixed' ? Math.max(0, discountValue) : 0);
        const finalPayable = Math.max(0, originalPrice - discountAmount);
        return `"${e.name}","${e.email}","${e.mobile}","${e.courseId?.title || e.courseName || ''}","${originalPrice}","${e.couponCode || ''}","${e.couponDiscountType || ''}","${discountValue}","${discountAmount.toFixed(2)}","${finalPayable.toFixed(2)}","${new Date(e.createdAt).toISOString()}"`;
      }),
    ];
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=enrollments.csv');
    res.send(rows.join('\n'));
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});


// ─── CONTACT MESSAGES (Fix #2) ────────────────────────────────────────

router.get('/contact-messages', adminOnly, async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json({ success: true, messages });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/contact-messages/:id/read', adminOnly, async (req, res) => {
  await ContactMessage.findByIdAndUpdate(req.params.id, { isRead: true });
  res.json({ success: true });
});

router.delete('/contact-messages/:id', adminOnly, async (req, res) => {
  await ContactMessage.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});


// ─── COUPON ADMIN (Fix #5) ─────────────────────────────────────────────

router.get('/coupons', adminOnly, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/coupons', adminOnly, async (req, res) => {
  try {
    const code = sanitizeStr(req.body.code, 50).toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!code) return res.status(400).json({ error: 'Valid coupon code required' });
    const coupon = await Coupon.create({
      code,
      discountType: ['percent','fixed'].includes(req.body.discountType) ? req.body.discountType : 'percent',
      discountValue: Math.max(0, parseFloat(req.body.discountValue) || 0),
      maxUses: parseInt(req.body.maxUses) || 0,
      expiresAt: req.body.expiresAt || null,
      isActive: req.body.isActive !== false,
      description: sanitizeStr(req.body.description, 300),
    });
    res.status(201).json({ success: true, coupon });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'Coupon code already exists' });
    res.status(400).json({ error: err.message });
  }
});

router.put('/coupons/:id', adminOnly, async (req, res) => {
  try {
    const update = {};
    if (req.body.discountType) update.discountType = req.body.discountType;
    if (req.body.discountValue !== undefined) update.discountValue = parseFloat(req.body.discountValue) || 0;
    if (req.body.maxUses !== undefined) update.maxUses = parseInt(req.body.maxUses) || 0;
    if (req.body.expiresAt !== undefined) update.expiresAt = req.body.expiresAt || null;
    if (req.body.isActive !== undefined) update.isActive = req.body.isActive;
    if (req.body.description !== undefined) update.description = sanitizeStr(req.body.description, 300);
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ success: true, coupon });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/coupons/:id', adminOnly, async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});


// ─── BUNDLE ADMIN (Fix #4) ─────────────────────────────────────────────

router.get('/bundles', adminOnly, async (req, res) => {
  try {
    const bundles = await Bundle.find().populate('courses', 'title price thumbnail').sort({ createdAt: -1 });
    res.json({ success: true, bundles });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/bundles', adminOnly, async (req, res) => {
  try {
    const bundle = await Bundle.create({
      title:       sanitizeStr(req.body.title, 300),
      description: sanitizeStr(req.body.description || '', 3000),
      thumbnail:   sanitizeUrl(req.body.thumbnail || ''),
      courses:     Array.isArray(req.body.courses) ? req.body.courses.filter(isValidId) : [],
      bundlePrice: Math.max(0, parseFloat(req.body.bundlePrice) || 0),
      isActive:    req.body.isActive !== false,
      isFeatured:  !!req.body.isFeatured,
    });
    res.status(201).json({ success: true, bundle });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/bundles/:id', adminOnly, async (req, res) => {
  try {
    const update = {};
    if (req.body.title !== undefined) update.title = sanitizeStr(req.body.title, 300);
    if (req.body.description !== undefined) update.description = sanitizeStr(req.body.description, 3000);
    if (req.body.thumbnail !== undefined) update.thumbnail = sanitizeUrl(req.body.thumbnail);
    if (req.body.courses !== undefined) update.courses = req.body.courses.filter(isValidId);
    if (req.body.bundlePrice !== undefined) update.bundlePrice = Math.max(0, parseFloat(req.body.bundlePrice) || 0);
    if (req.body.isActive !== undefined) update.isActive = req.body.isActive;
    if (req.body.isFeatured !== undefined) update.isFeatured = req.body.isFeatured;
    const bundle = await Bundle.findByIdAndUpdate(req.params.id, update, { new: true }).populate('courses', 'title price thumbnail');
    res.json({ success: true, bundle });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/bundles/:id', adminOnly, async (req, res) => {
  await Bundle.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});


// ─── SEO (admin) ──────────────────────────────────────────────────────────
router.get('/seo', adminOnly, async (req, res) => {
  try {
    let seo = await Seo.findOne();
    if (!seo) seo = await Seo.create({});
    res.json({ success: true, seo });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

router.put('/seo', adminOnly, async (req, res) => {
  try {
    const allowed = ['siteName','siteDescription','siteKeywords','canonicalUrl','defaultOgImage',
      'faviconUrl','googleVerification','bingVerification','googleAnalyticsId','robotsTxt',
      'twitterHandle','ogType','schemaOrg','pageOverrides'];
    const update = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
    update.updatedAt = new Date();
    const seo = await Seo.findOneAndUpdate({}, update, { upsert: true, new: true });
    res.json({ success: true, seo });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ─── CONTACT & SOCIAL (admin) ─────────────────────────────────────────────
router.get('/contact', adminOnly, async (req, res) => {
  try {
    let contact = await Contact.findOne();
    if (!contact) contact = await Contact.create({});
    res.json({ success: true, contact });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

router.put('/contact', adminOnly, async (req, res) => {
  try {
    const allowed = ['email','phone','whatsapp','address','mapEmbedUrl','youtube','instagram',
      'twitter','linkedin','facebook','telegram','discord','github','formEnabled','formRecipientEmail'];
    const update = {};
    allowed.forEach(k => {
      if (req.body[k] !== undefined) {
        if (['youtube','instagram','twitter','linkedin','facebook','telegram','discord','github'].includes(k)) {
          update[k] = sanitizeUrl(req.body[k]);
        } else {
          update[k] = req.body[k];
        }
      }
    });
    const contact = await Contact.findOneAndUpdate({}, update, { upsert: true, new: true });
    res.json({ success: true, contact });
  } catch { res.status(500).json({ error: 'Server error' }); }
});


// ─── SETTINGS (logo etc) ──────────────────────────────────────────────────
router.get('/settings', adminOnly, async (req, res) => {
  try {
    const settings = await Settings.find();
    const obj = {};
    settings.forEach(s => { obj[s.key] = s.value; });
    res.json({ success: true, settings: obj });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/settings', adminOnly, async (req, res) => {
  try {
    const { logoUrl } = req.body;
    if (logoUrl !== undefined) {
      await Settings.findOneAndUpdate(
        { key: 'logoUrl' },
        { key: 'logoUrl', value: sanitizeUrl(logoUrl) },
        { upsert: true, new: true }
      );
    }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});


// ─── JOURNEY GALLERY ──────────────────────────────────────────────────────────
router.get('/journey', trainerOrAdmin, async (req, res) => {
  const slides = await JourneySlide.find().sort({ order: 1 });
  res.json({ success: true, slides });
});
router.post('/journey', adminOnly, async (req, res) => {
  try {
    const slide = await JourneySlide.create({
      title:    sanitizeStr(req.body.title || '', 200),
      description: sanitizeStr(req.body.description || '', 500),
      imageUrl: sanitizeUrl(req.body.imageUrl),
      order:    parseInt(req.body.order) || 0,
      isActive: req.body.isActive !== false,
    });
    res.status(201).json({ success: true, slide });
  } catch (err) { res.status(400).json({ error: err.message }); }
});
router.put('/journey/:id', adminOnly, async (req, res) => {
  const update = {};
  if (req.body.title    !== undefined) update.title    = sanitizeStr(req.body.title, 200);
  if (req.body.description !== undefined) update.description = sanitizeStr(req.body.description, 500);
  if (req.body.imageUrl !== undefined) update.imageUrl = sanitizeUrl(req.body.imageUrl);
  if (req.body.order    !== undefined) update.order    = parseInt(req.body.order) || 0;
  if (req.body.isActive !== undefined) update.isActive = req.body.isActive;
  const slide = await JourneySlide.findByIdAndUpdate(req.params.id, update, { new: true });
  res.json({ success: true, slide });
});
router.delete('/journey/:id', adminOnly, async (req, res) => {
  await JourneySlide.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// ─── TEAM MEMBERS ─────────────────────────────────────────────────────────────
router.get('/team', trainerOrAdmin, async (req, res) => {
  const members = await TeamMember.find().sort({ order: 1 });
  res.json({ success: true, members });
});
router.post('/team', adminOnly, async (req, res) => {
  try {
    const member = await TeamMember.create({
      name:           sanitizeStr(req.body.name, 100),
      role:           sanitizeStr(req.body.role || '', 100),
      photo:          sanitizeUrl(req.body.photo || ''),
      bio:            sanitizeStr(req.body.bio || '', 1000),
      linkedin:       sanitizeUrl(req.body.linkedin || ''),
      twitter:        sanitizeUrl(req.body.twitter || ''),
      order:          parseInt(req.body.order) || 0,
      showOnAboutPage: req.body.showOnAboutPage !== false,
    });
    res.status(201).json({ success: true, member });
  } catch (err) { res.status(400).json({ error: err.message }); }
});
router.put('/team/:id', adminOnly, async (req, res) => {
  const allowed = ['name','role','photo','bio','linkedin','twitter','order','showOnAboutPage'];
  const update = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
  if (update.name)     update.name     = sanitizeStr(update.name, 100);
  if (update.role)     update.role     = sanitizeStr(update.role, 100);
  if (update.bio)      update.bio      = sanitizeStr(update.bio, 1000);
  if (update.photo)    update.photo    = sanitizeUrl(update.photo);
  if (update.linkedin) update.linkedin = sanitizeUrl(update.linkedin);
  if (update.twitter)  update.twitter  = sanitizeUrl(update.twitter);
  const member = await TeamMember.findByIdAndUpdate(req.params.id, update, { new: true });
  res.json({ success: true, member });
});
router.delete('/team/:id', adminOnly, async (req, res) => {
  await TeamMember.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// ─── SITE CONTENT (hero text, about text, etc.) ───────────────────────────────
router.get('/site-content', adminOnly, async (req, res) => {
  const items = await SiteContent.find();
  const obj = {};
  items.forEach(i => { obj[i.key] = i.value; });
  res.json({ success: true, content: obj });
});
router.put('/site-content', adminOnly, async (req, res) => {
  try {
    const updates = req.body; // { key: value, ... }
    await Promise.all(Object.entries(updates).map(([key, value]) =>
      SiteContent.findOneAndUpdate({ key }, { key, value: sanitizeStr(value, 5000) }, { upsert: true, new: true })
    ));
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
