import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter, MemoryRouter } from 'react-router';
import '@fontsource-variable/archivo/wdth.css';
import '@/styles/global.css';
import App from '@/App';

// BrowserRouter needs the host to serve index.html for every path.
// Set VITE_ROUTER=hash for static hosts without rewrites, such as GitHub Pages.
const mode = import.meta.env.VITE_ROUTER;
const Router = mode === 'hash' ? HashRouter : mode === 'memory' ? MemoryRouter : BrowserRouter;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
);
