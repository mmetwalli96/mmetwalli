import type { ButtonHTMLAttributes } from 'react';
import { Link } from 'react-router';
import { Magnetic } from '@/components/ui/Magnetic';
import { RollText } from '@/components/ui/RollText';
import styles from '@/components/ui/Button.module.css';

type Variant = 'solid' | 'ghost';

function classes(variant: Variant, extra?: string) {
  return [styles.button, styles[variant], extra].filter(Boolean).join(' ');
}

export function ButtonLink({ to, children, variant = 'solid' }: { to: string; children: string; variant?: Variant }) {
  const external = /^https?:\/\//.test(to);
  return (
    <Magnetic>
      {external ? (
        <a href={to} target="_blank" rel="noreferrer" className={classes(variant)}>
          <RollText text={children} />
        </a>
      ) : (
        <Link to={to} className={classes(variant)}>
          <RollText text={children} />
        </Link>
      )}
    </Magnetic>
  );
}

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  children: string;
  variant?: Variant;
};

export function Button({ children, variant = 'solid', className, ...rest }: ButtonProps) {
  return (
    <Magnetic>
      <button className={classes(variant, className)} {...rest}>
        <RollText text={children} />
      </button>
    </Magnetic>
  );
}
