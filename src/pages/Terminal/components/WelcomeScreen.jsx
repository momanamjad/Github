import React, { useState, useEffect, useRef } from "react";

const COMMANDS = [
  "git log --oneline -5",
  "ls src/components",
  "cat package.json",
  "npm run build",
];

const SHORTCUTS = [
  { key: "Ctrl+P", desc: "Command palette" },
  { key: "Ctrl+F", desc: "Search terminal" },
  { key: "Ctrl+L", desc: "Clear screen" },
  { key: "?", desc: "All shortcuts" },
];

const STORAGE_KEY = "terminal_visited";

/**
 * WelcomeScreen
 *
 * Shows a full-screen onboarding overlay the FIRST TIME a user visits /terminal.
 * - If "Don't show again" is checked when dismissing → sets localStorage.terminal_visited = true
 * - If unchecked → shows again next visit
 * - Fades in on appear, fades out on dismiss
 */
const WelcomeScreen = ({ onDismiss }) => {
  const [visible, setVisible] = useState(false);       // CSS opacity animation state
  const [exiting, setExiting] = useState(false);       // triggers fade-out
  const [dontShow, setDontShow] = useState(false);

  // Fade in after first paint
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const dismiss = () => {
    if (dontShow) {
      localStorage.setItem(STORAGE_KEY, "true");
    }
    setExiting(true);
    setTimeout(() => {
      onDismiss?.();
    }, 300);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        opacity: exiting ? 0 : visible ? 1 : 0,
        transition: "opacity 0.3s ease",
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <div
        style={{
          background: "#161b22",
          border: "1px solid #30363d",
          borderRadius: "16px",
          padding: "36px 40px",
          maxWidth: "520px",
          width: "100%",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
          transform: exiting ? "scale(0.97)" : visible ? "scale(1)" : "scale(0.95)",
          transition: "transform 0.3s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <div style={{ marginBottom: "28px", textAlign: "center" }}>
          <div
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "#e6edf3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              marginBottom: "6px",
              fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
            }}
          >
            <span>⚡</span>
            <span>github-cli Terminal</span>
          </div>
          <p style={{ color: "#8b949e", fontSize: "14px", margin: 0 }}>
            A real bash shell in your browser
          </p>
        </div>

        {/* Command examples */}
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              background: "#0d1117",
              border: "1px solid #30363d",
              borderRadius: "10px",
              padding: "16px 20px",
            }}
          >
            <div
              style={{
                color: "#8b949e",
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "10px",
              }}
            >
              Try these commands:
            </div>
            {COMMANDS.map((cmd) => (
              <div
                key={cmd}
                style={{
                  fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                  fontSize: "13px",
                  color: "#3fb950",
                  padding: "3px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span style={{ color: "#484f58", userSelect: "none" }}>$</span>
                {cmd}
              </div>
            ))}
          </div>
        </div>

        {/* Keyboard shortcuts */}
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              color: "#e6edf3",
              fontSize: "13px",
              fontWeight: 600,
              marginBottom: "10px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>⌨️</span>
            <span>Keyboard shortcuts</span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "6px 24px",
            }}
          >
            {SHORTCUTS.map(({ key, desc }) => (
              <div
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <kbd
                  style={{
                    display: "inline-block",
                    padding: "2px 8px",
                    background: "#21262d",
                    border: "1px solid #30363d",
                    borderRadius: "5px",
                    fontSize: "11px",
                    fontFamily: "'Fira Code', Consolas, monospace",
                    color: "#c9d1d9",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {key}
                </kbd>
                <span style={{ color: "#8b949e", fontSize: "12px" }}>{desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Feature hints */}
        <div
          style={{
            background: "#0d1117",
            border: "1px solid #30363d",
            borderRadius: "8px",
            padding: "12px 16px",
            marginBottom: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
            <span style={{ fontSize: "16px", flexShrink: 0, lineHeight: 1.3 }}>📊</span>
            <span style={{ color: "#8b949e", fontSize: "12px", lineHeight: 1.5 }}>
              <strong style={{ color: "#c9d1d9" }}>Live dashboard</strong> updates automatically as you navigate with{" "}
              <code
                style={{
                  background: "#161b22",
                  border: "1px solid #30363d",
                  borderRadius: "3px",
                  padding: "1px 5px",
                  fontSize: "11px",
                  color: "#3fb950",
                  fontFamily: "monospace",
                }}
              >
                cd
              </code>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
            <span style={{ fontSize: "16px", flexShrink: 0, lineHeight: 1.3 }}>🗂️</span>
            <span style={{ color: "#8b949e", fontSize: "12px", lineHeight: 1.5 }}>
              <strong style={{ color: "#c9d1d9" }}>Click any file</strong> in the explorer to open it in the Monaco editor
            </span>
          </div>
        </div>

        {/* Don't show again */}
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "16px",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <input
            type="checkbox"
            checked={dontShow}
            onChange={(e) => setDontShow(e.target.checked)}
            style={{
              width: "14px",
              height: "14px",
              accentColor: "#2da44e",
              cursor: "pointer",
            }}
          />
          <span style={{ color: "#8b949e", fontSize: "12px" }}>
            Don&apos;t show this again
          </span>
        </label>

        {/* CTA Button */}
        <button
          onClick={dismiss}
          style={{
            width: "100%",
            padding: "12px 24px",
            background: "#2da44e",
            border: "1px solid #2da44e",
            borderRadius: "8px",
            color: "#ffffff",
            fontSize: "15px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 0.15s ease, transform 0.1s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#2c974b";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#2da44e";
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = "scale(0.98)";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <span>Start Terminal</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};

/**
 * shouldShowWelcome — checks localStorage to decide if the screen should appear.
 * Returns true on first visit (no key), false if user previously checked "don't show again".
 */
export const shouldShowWelcome = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "true";
  } catch {
    return false;
  }
};

export default WelcomeScreen;
