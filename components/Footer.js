import Link from 'next/link';
import styles from './Footer.module.css';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerGrid}`}>
        <div className={styles.footerColumn}>
          <h2 className={styles.logoText}>Produit Academy<br />Classes</h2>
          <div className={styles.socialIcons} style={{ marginTop: '20px' }}>
            <Link href="https://facebook.com" passHref><Image src="/icons/facebook.svg" alt="Facebook" width={24} height={24} /></Link>
            <Link href="https://twitter.com" passHref><Image src="/icons/twitter.svg" alt="Twitter" width={24} height={24} /></Link>
            <Link href="https://linkedin.com" passHref><Image src="/icons/linkedin.svg" alt="LinkedIn" width={24} height={24} /></Link>
            <Link href="https://www.instagram.com/produit.academy/" passHref><Image src="/icons/instagram.svg" alt="Instagram" width={24} height={24} /></Link>
          </div>
        </div>

        <div className={styles.footerColumn}>
          <h3 className={styles.footerHeading}>Features</h3>
          <ul className={styles.footerLinks}>
            <li><Link href="/#features">Live Classes</Link></li>
            <li><Link href="/#features">Visual Analytics</Link></li>
            <li><Link href="/#features">Mentor Oversight</Link></li>
          </ul>
        </div>

        <div className={styles.footerColumn}>
          <h3 className={styles.footerHeading}>Company</h3>
          <ul className={styles.footerLinks}>
            <li><Link href="/#features">About Us</Link></li>
            <li><Link href="/#contact">Contact Us</Link></li>
          </ul>
        </div>

        <div className={styles.footerColumn}>
          <h3 className={styles.footerHeading}>Support</h3>
          <ul className={styles.footerLinks}>
            <li><Link href="/help-center">Help Center</Link></li>
            <li><Link href="/faqs">FAQ&apos;s</Link></li>
            <li><Link href="/privacy-policy">Privacy Policy</Link></li>
            <li><Link href="/terms-and-conditions">Terms & Conditions</Link></li>
          </ul>
        </div>

        <div className={styles.footerColumn}>
          <h3 className={styles.footerHeading}>Get in touch</h3>
          <ul className={styles.footerLinks}>
            <li><a href="mailto:produitacademy@gmail.com">produitacademy@gmail.com</a></li>
            <li><a href="tel:8139805996">+91 8139 805 996</a></li>
          </ul>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <div className={`container ${styles.footerBottomContainer}`}>
          <p>Copyright @ 2025. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}