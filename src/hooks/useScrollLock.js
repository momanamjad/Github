import { useEffect } from 'react';

export const useScrollLock = (isLocked) => {
  useEffect(() => {
    if (!isLocked) return;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isLocked]);
};
