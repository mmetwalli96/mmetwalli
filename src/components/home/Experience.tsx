import { useMemo, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from 'motion/react';
import type { MotionStyle } from 'motion/react';
import { milestones } from '@/data/profile';
import { cssVars, useMediaQuery } from '@/lib/hooks';
import { viridisLight } from '@/lib/viridis';
import styles from '@/components/home/Experience.module.css';

const monthYear = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });

function toDate(value: string, now: Date): Date {
  if (value === 'now') return now;
  const [year, month] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, 1));
}

function stemHeight(index: number, count: number): number {
  if (index === count - 1) return 1;
  return index % 2 === 0 ? 0.7 : 0.32;
}

export function Experience() {
  const chartRef = useRef<HTMLDivElement>(null);
  const wide = useMediaQuery('(min-width: 860px)');
  const reduced = useReducedMotion();
  const now = useMemo(() => new Date(), []);

  const { points, years } = useMemo(() => {
    const dates = milestones.map((m) => toDate(m.date, now));
    const firstYear = Math.min(...dates.map((d) => d.getUTCFullYear()));
    const start = Date.UTC(firstYear, 0, 1);
    const end = Math.max(now.getTime(), ...dates.map((d) => d.getTime()));
    const position = (time: number) => (time - start) / (end - start);

    const points = milestones.map((m, i) => {
      const at = dates[i];
      const pos = position(at.getTime());
      return {
        ...m,
        pos,
        stem: stemHeight(i, milestones.length),
        color: viridisLight(pos),
        align: pos > 0.82 ? 'end' : 'start',
        label: m.date === 'now' ? 'Today' : monthYear.format(at),
        dateTime: m.date === 'now' ? now.toISOString().slice(0, 10) : m.date,
      };
    });

    const years: { year: number; pos: number }[] = [];
    for (let year = firstYear; Date.UTC(year, 0, 1) <= end; year++) {
      years.push({ year, pos: position(Date.UTC(year, 0, 1)) });
    }
    return { points, years };
  }, [now]);

  const { scrollYProgress } = useScroll({ target: chartRef, offset: ['start 0.85', 'end 0.55'] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.0005 });
  const [reached, setReached] = useState(-1);

  const thresholds = wide
    ? points.map((p) => p.pos)
    : points.map((_, i) => (points.length > 1 ? i / (points.length - 1) : 0));

  useMotionValueEvent(progress, 'change', (value) => {
    let index = -1;
    thresholds.forEach((t, i) => {
      if (value >= t - 0.002) index = i;
    });
    setReached(index);
  });

  const reachedIndex = reduced ? points.length - 1 : reached;
  const chartStyle = { '--p': reduced ? 1 : progress } as unknown as MotionStyle;

  return (
    <section className={styles.section} aria-labelledby="experience-title">
      <div className="container">
        <h2 id="experience-title" className={`display ${styles.title}`}>
          Experience
        </h2>

        <motion.div ref={chartRef} className={styles.chart} style={chartStyle}>
          <div className={styles.axis} aria-hidden="true">
            <span className={styles.progress} />
            {years.map((y) => (
              <span key={y.year} className={styles.tick} style={cssVars({ '--pos': y.pos })}>
                <span className={styles.year}>{y.year}</span>
              </span>
            ))}
          </div>

          <ol className={styles.list}>
            {points.map((p, i) => (
              <li
                key={p.date}
                className={styles.item}
                data-reached={i <= reachedIndex || undefined}
                data-current={p.current || undefined}
                data-align={p.align}
                style={cssVars({ '--pos': p.pos, '--stem': p.stem, '--c': p.color })}
              >
                <span className={styles.stem} aria-hidden="true" />
                <span className={styles.marker} aria-hidden="true" />
                <div className={styles.label}>
                  <time className={styles.date} dateTime={p.dateTime}>
                    {p.label}
                  </time>
                  <p className={styles.what}>{p.title}</p>
                  {p.org && <p className={styles.org}>{p.org}</p>}
                </div>
              </li>
            ))}
          </ol>
        </motion.div>
      </div>
    </section>
  );
}
