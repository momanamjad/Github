import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useGitHub } from "@contexts/GitHubContext";
import { useClickOutside } from "@hooks/useGitHub_hooks";

// Icons (assuming paths are correct relative to components/features)
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

const GitHubUserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { status, user, setIsStatusModalOpen } = useGitHub();
  const navigate = useNavigate();

  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const toggleMenu = useCallback(() => setIsOpen(v => !v), []);
  const closeMenu = useCallback(() => setIsOpen(false), []);

  // Hooks
  useClickOutside([menuRef, buttonRef], closeMenu);

  const handleStatusClick = () => {
    setIsStatusModalOpen(true);
    closeMenu();
  };

  const username = user?.login || "momanamjad";
  const name = user?.name || "Moman Amjad";

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="flex items-center gap-1 group focus:outline-none"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm transition-opacity group-hover:opacity-80 cursor-pointer">
          {username.substring(0, 2).toUpperCase()}
        </div>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute top-full right-0 mt-2 w-[90vw] sm:w-80 md:w-[300px] bg-white border border-github-border rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden"
        >
          {/* Popover Arrow */}
          <div className="hidden sm:block absolute -top-2 right-3 w-4 h-4 bg-white border-l border-t border-github-border transform rotate-45" />

          {/* User Profile Header */}
          <div className="flex items-center gap-3 p-4 border-b border-github-border bg-white relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-semibold text-base flex-shrink-0">
              {username.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-github-text font-semibold text-[14px]">{username}</div>
              <div className="text-github-muted text-[14px] truncate">{name}</div>
            </div>
            <svg className="w-4 h-4 text-github-muted" fill="currentColor" viewBox="0 0 16 16">
              <path d="M5.22 14.78a.75.75 0 0 0 1.06-1.06L4.56 12h8.69a.75.75 0 0 0 0-1.5H4.56l1.72-1.72a.75.75 0 0 0-1.06-1.06l-3 3a.75.75 0 0 0 0 1.06l3 3Zm5.56-6.5a.75.75 0 1 1-1.06-1.06l1.72-1.72H2.75a.75.75 0 0 1 0-1.5h8.69L9.72 2.28a.75.75 0 0 1 1.06-1.06l3 3a.75.75 0 0 1 0 1.06l-3 3Z" />
            </svg>
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
            <MenuItem icon={<ProfileIcon />} text="Profile" path={`/${username}`} />
            <MenuItem icon={<RepositoriesIcon />} text="Repositories" path={`/${username}/repositories`} />
            <MenuItem icon={<StarsIcon />} text="Stars" path={`/${username}/stars`} />
            <MenuItem icon={<GistsIcon />} text="Gists" path="/gists" />
            <MenuItem icon={<OrganizationsIcon />} text="Organizations" path="/organizations" />
            <MenuItem icon={<EnterprisesIcon />} text="Enterprises" path="/enterprises" />
            <MenuItem icon={<SponsorsIcon />} text="Sponsors" path="/sponsors" />
          </div>

          <div className="py-2 border-b border-github-border">
            <MenuItem icon={<SettingsIcon />} text="Settings" path="/settings" />
            <MenuItem icon={<CopilotIcon />} text="Copilot settings" path="/settings/copilot" />
            <MenuItem icon={<FeatureIcon />} text="Feature preview" badge="New" />
            <MenuItem icon={<AppearanceIcon />} text="Appearance" />
            <MenuItem icon={<AccessibilityIcon />} text="Accessibility" />
            <MenuItem icon={<EnterpriseIcon />} text="Try Enterprise" badge="Free" badgeColor="green" />
          </div>

          <div className="py-2">
            <MenuItem icon={<SignOutIcon />} text="Sign out" />
          </div>
        </div>
      )}
    </div>
  );
};

const MenuItem = ({ icon, text, path, badge, badgeColor, onClick }) => {
  const navigate = useNavigate();
  const handleClick = (e) => {
    if (onClick) return onClick(e);
    if (path) return navigate(path);
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
