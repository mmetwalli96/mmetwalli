import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { viridisLight } from '@/lib/viridis';

const M = ['10001', '11011', '10101', '10001', '10001'];
const ROWS = M.map((row) => `${row}0${row}`);
const STEP = 4.4;
const R = 1.65;

export function Monogram() {
  const [hover, setHover] = useState(false);

  const dots = useMemo(() => {
    const out: { cx: number; cy: number; fill: string; dx: number; dy: number }[] = [];
    ROWS.forEach((row, r) =>
      Array.from(row).forEach((on, c) => {
        if (on !== '1') return;
        out.push({
          cx: R + c * STEP,
          cy: R + r * STEP,
          fill: viridisLight(c / (row.length - 1)),
          dx: (Math.random() - 0.5) * 9,
          dy: (Math.random() - 0.5) * 9,
        });
      }),
    );
    return out;
  }, []);

  const width = R * 2 + (ROWS[0].length - 1) * STEP;
  const height = R * 2 + (ROWS.length - 1) * STEP;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      style={{ overflow: 'visible' }}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      {dots.map((d, i) => (
        <motion.circle
          key={i}
          cx={d.cx}
          cy={d.cy}
          r={R}
          fill={d.fill}
          animate={hover ? { x: d.dx, y: d.dy } : { x: 0, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: hover ? 12 : 18, delay: hover ? i * 0.006 : 0 }}
        />
      ))}
    </svg>
  );
}
