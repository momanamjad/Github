import { useEffect } from 'react';

export const useScrollLock = (isLocked) => {
  useEffect(() => {
    if (isLocked) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalBodyPosition = document.body.style.position;
      const originalBodyWidth = document.body.style.width;
      const originalBodyTop = document.body.style.top;
      const originalPaddingRight = document.body.style.paddingRight;
      const originalOverscroll = document.body.style.overscrollBehavior;
      
      const scrollY = window.scrollY;
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Lock both html and body
      document.documentElement.style.setProperty('overflow', 'hidden', 'important');
      document.body.style.setProperty('overflow', 'hidden', 'important');
      document.body.style.setProperty('overscroll-behavior', 'none', 'important');

      if (scrollBarWidth > 0) {
        document.body.style.setProperty('padding-right', `${scrollBarWidth}px`, 'important');
      }

      // Position fixed is the most reliable way to prevent scroll on many browsers
      document.body.style.setProperty('position', 'fixed', 'important');
      document.body.style.setProperty('top', `-${scrollY}px`, 'important');
      document.body.style.setProperty('width', '100%', 'important');

      return () => {
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.overflow = originalBodyOverflow;
        document.body.style.position = originalBodyPosition;
        document.body.style.width = originalBodyWidth;
        document.body.style.top = originalBodyTop;
        document.body.style.paddingRight = originalPaddingRight;
        document.body.style.overscrollBehavior = originalOverscroll;
        
        window.scrollTo(0, scrollY);
      };
    }
  }, [isLocked]);
};
