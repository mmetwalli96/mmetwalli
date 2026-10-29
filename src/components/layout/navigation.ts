export const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/projects', label: 'Projects' },
  { to: '/contact', label: 'Contact' },
] as const;

export type NavLinkItem = (typeof NAV_LINKS)[number];
