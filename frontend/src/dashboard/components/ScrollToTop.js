import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, hash, state } = useLocation();

  useEffect(() => {
    // If there's a hash, scroll to the element with that ID
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        // Small delay to ensure the page has rendered
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 50);
        return () => clearTimeout(timer);
      }
    } 
    // If there's a scrollToContact state, handle it
    else if (state?.scrollToContact) {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        const timer = setTimeout(() => {
          contactSection.scrollIntoView({ behavior: 'smooth' });
          // Clear the state to prevent scrolling on re-renders
          window.history.replaceState({}, document.title);
        }, 100);
        return () => clearTimeout(timer);
      }
    }
    // Otherwise, scroll to top
    else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash, state]);

  return null;
};

export default ScrollToTop;
