import React, { useState } from "react";

const PullRequests = () => {
  const [selectedTab, setSelectedTab] = useState("everything");
  const [searchQuery, setSearchQuery] = useState("is:open is:pr author:@me");

  const tabs = [
    { id: "Created", label: "Created", count: 12 },
    { id: "Assigned", label: "Assigned", count: 3 },
    { id: "Mentioned", label: "Mentioned", count: 1 },

    { id: "Review requests", label: "Review requests", count: 5 },
  ];

  const pullRequests = [
    {
      id: 1,
      title: "Add user authentication flow",
      repo: "frontend-app",
      number: 234,
      status: "open",
      author: "johndoe",
      comments: 8,
      updated: "2 hours ago",
      labels: ["enhancement", "auth"],
    },
    {
      id: 2,
      title: "Fix responsive layout issues on mobile",
      repo: "website",
      number: 567,
      status: "draft",
      author: "janedoe",
      comments: 3,
      updated: "5 hours ago",
      labels: ["bug", "mobile"],
    },
    {
      id: 3,
      title: "Update API documentation",
      repo: "docs",
      number: 890,
      status: "merged",
      author: "bobsmith",
      comments: 12,
      updated: "yesterday",
      labels: ["documentation"],
    },
    {
      id: 4,
      title: "Implement dark mode toggle",
      repo: "dashboard",
      number: 123,
      status: "closed",
      author: "alicew",
      comments: 6,
      updated: "3 days ago",
      labels: ["feature", "ui"],
    },
  ];

  const StatusIcon = ({ status }) => {
    switch (status) {
      case "open":
        return (
          <span className="w-4 h-4 text-green-600">
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13z M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0z" />
            </svg>
          </span>
        );
      case "draft":
        return (
          <span className="w-4 h-4 text-gray-500">
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13z M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0z" />
              <rect x="3" y="7.5" width="10" height="1" />
            </svg>
          </span>
        );
      case "merged":
        return (
          <span className="w-4 h-4 text-purple-600">
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M5.5 3.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM5.5 12.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
              <path d="M5.5 5v2.5M5.5 7.5v2" />
              <path d="M11.5 5v4.5a3 3 0 0 1-3 3h-3" />
            </svg>
          </span>
        );
      case "closed":
        return (
          <span className="w-4 h-4 text-red-600">
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13z M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0z" />
              <path d="m5.47 5.47 5.32 5.32" />
              <path d="m10.68 5.47-5.32 5.32" />
            </svg>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen   text-[#e6edf3] font-sans">
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4  mb-4">
          <div className="border  rounded-md  border-github-border ">
            <nav className="flex   overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`
                  py-2 px-4  font-semibold text-[14px] whitespace-nowrap
                  ${
                    selectedTab === tab.id
                      ? "bg-[#0969DA] text-[white] border border-github-border"
                      : "text-[black] hover:bg-[#F6F8FA] border border-github-border  "
                  }
                `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F6F8FA] text-[#59636e] border border-github-border rounded-md py-2 pl-8 pr-3 text-sm focus:outline-none focus:border-[#2f81f7] focus:ring-1 focus:ring-[#2f81f7]"
              placeholder="Search pull requests..."
            />
            <svg
              className="absolute left-2.5 top-2.5 h-4 w-4 text-[#848d97]"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z"></path>{" "}
            </svg>
          </div>
        </div>

        <div className="border border-github-border  rounded-lg overflow-hidden ">
          <div className="bg-[#F6F8FA] px-4 py-3 border-b border-github-border flex items-center gap-3 text-sm">
            <svg
              className="w-4 h-4 text-[black]"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z"></path>
            </svg>
            <span className="text-[black]">{pullRequests.length} Open</span>
            <div className="flex gap-3">
              <svg
                className="w-4 h-4 text-[black]"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path>{" "}
              </svg>
              <span className="text-[black]">
                {
                  pullRequests.filter(
                    (pr) => pr.status === "closed" || pr.status === "merged",
                  ).length
                }{" "}
                Closed
              </span>
            </div>
          </div>

          {pullRequests.map((pr) => (
            <div
              key={pr.id}
              className="px-4 py-3 border-b border-github-border last:border-0  flex items-start gap-3"
            >
              <div className="flex-shrink-0 mt-1">
                <StatusIcon status={pr.status} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex text-[#59636e] flex-wrap items-center gap-2">
                  <svg
                    viewBox="0 0 16 16"
                    version="1.1"
                    width="16"
                    height="16"
                    aria-hidden="true"
                  >
                    <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z"></path>
                  </svg>
                  <a
                    href="#"
                    className="font-semibold hover:text-[#2f81f7] text-base"
                  >
                    {pr.title}
                  </a>
                  <h2 className=" text-xl text-[black] font-semibold">
                    {" "}
                    change title
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#848d97] mt-1">
                  <span>#{pr.number}</span>
                  <span>by {pr.author}</span>
                  <span>updated {pr.updated}</span>
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M1.5 2.75v8.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-8.5c0-.69-.56-1.25-1.25-1.25H2.75c-.69 0-1.25.56-1.25 1.25zM14 2.75v8.5c0 .14-.11.25-.25.25H2.75c-.14 0-.25-.11-.25-.25v-8.5c0-.14.11-.25.25-.25h10.5c.14 0 .25.11.25.25z"></path>
                      <path d="M4.5 4.5h7v1h-7zM4.5 6.5h7v1h-7zM4.5 8.5h4v1h-4z"></path>
                    </svg>
                    {pr.comments}
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0 text-xs  hidden sm:block">
                <svg
                  aria-hidden="true"
                  height="16"
                  viewBox="0 0 16 16"
                  version="1.1"
                  width="16"
                  data-view-component="true"
                >
                  <path d="M1 2.75C1 1.784 1.784 1 2.75 1h10.5c.966 0 1.75.784 1.75 1.75v7.5A1.75 1.75 0 0 1 13.25 12H9.06l-2.573 2.573A1.458 1.458 0 0 1 4 13.543V12H2.75A1.75 1.75 0 0 1 1 10.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h4.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path>
                </svg>
              </div>
            </div>
          ))}
        </div>

      </main>
      <div>
         <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center   gap-10 text-xs text-[#57606a]">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 fill-[#57606a]" viewBox="0 0 16 16">
                <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
              </svg>
              <span>© 2026 GitHub, Inc.</span>
            </div>
            <div className="flex flex-wrap justify-between gap-10">
              <a href="#" className="hover:text-[#0969da] hover:underline">
                Terms
              </a>
              <a href="#" className="hover:text-[#0969da] hover:underline">
                Privacy
              </a>
              <a href="#" className="hover:text-[#0969da] hover:underline">
                Security
              </a>
              <a href="#" className="hover:text-[#0969da] hover:underline">
                Status
              </a>
              <a href="#" className="hover:text-[#0969da] hover:underline">
                Community
              </a>
              <a href="#" className="hover:text-[#0969da] hover:underline">
                Docs
              </a>
              <a href="#" className="hover:text-[#0969da] hover:underline">
                Contact
              </a>
              <a href="#" className="hover:text-[#0969da] hover:underline">
                Manage cookies
              </a>
              <a href="#" className="hover:text-[#0969da] hover:underline">
                Do not share my personal information
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PullRequests;
