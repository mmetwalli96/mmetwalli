import { useRef, useState } from 'react';
import { useInView } from 'motion/react';
import { skillGroups } from '@/data/profile';
import { cssVars } from '@/lib/hooks';
import { Magnetic } from '@/components/ui/Magnetic';
import styles from '@/components/home/Skills.module.css';

const GROUP_COLORS = ['var(--v1)', 'var(--v2)', 'var(--v3)', 'var(--v4)', 'var(--v5)'];

export function Skills() {
  const listRef = useRef<HTMLUListElement>(null);
  const inView = useInView(listRef, { once: true, amount: 0.3 });
  const [focus, setFocus] = useState<string | null>(null);
  let tokenIndex = 0;

  return (
    <section className={styles.section} aria-labelledby="skills-title">
      <div className="container">
        <h2 id="skills-title" className={`display ${styles.title}`}>
          Skills
        </h2>

        <ul
          ref={listRef}
          className={styles.groups}
          data-inview={inView || undefined}
          data-focused={focus !== null || undefined}
          onPointerLeave={() => setFocus(null)}
        >
          {skillGroups.map((group, gi) => (
            <li
              key={group.id}
              className={styles.group}
              data-active={focus === group.id || undefined}
              style={cssVars({ '--c': GROUP_COLORS[gi % GROUP_COLORS.length], '--gi': gi })}
              onPointerEnter={() => setFocus(group.id)}
            >
              <h3 className={styles.label}>
                <span className={styles.swatch} aria-hidden="true" />
                {group.label}
              </h3>
              <ul className={styles.items}>
                {group.items.map((item) => (
                  <li key={item.name} className={styles.item} style={cssVars({ '--ti': tokenIndex++ })}>
                    <Magnetic strength={0.2}>
                      <span className={styles.token}>
                        <span className={styles.dot} aria-hidden="true" />
                        <span>{item.name}</span>
                        {item.note && <span className={styles.note}>{item.note}</span>}
                      </span>
                    </Magnetic>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
