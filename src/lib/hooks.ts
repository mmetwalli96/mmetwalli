import { useEffect, useState, useRef } from 'react';
import type { CSSProperties } from 'react';
import { profile } from '@/data/profile';
import * as sseTypes from '@/types/sse';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, [query]);

  return matches;
}

export function useScrolled(threshold = 8): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > threshold);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [threshold]);

  return scrolled;
}

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${profile.name}` : profile.name;
  }, [title]);
}

export function cssVars(vars: Record<`--${string}`, string | number>): CSSProperties {
  return vars as CSSProperties;
}

const TABLES: sseTypes.TableName[] = ['incident_history', 'progress_tracker'];
const HIGHLIGHT_MS = 2500;
const EMPTY: sseTypes.Tables = { incident_history: [], progress_tracker: [] };

function parse<T>(data: string): T | null {
  try {
    return JSON.parse(data) as T;
  } catch {
    console.warn('[live tables] Ignored a message that is not valid JSON:', data);
    return null;
  }
}

function applyChange<Row extends { id: number }>(rows: Row[], { op, id, row }: sseTypes.ChangeEvent): Row[] {
  if (op === 'DELETE') return rows.filter((r) => r.id !== id);
  if (!row) return rows;
  const next = { ...row, id } as unknown as Row;
  const index = rows.findIndex((r) => r.id === id);
  if (index === -1) return [...rows, next];
  const copy = rows.slice();
  copy[index] = next;
  return copy;
}

export function useLiveTables(enabled: boolean, EVENTS_URL?: string) {
  const [tables, setTables] = useState<sseTypes.Tables>(EMPTY);
  const [connection, setConnection] = useState<sseTypes.ConnectionStatus>('off');
  const [recent, setRecent] = useState<sseTypes.RecentChanges>({});
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const timers = useRef(new Map<string, number>());

  useEffect(() => {
    if (!enabled) return;
    if (!EVENTS_URL) {
      setConnection('closed');
      return;
    }

    setConnection('connecting');
    const es = new EventSource(EVENTS_URL);
    const pending = timers.current;

    const markRecent = (key: string, op: 'INSERT' | 'UPDATE') => {
      setRecent((current) => ({ ...current, [key]: op }));
      window.clearTimeout(pending.get(key));
      pending.set(
        key,
        window.setTimeout(() => {
          pending.delete(key);
          setRecent(({ [key]: _done, ...rest }) => rest);
        }, HIGHLIGHT_MS),
      );
    };

    es.onopen = () => setConnection('live');
    es.onerror = () => setConnection(es.readyState === EventSource.CLOSED ? 'closed' : 'reconnecting');

    es.addEventListener('snapshot', (event) => {
      const data = parse<Partial<sseTypes.Tables>>((event as MessageEvent<string>).data);
      if (!data) return;
      setTables({
        incident_history: data.incident_history ?? [],
        progress_tracker: data.progress_tracker ?? [],
      });
      setConnection('live');
      setLastUpdate(new Date());
    });

    for (const table of TABLES) {
      es.addEventListener(table, (event) => {
        const change = parse<sseTypes.ChangeEvent>((event as MessageEvent<string>).data);
        if (!change || !['INSERT', 'UPDATE', 'DELETE'].includes(change.op)) return;
        setTables((current) => ({
          ...current,
          [table]: applyChange(current[table] as { id: number }[], change),
        }));
        if (change.op !== 'DELETE') markRecent(`${table}:${change.id}`, change.op);
        setLastUpdate(new Date());
      });
    }

    return () => {
      es.close();
      pending.forEach((id) => window.clearTimeout(id));
      pending.clear();
      setConnection('off');
    };
  }, [enabled]);

  return { tables, connection, recent, lastUpdate };
}