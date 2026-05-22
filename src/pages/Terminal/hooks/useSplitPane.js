import { useState, useRef, useCallback } from 'react';

export const useSplitPane = () => {
  const [isSplit, setIsSplit] = useState(false);
  const [splitFocused, setSplitFocused] = useState('left'); // 'left' | 'right'
  const [splitRatio, setSplitRatio] = useState(50);
  const splitTermRef = useRef(null);
  const splitWsRef = useRef(null);
  const splitFitRef = useRef(null);
  const splitSearchRef = useRef(null);
  const splitContainerRef = useRef(null);
  const isDraggingRef = useRef(false);

  const handleSplitToggle = useCallback((tabsRef) => {
    if (isSplit) {
      // Close split
      if (splitWsRef.current) splitWsRef.current.close();
      if (splitTermRef.current) splitTermRef.current.dispose();
      splitTermRef.current = null;
      splitWsRef.current = null;
      splitFitRef.current = null;
      splitSearchRef.current = null;
      setIsSplit(false);
      setSplitRatio(50);
      // Refit main terminal
      setTimeout(() => {
        Object.values(tabsRef.current || {}).forEach(tInfo => {
          if (tInfo.fitAddon) tInfo.fitAddon.fit();
        });
      }, 100);
    } else {
      setIsSplit(true);
    }
  }, [isSplit]);

  const handleDividerMouseDown = useCallback((e) => {
    e.preventDefault();
    isDraggingRef.current = true;

    const startX = e.clientX;
    const startRatio = splitRatio;
    const parentEl = e.target.parentElement;
    const parentWidth = parentEl?.getBoundingClientRect().width || 1;

    const onMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      const delta = e.clientX - startX;
      const deltaPercent = (delta / parentWidth) * 100;
      const newRatio = Math.max(20, Math.min(80, startRatio + deltaPercent));
      setSplitRatio(newRatio);
    };

    const onMouseUp = (tabsRef) => () => {
      isDraggingRef.current = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      // Refit both terminals
      setTimeout(() => {
        Object.values(tabsRef.current || {}).forEach(tInfo => {
          if (tInfo.fitAddon) tInfo.fitAddon.fit();
        });
        if (splitFitRef.current) splitFitRef.current.fit();
      }, 50);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [splitRatio]);

  return {
    isSplit,
    setIsSplit,
    splitFocused,
    setSplitFocused,
    splitRatio,
    setSplitRatio,
    splitTermRef,
    splitWsRef,
    splitFitRef,
    splitSearchRef,
    splitContainerRef,
    isDraggingRef,
    handleSplitToggle,
    handleDividerMouseDown
  };
};
