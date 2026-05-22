import { useCallback, useState } from 'react';
import { THEME_KEY } from '../utils/constants';
import { TERMINAL_THEMES } from '../TerminalComponents';

export const useTerminalTheme = () => {
  const [selectedTheme, setSelectedTheme] = useState(() => {
    return localStorage.getItem(THEME_KEY) || 'GitHub Dark';
  });

  const applyThemeToAll = useCallback((themeName, tabsRef, splitTermRef) => {
    const theme = TERMINAL_THEMES[themeName];
    if (!theme) return;
    
    // Apply to all tab terminals
    Object.values(tabsRef.current || {}).forEach(tInfo => {
      if (tInfo.term) {
        tInfo.term.options.theme = theme;
      }
    });
    
    // Apply to split pane terminal
    if (splitTermRef?.current) {
      splitTermRef.current.options.theme = theme;
    }
    
    localStorage.setItem(THEME_KEY, themeName);
  }, []);

  const handleThemeChange = useCallback((themeName, tabsRef, splitTermRef) => {
    setSelectedTheme(themeName);
    applyThemeToAll(themeName, tabsRef, splitTermRef);
  }, [applyThemeToAll]);

  return { selectedTheme, setSelectedTheme, applyThemeToAll, handleThemeChange };
};
