'use client';

import { useEffect, useState } from 'react';

export interface PageActivity {
  isOnline: boolean;
  isVisible: boolean;
}

export function usePageActivity(): PageActivity {
  const [activity, setActivity] = useState<PageActivity>(() => ({
    isOnline: typeof navigator === 'undefined' ? true : navigator.onLine,
    isVisible:
      typeof document === 'undefined'
        ? true
        : document.visibilityState === 'visible',
  }));

  useEffect(() => {
    const update = () => {
      setActivity({
        isOnline: navigator.onLine,
        isVisible: document.visibilityState === 'visible',
      });
    };

    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    document.addEventListener('visibilitychange', update);
    update();

    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  return activity;
}
