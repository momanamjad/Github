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
        <div className="absolute top-15 ml-7   bg-white border border-[#C8D1DA] rounded-md shadow-lg p-4 w-48">
          <ul
            // class="prc-ActionList-ActionList-rPFF2"
            role="menu"
            aria-labelledby="global-create-menu-tooltip-_R_1jpb_"
            data-dividers="false"
            data-variant="inset"
          >
            <li
              tabindex="0"
              aria-labelledby="_r_1o_--label  "
              role="menuitem"
              id="_r_1o_"
              data-has-description="false"
              class="prc-ActionList-ActionListItem-So4vC"
              aria-keyshortcuts="n"
            >
              <div
                data-size="medium"
              >
                <span>
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    viewBox="0 0 16 16"
                    width="16"
                    height="16"
                    fill="currentColor"
                    display="inline-block"
                    overflow="visible"
                  >
                    <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"></path>
                    <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"></path>
                  </svg>
                </span>
                <span data-component="ActionList.Item--DividerContainer">
                  <span id="_r_1o_--label">New issue</span>
                </span>
              </div>
            </li>
            <li role="none" data-has-description="false">
              <a
                tabindex="-1"
                aria-labelledby="_r_1p_--label  "
                role="menuitem"
                id="_r_1p_"
                data-size="medium"
                href="/new"
                aria-keyshortcuts="n"
              >
                <span>
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    viewBox="0 0 16 16"
                    width="16"
                    height="16"
                    fill="currentColor"
                    display="inline-block"
                    overflow="visible"
                  >
                    <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path>
                  </svg>
                </span>
                <span data-component="ActionList.Item--DividerContainer">
                  <span id="_r_1p_--label">New repository</span>
                </span>
              </a>
            </li>
            <li role="none" data-has-description="false">
              <a
                tabindex="-1"
                aria-labelledby="_r_1q_--label  "
                role="menuitem"
                id="_r_1q_"
                data-size="medium"
                href="/new/import"
                aria-keyshortcuts="i"
              >
                <span>
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    viewBox="0 0 16 16"
                    width="16"
                    height="16"
                    fill="currentColor"
                    display="inline-block"
                    overflow="visible"
                  >
                    <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0V1.5h-8a1 1 0 0 0-1 1v6.708A2.493 2.493 0 0 1 4.5 9h2.25a.75.75 0 0 1 0 1.5H4.5a1 1 0 0 0 0 2h4.75a.75.75 0 0 1 0 1.5H4.5A2.5 2.5 0 0 1 2 11.5Zm12.23 7.79h-.001l-1.224-1.224v6.184a.75.75 0 0 1-1.5 0V9.066L10.28 10.29a.75.75 0 0 1-1.06-1.061l2.505-2.504a.75.75 0 0 1 1.06 0L15.29 9.23a.751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018Z"></path>
                  </svg>
                </span>
                <span data-component="ActionList.Item--DividerContainer">
                  <span id="_r_1q_--label">Import repository</span>
                </span>
              </a>
            </li>
            <li aria-hidden="true" data-component="ActionList.Divider"></li>
            <li role="none" data-has-description="false">
              <a
                tabindex="-1"
                aria-labelledby="_r_1r_--label  "
                role="menuitem"
                id="_r_1r_"
                data-size="medium"
                href="/codespaces/new"
                aria-keyshortcuts="n"
              >
                <span>
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    viewBox="0 0 16 16"
                    width="16"
                    height="16"
                    fill="currentColor"
                    display="inline-block"
                    overflow="visible"
                  >
                    <path d="M0 11.25c0-.966.784-1.75 1.75-1.75h12.5c.966 0 1.75.784 1.75 1.75v3A1.75 1.75 0 0 1 14.25 16H1.75A1.75 1.75 0 0 1 0 14.25Zm2-9.5C2 .784 2.784 0 3.75 0h8.5C13.216 0 14 .784 14 1.75v5a1.75 1.75 0 0 1-1.75 1.75h-8.5A1.75 1.75 0 0 1 2 6.75Zm1.75-.25a.25.25 0 0 0-.25.25v5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-5a.25.25 0 0 0-.25-.25Zm-2 9.5a.25.25 0 0 0-.25.25v3c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25v-3a.25.25 0 0 0-.25-.25Z"></path>
                    <path d="M7 12.75a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Zm-4 0a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1-.75-.75Z"></path>
                  </svg>
                </span>
                <span data-component="ActionList.Item--DividerContainer">
                  <span id="_r_1r_--label">New codespace</span>
                </span>
              </a>
            </li>
            <li role="none" data-has-description="false">
              <a
                tabindex="-1"
                aria-labelledby="_r_1s_--label  "
                role="menuitem"
                id="_r_1s_"
                data-size="medium"
                href="/gist"
                aria-keyshortcuts="n"
              >
                <span>
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    viewBox="0 0 16 16"
                    width="16"
                    height="16"
                    fill="currentColor"
                    display="inline-block"
                    overflow="visible"
                  >
                    <path d="m11.28 3.22 4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734L13.94 8l-3.72-3.72a.749.749 0 0 1 .326-1.275.749.749 0 0 1 .734.215Zm-6.56 0a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L2.06 8l3.72 3.72a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L.47 8.53a.75.75 0 0 1 0-1.06Z"></path>
                  </svg>
                </span>
                <span data-component="ActionList.Item--DividerContainer">
                  <span id="_r_1s_--label">New gist</span>
                </span>
              </a>
            </li>
            <li aria-hidden="true" data-component="ActionList.Divider"></li>
            <li role="none" data-has-description="false">
              <a
                tabindex="-1"
                aria-labelledby="_r_1t_--label  "
                role="menuitem"
                id="_r_1t_"
                data-size="medium"
                href="/account/organizations/new"
                aria-keyshortcuts="n"
              >
                <span>
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    viewBox="0 0 16 16"
                    width="16"
                    height="16"
                    fill="currentColor"
                    display="inline-block"
                    overflow="visible"
                  >
                    <path d="M1.75 16A1.75 1.75 0 0 1 0 14.25V1.75C0 .784.784 0 1.75 0h8.5C11.216 0 12 .784 12 1.75v12.5c0 .085-.006.168-.018.25h2.268a.25.25 0 0 0 .25-.25V8.285a.25.25 0 0 0-.111-.208l-1.055-.703a.749.749 0 1 1 .832-1.248l1.055.703c.487.325.779.871.779 1.456v5.965A1.75 1.75 0 0 1 14.25 16h-3.5a.766.766 0 0 1-.197-.026c-.099.017-.2.026-.303.026h-3a.75.75 0 0 1-.75-.75V14h-1v1.25a.75.75 0 0 1-.75.75Zm-.25-1.75c0 .138.112.25.25.25H4v-1.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 .75.75v1.25h2.25a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25h-8.5a.25.25 0 0 0-.25.25ZM3.75 6h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5ZM3 3.75A.75.75 0 0 1 3.75 3h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 3 3.75Zm4 3A.75.75 0 0 1 7.75 6h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 7 6.75ZM7.75 3h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5ZM3 9.75A.75.75 0 0 1 3.75 9h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 3 9.75ZM7.75 9h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5Z"></path>
                  </svg>
                </span>
                <span data-component="ActionList.Item--DividerContainer">
                  <span id="_r_1t_--label">New organization</span>
                </span>
              </a>
            </li>
            <li role="none" data-has-description="false">
              <a
                tabindex="-1"
                aria-labelledby="_r_1u_--label  "
                role="menuitem"
                id="_r_1u_"
                data-size="medium"
                href="/momanamjad?tab=projects"
                aria-keyshortcuts="n"
              >
                <span>
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    viewBox="0 0 16 16"
                    width="16"
                    height="16"
                    fill="currentColor"
                    display="inline-block"
                    overflow="visible"
                  >
                    <path d="M1.75 0h12.5C15.216 0 16 .784 16 1.75v12.5A1.75 1.75 0 0 1 14.25 16H1.75A1.75 1.75 0 0 1 0 14.25V1.75C0 .784.784 0 1.75 0ZM1.5 1.75v12.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25H1.75a.25.25 0 0 0-.25.25ZM11.75 3a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-1.5 0v-7.5a.75.75 0 0 1 .75-.75Zm-8.25.75a.75.75 0 0 1 1.5 0v5.5a.75.75 0 0 1-1.5 0ZM8 3a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 3Z"></path>
                  </svg>
                </span>
                <span data-component="ActionList.Item--DividerContainer">
                  <span id="_r_1u_--label">New project</span>
                </span>
              </a>
            </li>
          </ul>
        </div>
      )}
    </>
  );
};

export default CreateNewIssue;
