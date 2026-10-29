import { useRef } from 'react';
import type { PointerEvent, ReactNode } from 'react';
import { motion, useReducedMotion, useSpring } from 'motion/react';

type Props = {
  children: ReactNode;
  /** How far the element follows the pointer, as a fraction of the offset. */
  strength?: number;
  className?: string;
};

/** Pulls its child gently toward a mouse pointer, then springs back. */
export function Magnetic({ children, strength = 0.3, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const spring = { stiffness: 260, damping: 18, mass: 0.5 };
  const x = useSpring(0, spring);
  const y = useSpring(0, spring);

  const onMove = (event: PointerEvent<HTMLSpanElement>) => {
    if (reduced || event.pointerType !== 'mouse' || !ref.current) return;
    const box = ref.current.getBoundingClientRect();
    x.set((event.clientX - (box.left + box.width / 2)) * strength);
    y.set((event.clientY - (box.top + box.height / 2)) * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span
      ref={ref}
      className={className}
      style={{ x, y, display: 'inline-flex' }}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      {children}
    </motion.span>
  );
}
