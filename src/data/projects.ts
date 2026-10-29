export type Project = {
  id: string;
  title: string;
  summary: string;
  /** Short note shown while a project has no write-up yet. Delete it once you add details. */
  placeholder?: string;
  /** Optional link to a repo, demo or case study. */
  href?: string;
};

export const projects: Project[] = [
  {
    id: 'mm-auto',
    title: 'MM AUTO',
    summary: 'An agentic approach for factory automation.',
    placeholder: 'Details coming soon.',
  },
];
