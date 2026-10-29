import { createContext, useContext, useState } from 'react';

/** True while the router is still on the location the visitor first loaded. */
export const InitialRouteContext = createContext(true);

/**
 * Whether this page was the first one shown after a full page load.
 * Read once at mount, so a page that is exiting keeps the value it started with.
 */
export function useIsInitialPage(): boolean {
  const value = useContext(InitialRouteContext);
  const [initial] = useState(value);
  return initial;
}
