import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { useScrolled } from '@/lib/hooks';
import { LocalTime } from '@/components/ui/LocalTime';
import { Monogram } from '@/components/ui/Monogram';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { NAV_LINKS } from '@/components/layout/navigation';
import styles from '@/components/layout/Navbar.module.css';

export function Navbar() {
  const { pathname } = useLocation();
  const [hovered, setHovered] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const scrolled = useScrolled(12);
  const headerRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const activeTo = NAV_LINKS.find((link) => link.to === pathname)?.to ?? null;

  useEffect(() => setOpen(false), [pathname]);

  const close = (returnFocus = false) => {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!open) return;
    if (event.key === 'Escape') {
      close(true);
      return;
    }
    if (event.key !== 'Tab' || !headerRef.current) return;
    const focusables = Array.from(
      headerRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
    ).filter((el) => el.offsetParent !== null);
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <header
      ref={headerRef}
      className={styles.header}
      data-scrolled={scrolled || undefined}
      data-open={open || undefined}
      onKeyDown={onKeyDown}
    >
      <div className={styles.capsule}>
        <Link to="/" className={styles.brand} aria-label="Mohamed Metwalli, home">
          <Monogram />
        </Link>

        <nav aria-label="Main" className={styles.nav}>
          <ul className={styles.list} onPointerLeave={() => setHovered(null)}>
            {NAV_LINKS.map((link) => {
              const active = link.to === activeTo;
              return (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end
                    className={styles.link}
                    data-active={active || undefined}
                    onPointerEnter={() => setHovered(link.to)}
                    onFocus={() => setHovered(link.to)}
                    onBlur={() => setHovered(null)}
                  >
                    {hovered === link.to && !active && (
                      <motion.span
                        layoutId="nav-hover"
                        className={styles.hoverPill}
                        transition={{ type: 'spring', stiffness: 520, damping: 40 }}
                      />
                    )}
                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        className={styles.activePill}
                        transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                      />
                    )}
                    <span className={styles.label}>{link.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <LocalTime className={styles.clock} />

        <button
          ref={buttonRef}
          type="button"
          className={styles.menuButton}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((value) => !value)}
        >
          <motion.span
            className={styles.menuLine}
            animate={open ? { y: 0, rotate: 45 } : { y: -3.5, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 26 }}
          />
          <motion.span
            className={styles.menuLine}
            animate={open ? { y: 0, rotate: -45 } : { y: 3.5, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 26 }}
          />
        </button>
      </div>

      <MobileMenu open={open} originRef={buttonRef} activeTo={activeTo} onNavigate={() => close()} />
    </header>
  );
}
