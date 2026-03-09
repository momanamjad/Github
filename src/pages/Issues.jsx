import React, { useState } from "react";
import { Plus, Search, ChevronDown } from "lucide-react";
import FilterModal from "../components/FilterModal";
import { StarsIcon } from "../components/ui/Icons";
import TabUserIcon from "../components/ui/icons/TabUserIcon";
import TabCircleIcon from "../components/ui/icons/TabCircleIcon";
import TabAtIcon from "../components/ui/icons/TabAtIcon";
import TabClockIcon from "../components/ui/icons/TabClockIcon";
import ViewUntitledIcon from "../components/ui/icons/ViewUntitledIcon";
import IssuesVariantIcon from "../components/ui/icons/IssuesVariantIcon";
import FooterGithubIcon from "../components/ui/icons/FooterGithubIcon";

export default function GitHubIssues() {
  const [activeTab, setActiveTab] = useState("assigned");
  const [searchQuery, setSearchQuery] = useState(
    "is:issue state:open archived:false assignee:@me sort:updated-desc",
  );

  const tabs = [
    { id: "assigned", label: "Assigned to me", icon: "user" },
    { id: "created", label: "Created by me", icon: "circle" },
    { id: "mentioned", label: "Mentioned", icon: "at" },
    { id: "recent", label: "Recent activity", icon: "clock" },
  ];

  return (
    <div className="min-h-screen bg-[white]">
      <div className="flex">
        <aside className="w-64 bg-white border-r border-[#d0d7de] min-h-screen hidden lg:block">
          <div className="p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <div
                  className={`p-1.1 relative transition-all ${
                    activeTab === tab.id
                      ? "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-1 before:bg-blue-600 before:rounded-r-md"
                      : ""
                  }`}
                >
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all ${
                      activeTab === tab.id
                        ? "bg-[#ECEEF0] text-[#24292f] font-medium"
                        : "text-[#57606a] hover:bg-[#f6f8fa]"
                    }`}
                  >
                    {tab.icon === "user" && <TabUserIcon className="w-4 h-4" />}
                    {tab.icon === "circle" && <TabCircleIcon className="w-4 h-4" />}
                    {tab.icon === "at" && <TabAtIcon className="w-4 h-4" />}
                    {tab.icon === "clock" && <TabClockIcon className="w-4 h-4" />}
                    <span>{tab.label}</span>
                  </button>
                </div>
              ))}
            </nav>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-[#57606a] uppercase">
                  Views
                </h3>
                <button className="text-[#57606a] hover:text-[#24292f]">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1">
                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-[#57606a] hover:bg-[#f6f8fa]">
                  <ViewUntitledIcon className="w-4 h-4" />
                  <span>Untitled view</span>
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold text-[#24292f]">
                Assigned to me
              </h1>
              <button className="bg-[#1C8139] hover:bg-[#2c974b] text-white px-4 py-2 rounded-md text-sm font-medium">
                New issue
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-center bg-white border border-[#d0d7de] rounded-md focus-within:border-[#0969da] focus-within:ring-1 focus-within:ring-[#0969da]">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm focus:outline-none"
                />
                <button className="px-3 py-2 hover:bg-[#D1D9E0] bg-[#EFF2F5] border border-github-border rounded-r-md">
                  <Search className="w-5 h-5 text-[#57606a] " />
                </button>
              </div>
            </div>

            <div className="bg-white border border-[#d0d7de] rounded-t-md">
              <div className="flex items-center justify-between px-4 py-3 border-b bg-[#F6F8FA] border-[#d0d7de]">
                <div className="text-sm text-[#57606a]">
                  <span className="font-semibold ">0 results</span>
                </div>
                <div className="flex items-center rounded-md  hover:bg-[#D1D9E0] gap-3">
                  <button className="flex items-center gap-2 px-3 py-1.5 text-sm  rounded-md">
                      <IssuesVariantIcon className="w-4 h-4" />
                    <span>Updated</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="py-20 text-center">
                <h3 className="text-2xl font-normal text-[#24292f] mb-2">
                  No results
                </h3>
                <p className="text-base text-[#57606a]">
                  Try adjusting your search filters.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#d0d7de] bg-white mt-auto">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-[#57606a]">
            <div className="flex items-center gap-2">
              <FooterGithubIcon className="w-6 h-6 fill-[#57606a]" />
              <span>© 2026 GitHub, Inc.</span>
            </div>
            <div className="flex flex-wrap gap-4">
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
      </footer>
    </div>
  );
}

