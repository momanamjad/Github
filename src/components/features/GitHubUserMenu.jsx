import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useGitHub } from "@contexts/GitHubContext";
import { useClickOutside } from "@hooks/useGitHub_hooks";
import { useScrollLock } from "../../hooks/useScrollLock";


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
import SwitchIcon from '../../../public/customIcons/SwitchIcon';
const GitHubUserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { status, user, setIsStatusModalOpen } = useGitHub();

  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const toggleMenu = useCallback(() => setIsOpen(v => !v), []);
  const closeMenu = useCallback(() => setIsOpen(false), []);

  // Hooks
  useClickOutside([menuRef, buttonRef], closeMenu);
  useScrollLock(isOpen);



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
          className="fixed sm:absolute top-[64px] sm:top-full right-0 sm:right-0 sm:mt-2 w-full sm:w-80 md:w-[300px] max-h-[calc(100vh-64px)] sm:max-h-[85vh] overflow-y-auto bg-white border-t sm:border border-github-border sm:rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200"
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
            <MenuItem icon={<SignOutIcon />} text="Sign out" onClose={closeMenu} />
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
