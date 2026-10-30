import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { usePageTitle } from '@/lib/hooks';
import { viridisLight } from '@/lib/viridis';
import { useIsInitialPage } from '@/components/layout/transition-context';
import { Footer } from '@/components/layout/Footer';
import styles from '@/components/layout/Page.module.css';

const BAR_COUNT = 7;
const BAR_COLORS = Array.from({ length: BAR_COUNT }, (_, i) => viridisLight(i / (BAR_COUNT - 1)));
const EASE = [0.76, 0, 0.24, 1] as const;
const STAGGER = 0.032;

export function Page({ title, children }: { title?: string; children: ReactNode }) {
  usePageTitle(title);
  const isInitial = useIsInitialPage();
  const reduced = useReducedMotion() ?? false;

  return (
    <>
      <motion.div
        className={styles.page}
        initial={reduced && !isInitial ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        exit={{ opacity: reduced ? 0 : 1 }}
        transition={{ duration: 0.25 }}
      >
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </motion.div>

      {!reduced && (
        <div className={styles.bars} aria-hidden="true">
          {BAR_COLORS.map((color, i) => (
            <motion.span
              key={color}
              className={styles.bar}
              style={{ backgroundColor: color, originY: 1 }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 0 }}
              exit={{ scaleY: 1 }}
              transition={{ duration: 0.4, delay: i * STAGGER, ease: EASE }}
            />
          ))}
        </div>
      )}

      {!reduced && !isInitial && (
        <div className={styles.bars} aria-hidden="true">
          {BAR_COLORS.map((color, i) => (
            <motion.span
              key={color}
              className={styles.bar}
              style={{ backgroundColor: color, originY: 0 }}
              initial={{ scaleY: 1 }}
              animate={{ scaleY: 0 }}
              exit={{ scaleY: 0 }}
              transition={{ duration: 0.5, delay: 0.04 + i * STAGGER, ease: EASE }}
            />
          ))}
        </div>
      )}
    </>
  );
}
