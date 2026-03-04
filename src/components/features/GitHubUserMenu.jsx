import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getStoredStatus } from "../../services/storageService";
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

export default function GitHubUserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const [status, setStatus] = useState({ emoji: '🎯', text: 'Focusing' });

  useEffect(() => {
    // Initial load
    const currentStatus = getStoredStatus();
    if (currentStatus && (currentStatus.emoji || currentStatus.text)) {
      setStatus({
        emoji: currentStatus.emoji || '🎯',
        text: currentStatus.text || 'Focusing'
      });
    }

    const handleStatusUpdate = (e) => {
      const newStatus = e.detail;
      setStatus({
        emoji: newStatus.emoji || '🎯',
        text: newStatus.text || 'Focusing'
      });
    };

    window.addEventListener('github_status_updated', handleStatusUpdate);
    return () => window.removeEventListener('github_status_updated', handleStatusUpdate);
  }, []);

  const toggleMenu = () => setIsOpen((v) => !v);

  const username = "momanamjad";

  return (
    <div className="relative cursor-pointer">
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="flex items-center gap-1 group"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm transition-opacity group-hover:opacity-80 cursor-pointer ">
          MA
        </div>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute top-full right-0 mt-2 w-[90vw] sm:w-80 md:w-[300px] bg-[#FFFFFF] border border-github-border rounded-xl shadow-2xl z-50 animate-slideDown overflow-hidden"
        >
          <div className="hidden sm:block absolute -top-2 right-3 w-4 h-4 bg-github-canvas border-l border-t border-github-border transform rotate-45" />

          <div className="flex items-center gap-3 p-4 border-b border-github-border">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-semibold text-base flex-shrink-0">MA</div>
            <div className="flex-1 min-w-0">
              <div className="text-github-text font-semibold text-[14px]">momanamjad</div>
              <div className="text-github-muted text-[14px] text-[#59636E] truncate">Moman Amjad</div>
            </div>
            <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" display="inline-block" overflow="visible"><path d="M5.22 14.78a.75.75 0 0 0 1.06-1.06L4.56 12h8.69a.75.75 0 0 0 0-1.5H4.56l1.72-1.72a.75.75 0 0 0-1.06-1.06l-3 3a.75.75 0 0 0 0 1.06l3 3Zm5.56-6.5a.75.75 0 1 1-1.06-1.06l1.72-1.72H2.75a.75.75 0 0 1 0-1.5h8.69L9.72 2.28a.75.75 0 0 1 1.06-1.06l3 3a.75.75 0 0 1 0 1.06l-3 3Z"></path></svg>
          </div>

          <div
            onClick={() => {
              window.dispatchEvent(new CustomEvent('github_open_status_modal'));
              setIsOpen(false);
            }}
            className="flex items-center gap-2 px-4 py-2.5 text-github-muted text-xs border-b border-github-border hover:bg-gray-50 group/status cursor-pointer transition-colors"
          >
            <span className="text-[14px]">{status.emoji}</span>
            <span className="text-[14px] text-github-text group-hover/status:text-blue-600 truncate">{status.text}</span>
          </div>

          <div className="py-2 border-b border-github-border">
            <MenuItem icon={<ProfileIcon />} text="Profile" path="/profile" />
            <MenuItem icon={<RepositoriesIcon />} text="Repositories" path="/momanamjad/repositories" />
            <MenuItem icon={<StarsIcon />} text="Stars" path={`/${username}/stars`} />
            <MenuItem icon={<GistsIcon />} text="Gists" path="gists" />
            <MenuItem icon={<OrganizationsIcon />} text="Organizations" path="orgainnzation" />
            <MenuItem icon={<EnterprisesIcon />} text="Enterprises" path="enterprises" />
            <MenuItem icon={<SponsorsIcon />} text="Sponsors" path="sponsors" />
          </div>

          <div className="py-2 border-b border-github-border">
            <MenuItem icon={<SettingsIcon />} text="Settings" />
            <MenuItem icon={<CopilotIcon />} text="Copilot settings" />
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
}

const MenuItem = React.forwardRef(({ icon, text, path, badge, badgeColor, onClick }, ref) => {
  const navigate = useNavigate();
  const handleClick = (e) => {
    if (onClick) return onClick(e);
    if (path) return navigate(path);
  };

  return (
    <button
      ref={ref}
      role="menuitem"
      onClick={handleClick}
      className="flex w-full items-center gap-3 p-3 text-left hover:bg-[#EFF2F5] rounded-md cursor-pointer text-[14px]"
    >
      <span className="w-5 h-5 text-[#59636E]">{icon}</span>
      <span className="flex-1 truncate">{text}</span>
      {badge && (
        <span className={`ml-2 text-xs font-semibold px-2 py-[2px] rounded-full ${badgeColor === 'green' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {badge}
        </span>
      )}
    </button>
  );
});
