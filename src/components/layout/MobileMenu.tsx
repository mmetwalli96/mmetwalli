import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { NavLink } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { LocalTime } from '@/components/ui/LocalTime';
import { NAV_LINKS } from '@/components/layout/navigation';
import styles from '@/components/layout/MobileMenu.module.css';

type Props = {
  open: boolean;
  activeTo: string | null;
  originRef: RefObject<HTMLButtonElement | null>;
  onNavigate: () => void;
};

const EASE = [0.76, 0, 0.24, 1] as const;

/** Full-screen menu for small screens, revealed as a circle growing from the menu button. */
export function MobileMenu({ open, activeTo, originRef, onNavigate }: Props) {
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const [origin, setOrigin] = useState({ x: 0, y: 0, r: 0 });

  useEffect(() => {
    if (!open) return;
    const box = originRef.current?.getBoundingClientRect();
    const x = box ? box.left + box.width / 2 : window.innerWidth - 40;
    const y = box ? box.top + box.height / 2 : 40;
    const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    setOrigin({ x, y, r });

    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => firstLinkRef.current?.focus(), 260);
    return () => {
      root.style.overflow = previous;
      window.clearTimeout(focusTimer);
    };
  }, [open, originRef]);

  const closed = `circle(0px at ${origin.x}px ${origin.y}px)`;
  const expanded = `circle(${origin.r + 2}px at ${origin.x}px ${origin.y}px)`;

  return (
    <AnimatePresence>
      {open && origin.r > 0 && (
        <motion.div
          id="mobile-menu"
          className={styles.overlay}
          initial={{ clipPath: closed }}
          animate={{ clipPath: expanded }}
          exit={{ clipPath: closed, transition: { duration: 0.45, ease: EASE, delay: 0.1 } }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <nav aria-label="Main" className={styles.nav}>
            <ul className={styles.list}>
              {NAV_LINKS.map((link, i) => (
                <motion.li
                  key={link.to}
                  className={styles.item}
                  initial={{ y: 56, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -24, opacity: 0, transition: { duration: 0.2, delay: i * 0.03 } }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.18 + i * 0.07 }}
                >
                  <NavLink
                    ref={i === 0 ? firstLinkRef : undefined}
                    to={link.to}
                    end
                    className={styles.link}
                    data-active={link.to === activeTo || undefined}
                    onClick={onNavigate}
                  >
                    <span className={styles.dot} aria-hidden="true" />
                    {link.label}
                  </NavLink>
                </motion.li>
              ))}
            </ul>
          </nav>

          <motion.div
            className={styles.foot}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.45 } }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            <LocalTime />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
