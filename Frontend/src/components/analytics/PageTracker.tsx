import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useEventTracker } from '../../hooks/useEventTracker';

export const PageTracker = () => {
  const location = useLocation();
  const { trackEvent } = useEventTracker();
  const lastPath = useRef<string>('');

  useEffect(() => {
    if (lastPath.current === location.pathname) return;
    lastPath.current = location.pathname;
    
    trackEvent('page_view', { path: location.pathname });
  }, [location.pathname]);

  return null;
};
