import {
  IssueOpenedIcon,
  GitPullRequestIcon,
  InboxIcon,
} from "@primer/octicons-react";
import CreateNewIssue from "@features/CreateNew";
import { useNavigate } from "react-router-dom";

const IconButton = ({ children, label, onClick }) => (
  <button
    onClick={onClick}
    aria-label={label}
    className="
      flex items-center justify-center
      w-8 h-8
      text-[#57606a]
      dark:text-[#8b949e]
      border
      border-[#d0d7de]
      dark:border-[#30363d]
      hover:bg-[#eaeef2]
      dark:hover:bg-[#30363d]
      bg-transparent
      rounded-[9px]
      transition-colors
      cursor-pointer
      text-[14px]
    "
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-6 bg-[#d0d7de] dark:bg-[#30363d] mx-1 lg:mx-2" />;

const TopBarActions = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-1 lg:gap-2.5">
      {/* Divider — only on lg+ */}
      <div className="hidden lg:block">
        <Divider />
      </div>

      {/* Create New — always visible */}
      <CreateNewIssue />

      {/* These action icons hide below lg breakpoint (same as real GitHub) */}
      <div className="hidden lg:flex items-center gap-2.5">
        <IconButton label="Issues" onClick={() => navigate("/issues")}>
          <IssueOpenedIcon size={16} />
        </IconButton>
        <IconButton label="Pull requests" onClick={() => navigate("/pull-requests")}>
          <GitPullRequestIcon size={16} />
        </IconButton>
      </div>
    </div>
  );
};

export default TopBarActions;
