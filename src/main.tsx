import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter, MemoryRouter } from 'react-router';
import '@fontsource-variable/archivo/wdth.css';
import '@/styles/global.css';
import App from '@/App';

const mode = import.meta.env.VITE_ROUTER;
const Router = mode === 'hash' ? HashRouter : mode === 'memory' ? MemoryRouter : BrowserRouter;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
);
