import { useState, useEffect, useRef, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * useDashboardPolling
 *
 * Single polling manager that coordinates all dashboard updates.
 * Uses one master interval at 3 seconds.
 * Tick counters:
 *   - metrics (CPU/RAM/Disk): every tick (3s)
 *   - ports:                  every 3 ticks (~9s)
 *   - git status:             every 10 ticks (~30s)
 *   - stats:                  event-driven only (passed in via refreshPath)
 *
 * Pauses ALL polling when tab is hidden (document.visibilityState).
 * Resumes when tab becomes visible again.
 *
 * @param {string|null} refreshPath - When changed, triggers an immediate stats + git refresh
 * @returns {{ metrics, ports, gitStatus, isLoading }}
 */
export function useDashboardPolling(refreshPath) {
  const [metrics, setMetrics] = useState(null);
  const [ports, setPorts]     = useState(null);
  const [gitStatus, setGitStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const tickRef       = useRef(0);
  const intervalRef   = useRef(null);
  const abortRefs     = useRef({});   // keyed by fetch type
  const prevPathRef   = useRef(null);

  // ── Fetch helpers ──────────────────────────────────────────────────────────

  const fetchMetrics = useCallback(async () => {
    const ctrl = new AbortController();
    abortRefs.current.metrics = ctrl;
    try {
      const r = await fetch(`${API_URL}/metrics`, { signal: ctrl.signal });
      if (r.ok) setMetrics(await r.json());
    } catch (e) {
      if (e.name !== 'AbortError') { /* silently ignore network errors */ }
    }
  }, []);

  const fetchPorts = useCallback(async () => {
    const ctrl = new AbortController();
    abortRefs.current.ports = ctrl;
    try {
      const r = await fetch(`${API_URL}/ports`, { signal: ctrl.signal });
      if (r.ok) {
        const data = await r.json();
        setPorts(data.ports || []);
      }
    } catch (e) {
      if (e.name !== 'AbortError') setPorts([]);
    }
  }, []);

  const fetchGitStatus = useCallback(async () => {
    const ctrl = new AbortController();
    abortRefs.current.git = ctrl;
    try {
      const r = await fetch(`${API_URL}/git/status`, { signal: ctrl.signal });
      if (r.ok) setGitStatus(await r.json());
    } catch (e) {
      if (e.name !== 'AbortError') { /* silently ignore */ }
    }
  }, []);

  // ── Master tick ────────────────────────────────────────────────────────────

  const tick = useCallback(() => {
    if (document.visibilityState === 'hidden') return;

    tickRef.current += 1;
    const t = tickRef.current;

    // metrics: every tick (3s)
    fetchMetrics();

    // ports: every 3 ticks (~9s)
    if (t % 3 === 0) fetchPorts();

    // git: every 10 ticks (~30s)
    if (t % 10 === 0) fetchGitStatus();
  }, [fetchMetrics, fetchPorts, fetchGitStatus]);

  // ── Initial load ───────────────────────────────────────────────────────────

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchMetrics(), fetchPorts(), fetchGitStatus()]).finally(() =>
      setIsLoading(false)
    );
  }, [fetchMetrics, fetchPorts, fetchGitStatus]);

  // ── Master interval (3 s) ──────────────────────────────────────────────────

  useEffect(() => {
    intervalRef.current = setInterval(tick, 3000);
    return () => clearInterval(intervalRef.current);
  }, [tick]);

  // ── Pause / resume on tab visibility ──────────────────────────────────────

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        // Resume: run a tick immediately
        tick();
      }
      // When hidden: tick() is a no-op, so the interval naturally skips
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [tick]);

  // ── Event-driven refresh when cd is detected ───────────────────────────────

  useEffect(() => {
    if (refreshPath === null || refreshPath === prevPathRef.current) return;
    prevPathRef.current = refreshPath;
    // stats is event-driven and handled by the parent (index.jsx)
    // We only re-fetch git here since it's the other path-sensitive call
    fetchGitStatus();
  }, [refreshPath, fetchGitStatus]);

  // ── Abort all in-flight requests on unmount ────────────────────────────────

  useEffect(() => {
    return () => {
      Object.values(abortRefs.current).forEach(ctrl => {
        try { ctrl.abort(); } catch {}
      });
      clearInterval(intervalRef.current);
    };
  }, []);

  return { metrics, ports, gitStatus, isLoading };
}
