import { useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { AnimatePresence, motion, useAnimate, useReducedMotion } from 'motion/react';
import { isContactConnected, sendContactMessage } from '@/lib/contact';
import { Button } from '@/components/ui/Button';
import { SuccessMark } from '@/components/contact/SuccessMark';
import styles from '@/components/contact/ContactForm.module.css';

type Field = 'name' | 'email' | 'subject' | 'message';
type Values = Record<Field, string>;
type Errors = Partial<Record<Field, string>>;
type Status = 'idle' | 'sending' | 'sent' | 'error';

const EMPTY: Values = { name: '', email: '', subject: '', message: '' };
const MAX_MESSAGE = 2000;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const REQUIRED: Field[] = ['name', 'email', 'message'];

function validate(values: Values): Errors {
  const errors: Errors = {};
  if (values.name.trim().length < 2) errors.name = 'Enter your name.';
  if (!EMAIL.test(values.email.trim())) errors.email = 'Enter an email address like name@example.com.';
  if (values.message.trim().length < 10) errors.message = 'Write a message of at least 10 characters.';
  return errors;
}

type FieldProps = {
  field: Field;
  label: string;
  value: string;
  error?: string;
  multiline?: boolean;
  type?: string;
  autoComplete?: string;
  maxLength?: number;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur: () => void;
};

function FormField({ field, label, value, error, multiline, type = 'text', autoComplete, maxLength, onChange, onBlur }: FieldProps) {
  const id = `contact-${field}`;
  const errorId = `${id}-error`;
  const shared = {
    id,
    name: field,
    value,
    placeholder: ' ',
    autoComplete,
    maxLength,
    onChange,
    onBlur,
    className: multiline ? `${styles.input} ${styles.textarea}` : styles.input,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId : undefined,
  };

  return (
    <div className={styles.field} data-invalid={error ? true : undefined}>
      <div className={styles.control}>
        {multiline ? <textarea rows={6} {...shared} /> : <input type={type} {...shared} />}
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        <span className={styles.line} aria-hidden="true" />
      </div>
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            id={errorId}
            className={styles.error}
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ContactForm() {
  const [values, setValues] = useState<Values>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [sentName, setSentName] = useState('');
  const honeypotRef = useRef<HTMLInputElement>(null);
  const [scope, animate] = useAnimate<HTMLFormElement>();
  const reduced = useReducedMotion();

  const errors = validate(values);
  const shown = (field: Field) => (touched[field] ? errors[field] : undefined);

  const change = (field: Field) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const next = event.target.value;
    setValues((current) => ({ ...current, [field]: next }));
    if (status === 'error') setStatus('idle');
  };

  const blur = (field: Field) => () => setTouched((current) => ({ ...current, [field]: true }));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'sending') return;
    setTouched({ name: true, email: true, subject: true, message: true });

    const firstInvalid = REQUIRED.find((field) => errors[field]);
    if (firstInvalid) {
      if (!reduced && scope.current) {
        animate(scope.current, { x: [0, -12, 10, -7, 4, 0] }, { duration: 0.45 });
      }
      document.getElementById(`contact-${firstInvalid}`)?.focus();
      return;
    }

    setStatus('sending');
    try {
      await sendContactMessage(
        {
          name: values.name.trim(),
          email: values.email.trim(),
          subject: values.subject.trim(),
          message: values.message.trim(),
        },
        honeypotRef.current?.value ?? '',
      );
      setSentName(values.name.trim().split(/\s+/)[0] ?? '');
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  const reset = () => {
    setValues(EMPTY);
    setTouched({});
    setStatus('idle');
  };

  return (
    <div className={styles.panel}>
      <AnimatePresence mode="wait" initial={false}>
        {status === 'sent' ? (
          <motion.div
            key="sent"
            className={styles.sent}
            role="status"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <SuccessMark />
            <h2 className={styles.sentTitle}>{isContactConnected ? 'Message sent' : 'Preview only'}</h2>
            <p className={styles.sentText}>
              {isContactConnected
                ? `Thanks${sentName ? `, ${sentName}` : ''}. Your message is on its way.`
                : 'This form isn’t connected to an inbox yet, so your message wasn’t sent.'}
            </p>
            <Button type="button" variant="ghost" onClick={reset}>
              Write another message
            </Button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            ref={scope}
            className={styles.form}
            noValidate
            onSubmit={submit}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.row}>
              <FormField
                field="name"
                label="Your name"
                value={values.name}
                error={shown('name')}
                autoComplete="name"
                maxLength={120}
                onChange={change('name')}
                onBlur={blur('name')}
              />
              <FormField
                field="email"
                label="Email address"
                type="email"
                value={values.email}
                error={shown('email')}
                autoComplete="email"
                maxLength={200}
                onChange={change('email')}
                onBlur={blur('email')}
              />
            </div>
            <FormField
              field="subject"
              label="Subject (optional)"
              value={values.subject}
              maxLength={160}
              onChange={change('subject')}
              onBlur={blur('subject')}
            />
            <FormField
              field="message"
              label="Message"
              multiline
              value={values.message}
              error={shown('message')}
              maxLength={MAX_MESSAGE}
              onChange={change('message')}
              onBlur={blur('message')}
            />

            <div className={styles.honeypot} aria-hidden="true">
              <label htmlFor="contact-company">Company</label>
              <input ref={honeypotRef} id="contact-company" name="_gotcha" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <div className={styles.footer}>
              <p className={styles.count} aria-live="polite">
                {values.message.length} / {MAX_MESSAGE}
              </p>
              <Button type="submit" disabled={status === 'sending'} aria-busy={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Send message'}
              </Button>
            </div>

            <AnimatePresence>
              {status === 'sending' && (
                <motion.span
                  className={styles.progress}
                  aria-hidden="true"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </AnimatePresence>

            {status === 'error' && (
              <p className={styles.submitError} role="alert">
                Your message wasn’t sent. Check your connection and try again.
              </p>
            )}

            {!isContactConnected && (
              <p className={styles.notice}>
                Preview mode: messages aren’t delivered until a form endpoint is connected.
              </p>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
