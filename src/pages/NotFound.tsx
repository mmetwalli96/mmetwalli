import { Page } from '@/components/layout/Page';
import { ButtonLink } from '@/components/ui/Button';
import { ScatterTitle } from '@/components/ui/ScatterTitle';
import styles from '@/pages/NotFound.module.css';

export default function NotFound() {
  return (
    <Page title="Page not found">
      <div className={`container ${styles.page}`}>
        <ScatterTitle text="404" className={`display ${styles.code}`} />
        <p className={styles.text}>This page doesn’t exist. The link may be broken, or the page may have moved.</p>
        <ButtonLink to="/">Go to the home page</ButtonLink>
      </div>
    </Page>
  );
}
