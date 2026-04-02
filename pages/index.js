import Head from 'next/head';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from '../styles/Home.module.css';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } };
const slideInUp = { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } } };

export default function Home() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', course: '', message: '', platform: 'classes' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState({ type: '', message: '' });
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/classes/courses/`)
      .then(res => res.json())
      .then(data => setCourses(data))
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to send');
      setSubmitResult({ type: 'success', message: 'Message sent successfully. We will get back to you shortly.' });
      setFormData({ name: '', email: '', phone: '', course: '', message: '', platform: 'classes' });
    } catch (err) {
      setSubmitResult({ type: 'error', message: 'Something went wrong. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Head>
        <title>Produit Classes | Live Academic Portal</title>
        <meta name="description" content="The dedicated live-learning portal for Produit Academy students. Join classes, track attendance, and excel in your academics." />
      </Head>

      <Header />

      <main style={{ flex: 1 }}>
        <section className={styles.heroSection}>
          <div className={styles.kitesContainer}>
            <div className={styles.kite}>🪁</div>
            <div className={styles.kite}>📚</div>
            <div className={styles.kite}>🔬</div>
            <div className={styles.kite}>💡</div>
          </div>
          <div className="container">
            <div className={styles.heroContent}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <div className={styles.heroBadge}>Live Learning Platform</div>
              </motion.div>
              <motion.h1 className={styles.heroTitle} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                Your Classroom,<br />
                <span className={styles.heroHighlight}>Reimagined.</span>
              </motion.h1>
              <motion.p className={styles.heroSubtitle} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
                Join live classes, track your academic progress, and stay connected with your teachers &mdash; all from one unified portal.
              </motion.p>
              <motion.div className={styles.heroActions} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.4 }}>
                <a href="/login" className={`glass-btn primary ${styles.heroBtn}`}>
                  Get Started
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px' }}>
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </a>
              </motion.div>

            </div>
          </div>

          {/* Animated gradient orbs */}
          <div className={`${styles.heroOrb} ${styles.heroOrb1}`} />
          <div className={`${styles.heroOrb} ${styles.heroOrb2}`} />
          <div className={`${styles.heroOrb} ${styles.heroOrb3}`} />
        </section>

        {/* Animated Stats Overlapping Below Resulting in cleaner first-screen */}
        <div className={styles.heroStatsWrapper}>
          <motion.div className={styles.heroStats} variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }}>
            <motion.div variants={itemVariants} className={styles.heroStat}>
              <span className={styles.heroStatValue}>Live</span>
              <span className={styles.heroStatLabel}>Interactive Classes</span>
            </motion.div>
            <motion.div variants={itemVariants} className={styles.heroStatDivider} />
            <motion.div variants={itemVariants} className={styles.heroStat}>
              <span className={styles.heroStatValue}>Expert</span>
              <span className={styles.heroStatLabel}>Mentorship Support</span>
            </motion.div>
            <motion.div variants={itemVariants} className={styles.heroStatDivider} />
            <motion.div variants={itemVariants} className={styles.heroStat}>
              <span className={styles.heroStatValue}>Smart</span>
              <span className={styles.heroStatLabel}>Analytics Dashboard</span>
            </motion.div>
          </motion.div>
        </div>

    
        {/* ============ FEATURES SECTION ============ */}
        <section className={styles.featuresSection} id="features">
          <div className="container">
            <motion.div variants={slideInUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }}>
              <h2 className={styles.sectionTitle}>Everything You Need to Excel</h2>
              <p className={styles.sectionSubtitle}>A complete academic management system designed for modern learning</p>
            </motion.div>

            <motion.div className={styles.featuresGrid} variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
              <motion.div variants={itemVariants} className={`glass-card ${styles.featureCard}`}>
                <div className={styles.featureIcon} style={{ background: 'rgba(51, 174, 120, 0.1)', color: 'var(--accent-green)' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                </div>
                <h3>Live Classes</h3>
                <p>Join your scheduled classes with a single click. Seamless integration with Google Meet and Zoom.</p>
              </motion.div>

              <motion.div variants={itemVariants} className={`glass-card ${styles.featureCard}`}>
                <div className={styles.featureIcon} style={{ background: 'rgba(155, 89, 182, 0.1)', color: 'var(--accent-purple)' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></svg>
                </div>
                <h3>Visual Analytics</h3>
                <p>Beautiful charts and dashboards that give you instant insights into your academic performance.</p>
              </motion.div>

              <motion.div variants={itemVariants} className={`glass-card ${styles.featureCard}`}>
                <div className={styles.featureIcon} style={{ background: 'rgba(241, 196, 15, 0.1)', color: '#b7950b' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                </div>
                <h3>Mentor Oversight</h3>
                <p>Dedicated mentor dashboards to monitor teacher compliance and identify at-risk students early.</p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <div className="container">
          <section id="contact" className={styles.contactSection}>
            <motion.div
              variants={slideInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
            >
              <h2 className={styles.sectionTitle}>Contact Us</h2>
              <p className={styles.sectionSubtitle}>We are here to help you. Feel free to contact us.</p>
            </motion.div>

            <motion.div
              className={styles.contactContainer}
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <form className={styles.contactForm} onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Full Name</label>
                  <input type="text" id="name" name="name" className="input-field" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input type="email" id="email" name="email" className="input-field" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">Mobile Number</label>
                  <input type="tel" id="phone" name="phone" className="input-field" value={formData.phone} onChange={handleChange} placeholder="e.g., 9876543210" required />
                </div>
                <div className="form-group">
                  <label htmlFor="course" className="form-label">Course</label>
                  <select id="course" name="course" className="input-field" value={formData.course} onChange={handleChange} required>
                    <option value="">Select a course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.name}>{course.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="message" className="form-label">Message</label>
                  <textarea id="message" name="message" rows="5" className="input-field" value={formData.message} onChange={handleChange} required style={{ resize: 'vertical', minHeight: '120px' }}></textarea>
                </div>
                <button type="submit" className="glass-btn primary" disabled={isSubmitting} style={{ alignSelf: 'flex-start', marginTop: '10px' }}>{isSubmitting ? 'Sending…' : 'Send Message'}</button>
                {submitResult.message && (
                  <p style={{ marginTop: '0.75rem', color: submitResult.type === 'success' ? 'green' : 'crimson' }}>
                    {submitResult.message}
                  </p>
                )}
              </form>

              <div className={styles.contactInfo}>
                <div className={styles.contactInfoImage}>
                  <Image src="/logo.png" alt="Contact" width={125} height={125} />
                </div>
                <div className={styles.contactInfoItem}>
                  <h4>Address</h4>
                  <p>Produit Academy, Kollam, Kerala</p>
                </div>
                <div className={styles.contactInfoItem}>
                  <h4>Email</h4>
                  <p><a href="mailto:produitacademy@gmail.com">produitacademy@gmail.com</a></p>
                </div>
                <div className={styles.contactInfoItem}>
                  <h4>Phone</h4>
                  <p><a href="tel:8139805996">+91 8139 805 996</a></p>
                </div>
              </div>
            </motion.div>
          </section>
        </div>

      </main>

      <Footer />
    </div>
  );
}