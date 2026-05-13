const express = require('express');
const router = express.Router();
const { Enrollment, Coupon } = require('../models');

const asCleanString = (value, maxLength, { lower = false, upper = false } = {}) => {
  if (typeof value !== 'string') return '';
  let next = value.trim().slice(0, maxLength);
  if (lower) next = next.toLowerCase();
  if (upper) next = next.toUpperCase();
  return next;
};

// Public - Create enrollment
router.post('/', async (req, res) => {
  try {
    const name = asCleanString(req.body.name, 100);
    const email = asCleanString(req.body.email, 200, { lower: true });
    const mobile = asCleanString(req.body.mobile, 20);
    const courseId = asCleanString(req.body.courseId, 100);
    const courseName = asCleanString(req.body.courseName, 300);
    const couponCode = asCleanString(req.body.couponCode, 50, { upper: true });

    if (!name || !email || !mobile || !courseId) {
      return res.status(400).json({ error: 'All fields required' });
    }

    let couponMeta = {
      couponCode: '',
      couponDiscount: 0,
      couponDiscountType: '',
    };

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
      if (!coupon) return res.status(400).json({ error: 'Invalid coupon code' });
      if (coupon.expiresAt && new Date() > coupon.expiresAt) return res.status(400).json({ error: 'Coupon has expired' });
      if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) return res.status(400).json({ error: 'Coupon usage limit reached' });

      couponMeta = {
        couponCode: coupon.code,
        couponDiscount: coupon.discountValue,
        couponDiscountType: coupon.discountType,
      };
      await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
    }

    const enrollment = await Enrollment.create({
      name,
      email,
      mobile,
      courseId,
      courseName,
      ...couponMeta,
    });

    res.status(201).json({ success: true, enrollment });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
