import { createContext, useContext, useState } from 'react';

export const InitialRouteContext = createContext(true);

export function useIsInitialPage(): boolean {
  const value = useContext(InitialRouteContext);
  const [initial] = useState(value);
  return initial;
}
