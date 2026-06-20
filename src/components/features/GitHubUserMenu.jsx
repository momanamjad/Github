import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useGitHub } from "@contexts/GitHubContext";
import { useClickOutside } from "@hooks/useGitHub_hooks";
import { useScrollLock } from "../../hooks/useScrollLock";
import { registerUser } from "../../services/GithubApi";

// Icons
import ProfileIcon from '../../../public/customIcons/ProfileIcon';
import RepositoriesIcon from '../../../public/customIcons/RepositoriesIcon';
import StarsIcon from '../../../public/customIcons/StarsIcon';
import GistsIcon from '../../../public/customIcons/GistsIcon';
import OrganizationsIcon from '../../../public/customIcons/OrganizationsIcon';
import EnterprisesIcon from '../../../public/customIcons/EnterprisesIcon';
import SponsorsIcon from '../../../public/customIcons/SponsorsIcon';
import SettingsIcon from '../../../public/customIcons/SettingsIcon';
import CopilotIcon from '../../../public/customIcons/CopilotIcon';
import FeatureIcon from '../../../public/customIcons/FeatureIcon';
import AppearanceIcon from '../../../public/customIcons/AppearanceIcon';
import AccessibilityIcon from '../../../public/customIcons/AccessibilityIcon';
import EnterpriseIcon from '../../../public/customIcons/EnterpriseIcon';
import SignOutIcon from '../../../public/customIcons/SignOutIcon';
import SwitchIcon from '../../../public/customIcons/SwitchIcon';

const GitHubUserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState("login"); // "login" | "register"
  
  // Auth Form Fields
  const [loginUsername, setLoginUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const { status, user, setIsStatusModalOpen, login, logout } = useGitHub();

  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const toggleMenu = useCallback(() => setIsOpen(v => !v), []);
  const closeMenu = useCallback(() => setIsOpen(false), []);

  useClickOutside([menuRef, buttonRef], closeMenu);
  useScrollLock(isOpen || isAuthModalOpen);

  const handleStatusClick = () => {
    setIsStatusModalOpen(true);
    closeMenu();
  };

  const handleLogout = () => {
    logout();
    closeMenu();
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      if (authTab === "login") {
        await login(email, password);
      } else {
        await registerUser(loginUsername, email, password);
      }
      setIsAuthModalOpen(false);
      // Clean form fields
      setLoginUsername("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setErrorMsg(err.message || "Authentication failed. Please check details.");
    } finally {
      setLoading(false);
    }
  };

  const username = user?.login || "";
  const name = user?.name || user?.login || "";

  // If not logged in, render a stylish "Sign in" button
  if (!user) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="px-3 py-1.5 text-xs font-semibold text-[#1f2328] bg-[#f6f8fa] border border-[#d0d7de] rounded-md hover:bg-[#f3f4f6] active:bg-[#ebecf0] transition-colors cursor-pointer"
        >
          Sign in
        </button>

        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-[400px] bg-white rounded-xl shadow-2xl border border-github-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex border-b border-github-border">
                <button
                  type="button"
                  onClick={() => { setAuthTab("login"); setErrorMsg(""); }}
                  className={`flex-1 py-3 text-sm font-semibold transition-colors cursor-pointer ${
                    authTab === "login"
                      ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                      : "text-github-muted bg-[#f6f8fa] hover:text-github-text"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthTab("register"); setErrorMsg(""); }}
                  className={`flex-1 py-3 text-sm font-semibold transition-colors cursor-pointer ${
                    authTab === "register"
                      ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                      : "text-github-muted bg-[#f6f8fa] hover:text-github-text"
                  }`}
                >
                  Register
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="p-6 space-y-4">
                <h3 className="text-github-text font-bold text-lg text-center">
                  {authTab === "login" ? "Sign in to GitHub" : "Create your account"}
                </h3>

                {errorMsg && (
                  <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md">
                    {errorMsg}
                  </div>
                )}

                {authTab === "register" && (
                  <div>
                    <label className="block text-xs font-semibold text-github-text mb-1">Username</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. janesmith"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      className="w-full px-3 py-2 border border-github-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-github-text mb-1">Email address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-github-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-github-text mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-github-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(false)}
                    className="flex-1 py-2 text-sm font-semibold border border-github-border text-github-text rounded-md hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2 text-sm font-semibold bg-[#2da44e] text-white rounded-md hover:bg-[#2c974b] active:bg-[#298e46] transition-colors cursor-pointer flex items-center justify-center"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : authTab === "login" ? (
                      "Sign In"
                    ) : (
                      "Register"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="flex items-center gap-1 group focus:outline-none"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden border border-[#d0d7de] dark:border-[#30363d] flex items-center justify-center bg-gray-100 flex-shrink-0 transition-opacity group-hover:opacity-80 cursor-pointer">
          <img
            src={user.avatar_url || "/profile.webp"}
            alt={username}
            className="w-full h-full object-cover"
          />
        </div>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="fixed sm:absolute top-[64px] sm:top-full right-0 sm:right-0 sm:mt-2 w-full sm:w-80 md:w-[300px] max-h-[calc(100vh-64px)] sm:max-h-[85vh] overflow-y-auto bg-white border-t sm:border border-github-border sm:rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Popover Arrow */}
          <div className="hidden sm:block absolute -top-2 right-3 w-4 h-4 bg-white border-l border-t border-github-border transform rotate-45" />

          {/* User Profile Header */}
          <div className="flex items-center gap-3 p-4 border-b border-github-border bg-white relative">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#d0d7de] dark:border-[#30363d] flex items-center justify-center bg-gray-100 flex-shrink-0">
              <img
                src={user.avatar_url || "/profile.webp"}
                alt={username}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-github-text font-semibold text-[14px]">{username}</div>
              <div className="text-github-muted text-[14px] truncate">{name}</div>
            </div>
            <SwitchIcon className="w-4 h-4 text-github-muted" />
          </div>

          {/* Status Section */}
          <button
            onClick={handleStatusClick}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-github-muted text-xs border-b border-github-border hover:bg-gray-50 group/status transition-colors text-left"
          >
            <span className="text-[14px]">{status.emoji || '🎯'}</span>
            <span className="text-[14px] text-github-text group-hover/status:text-blue-600 truncate">
              {status.text || 'Set status'}
            </span>
          </button>

          {/* Menu Items */}
          <div className="py-2 border-b border-github-border overflow-y-auto max-h-60 sm:max-h-none">
            <MenuItem icon={<ProfileIcon />} text="Profile" path={`/${username}`} onClose={closeMenu} />
            <MenuItem icon={<RepositoriesIcon />} text="Repositories" path={`/${username}/repositories`} onClose={closeMenu} />
            <MenuItem icon={<StarsIcon />} text="Stars" path={`/${username}/stars`} onClose={closeMenu} />
            <MenuItem icon={<GistsIcon />} text="Gists" path="/gists" onClose={closeMenu} />
            <MenuItem icon={<OrganizationsIcon />} text="Organizations" path="/organizations" onClose={closeMenu} />
            <MenuItem icon={<EnterprisesIcon />} text="Enterprises" path="/enterprises" onClose={closeMenu} />
            <MenuItem icon={<SponsorsIcon />} text="Sponsors" path="/sponsors" onClose={closeMenu} />
          </div>

          <div className="py-2 border-b border-github-border">
            <MenuItem icon={<SettingsIcon />} text="Settings" path="/settings" onClose={closeMenu} />
            <MenuItem icon={<CopilotIcon />} text="Copilot settings" path="/settings/copilot" onClose={closeMenu} />
            <MenuItem icon={<FeatureIcon />} text="Feature preview" badge="New" onClose={closeMenu} />
            <MenuItem icon={<AppearanceIcon />} text="Appearance" onClose={closeMenu} />
            <MenuItem icon={<AccessibilityIcon />} text="Accessibility" onClose={closeMenu} />
            <MenuItem icon={<EnterpriseIcon />} text="Try Enterprise" badge="Free" badgeColor="green" onClose={closeMenu} />
          </div>

          <div className="py-2">
            <MenuItem icon={<SignOutIcon />} text="Sign out" onClick={handleLogout} onClose={closeMenu} />
          </div>
        </div>
      )}
    </div>
  );
};

const MenuItem = ({ icon, text, path, badge, badgeColor, onClick, onClose }) => {
  const navigate = useNavigate();
  const handleClick = (e) => {
    if (onClick) onClick(e);
    if (path) navigate(path);
    if (onClose) onClose();
  };

  return (
    <button
      role="menuitem"
      onClick={handleClick}
      className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-[#F6F8FA] cursor-pointer text-[14px] text-github-text"
    >
      <span className="w-4.5 h-4.5 text-github-muted">{icon}</span>
      <span className="flex-1 truncate">{text}</span>
      {badge && (
        <span className={`ml-2 text-xs font-semibold px-2 py-[2px] rounded-full ${badgeColor === 'green' ? 'bg-[#dafbe1] text-[#1a7f37]' : 'bg-[#eff1f3] text-[#57606a]'
          }`}>
          {badge}
        </span>
      )}
    </button>
  );
};

export default React.memo(GitHubUserMenu);
