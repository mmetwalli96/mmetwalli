import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { ConnectionStatus, RecentChanges, TableName, Tables, IncidentHistoryRow, ProgressTrackerRow } from '@/types/sse';
import styles from '@/styles/LiveTables.module.css';

const EASE = [0.22, 1, 0.36, 1] as const;

const dateTime = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
});


function formatTime(value: string | null | undefined): ReactNode {
  if (!value) return <span className={styles.muted}>Not set</span>;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return <time dateTime={date.toISOString()}>{dateTime.format(date)}</time>;
}

function StatusPill({ status }: { status: string }) {
  const tone = status === 'Resolved' ? 'resolved' : status === 'In Progress' ? 'progress' : 'other';
  return (
    <span className={styles.status} data-tone={tone}>
      {status}
    </span>
  );
}

function Uri({ value }: { value: string }) {
  if (!value) return <span className={styles.muted}>None</span>;
  if (/^https?:\/\//i.test(value)) {
    return (
      <a href={value} target="_blank" rel="noreferrer" className={styles.link}>
        {value}
      </a>
    );
  }
  return <span className={styles.code}>{value}</span>;
}

type Column<Row> = { key: string; label: string; render: (row: Row) => ReactNode; wide?: boolean };

const INCIDENT_COLUMNS: Column<IncidentHistoryRow>[] = [
  { key: 'id', label: 'id', render: (r) => r.id },
  { key: 'incident', label: 'incident', render: (r) => <span className={styles.code}>{r.incident}</span> },
  { key: 'interruption', label: 'interruption', render: (r) => <span className={styles.code}>{r.interruption}</span> },
  { key: 'occurrence_time', label: 'occurrence_time', render: (r) => formatTime(r.occurrence_time) },
  { key: 'description', label: 'description', render: (r) => r.description, wide: true },
  { key: 'resolution_date', label: 'resolution_date', render: (r) => formatTime(r.resolution_date) },
  { key: 'status', label: 'status', render: (r) => <StatusPill status={r.status} /> },
];

const PROGRESS_COLUMNS: Column<ProgressTrackerRow>[] = [
  { key: 'id', label: 'id', render: (r) => r.id },
  { key: 'incident', label: 'incident', render: (r) => <span className={styles.code}>{r.incident}</span> },
  { key: 'event_time', label: 'event_time', render: (r) => formatTime(r.event_time) },
  { key: 'event_description', label: 'event_description', render: (r) => r.event_description, wide: true },
  { key: 'uri', label: 'uri', render: (r) => <Uri value={r.uri} /> },
];

type DataTableProps<Row extends { id: number }> = {
  name: TableName;
  description: string;
  rows: Row[];
  columns: Column<Row>[];
  recent: RecentChanges;
};

function DataTable<Row extends { id: number }>({ name, description, rows, columns, recent }: DataTableProps<Row>) {
  // Newest rows first, so live changes appear at the top
  const sorted = [...rows].sort((a, b) => b.id - a.id);

  return (
    <section className={styles.table} aria-labelledby={`${name}-title`}>
      <div className={styles.tableHead}>
        <h3 id={`${name}-title`} className={styles.tableName}>
          {name}
        </h3>
        <p className={styles.tableMeta}>
          {description} · {rows.length} {rows.length === 1 ? 'row' : 'rows'}
        </p>
      </div>

      <div className={styles.scroll}>
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} scope="col" data-wide={column.wide || undefined}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {sorted.map((row) => {
                const change = recent[`${name}:${row.id}`];
                return (
                  <motion.tr
                    key={row.id}
                    layout="position"
                    data-change={change?.toLowerCase()}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 24, transition: { duration: 0.25 } }}
                    transition={{ duration: 0.35, ease: EASE }}
                  >
                    {columns.map((column) => (
                      <td key={column.key} data-wide={column.wide || undefined}>
                        {column.render(row)}
                      </td>
                    ))}
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
        {rows.length === 0 && <p className={styles.empty}>No rows yet. New rows appear here as soon as the server sends them.</p>}
      </div>
    </section>
  );
}

const CONNECTION_TEXT: Record<ConnectionStatus, string> = {
  off: 'Not connected',
  connecting: 'Connecting…',
  live: 'Live',
  reconnecting: 'Connection lost. Reconnecting…',
  closed: 'Disconnected. Reload the page to try again.',
};

const timeOnly = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' });

type LiveTablesProps = {
  tables: Tables;
  connection: ConnectionStatus;
  recent: RecentChanges;
  lastUpdate: Date | null;
};

export function LiveTables({ tables, connection, recent, lastUpdate }: LiveTablesProps) {
  return (
    <motion.section
      className={styles.section}
      aria-labelledby="live-title"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <div className={styles.head}>
        <h2 id="live-title" className={styles.title}>
          Live data
        </h2>
        <div className={styles.meta}>
          <span className={styles.connection} data-state={connection} role="status">
            <span className={styles.dot} aria-hidden="true" />
            {CONNECTION_TEXT[connection]}
          </span>
          {lastUpdate && <span className={styles.updated}>Last change {timeOnly.format(lastUpdate)}</span>}
        </div>
      </div>

      <DataTable
        name="incident_history"
        description="One row per incident"
        rows={tables.incident_history}
        columns={INCIDENT_COLUMNS}
        recent={recent}
      />
      <DataTable
        name="progress_tracker"
        description="Every step taken on an incident"
        rows={tables.progress_tracker}
        columns={PROGRESS_COLUMNS}
        recent={recent}
      />
    </motion.section>
  );
}