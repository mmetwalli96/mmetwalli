import { useReducedMotion } from 'motion/react';
import { cssVars } from '@/lib/hooks';
import styles from '@/components/projects/AgentGraph.module.css';

/*
 * Illustration for MM AUTO: an orchestrating agent hands work to three agents,
 * each tending a station on a conveyor. Parts pass the stations and change
 * colour as each one finishes its step.
 */

const ORCH = { x: 320, y: 86 };
const AGENTS = [
  { x: 150, y: 206, color: 'var(--v2)' },
  { x: 320, y: 206, color: 'var(--v3)' },
  { x: 490, y: 206, color: 'var(--v4)' },
];
const STATION_Y = 300;
const BELT_Y = 334;
const PARTS = [0, 1, 2, 3];
// Seconds after start at which a part first reaches each station (see the travel keyframes).
const STATION_PHASE = [1.62, 2.01, 0.15];

const orchestratorEdges = [
  `M${ORCH.x} ${ORCH.y} Q ${ORCH.x - 120} ${ORCH.y + 30} ${AGENTS[0].x} ${AGENTS[0].y}`,
  `M${ORCH.x} ${ORCH.y} L ${AGENTS[1].x} ${AGENTS[1].y}`,
  `M${ORCH.x} ${ORCH.y} Q ${ORCH.x + 120} ${ORCH.y + 30} ${AGENTS[2].x} ${AGENTS[2].y}`,
];
const peerEdge = `M${AGENTS[0].x} ${AGENTS[0].y} L ${AGENTS[2].x} ${AGENTS[2].y}`;
const stationEdges = AGENTS.map((a) => `M${a.x} ${a.y} L ${a.x} ${STATION_Y - 12}`);

export function AgentGraph() {
  const reduced = useReducedMotion();

  return (
    <svg className={styles.svg} viewBox="0 0 640 420" aria-hidden="true" focusable="false">
      <defs>
        <pattern id="mm-auto-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="1" fill="var(--grid-dot)" />
        </pattern>
      </defs>
      <rect width="640" height="420" fill="url(#mm-auto-grid)" />

      {/* Edges */}
      <g fill="none" strokeLinecap="round">
        {orchestratorEdges.map((d, i) => (
          <path key={d} d={d} stroke={AGENTS[i].color} strokeOpacity="0.45" strokeWidth="1.6" />
        ))}
        <path d={peerEdge} stroke="var(--ink)" strokeOpacity="0.18" strokeWidth="1.4" strokeDasharray="4 7" />
        {stationEdges.map((d, i) => (
          <path key={d} d={d} stroke={AGENTS[i].color} strokeOpacity="0.45" strokeWidth="1.6" />
        ))}
      </g>

      {/* Messages travelling along the edges */}
      {!reduced && (
        <g>
          {orchestratorEdges.map((d, i) => (
            <circle key={`o-${i}`} r="4.5" fill={AGENTS[i].color}>
              <animateMotion dur="2.4s" begin={`${i * 0.8}s`} repeatCount="indefinite" path={d} />
            </circle>
          ))}
          {stationEdges.map((d, i) => (
            <circle key={`s-${i}`} r="3.5" fill={AGENTS[i].color}>
              <animateMotion dur="1.3s" begin={`${0.4 + i * 0.45}s`} repeatCount="indefinite" path={d} />
            </circle>
          ))}
          <circle r="3.5" fill="var(--v1)">
            <animateMotion
              dur="4s"
              repeatCount="indefinite"
              path={peerEdge}
              keyPoints="0;1;0"
              keyTimes="0;0.5;1"
              calcMode="linear"
            />
          </circle>
        </g>
      )}

      {/* Orchestrator */}
      <circle className={styles.ring} cx={ORCH.x} cy={ORCH.y} r="26" fill="none" stroke="var(--v1)" strokeWidth="2" />
      <circle cx={ORCH.x} cy={ORCH.y} r="26" fill="var(--v1)" />
      <circle cx={ORCH.x} cy={ORCH.y} r="12" fill="none" stroke="var(--surface)" strokeWidth="2.5" />
      <circle cx={ORCH.x} cy={ORCH.y} r="3.5" fill="var(--surface)" />

      {/* Agents */}
      {AGENTS.map((a) => (
        <g key={a.x}>
          <circle cx={a.x} cy={a.y} r="18" fill="var(--surface)" stroke={a.color} strokeWidth="2.5" />
          <circle cx={a.x} cy={a.y} r="6" fill={a.color} />
        </g>
      ))}

      {/* Stations with status lights */}
      {AGENTS.map((a, i) => (
        <g key={`station-${a.x}`}>
          <rect
            x={a.x - 22}
            y={STATION_Y - 12}
            width="44"
            height="24"
            rx="6"
            fill="var(--surface)"
            stroke="var(--ink)"
            strokeOpacity="0.22"
            strokeWidth="1.4"
          />
          <circle
            className={styles.light}
            cx={a.x}
            cy={STATION_Y}
            r="4.5"
            fill={a.color}
            style={{ animationDelay: `${STATION_PHASE[i]}s` }}
          />
        </g>
      ))}

      {/* Conveyor belt */}
      <rect x="34" y={BELT_Y} width="572" height="26" rx="13" fill="var(--surface)" stroke="var(--ink)" strokeOpacity="0.2" strokeWidth="1.4" />
      <g className={styles.rollers}>
        {Array.from({ length: 14 }, (_, i) => (
          <circle key={i} cx={56 + i * 40} cy={BELT_Y + 13} r="5.5" fill="none" stroke="var(--ink)" strokeOpacity="0.16" strokeWidth="1.4" />
        ))}
      </g>

      {/* Parts riding the belt */}
      {PARTS.map((p) => (
        <rect
          key={p}
          className={styles.part}
          x="0"
          y={BELT_Y - 19}
          width="18"
          height="18"
          rx="4"
          style={{ animationDelay: `${-p * 2.25}s`, ...cssVars({ '--rest': `${110 + p * 130}px` }) }}
        />
      ))}
    </svg>
  );
}
