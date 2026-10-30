import { useRef } from 'react';
import { Route, Routes, useLocation } from 'react-router';
import { AnimatePresence, MotionConfig } from 'motion/react';
import { Backdrop } from '@/components/layout/Backdrop';
import { Navbar } from '@/components/layout/Navbar';
import { SkipLink } from '@/components/layout/SkipLink';
import { InitialRouteContext } from '@/components/layout/transition-context';
import Home from '@/pages/Home';
import Projects from '@/pages/Projects';
import Contact from '@/pages/Contact';
import NotFound from '@/pages/NotFound';

export default function App() {
  const location = useLocation();
  const initialKey = useRef(location.key);

  return (
    <MotionConfig reducedMotion="user">
      <SkipLink />
      <Backdrop />
      <Navbar />
      <InitialRouteContext.Provider value={location.key === initialKey.current}>
        <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </InitialRouteContext.Provider>
    </MotionConfig>
  );
}
