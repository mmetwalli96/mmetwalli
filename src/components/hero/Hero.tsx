import { motion, useReducedMotion } from 'motion/react';
import { profile } from '@/data/profile';
import { useMediaQuery } from '@/lib/hooks';
import { ButtonLink } from '@/components/ui/Button';
import { ParticleName } from '@/components/hero/ParticleName';
import styles from '@/components/hero/Hero.module.css';

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const touch = useMediaQuery('(hover: none), (pointer: coarse)');
  const reduced = useReducedMotion();

  return (
    <section className={`container ${styles.hero}`} aria-labelledby="hero-title">
      <h1 id="hero-title" className="sr-only">
        {profile.name}
      </h1>

      <figure className={styles.figure}>
        <motion.span
          className={styles.axisY}
          aria-hidden="true"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.8, ease: EASE }}
        />
        <motion.span
          className={styles.axisX}
          aria-hidden="true"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.12, ease: EASE }}
        />
        <div className={styles.plot}>
          <ParticleName lines={profile.nameLines} />
        </div>
        {!reduced && (
          <figcaption className={styles.caption}>
            {touch
              ? 'Tap the name to scatter the points and fit them again.'
              : 'Move through the points to push them around. Click to scatter them and fit again.'}
          </figcaption>
        )}
      </figure>

      <div className={styles.meta}>
        <p className={styles.intro}>{profile.intro}</p>
        <div className={styles.actions}>
          <ButtonLink to="/projects" variant="ghost">
            See projects
          </ButtonLink>
          <ButtonLink to="/contact">Get in touch</ButtonLink>
        </div>
      </div>
    </section>
  );
}
