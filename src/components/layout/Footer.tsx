import { Link } from 'react-router';
import { profile } from '@/data/profile';
import { LocalTime } from '@/components/ui/LocalTime';
import { RollText } from '@/components/ui/RollText';
import { NAV_LINKS } from '@/components/layout/navigation';
import styles from '@/components/layout/Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.identity}>
          <p className={styles.name}>{profile.name}</p>
          <p className={styles.meta}>
            {profile.role} at {profile.company}
          </p>
        </div>

        <nav aria-label="Footer">
          <ul className={styles.links}>
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className={styles.link}>
                  <RollText text={link.label} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.bottom}>
          <LocalTime />
          <p>
            © {new Date().getFullYear()} {profile.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
