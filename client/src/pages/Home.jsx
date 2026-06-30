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
  const bookStageRef = useRef(null);
  const pageRefs = useRef([]);
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

  const bookFeatures = [
    { title: 'Notes', text: 'Clean semester notes sorted by subject.', icon: BookOpen },
    { title: 'PYQs', text: 'Previous year questions in one place.', icon: GraduationCap },
    { title: 'Question Papers', text: 'Exam papers mapped to courses.', icon: FileText },
    { title: 'Resources', text: 'PDFs, links, and helpful references.', icon: Search },
    { title: 'Discussions', text: 'Subject rooms for doubts and answers.', icon: MessageSquare },
    { title: 'AI Assistant', text: 'Study help for faster revision.', icon: Sparkles },
    { title: 'Uploads', text: 'Share notes that helped you prepare.', icon: Upload },
  ];

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
    let cleanupBookInteraction = () => {};

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

      const pages = pageRefs.current.filter(Boolean).length
        ? pageRefs.current.filter(Boolean)
        : Array.from(pageRef.current.querySelectorAll('.physics-page'));
      const coverLeft = pageRef.current.querySelector('.book-cover-left');
      const coverRight = pageRef.current.querySelector('.book-cover-right');
      const bookOrbit = pageRef.current.querySelector('.book-orbit');
      const bookGlow = pageRef.current.querySelector('.book-ambient-glow');
      const bookShadow = pageRef.current.querySelector('.book-shadow');
      const storySection = pageRef.current.querySelector('.story-section');
      const initialTargets = [bookRef.current, coverLeft, coverRight, ...pages].filter(Boolean);
      const physics = {
        current: 0,
        target: 0,
        scrollTarget: 0,
        hoverTarget: 0,
        hoverX: 0,
        hoverY: 0,
        hovering: false,
        settledPage: -1,
        raf: 0,
      };
      const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
      const easeOut = (value) => 1 - Math.pow(1 - value, 3);

      gsap.set(initialTargets, {
        force3D: true,
        transformStyle: 'preserve-3d',
      });

      const setPageTransforms = () => {
        if (!bookRef.current || !coverLeft || !coverRight || pages.length === 0) {
          physics.raf = requestAnimationFrame(setPageTransforms);
          return;
        }

        const sourceTarget = physics.hovering ? physics.hoverTarget : physics.scrollTarget;
        physics.target = sourceTarget;
        physics.current += (physics.target - physics.current) * 0.045;
        if (Math.abs(physics.target - physics.current) < 0.001) physics.current = physics.target;

        const progress = clamp(physics.current);
        const open = clamp(progress * 1.2);
        const hoverLift = physics.hovering ? 1 : 0;
        const ambient = 0.18 + progress * 0.42 + hoverLift * 0.12;

        pageRef.current?.style.setProperty('--book-ambient', ambient.toFixed(3));
        pageRef.current?.style.setProperty('--book-page-shadow', (0.12 + progress * 0.24).toFixed(3));

        gsap.set(bookRef.current, {
          y: -18 * hoverLift,
          scale: 1 + hoverLift * 0.035 + open * 0.012,
          rotationX: 42 - open * 7 - hoverLift * 4 + physics.hoverY * 2,
          rotationY: -10 - open * 7 + physics.hoverX * 6,
          rotationZ: -6 + physics.hoverX * 1.3,
        });

        gsap.set(coverLeft, {
          rotationY: -18 - open * 122,
          x: -open * 11,
          z: open * 18,
        });

        gsap.set(coverRight, {
          rotationY: 7 + open * 20,
          x: open * 5,
        });

        pages.forEach((page, index) => {
          const start = index / (pages.length + 1.6);
          const span = 1 / (pages.length - 0.8);
          const local = clamp((progress - start) / span);
          const eased = easeOut(local);
          const bend = Math.sin(local * Math.PI) * 10;
          const flutter = local > 0.92 ? Math.sin((local - 0.92) * Math.PI * 9) * (1 - local) * 6 : 0;
          const lifted = Math.sin(local * Math.PI) * 18;
          const turn = -eased * 166 + flutter;
          const z = 26 - index * 2 + lifted;
          const pageShade = 0.18 + Math.sin(local * Math.PI) * 0.32;
          const isTurned = local > 0.98;

          page.style.setProperty('--page-curl', `${bend.toFixed(2)}deg`);
          page.style.setProperty('--page-shade', pageShade.toFixed(3));
          gsap.set(page, {
            zIndex: isTurned ? 3 + index : 40 - index,
            rotationY: turn,
            rotationX: -bend * 0.18,
            rotationZ: bend * 0.12,
            x: -eased * 18 + index * 0.9,
            z,
            skewY: bend * 0.13,
          });
        });

        const activePage = Math.round(progress * (pages.length - 1));
        if (activePage !== physics.settledPage && Math.abs(physics.target - physics.current) < 0.02) {
          physics.settledPage = activePage;
          const landingPage = pages[activePage];
          if (landingPage) {
            gsap.fromTo(
              landingPage,
              { rotationZ: '+=1.8' },
              { rotationZ: '-=1.8', duration: 0.34, ease: 'elastic.out(1, 0.55)', overwrite: 'auto' }
            );
          }
        }

        if (bookOrbit) {
          gsap.set(bookOrbit, {
            opacity: physics.hovering ? 0.1 : 0.7 - open * 0.48,
            y: -open * 12,
            scale: 1 - open * 0.04,
          });
        }

        if (bookGlow) {
          gsap.set(bookGlow, {
            opacity: ambient,
            scale: 0.92 + open * 0.22,
          });
        }

        if (bookShadow) {
          gsap.set(bookShadow, {
            opacity: 0.32 + open * 0.24 + hoverLift * 0.08,
            scaleX: 1 + open * 0.18,
            scaleY: 1 + open * 0.08,
          });
        }

        const finalProgress = clamp((progress - 0.86) / 0.14);
        if (storySection) {
          gsap.set(storySection, {
            '--story-reveal': finalProgress,
          });
        }

        physics.raf = requestAnimationFrame(setPageTransforms);
      };

      physics.raf = requestAnimationFrame(setPageTransforms);

      const handleBookMove = (event) => {
        const bounds = bookStageRef.current?.getBoundingClientRect();
        if (!bounds) return;
        const x = clamp((event.clientX - bounds.left) / bounds.width);
        const y = clamp((event.clientY - bounds.top) / bounds.height);
        physics.hovering = true;
        physics.hoverTarget = clamp(1 - y);
        physics.hoverX = (x - 0.5) * 2;
        physics.hoverY = (0.5 - y) * 2;
      };

      const handleBookEnter = () => {
        physics.hovering = true;
      };

      const handleBookLeave = () => {
        physics.hovering = false;
        physics.hoverTarget = 0;
        physics.hoverX = 0;
        physics.hoverY = 0;
        physics.scrollTarget = 0;
      };

      const stageEl = bookStageRef.current;
      stageEl?.addEventListener('pointerenter', handleBookEnter);
      stageEl?.addEventListener('pointermove', handleBookMove);
      stageEl?.addEventListener('pointerleave', handleBookLeave);
      cleanupBookInteraction = () => {
        stageEl?.removeEventListener('pointerenter', handleBookEnter);
        stageEl?.removeEventListener('pointermove', handleBookMove);
        stageEl?.removeEventListener('pointerleave', handleBookLeave);
        cancelAnimationFrame(physics.raf);
      };

      ScrollTrigger.create({
        trigger: '.book-scroll-stage',
        start: 'top 76%',
        end: 'bottom 10%',
        scrub: true,
        onUpdate: (self) => {
          if (!physics.hovering) {
            physics.scrollTarget = self.progress;
          }
        },
      });

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
      cleanupBookInteraction();
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

          <div ref={bookStageRef} className="hero-object book-scroll-stage">
            <div ref={bookRef} className="study-book" aria-label="Animated resource book">
              <div className="book-ambient-glow" />
              <div className="book-shadow" />
              <div className="book-cover book-cover-left">
                <span>BPSMV</span>
              </div>
              <div className="book-spine" />
              <div className="book-cover book-cover-right">
                <span>Hub</span>
              </div>
              {bookFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    ref={(node) => {
                      pageRefs.current[index] = node;
                    }}
                    className={`book-page physics-page book-page-${index + 1}`}
                    style={{ '--page-index': index }}
                  >
                    <div className="book-page-back" />
                    <div className="page-feature-icon"><Icon size={18} /></div>
                    <strong>{feature.title}</strong>
                    <small>{feature.text}</small>
                    <div className="page-number">0{index + 1}</div>
                  </div>
                );
              })}
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
