import {
  CopilotIcon,
  PlusIcon,
  IssueOpenedIcon,
  GitPullRequestIcon,
  RepoIcon,
  TriangleDownIcon,
} from "@primer/octicons-react";
import CreateNewIssue from "./CreateNew";

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
      rounded-[9px]
      transition-colors
      cursor-pointer
      text-[14px]
    "
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-6 bg-[#d1d9e0] mx-2" />;

const TopBarActions = () => {
  return (
    <div className="hidden lg:flex items-center gap-2.5">
      <Divider />

      {/* <IconButton   label="Create new issue">
        <PlusIcon size={16} />  
        <TriangleDownIcon size={16} className=" " />
      </IconButton> */}
      <CreateNewIssue />
      <IconButton label="Issues">
        <IssueOpenedIcon size={16} />
      </IconButton>

      <IconButton label="Pull requests">
        <GitPullRequestIcon size={16} />
      </IconButton>

      <IconButton label="Repositories">
        <RepoIcon size={16} />
      </IconButton>
    </div>
  );
};

export default TopBarActions;
