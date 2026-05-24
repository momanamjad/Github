import { useCallback, useEffect } from 'react';
import { SESSION_KEY, MAX_SESSION_LINES } from '../utils/constants';

const SESSION_RESTORED_KEY = 'session_already_restored';

export const useTerminalSession = (isLoggedIn) => {
  const lastSaveTimeRef = { current: 0 };
  const hasRestoredRef = { current: false };

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem(SESSION_RESTORED_KEY);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const saveSession = useCallback((term, force = false) => {
    if (!term || !isLoggedIn) return;
    const now = Date.now();
    if (!force && now - lastSaveTimeRef.current < 5000) return;
    lastSaveTimeRef.current = now;

    const buf = term.buffer.active;
    const lines = [];
    const start = Math.max(0, buf.length - MAX_SESSION_LINES);
    for (let i = start; i < buf.length; i++) {
      const line = buf.getLine(i);
      if (line) lines.push(line.translateToString(true));
    }
    try { 
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(lines)); 
    } catch (e) {
      console.warn("Failed to save terminal session", e);
    }
  }, [isLoggedIn]);

  const replaySession = useCallback((term) => {
    if (hasRestoredRef.current) return false;
    const alreadyRestored = sessionStorage.getItem(SESSION_RESTORED_KEY);
    if (alreadyRestored) return false;
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return false;
      const lines = JSON.parse(raw);
      if (Array.isArray(lines) && lines.length) {
        lines.forEach(l => term.writeln(l));
        term.writeln("\x1b[2m--- session restored ---\x1b[0m");
        hasRestoredRef.current = true;
        sessionStorage.setItem(SESSION_RESTORED_KEY, 'true');
        sessionStorage.removeItem(SESSION_KEY);
        return true;
      }
    } catch (e) {
      console.error("Failed to replay session", e);
    }
    return false;
  }, []);

  return { saveSession, replaySession, lastSaveTimeRef, hasRestoredRef };
};
