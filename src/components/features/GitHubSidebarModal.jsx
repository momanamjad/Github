import { useState, useEffect, useRef } from "react";
import HamburgerIcon from "../../../public/customIcons/HamburgerIcon";
import CloseIcon from "../../../public/customIcons/CloseIcon";
import GithubLogoIcon from "../../../public/customIcons/GithubLogoIcon";
import ReposotoryIcon from "../../../public/customIcons/ReposotoryIcon";
import SearchIconSvg from "../../../public/customIcons/SearchIconSvg";
import { useScrollLock } from "../../hooks/useScrollLock";

// navItems defined for future use — prefixed with _ to suppress lint warning
const _navItems = [
  { icon: "M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1Zm0 1a6 6 0 1 0 0 12A6 6 0 0 0 8 2Z", label: "Home", path: "M" },
  {
    icon: "M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0Zm8 8a8 8 0 1 0-16 0 8 8 0 0 0 16 0Z",
    label: "Issues",
  },
  {
    icon: "M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0ZM11.5 6.5a1 1 0 1 0 2 0 1 1 0 0 0-2 0Z",
    label: "Pull requests",
  },
  {
    icon: "M2 2.75C2 1.79 2.79 1 3.75 1h8.5C13.21 1 14 1.79 14 2.75v10.5C14 14.21 13.21 15 12.25 15h-8.5C2.79 15 2 14.21 2 13.25V2.75ZM3.75 2.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25V2.75a.25.25 0 0 0-.25-.25h-8.5Z",
    label: "Repositories",
  },
  {
    icon: "M2 2.75C2 1.79 2.79 1 3.75 1h8.5C13.21 1 14 1.79 14 2.75v10.5C14 14.21 13.21 15 12.25 15h-8.5C2.79 15 2 14.21 2 13.25V2.75ZM3.75 2.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25V2.75a.25.25 0 0 0-.25-.25h-8.5Z",
    label: "Projects",
  },
  {
    icon: "M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Z",
    label: "Discussions",
  },
  {
    icon: "M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z",
    label: "Codespaces",
  },
  {
    icon: "M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1Z",
    label: "Copilot",
  },
];

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
  hamburger: <HamburgerIcon />,
  close: <CloseIcon />,
  github: <GithubLogoIcon />,
  repo: <ReposotoryIcon width="14" height="14" />,
  search: <SearchIconSvg />,
};

export default function GitHubSidebarModal() {
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef(null);

  useScrollLock(isOpen);


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
    <div className="min-h-screen" style={{ backgroundColor: "#0d1117", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Top bar with hamburger button */}
      <div
        className="flex items-center px-3 py-2"
        style={{ backgroundColor: "#161b22", borderBottom: "1px solid #30363d" }}
      >
        <button
          type="button"
          aria-label="Open Menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center text-gray-300 hover:text-white transition-colors"
          style={{
            width: "36px",
            height: "36px",
            border: "1px solid #30363d",
            borderRadius: "8px",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          {Icons.hamburger}
        </button>

        {/* GitHub logo */}
        <div className="ml-3 text-white">{Icons.github}</div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
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

      <div className="flex items-center justify-center h-[calc(100vh-44px)]">
        <p className="text-gray-600" style={{ fontSize: "14px" }}>
          ☰ Click the hamburger button above to open the sidebar
        </p>
      </div>
    </div>
  );
}
