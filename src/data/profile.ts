/**
 * Everything the site says about Mohamed lives in this file.
 * Edit here and every page updates.
 */

export const profile = {
  name: 'Mohamed Metwalli',
  /** The hero draws the name on these lines. */
  nameLines: ['Mohamed', 'Metwalli'],
  location: 'Toronto',
  timeZone: 'America/Toronto',
  role: 'Software Engineer',
  company: 'Siemens DISW',
  intro: 'Data scientist, now a software engineer at Siemens DISW. Based in Toronto.',
} as const;

export type Milestone = {
  /** Year and month as YYYY-MM, or "now" for the current role. */
  date: string;
  title: string;
  org?: string;
  current?: boolean;
};

export const milestones: Milestone[] = [
  { date: '2022-03', title: 'Started as an intern', org: 'Altair' },
  { date: '2023-01', title: 'Full-time Data Scientist' },
  { date: '2025-04', title: 'Became part of Siemens', org: 'Siemens' },
  { date: 'now', title: 'Software Engineer', org: 'Siemens DISW', current: true },
];

export type Skill = { name: string; note?: string };
export type SkillGroup = { id: string; label: string; items: Skill[] };

export const skillGroups: SkillGroup[] = [
  {
    id: 'programming',
    label: 'Programming',
    items: [{ name: 'Python' }, { name: 'C++' }, { name: 'JavaScript' }, { name: 'TypeScript' }],
  },
  {
    id: 'databases',
    label: 'Databases',
    items: [{ name: 'MongoDB' }, { name: 'PostgreSQL' }, { name: 'Neo4j' }],
  },
  {
    id: 'frameworks',
    label: 'Frameworks',
    items: [{ name: 'LlamaIndex' }, { name: 'LangChain' }, { name: 'LangGraph' }],
  },
  {
    id: 'ingestion',
    label: 'Data ingestion',
    items: [{ name: 'Databricks' }],
  },
  {
    id: 'shell',
    label: 'Shell scripting',
    items: [
      { name: 'Batch', note: 'Windows' },
      { name: 'Bash / Zsh', note: 'macOS and Ubuntu' },
    ],
  },
];
