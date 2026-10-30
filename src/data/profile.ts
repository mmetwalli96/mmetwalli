export const profile = {
  name: 'Mohamed Metwalli',
  nameLines: ['Mohamed', 'Metwalli'],
  location: 'Toronto',
  timeZone: 'America/Toronto',
  role: 'Software Engineer',
  company: 'Siemens DISW',
  intro: `Ennthusiastic programmer with more than four years of experience`,
} as const;

export type Milestone = {
  date: string;
  title: string;
  org?: string;
  current?: boolean;
};

export const milestones: Milestone[] = [
  { date: '2022-03', title: 'Data Scientist Intern', org: 'Altair' },
  { date: '2023-01', title: 'Data Scientist' },
  { date: '2025-04', title: 'Siemens DISW Acquired Altair', org: 'Siemens DISW' },
  { date: 'now', title: 'Software Engineer', org: 'Siemens DISW', current: true },
];

export type Skill = { name: string; note?: string };
export type SkillGroup = { id: string; label: string; items: Skill[] };

export const skillGroups: SkillGroup[] = [
  {
    id: 'programming',
    label: 'Programming Languages',
    items: [{ name: 'Python' }, { name: 'C++' }, { name: 'JavaScript' }, { name: 'TypeScript' }],
  },
  {
    id: 'databases',
    label: 'Databases Technologies',
    items: [{ name: 'MongoDB' }, { name: 'PostgreSQL' }, { name: 'Neo4j' }],
  },
  {
    id: 'frameworks',
    label: 'Frameworks',
    items: [{ name: 'LlamaIndex' }, { name: 'LangChain/Graph' }, { name: 'FastAPI' }, { name: 'React' }, { name: 'Node.js' }],
  },
  {
    id: 'data-engineering',
    label: 'Data Engineering Technologies',
    items: [{ name: 'Databricks' }],
  },
  {
    id: 'shell',
    label: 'Shell Scripting',
    items: [
      { name: 'Batch', note: 'Windows' },
      { name: 'Bash', note: 'Linux' },
      { name: 'Zsh', note: 'macOS' },
      { name: 'Sh', note: 'Unix' },
    ],
  },
];
