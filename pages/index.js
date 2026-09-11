// pages/index.js - Produit Academy Classes Home (70% Minimalist + 20% Futuristic + 10% Playful)
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from '../styles/Home.module.css';
import {
  ArrowRight, Video, BarChart3, ShieldCheck, BookOpen,
  Sparkles, CheckCircle2, GraduationCap, Send, Clock, UserCheck
} from 'lucide-react';

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    course: '',
    message: '',
    platform: 'classes'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState({ type: '', message: '' });
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/classes/courses/?page_size=200`)
      .then(res => res.json())
      .then(data => setCourses(data.results || data || []))
      .catch(err => console.error("Failed to fetch courses", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitResult({ type: '', message: '' });
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/contact/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to send');
      setSubmitResult({
        type: 'success',
        message: 'Your inquiry has been received. Our academic coordinator will contact you shortly.'
      });
      setFormData({ name: '', email: '', phone: '', course: '', message: '', platform: 'classes' });
    } catch (err) {
      setSubmitResult({
        type: 'error',
        message: 'Something went wrong. Please reach out to us directly or try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <Head>
        <title>Produit Academy Classes | Live Academic Portal (Classes 6 - 12)</title>
        <meta
          name="description"
          content="The dedicated live-learning portal for Produit Academy students. Live interactive classes, vetted teachers, and verified academic progression for Classes 6 through 12."
        />
      </Head>

      <Header />

      <main style={{ flex: 1 }}>
        {/* ============ HERO SECTION ============ */}
        <section className={styles.heroSection}>
          <div className={styles.kitesContainer}>
            <div className={styles.kite}>🪁</div>
            <div className={styles.kite}>📚</div>
            <div className={styles.kite}>🔬</div>
            <div className={styles.kite}>💡</div>
          </div>

          <div className="container" style={{ position: 'relative', zIndex: 2 }}>
            <div className={styles.heroContent}>
              {/* Telemetry Chip */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <div className={styles.heroBadge}>
                  <span className={styles.pulseDot} />
                  <span>ACADEMIC NETWORK // CLASSES 6 - 12</span>
                </div>
              </motion.div>

              <motion.h1
                className={styles.heroTitle}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                Your Classroom,<br />
                <span className={styles.heroHighlight}>Reimagined.</span>
              </motion.h1>

              <motion.p
                className={styles.heroSubtitle}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Live interactive classes, dedicated teacher mentorship, and real-time academic progression tracking - engineered with clarity and precision.
              </motion.p>

              <motion.div
                className={styles.heroActions}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.35 }}
              >
                <Link href="/courses" className={styles.heroBtnPrimary} id="hero-btn-explore">
                  <span>Explore Classes</span>
                  <ArrowRight size={18} />
                </Link>

                <Link href="/login" className={styles.heroBtnSecondary} id="hero-btn-login">
                  <UserCheck size={18} color="var(--accent-green)" />
                  <span>Student Portal</span>
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Animated gradient orbs */}
          <div className={`${styles.heroOrb} ${styles.heroOrb1}`} />
          <div className={`${styles.heroOrb} ${styles.heroOrb2}`} />
          <div className={`${styles.heroOrb} ${styles.heroOrb3}`} />
        </section>

        {/* ============ HUD TELEMETRY BAR ============ */}
        <div className={styles.heroStatsWrapper}>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatTag}>[ 01 // LIVE ]</span>
              <span className={styles.heroStatValue}>Interactive Sessions</span>
              <span className={styles.heroStatLabel}>Direct audio, video & screen share</span>
            </div>

            <div className={styles.heroStat}>
              <span className={styles.heroStatTag}>[ 02 // MENTORS ]</span>
              <span className={styles.heroStatValue}>Vetted Faculty</span>
              <span className={styles.heroStatLabel}>Specialists in CBSE, ICSE & State syllabi</span>
            </div>

            <div className={styles.heroStat}>
              <span className={styles.heroStatTag}>[ 03 // BOOKINGS ]</span>
              <span className={styles.heroStatValue}>Self-Service Demo</span>
              <span className={styles.heroStatLabel}>Pick batch times and test trial sessions</span>
            </div>

            <div className={styles.heroStat}>
              <span className={styles.heroStatTag}>[ 04 // METRICS ]</span>
              <span className={styles.heroStatValue}>Verified Telemetry</span>
              <span className={styles.heroStatLabel}>Continuous attendance & academic feedback</span>
            </div>
          </div>
        </div>

        {/* ============ FEATURES SECTION ============ */}
        <section className={styles.featuresSection} id="features">
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>CORE CAPABILITIES</span>
              <h2 className={styles.sectionTitle}>Engineered for Academic Mastery</h2>
              <p className={styles.sectionSubtitle}>
                A focused, distraction-free environment combining high-touch teaching with modern digital workflow.
              </p>
            </div>

            <div className={styles.featuresGrid}>
              <div className={`${styles.featureCard} pop-accent-border`}>
                <div
                  className={styles.featureIconBox}
                  style={{ background: 'rgba(51, 174, 120, 0.08)', color: 'var(--accent-green)' }}
                >
                  <Video size={22} />
                </div>
                <h3>Live Classroom Hub</h3>
                <p>
                  Join scheduled video classes with a single click. Integrated Google Meet and Zoom with automatic attendance verification.
                </p>
              </div>

              <div className={`${styles.featureCard} pop-accent-border-blue`}>
                <div
                  className={styles.featureIconBox}
                  style={{ background: 'rgba(37, 99, 235, 0.08)', color: '#2563eb' }}
                >
                  <BookOpen size={22} />
                </div>
                <h3>Curriculum Roadmaps</h3>
                <p>
                  Class 6 to 12 syllabi mapped chapter by chapter. Download session materials, assignments, and test preparation schedules.
                </p>
              </div>

              <div className={`${styles.featureCard} pop-accent-border-purple`}>
                <div
                  className={styles.featureIconBox}
                  style={{ background: 'rgba(124, 58, 237, 0.08)', color: '#7c3aed' }}
                >
                  <BarChart3 size={22} />
                </div>
                <h3>Academic Progression</h3>
                <p>
                  Real-time analytics for students and parents. Track test performance, completion milestones, and regular attendance.
                </p>
              </div>

              <div className={`${styles.featureCard} pop-accent-border-amber`}>
                <div
                  className={styles.featureIconBox}
                  style={{ background: 'rgba(217, 119, 6, 0.08)', color: '#d97706' }}
                >
                  <ShieldCheck size={22} />
                </div>
                <h3>Verified Educators</h3>
                <p>
                  Every educator is thoroughly assessed on subject depth and pedagogical clarity, ensuring top-tier instruction.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ HOW IT WORKS ============ */}
        <section className={styles.howItWorksSection} id="how-it-works">
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>STUDENT PROTOCOL</span>
              <h2 className={styles.sectionTitle}>How Produit Classes Works</h2>
              <p className={styles.sectionSubtitle}>
                Get onboarded into your focused learning cohort in three transparent steps.
              </p>
            </div>

            <div className={styles.stepsGrid}>
              <div className={styles.stepCard}>
                <span className={styles.stepBadge}>PHASE // 01</span>
                <h3>Select Grade & Subject</h3>
                <p>
                  Choose your grade level (Classes 6 through 12) and pick your target subject - from foundation sciences to advanced mathematics.
                </p>
                <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                  <Link href="/courses" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-green)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span>Browse Subjects</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              <div className={styles.stepCard}>
                <span className={styles.stepBadge} style={{ color: '#2563eb', background: '#eff6ff', borderColor: '#bfdbfe' }}>
                  PHASE // 02
                </span>
                <h3>Book a Teacher & Demo</h3>
                <p>
                  Browse verified educator profiles, review bios and hourly rates, and schedule an interactive demo at your preferred time.
                </p>
                <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                  <Link href="/courses" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span>View Faculty</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              <div className={styles.stepCard}>
                <span className={styles.stepBadge} style={{ color: '#7c3aed', background: '#f5f3ff', borderColor: '#ddd6fe' }}>
                  PHASE // 03
                </span>
                <h3>Join Live Classes</h3>
                <p>
                  Access your student dashboard, enter your scheduled virtual classroom, access lesson notes, and review your performance telemetry.
                </p>
                <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                  <Link href="/login" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#7c3aed', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span>Launch Portal</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ GRADE SHOWCASE (10% PLAYFUL ACCENT) ============ */}
        <section className={styles.gradesSection}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>ACADEMIC PATHWAYS</span>
              <h2 className={styles.sectionTitle}>Tailored Across Every Class Tier</h2>
              <p className={styles.sectionSubtitle}>
                Calibrated curricula designed to build conceptual foundations and exam confidence.
              </p>
            </div>

            <div className={styles.gradesGrid}>
              <Link href="/courses" className={styles.gradeCard}>
                <div>
                  <div className={styles.gradeTier}>FOUNDATION STAGE</div>
                  <div className={styles.gradeTitle}>Classes 6 - 8</div>
                  <div className={styles.gradeSubjects}>
                    Mathematics, General Science, Social Studies & Coding Fundamentals
                  </div>
                </div>
                <div className={styles.gradeAction}>
                  <span>Explore Tier</span>
                  <ArrowRight size={14} />
                </div>
              </Link>

              <Link href="/courses" className={styles.gradeCard}>
                <div>
                  <div className={styles.gradeTier}>BOARD PREPARATION</div>
                  <div className={styles.gradeTitle}>Classes 9 - 10</div>
                  <div className={styles.gradeSubjects}>
                    Advanced Math, Physics, Chemistry, Biology & Board Exam Drills
                  </div>
                </div>
                <div className={styles.gradeAction}>
                  <span>Explore Tier</span>
                  <ArrowRight size={14} />
                </div>
              </Link>

              <Link href="/courses" className={styles.gradeCard}>
                <div>
                  <div className={styles.gradeTier}>SENIOR SECONDARY</div>
                  <div className={styles.gradeTitle}>Classes 11 - 12</div>
                  <div className={styles.gradeSubjects}>
                    Calculus, Mechanics, Organic Chemistry, Computer Science & Entrance Prep
                  </div>
                </div>
                <div className={styles.gradeAction}>
                  <span>Explore Tier</span>
                  <ArrowRight size={14} />
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* ============ CONTACT & INQUIRY SECTION ============ */}
        <section id="contact" className={styles.contactSection}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>DIRECT INQUIRY</span>
              <h2 className={styles.sectionTitle}>Connect With Our Academic Team</h2>
              <p className={styles.sectionSubtitle}>
                Have a question about courses, batch timings, or demo scheduling? Send us a message below.
              </p>
            </div>

            <div className={styles.contactContainer}>
              <form className={styles.contactForm} onSubmit={handleSubmit} id="contact-form">
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label htmlFor="name" className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="input-field"
                    style={{ borderRadius: '0px', width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter student or parent name"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group">
                    <label htmlFor="email" className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="input-field"
                      style={{ borderRadius: '0px', width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone" className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="input-field"
                      style={{ borderRadius: '0px', width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g., 9876543210"
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label htmlFor="course" className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                    Select Course or Grade Level
                  </label>
                  <select
                    id="course"
                    name="course"
                    className="input-field"
                    style={{ borderRadius: '0px', width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', fontSize: '0.92rem', background: '#ffffff' }}
                    value={formData.course}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Choose a curriculum / grade</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.name}>{course.name}</option>
                    ))}
                    {courses.length === 0 && (
                      <>
                        <option value="Classes 6 - 8 Foundation">Classes 6 - 8 Foundation</option>
                        <option value="Classes 9 - 10 Board Prep">Classes 9 - 10 Board Prep</option>
                        <option value="Classes 11 - 12 Senior Secondary">Classes 11 - 12 Senior Secondary</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label htmlFor="message" className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                    Specific Requirements or Questions
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    className="input-field"
                    style={{ borderRadius: '0px', width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', fontSize: '0.92rem', resize: 'vertical' }}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about the subjects you need help with, preferred timings, or questions..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  className={styles.heroBtnPrimary}
                  disabled={isSubmitting}
                  style={{ alignSelf: 'flex-start', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                  id="contact-submit-btn"
                >
                  <Send size={16} />
                  <span>{isSubmitting ? 'Submitting...' : 'Send Inquiry'}</span>
                </button>

                {submitResult.message && (
                  <div
                    style={{
                      marginTop: '1rem',
                      padding: '12px 16px',
                      borderRadius: '0px',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      background: submitResult.type === 'success' ? '#f0fdf4' : '#fef2f2',
                      color: submitResult.type === 'success' ? '#166534' : '#991b1b',
                      border: `1px solid ${submitResult.type === 'success' ? '#bbf7d0' : '#fecaca'}`
                    }}
                  >
                    {submitResult.message}
                  </div>
                )}
              </form>

              <div className={styles.contactInfo}>
                <div className={styles.contactInfoImage}>
                  <Image src="/logo.png" alt="Produit Academy Logo" width={56} height={56} style={{ borderRadius: '0px' }} />
                </div>

                <div className={styles.contactInfoItem}>
                  <h4>Campus Location</h4>
                  <p>Produit Academy, Kollam, Kerala</p>
                </div>

                <div className={styles.contactInfoItem}>
                  <h4>Admissions & Inquiries</h4>
                  <p><a href="mailto:produitacademy@gmail.com">produitacademy@gmail.com</a></p>
                </div>

                <div className={styles.contactInfoItem}>
                  <h4>Helpline</h4>
                  <p><a href="tel:8139805996">+91 8139 805 996</a></p>
                </div>

                <div className={styles.contactInfoItem}>
                  <h4>Operating Hours</h4>
                  <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
                    Monday - Saturday: 8:00 AM - 8:00 PM IST
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}