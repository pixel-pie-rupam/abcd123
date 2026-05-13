import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { getCourses, getComingSoon } from '../utils/api';

const CAT_MAP = {
  all: { label: 'All Courses', icon: '🎓' },
  aws: { label: 'AWS Cloud', icon: '☁️', color: '#ff9900' },
  azure: { label: 'Azure', icon: '🔷', color: '#0078d4' },
  cybersecurity: { label: 'Cybersecurity', icon: '🛡️', color: '#ff4757' },
  soc: { label: 'SOC', icon: '🔍', color: '#00d4a1' },
  'pentesting-web': { label: 'Web Pentest', icon: '🕸️', color: '#ffa502' },
  'pentesting-network': { label: 'Network Pentest', icon: '🌐', color: '#ff6b35' },
  'pentesting-api': { label: 'API Pentest', icon: '⚡', color: '#a29bfe' },
  networking: { label: 'Networking', icon: '📡', color: '#6c47ff' },
};

function CourseCard({ course }) {
  const navigate = useNavigate();
  const cat = CAT_MAP[course.category] || {};
  return (
    <div className="card course-card" onClick={() => navigate(`/courses/${course.slug}`)}>
      <div className="course-thumb">
        {course.thumbnail
          ? <img src={course.thumbnail} alt={course.title} />
          : <div className="course-thumb-placeholder">{cat.icon || '📚'}</div>
        }
      </div>
      <div className="course-body">
        <div className="course-meta">
          <span className="tag" style={cat.color ? { color: cat.color, borderColor: `${cat.color}33`, background: `${cat.color}14` } : {}}>{cat.icon} {cat.label}</span>
          <span className="tag">{course.level}</span>
          {course.price === 0 && <span className="tag free">FREE</span>}
        </div>
        <div className="course-title">{course.title}</div>
        <div className="course-desc">{course.description}</div>
        <div className="course-footer">
          <div className="course-trainer">
            {course.trainer?.photo
              ? <img src={course.trainer.photo} alt={course.trainer.name} />
              : <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--accent2)', fontWeight: 700 }}>{(course.trainer?.name || 'P')[0]}</span>
            }
            {course.trainer?.name || 'Pragni'}
          </div>
          {course.price === 0
            ? <span className="price-free">FREE</span>
            : <span className="price-paid">₹{course.price}</span>
          }
        </div>
      </div>
    </div>
  );
}

function ComingSoonCard({ course }) {
  const cat = CAT_MAP[course.category] || {};
  return (
    <div className="coming-card">
      <div className="coming-overlay" />
      <div style={{ position: 'relative' }}>
        <div className="course-meta" style={{ marginBottom: 10 }}>
          <span className="tag amber">🔜 Coming Soon</span>
          <span className="tag" style={cat.color ? { color: cat.color, borderColor: `${cat.color}33`, background: `${cat.color}14` } : {}}>{cat.icon} {cat.label}</span>
        </div>
        <div className="course-title">{course.title}</div>
        {course.description && <div className="course-desc">{course.description}</div>}
      </div>
    </div>
  );
}

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [coming, setComing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';
  const activeLevel = searchParams.get('level') || 'all';

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (activeCategory !== 'all') params.category = activeCategory;
    if (activeLevel !== 'all') params.level = activeLevel;
    Promise.all([
      getCourses(params).then(r => setCourses(r.data.courses || [])),
      getComingSoon().then(r => setComing(r.data.courses || []))
    ]).finally(() => setLoading(false));
  }, [activeCategory, activeLevel]);

  const setCategory = (cat) => {
    const p = new URLSearchParams(searchParams);
    if (cat === 'all') p.delete('category'); else p.set('category', cat);
    setSearchParams(p);
  };

  const setLevel = (lv) => {
    const p = new URLSearchParams(searchParams);
    if (lv === 'all') p.delete('level'); else p.set('level', lv);
    setSearchParams(p);
  };

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <div className="eyebrow">All Courses</div>
          <h2>Learn at Your Own Pace</h2>
          <p>Free and affordable courses in Cloud, Cybersecurity, Networking & more.</p>
        </div>

        {/* Category filter */}
        <div className="cat-filter">
          {Object.entries(CAT_MAP).map(([slug, { label, icon }]) => (
            <button key={slug} className={`cat-btn ${activeCategory === slug ? 'active' : ''}`} onClick={() => setCategory(slug)}>
              {icon} {label}
            </button>
          ))}
        </div>

        {/* Level filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          {['all', 'beginner', 'intermediate', 'advanced'].map(lv => (
            <button key={lv} className={`cat-btn ${activeLevel === lv ? 'active' : ''}`} onClick={() => setLevel(lv)}
              style={{ fontSize: 12 }}>
              {lv === 'all' ? 'All Levels' : lv.charAt(0).toUpperCase() + lv.slice(1)}
            </button>
          ))}
        </div>

        {loading
          ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
              {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 320, borderRadius: 16 }} />)}
            </div>
          : courses.length === 0
            ? <div className="empty-state"><div className="icon">🔍</div><p>No courses found. Try a different filter.</p></div>
            : <div className="grid-3">{courses.map(c => <CourseCard key={c._id} course={c} />)}</div>
        }

        {/* Coming Soon */}
        {coming.length > 0 && (
          <>
            <div className="divider" />
            <div className="section-head">
              <div className="eyebrow">Coming Soon</div>
              <h2>Premium Batches — Launching Soon</h2>
              <p>Intensive live cohorts with hands-on labs and certification prep.</p>
            </div>
            <div className="grid-3">{coming.map(c => <ComingSoonCard key={c._id} course={c} />)}</div>
          </>
        )}
      </div>
    </section>
  );
}
