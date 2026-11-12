import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { Page } from '@/components/layout/Page';
import { ScatterTitle } from '@/components/ui/ScatterTitle';
import { cssVars } from '@/lib/hooks';
import styles from '@/styles/MmAuto.module.css';
import graphImg from '@/assets/mm-auto/graph.png';
import sqlImg from '@/assets/mm-auto/sql.png';
import solutionImg from '@/assets/mm-auto/solution.png';
import { Button } from '@/components/ui/Button';

type Diagram = { src: string; alt: string; width: number; height: number };

const DIAGRAMS = {
  graph: {
    src: graphImg,
    width: 2560,
    height: 1806,
    alt: 'Neo4j data model: Supplier, Car, System, Part, Material, Plant, Line, Station, Employee and Shift nodes and the relationships between them.',

  },
  sql: {
    src: sqlImg,
    width: 2560,
    height: 1298,
    alt: 'PostgreSQL data model: the interruption_codes, incident_history and progress_tracker tables and their columns.',
  },
  solution: {
    src: solutionImg,
    width: 2560,
    height: 1524,
    alt: 'The eight steps the agent takes to detect and resolve a shortfall, from looking up the interruption code to checking the response.',
  },
} satisfies Record<string, Diagram>;

const NODES = ['Car', 'System', 'Part', 'Material', 'Supplier', 'Plant', 'Line', 'Station', 'Employee', 'Shift'];

const CAPABILITIES = [
  { word: 'Detect', color: 'var(--v3)' },
  { word: 'Search', color: 'var(--v2)' },
  { word: 'Notify', color: '#d9732a' },
  { word: 'Follow', color: '#c2456f' },
];

const TABLES = [
  {
    name: 'interruption_codes',
    purpose: 'The list of interruption codes',
    columns: (
      <>
        <code>id</code>, <code>code</code> (e.g. <code>'CR-1097'</code>), <code>reason</code>, <code>category</code>{' '}
        (e.g. Capacity, Workforce, Equipment), <code>severity</code>
      </>
    ),
  },
  {
    name: 'incident_history',
    purpose: 'One row per incident',
    columns: (
      <>
        <code>id</code>, <code>incident</code>, <code>interruption</code> (the code from <code>interruption_codes</code>,
        not the id), <code>occurence_time</code>, <code>description</code>, <code>resolution_date</code>,{' '}
        <code>status</code> (<code>'In Progress'</code> or <code>'Resolved'</code>)
      </>
    ),
  },
  {
    name: 'progress_tracker',
    purpose: 'Every step taken on an incident',
    columns: (
      <>
        <code>id</code>, <code>incident</code> (from <code>incident_history</code>), <code>event_time</code>,{' '}
        <code>event_description</code>, <code>uri</code>
      </>
    ),
  },
];

function Figure({ diagram }: { diagram: Diagram }) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      root.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
      triggerRef.current?.focus();
    };
  }, [open]);

  return (
    <figure className={styles.figure}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.figureButton}
        onClick={() => setOpen(true)}
      >
        <motion.img
          layoutId={diagram.src}
          src={diagram.src}
          alt={diagram.alt}
          width={diagram.width}
          height={diagram.height}
          loading="lazy"
          className={styles.figureImage}
        />
      </button>

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              className={styles.lightbox}
              role="dialog"
              aria-modal="true"
              aria-label={diagram.alt}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            >
              <button ref={closeRef} type="button" className={styles.close} onClick={() => setOpen(false)}>
                Close
              </button>
              <div className={styles.lightboxScroll}>
                <motion.img
                  layoutId={diagram.src}
                  src={diagram.src}
                  alt={diagram.alt}
                  width={diagram.width}
                  height={diagram.height}
                  className={styles.lightboxImage}
                  onClick={(event) => event.stopPropagation()}
                  transition={{ type: 'spring', stiffness: 260, damping: 30 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </figure>
  );
}


function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function MmAuto() {
  return (
    <Page title="MM AUTO">
      <article className={`container ${styles.page}`}>
        <Link to="/projects" className={styles.back}>
          <span aria-hidden="true" className={styles.backArrow}>
            ←
          </span>
          All projects
        </Link>

        <header className={styles.hero}>
          <ScatterTitle text="MM AUTO" className={`display ${styles.title}`} />
          <motion.p
            className={styles.tagline}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            An agentic approach in factory automation
          </motion.p>
          <motion.ul
            className={styles.stack}
            aria-label="Built with"
            initial="hidden"
            animate="shown"
            variants={{ shown: { transition: { staggerChildren: 0.06, delayChildren: 0.8 } } }}
          >
            {['Neo4j', 'PostgreSQL', 'Node.js', 'MailTrap', 'MongoDB'].map((tool) => (
              <motion.li
                key={tool}
                className={styles.chip}
                variants={{ hidden: { opacity: 0, y: 10 }, shown: { opacity: 1, y: 0 } }}
              >
                {tool}
              </motion.li>
            ))}
          </motion.ul>
        </header>

        <section className={styles.section} aria-labelledby="intro">
          <div className={styles.sectionHead}>
            <span className={styles.number}>1</span>
            <h2 id="intro" className={styles.h2}>
              Intro
            </h2>
          </div>
          <div className={styles.body}>
            <Reveal className={styles.prose}>
              <p>
                In car manufacturing, when a supplier cannot deliver a part, someone has to notice it, find
                alternative suppliers, notify the appropriate stakeholders, follow up until they respond, and record
                the outcome.
              </p>
              <p>
                <strong>MM AUTO</strong> applies an agentic approach to factory automation. It hands that work to an
                agent so supply shortfalls are resolved in a timely manner and every step is logged.
              </p>
            </Reveal>

            <Reveal className={styles.sub}>
              <h3 className={styles.h3}>The manufacturing data</h3>
              <div className={styles.prose}>
                <p>
                  To model the complex relationships in a car manufacturing company, <strong>Neo4j</strong> was used.
                  It suits this application because it can capture the depth of the relationships in the data.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        <Reveal className={styles.wide}>
          <Figure diagram={DIAGRAMS.graph} />
        </Reveal>

        <section className={styles.section} aria-label="Graph model details">
          <div className={styles.sectionHead} aria-hidden="true" />
          <div className={styles.body}>
            <Reveal className={styles.prose}>
              <h4 className={styles.h4}>Nodes</h4>
              <ul className={styles.nodes}>
                {NODES.map((node) => (
                  <li key={node}>
                    <code>{node}</code>
                  </li>
                ))}
              </ul>
              <p className={styles.small}>
                Every node has an <code>id</code>.
              </p>

              <h4 className={styles.h4}>Relationships</h4>
              <ul className={styles.list}>
                <li>
                  A <code>Supplier</code> <code className={styles.rel}>SUPPLIES</code> a <code>Part</code>.
                </li>
                <li>
                  A <code>Part</code> is a <code className={styles.rel}>COMPONENT_OF</code> a <code>System</code> and is{' '}
                  <code className={styles.rel}>MADE_OF</code> a <code>Material</code>.
                </li>
                <li>
                  A <code>Car</code> <code className={styles.rel}>USES</code> a <code>System</code>.
                </li>
                <li>
                  A <code>Line</code> <code className={styles.rel}>PRODUCES</code> parts,{' '}
                  <code className={styles.rel}>ASSEMBLES</code> systems and sits <code className={styles.rel}>IN</code>{' '}
                  a <code>Plant</code>.
                </li>
                <li>
                  A <code>Station</code> is <code className={styles.rel}>AT</code> a <code>Line</code>.
                </li>
                <li>
                  An <code>Employee</code> is <code className={styles.rel}>ASSIGNED_TO</code> a <code>Station</code>,{' '}
                  <code className={styles.rel}>SCHEDULED_FOR</code> a <code>Shift</code>, and the plant director{' '}
                  <code className={styles.rel}>DIRECTS</code> a <code>Plant</code>.
                </li>
              </ul>

              <h4 className={styles.h4}>
                <code className={styles.rel}>SUPPLIES</code> properties
              </h4>
              <p>
                <code>qty</code> (supplied quantity), <code>cpu</code> (cost per unit), <code>currency</code>,{' '}
                <code>start_date</code>, <code>end_date</code>, <code>uri</code> and <code>interruption_code</code>.
                The code is null when the supply is uninterrupted.
              </p>
            </Reveal>

            <Reveal className={styles.sub}>
              <h3 className={styles.h3}>Incident tracking</h3>
              <div className={styles.prose}>
                <p>
                  SQL databases are the best choice for tabular data, and one is used to store the information and
                  metadata related to interruptions and incidents.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        <Reveal className={styles.wide}>
          <Figure diagram={DIAGRAMS.sql} />
        </Reveal>

        <section className={styles.section} aria-label="Incident tables">
          <div className={styles.sectionHead} aria-hidden="true" />
          <Reveal className={styles.body}>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Table</th>
                    <th scope="col">Purpose</th>
                    <th scope="col">Columns</th>
                  </tr>
                </thead>
                <tbody>
                  {TABLES.map((table) => (
                    <tr key={table.name}>
                      <th scope="row">
                        <code>{table.name}</code>
                      </th>
                      <td>{table.purpose}</td>
                      <td>{table.columns}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </section>

        <section className={styles.section} aria-labelledby="problem">
          <div className={styles.sectionHead}>
            <span className={styles.number}>2</span>
            <h2 id="problem" className={styles.h2}>
              Problem statement
            </h2>
          </div>
          <Reveal className={`${styles.body} ${styles.prose}`}>
            <p>
              There is a shortfall in the supply of connecting rod. The shortfall appears as the supply-shortfall interruption code
              on a <code className={styles.rel}>SUPPLIES</code> relationship between a supplier and a part.
            </p>
            <p>
              Until it is resolved, alternative suppliers must be found, the plant director must be notified, decide
              which one to approach and be reminded when needed, and each step must be documented and logged.
            </p>
          </Reveal>
        </section>

        <section className={styles.section} aria-labelledby="solution">
          <div className={styles.sectionHead}>
            <span className={styles.number}>3</span>
            <h2 id="solution" className={styles.h2}>
              Objective and solution
            </h2>
          </div>
          <div className={styles.body}>
            <Reveal className={styles.prose}>
              <p>
                Make resolving supply shortfalls timely and documented, using an agent that can detect, search, notify
                and follow.
              </p>
            </Reveal>
            <ul className={styles.capabilities}>
              {CAPABILITIES.map((item, i) => (
                <motion.li
                  key={item.word}
                  className={styles.capability}
                  style={cssVars({ '--c': item.color })}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.6, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                >
                  {item.word}
                </motion.li>
              ))}
            </ul>
          </div>
        </section>

        <Reveal className={styles.wide}>
          <Figure diagram={DIAGRAMS.solution} />
        </Reveal>
      </article>
      <div className={styles.demoWrap}>
        <Link to="/projects/mm-auto/demo">
          <Button>Start</Button>
        </Link>
      </div>

    </Page>
  );
}