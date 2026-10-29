import { Link } from 'react-router';
import { RollText } from '@/components/ui/RollText';
import styles from '@/components/home/ContactCta.module.css';

export function ContactCta() {
  return (
    <section className={styles.cta} aria-label="Contact">
      <div className="container">
        <Link to="/contact" className={styles.link}>
          <span className={`display ${styles.text}`}>
            <RollText text="Get in touch" />
          </span>
        </Link>
      </div>
    </section>
  );
}
