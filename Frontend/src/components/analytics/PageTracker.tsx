import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useEventTracker } from '../../hooks/useEventTracker';

export const PageTracker = () => {
  const location = useLocation();
  const { trackEvent } = useEventTracker();
  const lastPath = useRef<string>('');

  useEffect(() => {
    // Only track if path actually changed (prevents StrictMode double-trigger)
    if (lastPath.current === location.pathname) return;
    lastPath.current = location.pathname;
    
    trackEvent('page_view');
  }, [location.pathname, trackEvent]);

  return null;
};
