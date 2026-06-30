import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import axios from 'axios';
import {
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  GraduationCap,
  Layers,
  Loader2,
  MessageSquare,
  Orbit,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Upload,
  UserPlus,
  Users,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Home.css';

gsap.registerPlugin(ScrollTrigger);

const REVIEW_STORAGE_KEY = 'bpsmvSubmittedReview';
const REVIEW_VISITOR_KEY = 'bpsmvReviewVisitorKey';

const getStoredSubmittedReview = () => {
  try {
    const saved = localStorage.getItem(REVIEW_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const getVisitorReviewKey = () => {
  let key = localStorage.getItem(REVIEW_VISITOR_KEY);
  if (!key) {
    key = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(REVIEW_VISITOR_KEY, key);
  }
  return `visitor:${key}`;
};

const mergeOwnReview = (list, ownReview) => {
  if (!ownReview?._id) return list;
  if (list.some((review) => review._id === ownReview._id)) return list;
  return [ownReview, ...list];
};

const reveal = {
  hidden: { opacity: 0, y: 28, filter: 'blur(10px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const reduceMotion = useReducedMotion();
  const pageRef = useRef(null);
  const bookRef = useRef(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [introComplete, setIntroComplete] = useState(false);
  const [stats, setStats] = useState({
    totalResources: 0,
    totalSubjects: 0,
    totalStudents: 0,
    totalNotes: 0,
    totalPYQs: 0,
    totalBranches: 0,
    totalCourses: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ fullName: '', rating: 5, review: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');
  const [submittedReview, setSubmittedReview] = useState(null);

  const statItems = useMemo(() => [
    { icon: BookOpen, label: 'Subjects mapped', value: stats.totalSubjects || 42 },
    { icon: FileText, label: 'Resources live', value: stats.totalResources || 520 },
    { icon: Users, label: 'Students flowing', value: stats.totalStudents || 860 },
    { icon: ShieldCheck, label: 'Branches covered', value: stats.totalBranches || 12 },
  ], [stats]);

  const featureScenes = [
    {
      icon: Search,
      kicker: 'Search layer',
      title: 'Find the exact material before your study rhythm breaks.',
      text: 'Notes, PYQs, PDFs, and subject discussions are arranged by degree, branch, year, and semester.',
      metric: '0.8s',
      label: 'to narrow results',
    },
    {
      icon: Upload,
      kicker: 'Contribution layer',
      title: 'Upload once. Help the whole batch move faster.',
      text: 'Students can contribute resources with clean categorization so useful material does not vanish in chat threads.',
      metric: '1 tap',
      label: 'to share notes',
    },
    {
      icon: MessageSquare,
      kicker: 'Discussion layer',
      title: 'Turn scattered doubts into subject-wise knowledge rooms.',
      text: 'Dedicated spaces make academic conversation easier to revisit, reference, and build on.',
      metric: '24/7',
      label: 'peer support',
    },
  ];

  const journey = [
    { icon: UserPlus, title: 'Enter', text: 'Create your account and land in a calm student workspace.' },
    { icon: Layers, title: 'Filter', text: 'Choose your course, branch, semester, and subject.' },
    { icon: Download, title: 'Collect', text: 'Preview, save, and study from resources that match your syllabus.' },
    { icon: Orbit, title: 'Return', text: 'Ask doubts, upload notes, and keep the library improving.' },
  ];

  const fetchReviews = async (page) => {
    setReviewsLoading(true);
    try {
      const res = await axios.get(`/reviews/approved?page=${page}&limit=6`);
      const savedReview = getStoredSubmittedReview();
      setReviews(mergeOwnReview(res.data.reviews || [], savedReview));
      setReviewsTotal(res.data.total || 0);
      setReviewsPage(res.data.page || 1);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    const savedReview = getStoredSubmittedReview();
    if (savedReview) setSubmittedReview(savedReview);

    axios.get('/resources/public/stats')
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setStatsLoading(false));

    fetchReviews(1);
  }, []);

  useEffect(() => {
    if (user?.name && !submittedReview && !reviewForm.fullName.trim()) {
      setReviewForm((current) => ({ ...current, fullName: user.name }));
    }
  }, [user, submittedReview, reviewForm.fullName]);

  useEffect(() => {
    if (reduceMotion) {
      setLoadingProgress(100);
      setIntroComplete(true);
      return undefined;
    }

    const timer = window.setInterval(() => {
      setLoadingProgress((current) => {
        if (current >= 100) {
          window.clearInterval(timer);
          window.setTimeout(() => setIntroComplete(true), 420);
          return 100;
        }
        return Math.min(100, current + Math.floor(Math.random() * 9) + 5);
      });
    }, 95);

    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion || !pageRef.current) return undefined;

    const lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 0.85 });
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      gsap.from('.hero-word', {
        yPercent: 80,
        rotateX: -10,
        opacity: 0,
        stagger: 0.04,
        duration: 0.82,
        ease: 'power4.out',
        delay: 0.2,
      });

      gsap.to('.hero-light-ray', {
        xPercent: 18,
        yPercent: -8,
        rotate: 4,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.timeline({
        scrollTrigger: {
          trigger: '.book-scroll-stage',
          start: 'top 76%',
          end: 'bottom 12%',
          scrub: 0.8,
        },
      })
        .to('.book-cover-left', { rotateY: -42, x: -8, ease: 'none' }, 0)
        .to('.book-cover-right', { rotateY: 28, x: 6, ease: 'none' }, 0)
        .to('.book-page-1', { rotateY: -152, x: -16, z: 22, ease: 'none' }, 0.12)
        .to('.book-page-2', { rotateY: -144, x: -14, z: 28, ease: 'none' }, 0.32)
        .to('.book-page-3', { rotateY: -136, x: -12, z: 34, ease: 'none' }, 0.52)
        .to('.book-page-4', { rotateY: -126, x: -10, z: 40, ease: 'none' }, 0.72)
        .to(bookRef.current, { rotateX: 38, rotateY: -14, rotateZ: -2, scale: 1.04, ease: 'none' }, 0)
        .to('.book-orbit', { opacity: 0.2, y: -10, scale: 0.96, ease: 'none' }, 0);

      gsap.utils.toArray('.scene-card').forEach((card, index) => {
        gsap.from(card, {
          scrollTrigger: { trigger: card, start: 'top 82%' },
          y: 72,
          rotateX: index % 2 ? -9 : 9,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
        });
      });

      gsap.utils.toArray('.timeline-node').forEach((node, index) => {
        gsap.from(node, {
          scrollTrigger: { trigger: '.journey-rail', start: 'top 72%' },
          y: 42,
          opacity: 0,
          delay: index * 0.08,
          duration: 0.75,
          ease: 'back.out(1.35)',
        });
      });
    }, pageRef);

    const handleMouse = (event) => {
      const x = event.clientX;
      const y = event.clientY;
      pageRef.current?.style.setProperty('--mouse-x', `${x}px`);
      pageRef.current?.style.setProperty('--mouse-y', `${y}px`);
      pageRef.current?.style.setProperty('--tilt-x', `${((y / window.innerHeight) - 0.5) * -10}deg`);
      pageRef.current?.style.setProperty('--tilt-y', `${((x / window.innerWidth) - 0.5) * 12}deg`);
    };

    window.addEventListener('mousemove', handleMouse);

    return () => {
      window.removeEventListener('mousemove', handleMouse);
      ctx.revert();
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, [reduceMotion]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (submittedReview || !reviewForm.fullName.trim() || !reviewForm.review.trim()) return;
    setReviewSubmitting(true);
    setReviewMessage('');

    try {
      const reviewerKey = user?._id ? `user:${user._id}` : getVisitorReviewKey();
      const res = await axios.post('/reviews', {
        fullName: reviewForm.fullName.trim(),
        rating: parseInt(reviewForm.rating, 10),
        review: reviewForm.review.trim(),
        reviewerKey,
      });
      const newReview = res.data;
      localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(newReview));
      setSubmittedReview(newReview);
      setReviews((prev) => mergeOwnReview(prev, newReview).slice(0, 6));
      setReviewsTotal((prev) => prev + 1);
      setReviewForm({ fullName: '', rating: 5, review: '' });
      setReviewMessage('Thank you. Your review is now in the student wall.');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to submit review. Please try again.';
      setReviewMessage(message);
      if (err.response?.status === 409) {
        const savedReview = getStoredSubmittedReview();
        if (savedReview) setSubmittedReview(savedReview);
      }
    } finally {
      setReviewSubmitting(false);
    }
  };

  const goPrimary = () => navigate(isAuthenticated ? '/dashboard' : '/login');

  return (
    <div ref={pageRef} className="landing-cinema -mx-4 -my-6 sm:-mx-6 lg:-mx-8">
      {!introComplete && (
        <div className="launch-loader">
          <div className="loader-aurora" />
          <div className="loader-mark">
            <BookOpen size={34} />
            <span>BPSMV</span>
          </div>
          <div className="loader-copy">
            <p>Indexing notes, papers, discussions</p>
            <strong>{loadingProgress}%</strong>
          </div>
          <div className="loader-track">
            <span style={{ width: `${loadingProgress}%` }} />
          </div>
        </div>
      )}

      <div className="cinema-cursor" />
      <div className="mouse-light" />
      <div className="grain-layer" />

      <section className="hero-theater min-h-[calc(100vh-4rem)]">
        <div className="hero-light-ray" />
        <div className="hero-shell">
          <motion.div
            variants={reveal}
            initial="hidden"
            animate="show"
            className="hero-copy"
          >
            <div className="signal-pill">
              <Sparkles size={16} />
              <span>Academic OS for BPSMV students</span>
            </div>
            <h1 className="hero-headline">
              <span className="hero-line">
                {['Study', 'smarter'].map((word) => (
                  <span className="hero-word-mask" key={word}>
                    <span className="hero-word">{word}</span>
                  </span>
                ))}
              </span>
              <span className="hero-line muted-line">
                {['with', 'one', 'beautiful', 'resource', 'hub.'].map((word) => (
                  <span className="hero-word-mask" key={word}>
                    <span className="hero-word">{word}</span>
                  </span>
                ))}
              </span>
            </h1>
            <p className="hero-subcopy">
              Subject-wise notes, previous year papers, discussions, and uploads in one calm workspace designed for BPSMV students.
            </p>
            <div className="hero-actions">
              <button className="magnetic-button primary" onClick={goPrimary}>
                <span>{isAuthenticated ? 'Open dashboard' : 'Enter the hub'}</span>
                <ArrowRight size={18} />
              </button>
              <button className="magnetic-button secondary" onClick={() => navigate('/resources')}>
                <span>Explore resources</span>
                <Search size={18} />
              </button>
            </div>
          </motion.div>

          <div className="hero-object book-scroll-stage">
            <div ref={bookRef} className="study-book" aria-label="Animated resource book">
              <div className="book-shadow" />
              <div className="book-cover book-cover-left">
                <span>Notes</span>
              </div>
              <div className="book-spine" />
              <div className="book-cover book-cover-right">
                <span>PYQ</span>
              </div>
              <div className="book-page book-page-1">
                <strong>Search</strong>
                <small>Branch, semester, subject</small>
              </div>
              <div className="book-page book-page-2">
                <strong>Discuss</strong>
                <small>Ask, answer, revisit</small>
              </div>
              <div className="book-page book-page-3">
                <strong>Upload</strong>
                <small>Share what helped</small>
              </div>
              <div className="book-page book-page-4">
                <strong>Revise</strong>
                <small>Return before exams</small>
              </div>
            </div>
            <div className="book-orbit">
              <span><FileText size={16} /> PDFs</span>
              <span><MessageSquare size={16} /> Doubts</span>
              <span><GraduationCap size={16} /> Syllabus</span>
            </div>
          </div>
        </div>

        <div className="stats-marquee">
          <div className="stats-track">
            {[...statItems, ...statItems].map((item, index) => {
              const Icon = item.icon;
              return (
                <div className="stat-chip" key={`${item.label}-${index}`}>
                  <Icon size={18} />
                  <strong>{statsLoading ? '...' : item.value}+</strong>
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="cinema-section story-section">
        <div className="section-kicker">Scroll story</div>
        <h2 className="section-title">Every layer has a job.</h2>
        <p className="section-copy">
          The landing page now behaves like the product promise: connected, guided, and responsive. Search, contribution, and discussion appear as linked scenes instead of ordinary feature tiles.
        </p>

        <div className="scene-grid">
          {featureScenes.map((feature) => {
            const Icon = feature.icon;
            return (
              <article className="scene-card" key={feature.title}>
                <div className="scene-card-glow" />
                <div className="scene-card-icon"><Icon size={24} /></div>
                <span>{feature.kicker}</span>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
                <div className="scene-metric">
                  <strong>{feature.metric}</strong>
                  <small>{feature.label}</small>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="cinema-section resource-lab">
        <div className="lab-visual">
          <img src="/assets/image5.jpeg" alt="Students collaborating around study resources" />
          <div className="lab-panel panel-a">
            <Zap size={18} />
            <span>Live resource pulse</span>
          </div>
          <div className="lab-panel panel-b">
            <BookOpen size={18} />
            <span>{statsLoading ? 'Curated' : `${stats.totalNotes || 240}+`} notes</span>
          </div>
        </div>
        <div className="lab-copy">
          <div className="section-kicker">Interactive workspace</div>
          <h2 className="section-title">A floating desk for the whole campus.</h2>
          <p className="section-copy">
            Materials do not just sit in folders. They orbit the student journey: discover, preview, discuss, upload, and return when exams get close.
          </p>
          <div className="lab-stack">
            {['Subject rooms stay searchable', 'Previous papers stay close to notes', 'Uploads inherit useful academic context'].map((item) => (
              <div className="lab-row" key={item}>
                <span />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cinema-section journey-section">
        <div className="section-kicker">Student path</div>
        <h2 className="section-title">From panic-searching to a repeatable study ritual.</h2>
        <div className="journey-rail">
          {journey.map((step, index) => {
            const Icon = step.icon;
            return (
              <div className="timeline-node" key={step.title}>
                <div className="node-index">0{index + 1}</div>
                <div className="node-icon"><Icon size={22} /></div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="cinema-section review-section">
        <div className="review-copy">
          <div className="section-kicker">Student signal</div>
          <h2 className="section-title">The wall of proof stays alive.</h2>
          <p className="section-copy">
            Reviews are still powered by the real API, now wrapped in a cleaner editorial surface.
          </p>
        </div>

        <div className="review-compose">
          {submittedReview ? (
            <div className="submitted-review">
              <div className="review-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={17} className={i < submittedReview.rating ? 'filled' : ''} />
                ))}
              </div>
              <p>"{submittedReview.review}"</p>
              <strong>{submittedReview.fullName}</strong>
              {reviewMessage && <span>{reviewMessage}</span>}
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit}>
              <label>
                <span>Full name</span>
                <input
                  type="text"
                  value={reviewForm.fullName}
                  onChange={(e) => setReviewForm({ ...reviewForm, fullName: e.target.value })}
                  required
                />
              </label>
              <label>
                <span>Rating</span>
                <div className="rating-row">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      aria-label={`${star} star rating`}
                    >
                      <Star size={22} className={star <= reviewForm.rating ? 'filled' : ''} />
                    </button>
                  ))}
                </div>
              </label>
              <label>
                <span>Your review</span>
                <textarea
                  value={reviewForm.review}
                  onChange={(e) => setReviewForm({ ...reviewForm, review: e.target.value })}
                  maxLength={2000}
                  required
                />
              </label>
              {reviewMessage && <p className="review-message">{reviewMessage}</p>}
              <button className="magnetic-button primary" type="submit" disabled={reviewSubmitting}>
                {reviewSubmitting ? <Loader2 size={17} className="spin" /> : <Send size={17} />}
                <span>{reviewSubmitting ? 'Submitting' : 'Submit review'}</span>
              </button>
            </form>
          )}
        </div>

        <div className="review-wall">
          {reviewsLoading ? (
            <div className="review-loading"><Loader2 className="spin" /> Loading reviews</div>
          ) : reviews.length === 0 ? (
            <div className="review-loading">No reviews yet. Be the first voice here.</div>
          ) : (
            reviews.map((review) => (
              <article className="review-card" key={review._id}>
                <div className="review-stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={15} className={i < review.rating ? 'filled' : ''} />
                  ))}
                </div>
                <p>"{review.review}"</p>
                <div>
                  <strong>{review.fullName}</strong>
                  <span>{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Student review'}</span>
                </div>
              </article>
            ))
          )}
        </div>

        {reviewsTotal > 6 && (
          <div className="review-pagination">
            <button onClick={() => fetchReviews(reviewsPage - 1)} disabled={reviewsPage <= 1 || reviewsLoading}>
              <ChevronLeft size={18} />
            </button>
            <span>Page {reviewsPage} of {Math.ceil(reviewsTotal / 6)}</span>
            <button onClick={() => fetchReviews(reviewsPage + 1)} disabled={reviewsPage >= Math.ceil(reviewsTotal / 6) || reviewsLoading}>
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </section>

      <section className="final-theater">
        <div className="final-image">
          <img src="/assets/image3.png" alt="Motivational study collage" />
        </div>
        <div className="final-copy">
          <div className="section-kicker">Next session</div>
          <h2>Open the hub before your next study sprint.</h2>
          <p>Start with the material you need, then leave something useful behind for the next student.</p>
          <div className="hero-actions">
            <button className="magnetic-button light" onClick={goPrimary}>
              <Sparkles size={18} />
              <span>{isAuthenticated ? 'Open dashboard' : 'Get started'}</span>
            </button>
            <button className="magnetic-button ghost" onClick={() => navigate('/upload')}>
              <Upload size={18} />
              <span>Upload resource</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
