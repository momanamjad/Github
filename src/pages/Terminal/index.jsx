import React, { useEffect, useRef, useState, useCallback } from "react";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { WebLinksAddon } from "xterm-addon-web-links";
import { SearchAddon } from "xterm-addon-search";
import "xterm/css/xterm.css";
import { useGitHub } from "@/contexts/GitHubContext";
import { TerminalSquare } from "lucide-react";

// Import Terminal components (moved from TerminalComponents)
import {
  LockedScreen, FileExplorer, CommandPalette,
  TerminalToolbar, TabBar,
  TerminalSearchBar, MonacoEditor,
  TERMINAL_THEMES, ShortcutsModal
} from "./TerminalComponents";

// Import custom hooks
import {
  useTerminalSession,
  useTerminalTheme,
  useTerminalTabs,
  useSplitPane
} from "./hooks";

// Import components
import { Dashboard, TerminalArea, WelcomeScreen, shouldShowWelcome } from "./components";

// Import utilities
import {
  API_URL,
  WS_URL,
  INITIAL_FONT_SIZE,
  MAX_FONT_SIZE,
  MIN_FONT_SIZE,
  RECONNECT_TIMEOUT,
  DASHBOARD_UPDATE_DURATION
} from "./utils/constants";
import { SpinnerIndicator } from "./TerminalComponents";

const TerminalPage = () => {
  // =============================================
  // Core Refs
  // =============================================
  const terminalRefs = useRef({});
  const tabsRef = useRef({});
  const activeXtermRef = useRef(null);
  const activeWsRef = useRef(null);
  const fontSizeRef = useRef(INITIAL_FONT_SIZE);

  // =============================================
  // Dashboard State
  // =============================================
  const [stats, setStats] = useState(null);
  const [deps, setDeps] = useState(null);
  const [gitStatus, setGitStatus] = useState(null);
  const [currentPath, setCurrentPath] = useState('~');
  const currentPathRef = useRef('~');
  const outputBufferRef = useRef('');
  const [dashboardUpdating, setDashboardUpdating] = useState(false);

  // =============================================
  // Terminal State
  // =============================================
  const [wsStatus, setWsStatus] = useState("connecting");
  const [cmdRunning, setCmdRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [commandHistory, setCommandHistory] = useState([]);
  const searchAddonRef = useRef(null);
  const commandHistoryRef = useRef([]);
  const currentCommandRef = useRef('');
  const [editorFile, setEditorFile] = useState(null);

  // Ping / latency tracking
  const [ping, setPing] = useState(null);
  const pingSentTimeRef = useRef(null);
  const pingIntervalRef = useRef(null);

  // Command timing for notifications
  const commandStartTimeRef = useRef(null);
  const lastCommandRef = useRef('');

  // =============================================
  // Welcome Screen
  // =============================================
  const [showWelcome, setShowWelcome] = useState(() => shouldShowWelcome());

  // =============================================
  // Custom Hooks
  // =============================================
  const { user } = useGitHub();
  const isLoggedIn = !!user;

  const { saveSession, replaySession, lastSaveTimeRef, hasRestoredRef } = useTerminalSession(isLoggedIn);
  const { selectedTheme, setSelectedTheme, applyThemeToAll, handleThemeChange: handleThemeChangeHook } = useTerminalTheme();
  const {
    tabs,
    setTabs,
    activeTabId,
    setActiveTabId,
    activeTabIdRef,
    nextTabId,
    handleNewTab,
    handleCloseTab
  } = useTerminalTabs();
  const {
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
  } = useSplitPane();

  // Keep activeTabIdRef updated
  useEffect(() => {
    activeTabIdRef.current = activeTabId;
  }, [activeTabId]);

  // =============================================
  // Theme Management
  // =============================================
  const handleThemeChange = useCallback((themeName) => {
    handleThemeChangeHook(themeName, tabsRef, splitTermRef);
  }, [handleThemeChangeHook]);

  // =============================================
  // Dashboard API Fetches
  // =============================================
  const fetchStats = useCallback(async (path, signal) => {
    try {
      const url = path ? `${API_URL}/stats?path=${encodeURIComponent(path)}` : `${API_URL}/stats`;
      const r = await fetch(url, signal ? { signal } : undefined);
      setStats(await r.json());
    } catch (e) {
      if (e?.name !== 'AbortError') { /* silently ignore */ }
    }
  }, []);

  const fetchDeps = useCallback(async (signal) => {
    try {
      const r = await fetch(`${API_URL}/deps`, signal ? { signal } : undefined);
      setDeps(await r.json());
    } catch (e) {
      if (e?.name !== 'AbortError') { /* silently ignore */ }
    }
  }, []);

  const fetchGitStatus = useCallback(async (signal) => {
    try {
      const r = await fetch(`${API_URL}/git/status`, signal ? { signal } : undefined);
      setGitStatus(await r.json());
    } catch (e) {
      if (e?.name !== 'AbortError') { /* silently ignore */ }
    }
  }, []);

  // Debounce ref for cd-detected refresh
  const cdDebounceRef = useRef(null);

  // Reactive dashboard refresh on cd — debounced 300ms
  const refreshDashboard = useCallback(async (termPath) => {
    // Cancel any pending debounce
    if (cdDebounceRef.current) clearTimeout(cdDebounceRef.current);

    cdDebounceRef.current = setTimeout(async () => {
      // Flash animation — show spinner for 1 second
      setDashboardUpdating(true);
      const timer = setTimeout(() => setDashboardUpdating(false), DASHBOARD_UPDATE_DURATION);

      // Create per-call AbortControllers
      const ctrl = new AbortController();
      await Promise.all([
        fetchStats(termPath, ctrl.signal),
        fetchGitStatus(ctrl.signal),
      ]);

      return () => {
        clearTimeout(timer);
        ctrl.abort();
      };
    }, 300);
  }, [fetchStats, fetchGitStatus]);

  // Initial dashboard fetch — cancel on unmount
  useEffect(() => {
    const ctrl = new AbortController();
    fetchStats(undefined, ctrl.signal);
    fetchDeps(ctrl.signal);
    fetchGitStatus(ctrl.signal);
    return () => ctrl.abort();
  }, [fetchStats, fetchDeps, fetchGitStatus]);

  // =============================================
  // Global Keyboard Shortcuts
  // =============================================
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === "p") { 
        e.preventDefault(); 
        setShowPalette(v => !v); 
      }
      // Shortcuts modal: ? (when not in an input/terminal) or Ctrl+Shift+?
      if (
        (e.key === '?' && !e.ctrlKey && !e.altKey &&
          !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName) &&
          !document.activeElement?.closest('.xterm')) ||
        (e.ctrlKey && e.shiftKey && e.key === '?')
      ) {
        e.preventDefault();
        setShowShortcuts(v => !v);
      }
      if (e.key === 'Escape') {
        setShowShortcuts(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // =============================================
  // Tab Management Effects
  // =============================================
  useEffect(() => {
    const activeTab = tabsRef.current[activeTabId];
    activeXtermRef.current = activeTab ? activeTab.term : null;
    activeWsRef.current = activeTab ? activeTab.ws : null;
    searchAddonRef.current = activeTab ? activeTab.searchAddon : null;

    if (activeTab) {
      if (activeTab.ws) {
        if (activeTab.ws.readyState === WebSocket.OPEN) {
          setWsStatus("connected");
        } else if (activeTab.ws.readyState === WebSocket.CONNECTING) {
          setWsStatus("connecting");
        } else {
          setWsStatus("disconnected");
        }
      } else {
        setWsStatus("connecting");
      }

      setTimeout(() => {
        if (activeTab.fitAddon) activeTab.fitAddon.fit();
        if (activeTab.term) activeTab.term.focus();
      }, 100);
    }
  }, [activeTabId, tabs]);

  // =============================================
  // Terminal Initialization for Each Tab
  // =============================================
  useEffect(() => {
    if (!isLoggedIn) return;

    const currentTheme = TERMINAL_THEMES[selectedTheme] || TERMINAL_THEMES['GitHub Dark'];

    tabs.forEach((tab, index) => {
      if (tabsRef.current[tab.id]) return;

      const container = terminalRefs.current[tab.id];
      if (!container) return;

      const term = new XTerm({
        theme: currentTheme,
        fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
        fontSize: fontSizeRef.current,
        cursorBlink: true,
        convertEol: true,
        allowProposedApi: true,
        rightClickSelectsWord: false,
        macOptionIsMeta: true,
      });

      const fitAddon = new FitAddon();
      const searchAddon = new SearchAddon();
      term.loadAddon(fitAddon);
      term.loadAddon(new WebLinksAddon());
      term.loadAddon(searchAddon);
      term.open(container);

      // Replay saved session before WS connects - ONLY for the very first tab
      let restored = false;
      if (index === 0) {
        restored = replaySession(term);
      }

      setTimeout(() => fitAddon.fit(), 100);

      // Only show welcome banner for new tabs or if no session was restored
      if (!restored) {
        term.writeln("\x1b[1;36m╔══════════════════════════════════════════════════╗\x1b[0m");
        term.writeln("\x1b[1;36m║\x1b[0m  \x1b[1;37mgithub-cli\x1b[0m — \x1b[32mProduction Terminal\x1b[0m                 \x1b[1;36m║\x1b[0m");
        term.writeln("\x1b[1;36m║\x1b[0m  \x1b[33mvim, nano, git, node, npm available\x1b[0m             \x1b[1;36m║\x1b[0m");
        term.writeln("\x1b[1;36m║\x1b[0m  \x1b[2mCtrl+P: Palette | Ctrl+F: Search | Ctrl+±: Zoom\x1b[0m\x1b[1;36m║\x1b[0m");
        term.writeln("\x1b[1;36m╚══════════════════════════════════════════════════╝\x1b[0m");
        term.writeln("");
      }

      let currentLine = "";
      let reconnectTimeout = null;
      let ws = null;

      // WebSocket Connection with exponential backoff
      let reconnectDelay = 1000; // start at 1s
      const connectWS = () => {
        if (reconnectTimeout) clearTimeout(reconnectTimeout);
        const newWs = new WebSocket(`${WS_URL}/ws`);
        newWs.binaryType = "blob";
        ws = newWs;
        
        if (tabsRef.current[tab.id]) {
          tabsRef.current[tab.id].ws = newWs;
        }
        if (tab.id === activeTabIdRef.current) {
          activeWsRef.current = newWs;
        }

        newWs.onopen = () => {
          // Successful connection — reset backoff delay
          reconnectDelay = 1000;
          if (tab.id === activeTabIdRef.current) {
            setWsStatus("connected");

            // Request notification permission
            if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
              Notification.requestPermission();
            }

            // Start ping interval
            if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = setInterval(() => {
              if (newWs.readyState === WebSocket.OPEN && tab.id === activeTabIdRef.current) {
                pingSentTimeRef.current = Date.now();
                newWs.send(JSON.stringify({ type: 'ping' }));
              }
            }, 5000);
          }
          newWs.send(JSON.stringify({ type: "resize", cols: term.cols, rows: term.rows }));
        };

        newWs.onmessage = async (event) => {
          // Handle text frames (pong, etc.) before writing to terminal
          if (typeof event.data === 'string') {
            try {
              const parsed = JSON.parse(event.data);
              if (parsed.type === 'pong' && pingSentTimeRef.current !== null) {
                const latency = Date.now() - pingSentTimeRef.current;
                pingSentTimeRef.current = null;
                if (tab.id === activeTabIdRef.current) setPing(latency);
                return; // Don't write pong to terminal
              }
            } catch {}
            // Not a control frame — write to terminal as-is
            term.write(event.data);
            processText(event.data);
            return;
          }

          let text;
          if (event.data instanceof Blob) {
            const buf = await event.data.arrayBuffer();
            const bytes = new Uint8Array(buf);
            term.write(bytes);
            text = new TextDecoder().decode(bytes);
          } else {
            term.write(event.data);
            text = event.data;
          }
          processText(text);
        };

        const processText = (text) => {
          // Prompt detection
          currentLine += text;
          if (/[$#]\s*$/.test(currentLine.split("\n").pop())) {
            if (tab.id === activeTabIdRef.current) {
              setCmdRunning(false);

              // Notification for long commands
              if (commandStartTimeRef.current !== null) {
                const duration = Date.now() - commandStartTimeRef.current;
                commandStartTimeRef.current = null;
                if (duration > 5000 && document.hidden) {
                  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                    new Notification('github-cli', {
                      body: `"${lastCommandRef.current}" completed in ${(duration / 1000).toFixed(1)}s`,
                      icon: '/favicon.ico',
                    });
                  }
                }
              }
            }
            currentLine = "";
          }

          // Reactive dashboard: detect cwd from bash prompt
          outputBufferRef.current += text;
          const promptRegex = /[\w-]+@[\w.-]+:([^#$\x1b]+)[#$]/;
          const promptMatch = outputBufferRef.current.match(promptRegex);
          if (promptMatch) {
            const newPath = promptMatch[1].trim();
            if (newPath && newPath !== currentPathRef.current) {
              currentPathRef.current = newPath;
              setCurrentPath(newPath);
              refreshDashboard(newPath);
            }
            outputBufferRef.current = '';
          }
          if (outputBufferRef.current.length > 4096) {
            outputBufferRef.current = outputBufferRef.current.slice(-2048);
          }

          saveSession(term);
        };

        newWs.onclose = () => {
          if (tab.id === activeTabIdRef.current) {
            setWsStatus("disconnected");
            // Clear ping interval
            if (pingIntervalRef.current) {
              clearInterval(pingIntervalRef.current);
              pingIntervalRef.current = null;
            }
            setPing(null);
          }
          // Exponential backoff: 1s → 2s → 4s → 8s → max 30s
          reconnectTimeout = setTimeout(() => {
            if (tab.id === activeTabIdRef.current) {
              setWsStatus("connecting");
            }
            reconnectDelay = Math.min(reconnectDelay * 2, 30000);
            connectWS();
          }, reconnectDelay);
          if (tabsRef.current[tab.id]) {
            tabsRef.current[tab.id].reconnectTimeout = reconnectTimeout;
          }
        };

        newWs.onerror = () => {
          if (tab.id === activeTabIdRef.current) {
            setWsStatus("error");
          }
          newWs.close();
        };
      };

      connectWS();

      // Keyboard Event Handling
      const handleKeydown = (e) => {
        if (e.ctrlKey && e.key === 'f') {
          e.preventDefault();
          e.stopPropagation();
          setShowSearch(true);
          return;
        }
        if (e.ctrlKey && (e.key === "=" || e.key === "+")) {
          e.preventDefault();
          e.stopPropagation();
          fontSizeRef.current = Math.min(MAX_FONT_SIZE, fontSizeRef.current + 1);
          Object.values(tabsRef.current).forEach(tInfo => {
            if (tInfo.term) {
              tInfo.term.options.fontSize = fontSizeRef.current;
              if (tInfo.fitAddon) tInfo.fitAddon.fit();
            }
          });
          if (splitTermRef.current) {
            splitTermRef.current.options.fontSize = fontSizeRef.current;
            if (splitFitRef.current) splitFitRef.current.fit();
          }
          return;
        }
        if (e.ctrlKey && e.key === "-") {
          e.preventDefault();
          e.stopPropagation();
          fontSizeRef.current = Math.max(MIN_FONT_SIZE, fontSizeRef.current - 1);
          Object.values(tabsRef.current).forEach(tInfo => {
            if (tInfo.term) {
              tInfo.term.options.fontSize = fontSizeRef.current;
              if (tInfo.fitAddon) tInfo.fitAddon.fit();
            }
          });
          if (splitTermRef.current) {
            splitTermRef.current.options.fontSize = fontSizeRef.current;
            if (splitFitRef.current) splitFitRef.current.fit();
          }
          return;
        }
        if (e.ctrlKey && e.shiftKey && (e.key === 'V' || e.code === 'KeyV')) {
          e.preventDefault();
          e.stopPropagation();
          navigator.clipboard.readText().then(text => {
            if (text && ws?.readyState === WebSocket.OPEN) ws.send(text);
          }).catch(() => {});
          return;
        }
        if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.code === 'KeyC')) {
          e.preventDefault();
          e.stopPropagation();
          const sel = term.getSelection();
          if (sel) navigator.clipboard.writeText(sel).catch(() => {});
          return;
        }
        if (e.ctrlKey && !e.shiftKey && (e.key === 'C' || e.code === 'KeyC')) {
          const sel = term.getSelection();
          if (sel) {
            e.preventDefault();
            e.stopPropagation();
            navigator.clipboard.writeText(sel).catch(() => {});
            term.clearSelection();
            return;
          }
        }

        // Real terminal shortcuts
        if (e.ctrlKey && !e.shiftKey && e.key === 'l') {
          e.preventDefault();
          term.clear();
          ws?.send('\x0c');
          return;
        }
        if (e.ctrlKey && e.key === 'u') {
          e.preventDefault();
          ws?.send('\x15');
          return;
        }
        if (e.ctrlKey && e.key === 'a') {
          e.preventDefault();
          ws?.send('\x01');
          return;
        }
        if (e.ctrlKey && e.key === 'e') {
          e.preventDefault();
          ws?.send('\x05');
          return;
        }
        if (e.ctrlKey && e.key === 'w') {
          e.preventDefault();
          ws?.send('\x17');
          return;
        }
        if (e.ctrlKey && e.key === 'r') {
          e.preventDefault();
          ws?.send('\x12');
          return;
        }
      };
      container.addEventListener('keydown', handleKeydown, true);

      const handleRightClick = (e) => {
        e.preventDefault();
        navigator.clipboard.readText().then(text => {
          if (text && ws?.readyState === WebSocket.OPEN) ws.send(text);
        }).catch(() => {});
      };
      container.addEventListener('contextmenu', handleRightClick);

      term.onData((data) => {
        if (data === '\r') {
          const cmd = currentCommandRef.current.trim();
          if (cmd && cmd !== commandHistoryRef.current[0]) {
            commandHistoryRef.current = [cmd, ...commandHistoryRef.current].slice(0, 50);
            setCommandHistory([...commandHistoryRef.current]);
            setCmdRunning(true);
            // Track command start time for notifications
            commandStartTimeRef.current = Date.now();
            lastCommandRef.current = cmd;
          }
          currentCommandRef.current = '';
        } else if (data === '\x7f') {
          currentCommandRef.current = currentCommandRef.current.slice(0, -1);
        } else if (data >= ' ' || data === '\t') {
          currentCommandRef.current += data;
        }

        if (ws?.readyState === WebSocket.OPEN) {
          ws.send(data);
        }
      });

      term.attachCustomKeyEventHandler((e) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          return true;
        }
      });

      term.onResize(({ cols, rows }) => {
        const activeWs = tabsRef.current[tab.id]?.ws;
        if (activeWs?.readyState === WebSocket.OPEN) {
          activeWs.send(JSON.stringify({ type: "resize", cols, rows }));
        }
      });

      tabsRef.current[tab.id] = {
        term,
        fitAddon,
        searchAddon,
        ws,
        reconnectTimeout,
        container,
        handleKeydown,
        handleRightClick
      };
    });

    // Cleanup closed tabs
    Object.keys(tabsRef.current).forEach(idStr => {
      const id = parseInt(idStr, 10);
      if (!tabs.find(t => t.id === id)) {
        const tInfo = tabsRef.current[id];
        if (tInfo) {
          if (tInfo.reconnectTimeout) clearTimeout(tInfo.reconnectTimeout);
          if (tInfo.ws) tInfo.ws.close();
          if (tInfo.container) {
            tInfo.container.removeEventListener('keydown', tInfo.handleKeydown, true);
            tInfo.container.removeEventListener('contextmenu', tInfo.handleRightClick);
          }
          if (tInfo.term) tInfo.term.dispose();
        }
        delete tabsRef.current[id];
      }
    });

  }, [tabs, isLoggedIn, replaySession, saveSession, refreshDashboard]);

  // =============================================
  // Split Pane Terminal Initialization
  // =============================================
  useEffect(() => {
    if (!isSplit || !splitContainerRef.current) return;
    if (splitTermRef.current) return;

    const currentTheme = TERMINAL_THEMES[selectedTheme] || TERMINAL_THEMES['GitHub Dark'];

    const term = new XTerm({
      theme: currentTheme,
      fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
      fontSize: fontSizeRef.current,
      cursorBlink: true,
      convertEol: true,
      allowProposedApi: true,
      rightClickSelectsWord: false,
    });

    const fitAddon = new FitAddon();
    const searchAddon = new SearchAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());
    term.loadAddon(searchAddon);
    term.open(splitContainerRef.current);

    splitTermRef.current = term;
    splitFitRef.current = fitAddon;
    splitSearchRef.current = searchAddon;

    setTimeout(() => fitAddon.fit(), 100);

    term.writeln("\x1b[1;35m── Split Pane ──\x1b[0m");
    term.writeln("");

    let ws = null;
    let reconnectTimeout = null;

    const connectSplitWS = () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      const newWs = new WebSocket(`${WS_URL}/ws`);
      newWs.binaryType = "blob";
      ws = newWs;
      splitWsRef.current = newWs;

      newWs.onopen = () => {
        newWs.send(JSON.stringify({ type: "resize", cols: term.cols, rows: term.rows }));
      };

      newWs.onmessage = async (event) => {
        if (event.data instanceof Blob) {
          const buf = await event.data.arrayBuffer();
          term.write(new Uint8Array(buf));
        } else {
          term.write(event.data);
        }
      };

      newWs.onclose = () => {
        reconnectTimeout = setTimeout(connectSplitWS, RECONNECT_TIMEOUT);
      };

      newWs.onerror = () => { newWs.close(); };
    };

    connectSplitWS();

    const handleKeydown = (e) => {
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        e.stopPropagation();
        setShowSearch(true);
        return;
      }
    };
    splitContainerRef.current.addEventListener('keydown', handleKeydown, true);

    const handleRightClick = (e) => {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        if (text && ws?.readyState === WebSocket.OPEN) ws.send(text);
      }).catch(() => {});
    };
    splitContainerRef.current.addEventListener('contextmenu', handleRightClick);

    term.onData((data) => {
      if (ws?.readyState === WebSocket.OPEN) ws.send(data);
    });

    term.onResize(({ cols, rows }) => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "resize", cols, rows }));
      }
    });

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [isSplit, selectedTheme]);

  // =============================================
  // Window Resize Handler
  // =============================================
  useEffect(() => {
    const handleResize = () => {
      Object.values(tabsRef.current).forEach(tInfo => {
        if (tInfo.fitAddon) tInfo.fitAddon.fit();
      });
      if (splitFitRef.current) splitFitRef.current.fit();
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // =============================================
  // Buddy Extension Listeners
  // =============================================
  useEffect(() => {
    const handleBuddyCommand = (e) => {
      const { command } = e.detail;
      const activeWs = activeWsRef.current;
      if (activeWs?.readyState === WebSocket.OPEN) activeWs.send(command + "\r");
    };

    const handleBuddyGetOutput = (e) => {
      const activeTerm = activeXtermRef.current;
      if (!activeTerm) return;
      const buffer = activeTerm.buffer.active;
      let output = "";
      for (let i = Math.max(0, buffer.baseY + buffer.viewportY - 50); i < buffer.baseY + buffer.viewportY + activeTerm.rows; i++) {
        const line = buffer.getLine(i);
        if (line) output += line.translateToString(true) + "\n";
      }
      const callback = e.detail?.callback;
      if (callback) callback(output);
    };

    window.addEventListener("buddy_terminal_command", handleBuddyCommand);
    window.addEventListener("buddy_get_output", handleBuddyGetOutput);

    return () => {
      window.removeEventListener("buddy_terminal_command", handleBuddyCommand);
      window.removeEventListener("buddy_get_output", handleBuddyGetOutput);
    };
  }, []);

  // =============================================
  // Cleanup on Unmount
  // =============================================
  useEffect(() => {
    return () => {
      Object.values(tabsRef.current).forEach(tInfo => {
        if (tInfo.reconnectTimeout) clearTimeout(tInfo.reconnectTimeout);
        if (tInfo.ws) tInfo.ws.close();
        if (tInfo.container) {
          tInfo.container.removeEventListener('keydown', tInfo.handleKeydown, true);
          tInfo.container.removeEventListener('contextmenu', tInfo.handleRightClick);
        }
        if (tInfo.term) {
          saveSession(tInfo.term);
          tInfo.term.dispose();
        }
      });
      if (splitWsRef.current) splitWsRef.current.close();
      if (splitTermRef.current) splitTermRef.current.dispose();
    };
  }, [saveSession]);

  // Close history dropdown on outside click
  useEffect(() => {
    if (!showHistory) return;
    const close = () => setShowHistory(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [showHistory]);

  // =============================================
  // File Handler
  // =============================================
  const handleOpenFile = useCallback((filePath) => {
    setEditorFile(filePath);
  }, []);

  // =============================================
  // Render
  // =============================================
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)] bg-[#0d1117] text-[#e6edf3] font-sans">
        <LockedScreen onLogin={() => window.location.href = "/"} />
      </div>
    );
  }

  const terminalPanelClass = isFullscreen
    ? "fixed inset-0 z-40 flex flex-col bg-[#0d1117]"
    : "flex-1 flex flex-col bg-[#0d1117] min-w-0 overflow-hidden";

  return (
    <div className={`flex flex-col ${isFullscreen ? "" : "h-[calc(100vh-64px)]"} bg-[#0d1117] text-[#e6edf3] font-sans`}>
      {/* Onboarding Welcome Screen — first-visit only */}
      {showWelcome && (
        <WelcomeScreen onDismiss={() => setShowWelcome(false)} />
      )}

      <div className={`flex flex-1 overflow-hidden ${isFullscreen ? "" : "flex-col lg:flex-row"}`}>
        {/* Dashboard */}
        {!isFullscreen && (
          <Dashboard
            stats={stats}
            deps={deps}
            gitStatus={gitStatus}
            currentPath={currentPath}
            dashboardUpdating={dashboardUpdating}
            activeWsRef={activeWsRef}
            onOpenFile={handleOpenFile}
          />
        )}

        {/* Terminal Panel */}
        <div className={terminalPanelClass}>
          {/* Header */}
          <div className="h-12 border-b border-[#30363d] flex items-center justify-between px-4 sm:px-6 bg-[#161b22] shrink-0">
            <div className="flex items-center gap-3">
              <TerminalSquare size={18} className="text-[#8b949e]" />
              <span className="text-[13px] font-medium text-[#c9d1d9] truncate">github-cli — terminal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                wsStatus === "connected" ? "bg-[#3fb950] shadow-[0_0_8px_#3fb950]" : 
                wsStatus === "connecting" ? "bg-[#d29922]" : "bg-[#f85149]"
              }`} />
              <span className="text-[11px] text-[#8b949e] uppercase tracking-wider font-semibold">{wsStatus}</span>
              {wsStatus === 'connected' && ping !== null && (
                <span
                  className="text-[11px] font-mono font-semibold"
                  style={{
                    color: ping < 100 ? '#3fb950' : ping < 300 ? '#d29922' : '#f85149'
                  }}
                >
                  {ping}ms
                </span>
              )}
            </div>
          </div>

          {/* Tab Bar */}
          <TabBar 
            tabs={tabs}
            activeTabId={activeTabId}
            onSelectTab={setActiveTabId}
            onNewTab={handleNewTab}
            onCloseTab={handleCloseTab}
          />

          {/* Shortcuts Modal */}
          <ShortcutsModal visible={showShortcuts} onClose={() => setShowShortcuts(false)} />

          {/* Toolbar */}
          <TerminalToolbar
            wsRef={splitFocused === 'right' ? splitWsRef : activeWsRef}
            xtermRef={splitFocused === 'right' ? splitTermRef : activeXtermRef}
            isFullscreen={isFullscreen}
            setIsFullscreen={setIsFullscreen}
            commandHistory={commandHistory.slice(0, 10)}
            showHistory={showHistory}
            setShowHistory={setShowHistory}
            onSplit={() => handleSplitToggle(tabsRef)}
            isSplit={isSplit}
            selectedTheme={selectedTheme}
            onThemeChange={handleThemeChange}
            onShowShortcuts={() => setShowShortcuts(v => !v)}
          />

          {/* Terminal Area */}
          <TerminalArea
            isSplit={isSplit}
            splitRatio={splitRatio}
            splitFocused={splitFocused}
            splitTermRef={splitTermRef}
            splitContainerRef={splitContainerRef}
            splitFitRef={splitFitRef}
            splitSearchRef={splitSearchRef}
            handleDividerMouseDown={handleDividerMouseDown}
            handleSplitToggle={() => handleSplitToggle(tabsRef)}
            tabs={tabs}
            activeTabId={activeTabId}
            terminalRefs={terminalRefs}
            cmdRunning={cmdRunning}
            showSearch={showSearch}
            setShowSearch={setShowSearch}
            showPalette={showPalette}
            setShowPalette={setShowPalette}
            activeWsRef={activeWsRef}
            editorFile={editorFile}
            setEditorFile={setEditorFile}
            searchAddonRef={searchAddonRef}
            setSplitFocused={setSplitFocused}
          />
        </div>
      </div>
    </div>
  );
};

export default TerminalPage;
