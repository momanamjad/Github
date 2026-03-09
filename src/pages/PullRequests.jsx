import React, { useState } from "react";
import { Search, Check } from 'lucide-react';
import StatusOpenIcon from "../components/ui/icons/StatusOpenIcon";
import StatusDraftIcon from "../components/ui/icons/StatusDraftIcon";
import StatusMergedIcon from "../components/ui/icons/StatusMergedIcon";
import StatusClosedIcon from "../components/ui/icons/StatusClosedIcon";
import PullRequestSidebarIcon from "../components/ui/icons/PullRequestSidebarIcon";
import CommentsIcon from "../components/ui/icons/CommentsIcon";
import GithubLogoVariantIcon from "../components/ui/icons/GithubLogoVariantIcon";

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
            <StatusOpenIcon className="w-4 h-4" />
          </span>
        );
      case "draft":
        return (
          <span className="w-4 h-4 text-gray-500">
            <StatusDraftIcon className="w-4 h-4" />
          </span>
        );
      case "merged":
        return (
          <span className="w-4 h-4 text-purple-600">
            <StatusMergedIcon className="w-4 h-4" />
          </span>
        );
      case "closed":
        return (
          <span className="w-4 h-4 text-red-600">
            <StatusClosedIcon className="w-4 h-4" />
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
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#848d97]" />
          </div>
        </div>

        <div className="border border-github-border  rounded-lg overflow-hidden ">
          <div className="bg-[#F6F8FA] px-4 py-3 border-b border-github-border flex items-center gap-3 text-sm">
            <StatusOpenIcon className="w-4 h-4 text-[black]" />
            <span className="text-[black]">{pullRequests.length} Open</span>
            <div className="flex gap-3">
              <Check className="w-4 h-4 text-[black]" />
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
                  <PullRequestSidebarIcon className="w-4 h-4 text-[#59636e]" />
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
                    <CommentsIcon className="w-4 h-4" />
                    {pr.comments}
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0 text-xs  hidden sm:block">
                <PullRequestSidebarIcon className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>

      </main>
      <div>
         <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center   gap-10 text-xs text-[#57606a]">
            <div className="flex items-center gap-2">
              <GithubLogoVariantIcon className="w-6 h-6 fill-[#57606a]" />
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
