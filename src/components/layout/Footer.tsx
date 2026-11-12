import { profile } from '@/data/profile';
import { LocalTime } from '@/components/ui/LocalTime';
import styles from '@/styles/Footer.module.css';

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


        <div className={styles.bottom}>
          <LocalTime />
          <p>
            © {new Date().getFullYear()} {"MMETWALLI"}
          </p>
        </div>
      </div>
    </footer>
  );
}
