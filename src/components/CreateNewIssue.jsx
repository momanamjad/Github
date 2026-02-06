import React from "react";
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
      rounded-[9px]
      transition-colors
      cursor-pointer
      text-[14px]
    "
  >
    {children}
  </button>
);

const CreateNewIssue = () => {
  const [open, setIsOpen] = React.useState(false);

  return (
    <>
      <div onClick={() => setIsOpen(!open)}>
        <IconButton label="Create new issue">
          <PlusIcon size={16} />
          <TriangleDownIcon size={16} className=" " />
        </IconButton>
      </div>
      {open && (
        <div className="absolute top-15 ml-7   bg-white border border-[#C8D1DA] rounded-md shadow-lg p-4 w-48"></div>
      )}
    </>
  );
};

export default CreateNewIssue;
const icons = {
  newIssue: (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
      <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"></path>
      <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"></path>{" "}
    </svg>
  ),
  NewRepo: (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
      <path d="M7.5 1.5a.75.75 0 0 1 .75.75v4h4a.75.75 0 0 1 0 1.5h-4v4a.75.75 0 0 1-1.5 0v-4h-4a.75.75 0 0 1 0-1.5h4v-4A.75.75 0 0 1 7.5 1.5Z"></path>
    </svg>
  ),
  ImportRepo: (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
      <path d="M8 1.5a6.5 6.5 0 1 1 0 13A6.5 6.5 0 0 1 8 1.5ZM4.47 7.47a.75.75 0 0 0-1.06-1.06l-2.25 2.25a.75.75 0 0 0 0 1.06l2.25 2.25a.75.75 0 1 0 1.06-1.06L3.81 9H11a3 3 0 0 0 .177-5.995L11-4H4a3 3 0 0 0-2.53 5.47l2.47 2.47Z"></path>
    </svg>
  ),
  newCodeSpace: (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
      <path d="M8 1.5a6.5 6.5 0 1 1 0 13A6.5 6.5 0 0 1 8 1.5ZM4.47 7.47a.75.75 0 0 0-1.06-1.06l-2.25 2.25a.75.75 0 0 0 0 1.06l2.25 2.25a.75.75 0 1 0 1.06-1.06L3.81 9H11a3 3 0 0 0 .177-5.995L11-4H4a3 3 0 0 0-2.53 5.47l2.47 2.47Z"></path>
    </svg>
  ),
  newGist: (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
      <path d="M8 1.5a6.5 6.5 0 1 1 0 13A6.5 6.5 0 0 1 8 1.5ZM4.47 7.47a.75.75 0 0 0-1.06-1.06l-2.25 2.25a.75.75 0 0 0 0 1.06l2.25 2.25a.75.75 0 1 0 1.06-1.06L3.81 9H11a3 3 0 0 0 .177-5.995L11-4H4a3 3 0 0 0-2.53 5.47l2.47 2.47Z"></path>
    </svg>
  ),
  NewOrganization: (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
      <path d="M8 1.5a6.5 6.5 0 1 1 0 13A6.5 6.5 0 0 1 8 1.5ZM4.47 7.47a.75.75 0 0 0-1.06-1.06l-2.25 2.25a.75.75 0 0 0 0 1.06l2.25 2.25a.75.75 0 1 0 1.06-1.06L3.81 9H11a3 3 0 0 0 .177-5.995L11-4H4a3 3 0 0 0-2.53 5.47l2.47 2.47Z"></path>
    </svg>
  ),
  newProject: (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
      <path d="M8 1.5a6.5 6.5 0 1 1 0 13A6.5 6.5 0 0 1 8 1.5ZM4.47 7.47a.75.75 0 0 0-1.06-1.06l-2.25 2.25a.75.75 0 0 0 0 1.06l2.25 2.25a.75.75 0 1 0 1.06-1.06L3.81 9H11a3 3 0 0 0 .177-5.995L11-4H4a3 3 0 0 0-2.53 5.47l2.47 2.47Z"></path>
    </svg>
  ),
};
