import { motion } from 'motion/react';
import { viridisLight } from '@/lib/viridis';

const DOTS = 12;

export function SuccessMark() {
  return (
    <svg width="112" height="112" viewBox="0 0 112 112" aria-hidden="true">
      {Array.from({ length: DOTS }, (_, i) => {
        const angle = (i / DOTS) * Math.PI * 2;
        return (
          <motion.circle
            key={i}
            cx={56}
            cy={56}
            r={3.2}
            fill={viridisLight(i / (DOTS - 1))}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
            animate={{
              x: [0, Math.cos(angle) * 54, Math.cos(angle) * 48],
              y: [0, Math.sin(angle) * 54, Math.sin(angle) * 48],
              opacity: [0, 1, 0],
              scale: [0.4, 1, 0.6],
            }}
            transition={{ duration: 1.2, delay: 0.35 + i * 0.015, ease: [0.22, 1, 0.36, 1] }}
          />
        );
      })}
      <g transform="rotate(-90 56 56)">
        <motion.circle
          cx={56}
          cy={56}
          r={34}
          fill="none"
          stroke="var(--v3)"
          strokeWidth={3}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
        />
      </g>
      <motion.path
        d="M41 57 l10 10 l21 -23"
        fill="none"
        stroke="var(--ink)"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.45, delay: 0.55, ease: [0.65, 0, 0.35, 1] }}
      />
    </svg>
  );
}
