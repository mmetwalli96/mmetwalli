import { useRef } from 'react';
import type { PointerEvent } from 'react';
import { motion, useReducedMotion, useSpring } from 'motion/react';
import type { Project } from '@/data/projects';
import { ButtonLink } from '@/components/ui/Button';
import { AgentGraph } from '@/components/projects/AgentGraph';
import styles from '@/components/projects/ProjectCard.module.css';

/** A project figure that tilts toward the pointer, with a soft light following it. */
export function ProjectCard({ project }: { project: Project }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const spring = { stiffness: 150, damping: 20 };
  const rotateX = useSpring(0, spring);
  const rotateY = useSpring(0, spring);

  const onMove = (event: PointerEvent<HTMLElement>) => {
    if (reduced || event.pointerType !== 'mouse' || !ref.current) return;
    const box = ref.current.getBoundingClientRect();
    const px = (event.clientX - box.left) / box.width;
    const py = (event.clientY - box.top) / box.height;
    rotateY.set((px - 0.5) * 5);
    rotateX.set(-(py - 0.5) * 5);
    ref.current.style.setProperty('--gx', `${px * 100}%`);
    ref.current.style.setProperty('--gy', `${py * 100}%`);
  };

  const onLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.article
      ref={ref}
      className={styles.card}
      style={{ rotateX, rotateY, transformPerspective: 1400 }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      aria-labelledby={`project-${project.id}`}
    >
      <div className={styles.visual}>
        <AgentGraph />
      </div>

      <div className={styles.body}>
        <h2 id={`project-${project.id}`} className={`display ${styles.title}`}>
          {project.title}
        </h2>
        <p className={styles.summary}>{project.summary}</p>
        {project.placeholder && (
          <p className={styles.note}>
            <span className={styles.noteDot} aria-hidden="true" />
            {project.placeholder}
          </p>
        )}
        {project.href && (
          <div className={styles.actions}>
            <ButtonLink to={project.href} variant="ghost">
              View project
            </ButtonLink>
          </div>
        )}
      </div>
    </motion.article>
  );
}
