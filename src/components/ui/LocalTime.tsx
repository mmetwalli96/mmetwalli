import { useSyncExternalStore } from 'react';
import { profile } from '@/data/profile';
import styles from '@/components/ui/LocalTime.module.css';

let current = new Date();
let timer = 0;
const listeners = new Set<() => void>();

function scheduleTick() {
  const wait = 60_000 - (Date.now() % 60_000) + 50;
  timer = window.setTimeout(() => {
    current = new Date();
    listeners.forEach((notify) => notify());
    scheduleTick();
  }, wait);
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  if (listeners.size === 1) {
    current = new Date();
    scheduleTick();
  }
  return () => {
    listeners.delete(notify);
    if (listeners.size === 0) window.clearTimeout(timer);
  };
}

const getSnapshot = () => current;

const format = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  timeZone: profile.timeZone,
});

type Props = {
  className?: string;
  withCity?: boolean;
};

export function LocalTime({ className, withCity = true }: Props) {
  const now = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return (
    <span className={[styles.time, className].filter(Boolean).join(' ')}>
      <span className={styles.pulse} aria-hidden="true" />
      {withCity && <span>{profile.location}</span>}
      <time dateTime={now.toISOString()}>{format.format(now)}</time>
    </span>
  );
}
