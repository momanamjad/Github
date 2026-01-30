import {
  CopilotIcon,
  PlusIcon,
  IssueOpenedIcon,
  GitPullRequestIcon,
  RepoIcon,
  TriangleDownIcon,
} from "@primer/octicons-react";

const IconButton = ({ children, label }) => (
  <button
    aria-label={label}
    className="
      flex items-center justify-center
      w-8 h-8
      text-[#59636e]
      border
      border-[#C8D1DA]
      hover:bg-[#D1D9E0]
      rounded-[10px]
      transition-colors
      p-4
      cursor-pointer
      text-[14px]
    "
  >
    {children}
  </button>
);

const Divider = () => (
  <div className="w-px h-6 bg-[#d1d9e0] mx-2" />
);

const TopBarActions = () => {
  return (
    <div className="hidden lg:flex items-center gap-2.5">
     
 
      <Divider   />

      {/* Create New */}
      <IconButton label="Create new">
        <PlusIcon size={12} />
        <TriangleDownIcon size={12} className="ml-0.5" />
      </IconButton>

      {/* Issues */}
      <IconButton label="Issues">
        <IssueOpenedIcon size={12} />
      </IconButton>

      {/* Pull Requests */}
      <IconButton label="Pull requests">
        <GitPullRequestIcon size={12} />
      </IconButton>

      {/* Repositories */}
      <IconButton label="Repositories">
        <RepoIcon size={12} />
      </IconButton>
    </div>
  );
};

export default TopBarActions;
