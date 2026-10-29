import { useEffect, useRef } from 'react';
import styles from '@/components/layout/Backdrop.module.css';

/**
 * A faint dot grid behind every page, like plotting paper. Near a mouse
 * pointer the dots light up in teal.
 */
export function Backdrop() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(pointer: coarse)').matches) return;

    let frame = 0;
    let x = -1000;
    let y = -1000;
    const apply = () => {
      frame = 0;
      el.style.setProperty('--mx', `${x}px`);
      el.style.setProperty('--my', `${y}px`);
    };
    const onMove = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      x = -1000;
      y = -1000;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div ref={ref} className={styles.backdrop} aria-hidden="true">
      <div className={styles.spot} />
    </div>
  );
}
