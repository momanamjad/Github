import React from 'react'
import { useState, useEffect, useRef } from "react";


 

const exploreItems = [
  { label: "Explore" },
  { label: "Marketplace" },
  { label: "MCP registry" },
];

const repos = [
  "momanajad/Employ",
  "momanajad/k_72-Clone-in-react-GSAP",
  "momanajad/theater-web-in-react",
  "momanajad/Github",
  "momanajad/Todo-list",
];

// Simple SVG icons
const Icons = {
  hamburger: (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
      <path d="M1 2.75A.75.75 0 0 1 1.75 2h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 2.75Zm0 5A.75.75 0 0 1 1.75 7h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 7.75ZM1.75 12h12.5a.75.75 0 0 1 0 1.5H1.75a.75.75 0 0 1 0-1.5Z" />
    </svg>
  ),
  close: (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
      <path d="M3.457 3.457a.75.75 0 0 1 1.06 0l3.483 3.484 3.483-3.484a.75.75 0 1 1 1.061 1.06L8.06 8l3.484 3.483a.75.75 0 1 1-1.06 1.061l-3.484-3.484-3.483 3.484a.75.75 0 0 1-1.06-1.06L6.938 8 3.457 4.517a.75.75 0 0 1 0-1.06Z" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 16 16" width="24" height="24" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52.01-.53.63-.01 1.08.58 1.23.82 1.21 2.03 3.14 1.46 3.91 1.11.12-.86.44-1.46.8-1.79-2.67-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23.96-.27 1.98-.36 3-.36s2.04.09 3 .36c2.29-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.63-5.47 5.93.44.38.82 1.12.82 2.27 0 1.64-.01 2.96-.01 3.37 0 .21.14.46.56.38C13.72 14.53 16 11.52 16 8c0-4.42-3.58-8-8-8z"
      />
    </svg>
  ),
  repo: (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
      <path d="M2 2.25C2 1.01 3.01 0 4.25 0h8.5C13.99 0 15 1.01 15 2.25v11.5C15 14.99 13.99 16 12.75 16h-8.5C3.01 16 2 14.99 2 13.75V2.25ZM4.25 1.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75V2.25a.75.75 0 0 0-.75-.75h-8.5Z" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
      <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
    </svg>
  ),
};




const GithubOpenMenu = () => {
    const[isOpen,setIsOpen]=React.useState(false);
     const sidebarRef = useRef(null);
    
      // Close on outside click
      useEffect(() => {
        const handleClick = (e) => {
          if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
            setIsOpen(false);
          }
        };
        if (isOpen) document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
      }, [isOpen]);
    
      // Close on Escape
      useEffect(() => {
        const handleKey = (e) => {
          if (e.key === "Escape") setIsOpen(false);
        };
        if (isOpen) document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
      }, [isOpen]);
    
  return (
<>
 <button
            type="button"
            aria-label="Open Menu"
            aria-expanded={isOpen}
            onClick={() => setIsOpen(!isOpen)}
            className="btn-octicon m-2 p-2 border border-[#C8D1DA] rounded-[8px] cursor-pointer"
            size={36}
          >
            <svg
              aria-hidden="true"
              focusable="false"
              // class="octicon octicon-three-bars"
              viewBox="0 0 16 16"
              width="16"
              height="16"
              fill="currentColor"
              display="inline-block"
              overflow="visible"
              // style="vertical-align:text-bottom"
            >
              <path d="M1 2.75A.75.75 0 0 1 1.75 2h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 2.75Zm0 5A.75.75 0 0 1 1.75 7h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 7.75ZM1.75 12h12.5a.75.75 0 0 1 0 1.5H1.75a.75.75 0 0 1 0-1.5Z"></path>
            </svg>
          </button>
          {/* open Modall */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setIsOpen(false)}
        />
      )}

        <div
        ref={sidebarRef}
        className="fixed top-0 left-0 z-50 h-full overflow-y-auto"
        style={{
          width: "280px",
          backgroundColor: "#161b22",
          borderRight: "1px solid #30363d",
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: isOpen ? "4px 0 20px rgba(0,0,0,0.4)" : "none",
        }}
      >
        {/* Header: GitHub logo + Close button */}
        <div className="flex items-center justify-between px-3 py-3" style={{ borderBottom: "1px solid #30363d" }}>
          <div className="text-white">{Icons.github}</div>
          <button
            type="button"
            aria-label="Close Menu"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}
          >
            {Icons.close}
          </button>
        </div>

        {/* Profile Section */}
        <div className="px-4 py-4" style={{ borderBottom: "1px solid #30363d" }}>
          {/* Avatar */}
          <div className="flex items-center gap-3 mb-3">
            <div
              className="rounded-full overflow-hidden flex-shrink-0"
              style={{
                width: "40px",
                height: "40px",
                background: "linear-gradient(135deg, #c084fc, #e879f9, #a855f7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span className="text-white font-bold" style={{ fontSize: "16px" }}>A</span>
            </div>
            <div>
              <div className="text-white font-semibold" style={{ fontSize: "14px" }}>
                Amjad
              </div>
              <div className="text-gray-500" style={{ fontSize: "12px" }}>
                momanajad · he/him
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4" style={{ fontSize: "12px" }}>
            <span className="text-gray-400">
              <span className="text-white font-semibold">5</span> followers
            </span>
            <span className="text-gray-400">
              <span className="text-white font-semibold">3</span> following
            </span>
          </div>
        </div>

        {/* Main Nav */}
        <nav className="py-2" style={{ borderBottom: "1px solid #30363d" }}>
          {[
            { label: "Home", icon: "M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Z" },
            { label: "Issues" },
            { label: "Pull requests" },
            { label: "Repositories" },
            { label: "Projects" },
            { label: "Discussions" },
            { label: "Codespaces" },
            { label: "Copilot" },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-300 hover:text-white transition-colors"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                borderRadius: "6px",
                margin: "1px 8px",
                width: "calc(100% - 16px)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#21262d")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              {/* Bullet dot as icon substitute */}
              <span
                className="flex-shrink-0"
                style={{
                  width: "16px",
                  height: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: item.label === "Home" ? "#58a6ff" : "#484f58",
                  }}
                />
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Explore Section */}
        <nav className="py-2" style={{ borderBottom: "1px solid #30363d" }}>
          {exploreItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-300 hover:text-white transition-colors"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                borderRadius: "6px",
                margin: "1px 8px",
                width: "calc(100% - 16px)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#21262d")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: "#484f58",
                  flexShrink: 0,
                  marginLeft: "5px",
                }}
              />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Top Repositories */}
        <div className="py-3 px-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 font-semibold" style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Top repositories
            </span>
            <button
              type="button"
              className="text-gray-500 hover:text-gray-300 transition-colors"
              style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}
            >
              {Icons.search}
            </button>
          </div>

          <div className="flex flex-col gap-0.5">
            {repos.map((repo) => (
              <button
                key={repo}
                type="button"
                className="flex items-center gap-2 py-1.5 px-2 text-left text-blue-400 hover:text-blue-300 transition-colors"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  borderRadius: "6px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#21262d")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <span className="text-gray-600 flex-shrink-0">{Icons.repo}</span>
                <span className="truncate">{repo}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            className="mt-2 text-gray-500 hover:text-gray-300 transition-colors"
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", padding: "4px 0" }}
          >
            Show more
          </button>
        </div>
      </div>
</>  )
}

export default GithubOpenMenu