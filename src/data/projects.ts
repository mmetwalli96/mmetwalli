export type Project = {
  id: string;
  title: string;
  summary: string;
  placeholder?: string;
  href?: string;
};

export const projects: Project[] = [
  {
    id: 'mm-auto',
    title: 'MM AUTO',
    summary: 'An agentic approach for factory automation',
    placeholder: 'Details coming soon.',
  },
];
