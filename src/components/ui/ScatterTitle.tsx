import { useMemo } from 'react';
import { motion } from 'motion/react';

type Props = {
  text: string;
  as?: 'h1' | 'h2';
  className?: string;
  id?: string;
};

export function ScatterTitle({ text, as = 'h1', className, id }: Props) {
  const Tag = as;
  const offsets = useMemo(
    () =>
      Array.from(text).map(() => ({
        x: (Math.random() - 0.5) * 70,
        y: (Math.random() - 0.5) * 56,
        rotate: (Math.random() - 0.5) * 24,
      })),
    [text],
  );

  let index = 0;
  return (
    <Tag id={id} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" style={{ display: 'inline-flex', flexWrap: 'wrap', columnGap: '0.24em' }}>
        {text.split(' ').map((word, w) => (
          <span key={`${word}-${w}`} style={{ display: 'inline-flex', whiteSpace: 'nowrap' }}>
            {Array.from(word).map((char) => {
              const i = index++;
              const from = offsets[i];
              return (
                <motion.span
                  key={i}
                  style={{ display: 'inline-block' }}
                  initial={{ ...from, opacity: 0 }}
                  animate={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 140,
                    damping: 16,
                    mass: 0.9,
                    delay: 0.2 + i * 0.035,
                    opacity: { duration: 0.35, delay: 0.2 + i * 0.035 },
                  }}
                >
                  {char}
                </motion.span>
              );
            })}
          </span>
        ))}
      </span>
    </Tag>
  );
}
