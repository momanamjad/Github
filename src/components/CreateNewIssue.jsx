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
  const [openIssueModal, setOpenIssueModal] = React.useState(false);
  const createNewIssueRef = React.useRef(null);
  const buttonRef = React.useRef(null);
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !(
          createNewIssueRef.current?.contains(event.target) ||
          buttonRef.current?.contains(event.target)
        )
      ) {
        setIsOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const toggleMenu = () => {
    setIsOpen(!open);
  };

  return (
    <>
      <div
        className="create-new-issue"
        ref={createNewIssueRef}
        onClick={() => setIsOpen(!open)}
      >
        <IconButton
          label="Create new issue"
          onClick={toggleMenu}
          ref={buttonRef}
        >
          <PlusIcon size={16} />
          <TriangleDownIcon size={16} className=" " />
        </IconButton>
      </div>
      {open && (
        <div className="absolute top-15 ml-7   bg-white border border-[#C8D1DA] rounded-md shadow-lg p-4 w-48">
          <div className="py-2 border-b border-github-border">
            <Items
              icon={icons.newIssue}
              label="New issue"
              onClick={() => setOpenIssueModal(true)}
            />
            <Items icon={icons.NewRepo} label="New repository" />
            <Items icon={icons.ImportRepo} label="Import repository" />
          </div>
          <div className="py-2 border-b border-github-border">
            <Items icon={icons.newCodeSpace} label="New codespace" />
            <Items icon={icons.newGist} label="New gist" />
          </div>
          <div className="py-2">
            <Items icon={icons.NewOrganization} label="New organization" />
            <Items icon={icons.newProject} label="New project" />
          </div>
        </div>
      )}
    </>
  );
};

export default CreateNewIssue;
function Items({ icon, label }) {
  return (
    <div className="flex items-center gap-2 p-2 hover:bg-[#EFF2F5] rounded-md cursor-pointer">
      <div className="w-4 h-4 text-[#59636E]">{icon}</div>
      <span className="text-[14px] text-github-text">{label}</span>
    </div>
  );
}
const icons = {
  newIssue: (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
      <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"></path>
      <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"></path>{" "}
    </svg>
  ),
  NewRepo: (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
      <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path>{" "}
    </svg>
  ),
  ImportRepo: (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
      <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0V1.5h-8a1 1 0 0 0-1 1v6.708A2.493 2.493 0 0 1 4.5 9h2.25a.75.75 0 0 1 0 1.5H4.5a1 1 0 0 0 0 2h4.75a.75.75 0 0 1 0 1.5H4.5A2.5 2.5 0 0 1 2 11.5Zm12.23 7.79h-.001l-1.224-1.224v6.184a.75.75 0 0 1-1.5 0V9.066L10.28 10.29a.75.75 0 0 1-1.06-1.061l2.505-2.504a.75.75 0 0 1 1.06 0L15.29 9.23a.751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018Z"></path>{" "}
    </svg>
  ),
  newCodeSpace: (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
      <path d="M0 11.25c0-.966.784-1.75 1.75-1.75h12.5c.966 0 1.75.784 1.75 1.75v3A1.75 1.75 0 0 1 14.25 16H1.75A1.75 1.75 0 0 1 0 14.25Zm2-9.5C2 .784 2.784 0 3.75 0h8.5C13.216 0 14 .784 14 1.75v5a1.75 1.75 0 0 1-1.75 1.75h-8.5A1.75 1.75 0 0 1 2 6.75Zm1.75-.25a.25.25 0 0 0-.25.25v5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-5a.25.25 0 0 0-.25-.25Zm-2 9.5a.25.25 0 0 0-.25.25v3c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25v-3a.25.25 0 0 0-.25-.25Z"></path>
      <path d="M7 12.75a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Zm-4 0a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1-.75-.75Z"></path>{" "}
    </svg>
  ),
  newGist: (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
      <path d="m11.28 3.22 4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734L13.94 8l-3.72-3.72a.749.749 0 0 1 .326-1.275.749.749 0 0 1 .734.215Zm-6.56 0a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L2.06 8l3.72 3.72a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L.47 8.53a.75.75 0 0 1 0-1.06Z"></path>{" "}
    </svg>
  ),
  NewOrganization: (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
      <path d="M1.75 16A1.75 1.75 0 0 1 0 14.25V1.75C0 .784.784 0 1.75 0h8.5C11.216 0 12 .784 12 1.75v12.5c0 .085-.006.168-.018.25h2.268a.25.25 0 0 0 .25-.25V8.285a.25.25 0 0 0-.111-.208l-1.055-.703a.749.749 0 1 1 .832-1.248l1.055.703c.487.325.779.871.779 1.456v5.965A1.75 1.75 0 0 1 14.25 16h-3.5a.766.766 0 0 1-.197-.026c-.099.017-.2.026-.303.026h-3a.75.75 0 0 1-.75-.75V14h-1v1.25a.75.75 0 0 1-.75.75Zm-.25-1.75c0 .138.112.25.25.25H4v-1.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 .75.75v1.25h2.25a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25h-8.5a.25.25 0 0 0-.25.25ZM3.75 6h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5ZM3 3.75A.75.75 0 0 1 3.75 3h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 3 3.75Zm4 3A.75.75 0 0 1 7.75 6h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 7 6.75ZM7.75 3h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5ZM3 9.75A.75.75 0 0 1 3.75 9h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 3 9.75ZM7.75 9h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5Z"></path>{" "}
    </svg>
  ),
  newProject: (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
      <path d="M1.75 0h12.5C15.216 0 16 .784 16 1.75v12.5A1.75 1.75 0 0 1 14.25 16H1.75A1.75 1.75 0 0 1 0 14.25V1.75C0 .784.784 0 1.75 0ZM1.5 1.75v12.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25H1.75a.25.25 0 0 0-.25.25ZM11.75 3a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-1.5 0v-7.5a.75.75 0 0 1 .75-.75Zm-8.25.75a.75.75 0 0 1 1.5 0v5.5a.75.75 0 0 1-1.5 0ZM8 3a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 3Z"></path>{" "}
    </svg>
  ),
};
