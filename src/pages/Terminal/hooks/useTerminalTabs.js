import { useState, useRef, useCallback } from 'react';

export const useTerminalTabs = () => {
  const [tabs, setTabs] = useState([{ id: 1, label: "bash" }]);
  const [activeTabId, setActiveTabId] = useState(1);
  const activeTabIdRef = useRef(activeTabId);
  const nextTabId = useRef(2);

  // Keep activeTabIdRef updated
  const updateActiveTabRef = useCallback(() => {
    activeTabIdRef.current = activeTabId;
  }, [activeTabId]);

  const handleNewTab = useCallback(() => {
    const newId = nextTabId.current++;
    const newLabel = `bash ${newId}`;
    setTabs(prev => [...prev, { id: newId, label: newLabel }]);
    setActiveTabId(newId);
  }, []);

  const handleCloseTab = useCallback((tabId) => {
    setTabs(prev => {
      const nextTabs = prev.filter(t => t.id !== tabId);
      if (nextTabs.length === 0) {
        const newId = nextTabId.current++;
        const newLabel = `bash ${newId}`;
        setActiveTabId(newId);
        return [{ id: newId, label: newLabel }];
      }
      if (tabId === activeTabId) {
        const closedIdx = prev.findIndex(t => t.id === tabId);
        const newActiveIdx = Math.min(nextTabs.length - 1, Math.max(0, closedIdx - 1));
        setActiveTabId(nextTabs[newActiveIdx].id);
      }
      return nextTabs;
    });
  }, [activeTabId]);

  return {
    tabs,
    setTabs,
    activeTabId,
    setActiveTabId,
    activeTabIdRef,
    nextTabId,
    updateActiveTabRef,
    handleNewTab,
    handleCloseTab
  };
};
