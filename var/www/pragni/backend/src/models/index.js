const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ── User permissions system ──────────────────────────────────────────────────
// role: 'admin' | 'trainer' | 'semi-admin'
// permissions for semi-admin: array of strings e.g. ['comments','seo','courses','videos','workshops','trainers','banner','categories','contact','enrollments']
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 200 },
  password: { type: String, required: true, minlength: 8 },
  role: { type: String, enum: ['admin', 'trainer', 'semi-admin'], default: 'trainer' },
  permissions: [{ type: String }], // for semi-admin role
  bio: { type: String, default: '', maxlength: 2000 },
  photo: { type: String, default: '', maxlength: 500 },
  specializations: [{ type: String, maxlength: 100 }],
  socialLinks: { linkedin: String, github: String, twitter: String },
  isActive:          { type: Boolean, default: true },
  showOnPublicPage:  { type: Boolean, default: true },  // trainer visible on /trainers page
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.matchPassword = async function(plain) {
  return bcrypt.compare(plain, this.password);
};

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 300 },
  slug: { type: String, required: true, unique: true, trim: true, maxlength: 300 },
  category: { type: String, required: true, trim: true, maxlength: 100 },
  subcategory: { type: String, default: '', trim: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 5000 },
  thumbnail: { type: String, default: '', maxlength: 500 },
  level: { type: String, enum: ['beginner','intermediate','advanced'], default: 'beginner' },
  price: { type: Number, default: 0, min: 0 },
  isFeatured: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: false },
  isComing: { type: Boolean, default: false },
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  syllabus: [{ weekNumber: Number, title: { type: String, maxlength: 300 }, topics: [{ type: String, maxlength: 300 }] }],
  enrolledCount: { type: Number, default: 0 },
  order: { type: Number, default: 0 },
  // Premium course fields
  benefits:                  { type: String, default: '', maxlength: 3000 },
  duration:                  { type: String, default: '', maxlength: 200 },
  prerequisites:             { type: String, default: '', maxlength: 2000 },
  certificationOnCompletion: { type: Boolean, default: false },
  premiumContent:            { type: String, default: '', maxlength: 3000 },
  hasProject:                { type: Boolean, default: false },
}, { timestamps: true });

const videoSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true, trim: true, maxlength: 300 },
  description: { type: String, default: '', maxlength: 2000 },
  encryptedVideoId: { type: String, required: true },
  videoType: { type: String, enum: ['unlisted', 'listed'], default: 'unlisted' }, // Fix #8
  weekNumber: { type: Number, default: 1 },
  order: { type: Number, default: 0 },
  duration: { type: String, default: '', maxlength: 50 },
  resources: [{
    type: { type: String, enum: ['pdf','gdrive','notes','link'] },
    title: { type: String, maxlength: 200 },
    encryptedUrl: String,
  }],
  isPublished: { type: Boolean, default: false },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const workshopSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 300 },
  description: { type: String, required: true, maxlength: 3000 },
  bannerImage: { type: String, default: '', maxlength: 500 },
  scheduledAt: { type: Date, required: true },
  durationMinutes: { type: Number, default: 60 },
  encryptedMeetLink: { type: String, default: '' },
  category: { type: String, default: 'general', trim: true, maxlength: 100 },
  isActive: { type: Boolean, default: true },
  registrationCount: { type: Number, default: 0 },
}, { timestamps: true });

const registrationSchema = new mongoose.Schema({
  workshop: { type: mongoose.Schema.Types.ObjectId, ref: 'Workshop', required: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, lowercase: true, trim: true, maxlength: 200 },
  mobile: { type: String, default: '', trim: true, maxlength: 20 },
  joinedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const commentSchema = new mongoose.Schema({
  video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  userName: { type: String, required: true, trim: true, maxlength: 100 },
  userEmail: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
  content: { type: String, required: true, maxlength: 2000 },
  isDoubt: { type: Boolean, default: false },
  isResolved: { type: Boolean, default: false },
  reply: { type: String, default: '', maxlength: 2000 },
  repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isApproved: { type: Boolean, default: false },
}, { timestamps: true });

const enrollmentSchema = new mongoose.Schema({
  courseId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  courseName:     { type: String, default: '', maxlength: 300 },
  name:           { type: String, required: true, trim: true, maxlength: 100 },
  email:          { type: String, required: true, lowercase: true, trim: true, maxlength: 200 },
  mobile:         { type: String, required: true, trim: true, maxlength: 20 },
  couponCode:     { type: String, default: '', trim: true, maxlength: 50 },
  couponDiscount: { type: Number, default: 0 },
  couponDiscountType: { type: String, enum: ['percent', 'fixed', ''], default: '' },
  // Student tracking fields
  altEmail:       { type: String, default: '', maxlength: 200 },
  altPhone:       { type: String, default: '', maxlength: 20 },
  notes:          { type: String, default: '', maxlength: 1000 },
  contacted:      { type: Boolean, default: false },   // checkbox: have we contacted this student?
  contactStatus:  { type: String, enum: ['pending','contacted','enrolled','not_interested','followup'], default: 'pending' },
}, { timestamps: true });

const categorySchema = new mongoose.Schema({
  slug:  { type: String, required: true, unique: true, trim: true, maxlength: 100 },
  label: { type: String, required: true, trim: true, maxlength: 100 },
  icon:  { type: String, default: '📁' },
  color: { type: String, default: '#7b5ea7', maxlength: 30 },
  glow:  { type: String, default: 'rgba(123,94,167,0.2)', maxlength: 60 },
  order: { type: Number, default: 0 },
  imageUrl: { type: String, default: '', maxlength: 500 }, // optional image instead of emoji
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const bannerSchema = new mongoose.Schema({
  type:           { type: String, default: 'topbar' },
  headline:       { type: String, default: '', maxlength: 300 },
  subtext:        { type: String, default: '', maxlength: 1000 },
  message:        { type: String, default: '', maxlength: 500 },
  imageUrl:       { type: String, default: '', maxlength: 500 },
  ctaText:        { type: String, default: '', maxlength: 100 },
  ctaUrl:         { type: String, default: '', maxlength: 500 },
  ctaStyle:       { type: String, default: 'button' },
  secondaryText:  { type: String, default: '', maxlength: 100 },
  secondaryUrl:   { type: String, default: '', maxlength: 500 },
  bgColor:        { type: String, default: '#7b5ea7', maxlength: 30 },
  textColor:      { type: String, default: '#ffffff', maxlength: 30 },
  ctaBgColor:     { type: String, default: '#2d4fd6', maxlength: 30 },
  ctaTextColor:   { type: String, default: '#ffffff', maxlength: 30 },
  overlayOpacity: { type: Number, default: 0.6 },
  isClickable:    { type: Boolean, default: true },
  isActive:       { type: Boolean, default: false },
  linkUrl:        { type: String, default: '', maxlength: 500 },
  linkText:       { type: String, default: '', maxlength: 200 },
}, { timestamps: true });

const settingsSchema = new mongoose.Schema({
  key:   { type: String, required: true, unique: true, trim: true, maxlength: 100 },
  value: { type: String, default: '', maxlength: 5000 },
}, { timestamps: true });

const seoSchema = new mongoose.Schema({
  siteName:        { type: String, default: 'Pragni Tech', maxlength: 100 },
  siteDescription: { type: String, default: '', maxlength: 500 },
  siteKeywords:    { type: String, default: '', maxlength: 500 },
  canonicalUrl:    { type: String, default: '', maxlength: 500 },
  defaultOgImage:  { type: String, default: '', maxlength: 500 },
  faviconUrl:      { type: String, default: '', maxlength: 500 },
  googleVerification: { type: String, default: '', maxlength: 200 },
  bingVerification:   { type: String, default: '', maxlength: 200 },
  googleAnalyticsId:  { type: String, default: '', maxlength: 50 },
  robotsTxt: { type: String, default: 'User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: /sitemap.xml', maxlength: 2000 },
  twitterHandle:  { type: String, default: '', maxlength: 100 },
  ogType:         { type: String, default: 'website', maxlength: 50 },
  schemaOrg:      { type: String, default: '', maxlength: 5000 },
  pageOverrides:  { type: String, default: '{}', maxlength: 10000 },
  updatedAt:      { type: Date, default: Date.now },
}, { timestamps: true });

const contactSchema = new mongoose.Schema({
  email:        { type: String, default: '', maxlength: 200 },
  phone:        { type: String, default: '', maxlength: 50 },
  whatsapp:     { type: String, default: '', maxlength: 50 },
  address:      { type: String, default: '', maxlength: 500 },
  mapEmbedUrl:  { type: String, default: '', maxlength: 1000 },
  youtube:      { type: String, default: '', maxlength: 500 },
  instagram:    { type: String, default: '', maxlength: 500 },
  twitter:      { type: String, default: '', maxlength: 500 },
  linkedin:     { type: String, default: '', maxlength: 500 },
  facebook:     { type: String, default: '', maxlength: 500 },
  telegram:     { type: String, default: '', maxlength: 500 },
  discord:      { type: String, default: '', maxlength: 500 },
  github:       { type: String, default: '', maxlength: 500 },
  formEnabled:  { type: Boolean, default: true },
  formRecipientEmail: { type: String, default: '', maxlength: 200 },
}, { timestamps: true });

// Fix #2 — Contact form messages stored in DB (admin can view them)
const contactMessageSchema = new mongoose.Schema({
  name:    { type: String, required: true, trim: true, maxlength: 100 },
  email:   { type: String, required: true, lowercase: true, trim: true, maxlength: 200 },
  message: { type: String, required: true, maxlength: 3000 },
  isRead:  { type: Boolean, default: false },
}, { timestamps: true });

// Fix #5 — Coupon codes
const couponSchema = new mongoose.Schema({
  code:          { type: String, required: true, unique: true, uppercase: true, trim: true, maxlength: 50 },
  discountType:  { type: String, enum: ['percent', 'fixed'], default: 'percent' },
  discountValue: { type: Number, required: true, min: 0 },
  maxUses:       { type: Number, default: 0 }, // 0 = unlimited
  usedCount:     { type: Number, default: 0 },
  expiresAt:     { type: Date, default: null },
  isActive:      { type: Boolean, default: true },
  description:   { type: String, default: '', maxlength: 300 },
}, { timestamps: true });

// Fix #4 — Premium course bundles
const bundleSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true, maxlength: 300 },
  description: { type: String, default: '', maxlength: 3000 },
  thumbnail:   { type: String, default: '', maxlength: 500 },
  courses:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  bundlePrice: { type: Number, required: true, min: 0 },
  isActive:    { type: Boolean, default: true },
  isFeatured:  { type: Boolean, default: false },
}, { timestamps: true });


// ── Journey/Gallery carousel (admin-controlled image slider) ──────────────────
const journeySchema = new mongoose.Schema({
  title:       { type: String, default: '', maxlength: 200 },
  description: { type: String, default: '', maxlength: 500 },
  imageUrl:    { type: String, required: true, maxlength: 500 },
  order:       { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

// ── Team Members (About page — Founder, CEO, etc.) ────────────────────────────
const teamMemberSchema = new mongoose.Schema({
  name:           { type: String, required: true, trim: true, maxlength: 100 },
  role:           { type: String, default: '', maxlength: 100 },
  photo:          { type: String, default: '', maxlength: 500 },
  bio:            { type: String, default: '', maxlength: 1000 },
  linkedin:       { type: String, default: '', maxlength: 500 },
  twitter:        { type: String, default: '', maxlength: 500 },
  order:          { type: Number, default: 0 },
  showOnAboutPage: { type: Boolean, default: true },
}, { timestamps: true });

// ── Site content blocks (hero tagline, description, about text, etc.) ─────────
const siteContentSchema = new mongoose.Schema({
  key:   { type: String, required: true, unique: true, maxlength: 100 },
  value: { type: String, default: '', maxlength: 5000 },
}, { timestamps: true });

module.exports = {
  User:           mongoose.model('User', userSchema),
  Course:         mongoose.model('Course', courseSchema),
  Video:          mongoose.model('Video', videoSchema),
  Workshop:       mongoose.model('Workshop', workshopSchema),
  Registration:   mongoose.model('Registration', registrationSchema),
  Comment:        mongoose.model('Comment', commentSchema),
  Enrollment:     mongoose.model('Enrollment', enrollmentSchema),
  Category:       mongoose.model('Category', categorySchema),
  Banner:         mongoose.model('Banner', bannerSchema),
  Settings:       mongoose.model('Settings', settingsSchema),
  Seo:            mongoose.model('Seo', seoSchema),
  Contact:        mongoose.model('Contact', contactSchema),
  ContactMessage: mongoose.model('ContactMessage', contactMessageSchema),
  Coupon:         mongoose.model('Coupon', couponSchema),
  Bundle:         mongoose.model('Bundle', bundleSchema),
  JourneySlide:   mongoose.model('JourneySlide', journeySchema),
  TeamMember:     mongoose.model('TeamMember', teamMemberSchema),
  SiteContent:    mongoose.model('SiteContent', siteContentSchema),
};
