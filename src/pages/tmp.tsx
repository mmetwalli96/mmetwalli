import { useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Page } from '@/components/layout/Page';
import { resetDemo, updateEmployeeContact } from '@/lib/api';
import type { ApiResponse, EmployeeContact } from '@/lib/api';
import { useLiveTables } from '@/lib/hooks';
import { LiveTables } from '@/components/mm-auto/LiveTables';
import styles from './MmautoDemo.module.css';

type Status = 'idle' | 'running' | 'success' | 'error';

type LogEntry = {
  id: number;
  action: string;
  ok: boolean;
  message: string;
  time: Date;
};

type ContactErrors = Partial<Record<keyof EmployeeContact, string>>;

const timeFormat = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' });
const EASE = [0.22, 1, 0.36, 1] as const;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateContact(contact: EmployeeContact): ContactErrors {
  const errors: ContactErrors = {};
  if (!contact.name.trim()) errors.name = 'Enter the employee’s name.';
  if (!EMAIL.test(contact.email.trim())) errors.email = 'Enter an email address like name@example.com.';
  return errors;
}

type ActionCardProps = {
  step: number;
  title: string;
  description: string;
  buttonLabel: string;
  confirmLabel?: string;
  successText: string;
  failText: string;
  lockedText?: string;
  canSend?: () => boolean;
  run: () => Promise<ApiResponse>;
  onStart?: () => void;
  onDone: (result: ApiResponse) => void;
  children?: ReactNode;
};

function ActionCard({
  step,
  title,
  description,
  buttonLabel,
  confirmLabel,
  successText,
  failText,
  lockedText,
  canSend,
  run,
  onStart,
  onDone,
  children,
}: ActionCardProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [detail, setDetail] = useState('');
  const [confirming, setConfirming] = useState(false);
  const confirmTimer = useRef(0);
  const locked = Boolean(lockedText);
  const titleId = `step-${step}-title`;

  useEffect(() => () => window.clearTimeout(confirmTimer.current), []);

  const send = async () => {
    setStatus('running');
    setDetail('');
    onStart?.();
    const result = await run();
    setStatus(result.ok ? 'success' : 'error');
    setDetail(result.message);
    onDone(result);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'running' || locked) return;
    if (canSend && !canSend()) return;
    if (confirmLabel && !confirming) {
      setConfirming(true);
      // Drop back to the normal button if the user doesn't confirm in time
      confirmTimer.current = window.setTimeout(() => setConfirming(false), 4000);
      return;
    }
    window.clearTimeout(confirmTimer.current);
    setConfirming(false);
    void send();
  };

  const label = status === 'running' ? 'Sending…' : confirming && confirmLabel ? confirmLabel : buttonLabel;

  return (
    <section className={styles.card} data-status={status} data-locked={locked || undefined} aria-labelledby={titleId}>
      <div className={styles.cardHead}>
        <h2 id={titleId} className={styles.cardTitle}>
          <span className={styles.step} aria-label={`Step ${step}:`}>
            {step}
          </span>
          {title}
        </h2>
        <span className={styles.pill} data-status={locked ? 'locked' : status}>
          {locked && 'Waiting'}
          {!locked && status === 'idle' && 'Ready'}
          {!locked && status === 'running' && 'Sending'}
          {!locked && status === 'success' && 'Succeeded'}
          {!locked && status === 'error' && 'Failed'}
        </span>
      </div>

      <p className={styles.description}>{description}</p>

      <form className={styles.form} onSubmit={onSubmit} noValidate>
        {children}

        <div className={styles.buttonRow}>
          <button
            type="submit"
            className={styles.button}
            data-confirming={confirming || undefined}
            disabled={status === 'running' || locked}
            aria-busy={status === 'running'}
            aria-describedby={locked ? `${titleId}-locked` : undefined}
          >
            {status === 'running' && <span className={styles.spinner} aria-hidden="true" />}
            {label}
          </button>
          {locked && (
            <p id={`${titleId}-locked`} className={styles.lockedText}>
              {lockedText}
            </p>
          )}
        </div>
      </form>

      <div aria-live="polite" className={styles.messageSlot}>
        <AnimatePresence mode="wait" initial={false}>
          {(status === 'success' || status === 'error') && (
            <motion.div
              key={status + detail}
              className={styles.message}
              data-status={status}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <span className={styles.icon} aria-hidden="true">
                {status === 'success' ? '✓' : '!'}
              </span>
              <div>
                <p className={styles.messageTitle}>{status === 'success' ? successText : failText}</p>
                {detail && <p className={styles.messageDetail}>{detail}</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

type FieldProps = {
  id: string;
  label: string;
  type?: string;
  value: string;
  error?: string;
  autoComplete?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

function Field({ id, label, type = 'text', value, error, autoComplete, disabled, onChange }: FieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        className={styles.input}
        value={value}
        autoComplete={autoComplete}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && (
        <p id={`${id}-error`} className={styles.fieldError}>
          {error}
        </p>
      )}
    </div>
  );
}

export default function MmautoDemo() {
  const [log, setLog] = useState<LogEntry[]>([]);
  const nextId = useRef(1);

  const [resetDone, setResetDone] = useState(false);

  const [showTables, setShowTables] = useState(false);
  const live = useLiveTables(showTables);

  const [contact, setContact] = useState<EmployeeContact>({ name: '', email: '' });
  const [contactErrors, setContactErrors] = useState<ContactErrors>({});
  const [showErrors, setShowErrors] = useState(false);

  const record = (action: string) => (result: ApiResponse) => {
    setLog((entries) => [
      { id: nextId.current++, action, ok: result.ok, message: result.message, time: new Date() },
      ...entries,
    ]);
  };

  const editContact = (field: keyof EmployeeContact) => (value: string) => {
    const next = { ...contact, [field]: value };
    setContact(next);
    if (showErrors) setContactErrors(validateContact(next));
  };

  const checkContact = () => {
    const errors = validateContact(contact);
    setContactErrors(errors);
    setShowErrors(true);
    const firstInvalid = (['name', 'email'] as const).find((field) => errors[field]);
    if (firstInvalid) document.getElementById(`employee-${firstInvalid}`)?.focus();
    return !firstInvalid;
  };

  return (
    <Page title="MM AUTO demo">
      <div className={`container ${styles.page}`}>
        <h1 className={`display ${styles.title}`}>MM AUTO DEMO</h1>

        <div className={styles.actions}>
          <ActionCard
            step={1}
            title="Reset"
            description="Sends a reset request to the server."
            buttonLabel="Reset"
            confirmLabel="Click again to reset"
            successText="Reset complete."
            failText="Reset failed."
            run={resetDemo}
            onStart={() => setResetDone(false)}
            onDone={(result) => {
              setResetDone(result.ok);
              record('Reset')(result);
            }}
          />

          <ActionCard
            step={2}
            title="Update contact records"
            description="Sends the employee’s name and email to the server to update their contact record."
            buttonLabel="Update contact"
            successText="Contact record updated."
            failText="Contact record wasn’t updated."
            lockedText={resetDone ? undefined : 'Run the reset first. This step unlocks when it succeeds.'}
            canSend={checkContact}
            run={() => updateEmployeeContact({ name: contact.name.trim(), email: contact.email.trim() })}
            onDone={(result) => {
              if (result.ok) setShowTables(true);
              record('Update contact')(result);
            }}
          >
            <div className={styles.fields}>
              <Field
                id="employee-name"
                label="Employee name"
                value={contact.name}
                error={contactErrors.name}
                autoComplete="off"
                onChange={editContact('name')}
              />
              <Field
                id="employee-email"
                label="Employee email"
                type="email"
                value={contact.email}
                error={contactErrors.email}
                autoComplete="off"
                onChange={editContact('email')}
              />
            </div>
          </ActionCard>
        </div>

        {showTables && <LiveTables {...live} />}

        <section className={styles.logSection} aria-labelledby="log-title">
          <div className={styles.logHead}>
            <h2 id="log-title" className={styles.logTitle}>
              Activity
            </h2>
            {log.length > 0 && (
              <button type="button" className={styles.clear} onClick={() => setLog([])}>
                Clear
              </button>
            )}
          </div>

          {log.length === 0 ? (
            <p className={styles.empty}>Each request you send appears here with its result.</p>
          ) : (
            <ol className={styles.log}>
              <AnimatePresence initial={false}>
                {log.map((entry) => (
                  <motion.li
                    key={entry.id}
                    layout
                    className={styles.logItem}
                    data-ok={entry.ok || undefined}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                  >
                    <time className={styles.logTime} dateTime={entry.time.toISOString()}>
                      {timeFormat.format(entry.time)}
                    </time>
                    <span className={styles.logAction}>{entry.action}</span>
                    <span className={styles.logResult}>{entry.ok ? 'Succeeded' : 'Failed'}</span>
                    {entry.message && <span className={styles.logMessage}>{entry.message}</span>}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ol>
          )}
        </section>
      </div>
    </Page>
  );
}