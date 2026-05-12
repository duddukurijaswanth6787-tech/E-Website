import { useCallback, useRef } from 'react';
import { publicApi } from '../lib/api';

export type EventType = 'page_view' | 'product_view' | 'add_to_cart' | 'checkout_start' | 'purchase' | 'inquiry' | 'search' | 'click';

interface TrackOptions {
  path?: string;
  metadata?: Record<string, any>;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
}

/**
 * Enterprise Telemetry Tracker
 * - Deduplication of identical events within 2s
 * - Silent fallbacks (never crashes UI)
 * - Debounced to prevent flood
 */
export const useEventTracker = () => {
  const lastEventRef = useRef<string | null>(null);
  const lastTimestampRef = useRef<number>(0);

  const trackEvent = useCallback(async (type: EventType, options: TrackOptions = {}) => {
    try {
      const { path, metadata, utm } = options;
      const currentPath = path || window.location.pathname;
      
      // Task 5: Deduplication Logic (2s window for same event/path)
      const eventKey = `${type}:${currentPath}:${JSON.stringify(metadata || {})}`;
      const now = Date.now();
      
      if (lastEventRef.current === eventKey && (now - lastTimestampRef.current) < 2000) {
        return; // Skip duplicate
      }
      
      lastEventRef.current = eventKey;
      lastTimestampRef.current = now;

      const device = {
        browser: navigator.userAgent,
        os: navigator.platform,
        isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
      };

      const guestId = localStorage.getItem('guestId') || `guest_${crypto.randomUUID()}`;
      if (!localStorage.getItem('guestId')) localStorage.setItem('guestId', guestId);

      // Task 3: Graceful sync using publicApi (Enterprise client)
      await publicApi.post('/analytics/public/track-event', {
        type,
        path: currentPath,
        metadata: {
          ...metadata,
          screenResolution: `${window.innerWidth}x${window.innerHeight}`,
          timestamp: new Date().toISOString(),
        },
        utm: utm || {},
        device,
        guestId
      }).catch(err => {
        if (import.meta.env.DEV) {
          console.warn('[Telemetry] Sync deferred:', err.message);
        }
      });
    } catch (error) {
      // Never throw in telemetry
    }
  }, []);

  const trackClick = useCallback((e: React.MouseEvent, metadata: Record<string, any> = {}) => {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    trackEvent('click', {
      metadata: {
        ...metadata,
        x: Math.round(x * 100) / 100,
        y: Math.round(y * 100) / 100,
        tag: target.tagName,
        text: target.innerText?.substring(0, 50)
      }
    });
  }, [trackEvent]);

  return { trackEvent, trackClick };
};
