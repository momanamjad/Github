import React from "react";
import {
  Plus,
  Search,
  Filter,
  Star,
  GitBranch,
  GitPullRequest,
  Code,
  MessageSquare,
  ListTodo,
} from "lucide-react";

const Home = () => {
  const repositories = [
    "momanamjad/Employ",
    "momanamjad/Github",
    "momanamjad/k_77-Clone-in-react-GSAP",
    "momanamjad/theater-web-in-react",
    "momanamjad/Todo-list",
    "momanamjad/practice-react",
    "momanamjad/Real-Estate",
  ];

  return (
    <div className="flex min-h-screen bg-[#ffffff] font-sans text-[#1f2328]">
      {/* Sidebar - Left */}
      <aside className="hidden w-80 border-r border-[#d0d7de] p-6 lg:block">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Top repositories</h2>
          <button className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-[#1f883d] rounded-md hover:bg-[#1a7f37]">
            <Plus size={14} /> New
          </button>
        </div>
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Find a repository..."
            className="w-full px-3 py-1 text-sm border border-[#d0d7de] rounded-md bg-[#f6f8fa] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0969da]"
          />
        </div>
        <ul className="space-y-2">
          {repositories.map((repo) => (
            <li
              key={repo}
              className="flex items-center gap-2 text-sm hover:underline cursor-pointer"
            >
              <span className="w-4 h-4 bg-[#afb8c1] rounded-full"></span> {repo}
            </li>
          ))}
        </ul>
        <button className="mt-4 text-xs text-[#636c76] hover:text-[#0969da]">
          Show more
        </button>
      </aside>

      {/* Main Content - Center */}
      <main className="flex-1 max-w-4xl mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-xl font-semibold mb-6">Home</h1>
          <div className="relative flex items-center p-4 border border-[#d0d7de] rounded-lg bg-white shadow-sm mb-6">
            <span className="text-gray-400 mr-2 font-medium">Ask anything</span>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-gray-400 italic">
                Claude Haiku 4.5
              </span>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <Search size={18} />
              </button>
            </div>
          </div>

          {/* Action Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { icon: <ListTodo size={16} />, label: "Task" },
              { icon: <MessageSquare size={16} />, label: "Create issue" },
              { icon: <Code size={16} />, label: "Write code" },
              { icon: <GitBranch size={16} />, label: "Git" },
              {
                icon: <GitPullRequest size={16} />,
                label: "Pull requests",
                count: 11,
              },
            ].map((tab) => (
              <button
                key={tab.label}
                className="flex items-center gap-2 px-3 py-1.5 text-sm border border-[#d0d7de] rounded-full bg-[#f6f8fa] hover:bg-[#ebedf0]"
              >
                {tab.icon} {tab.label}{" "}
                {tab.count && (
                  <span className="bg-[#afb8c1] text-white text-[10px] px-1.5 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Feed */}
          <div className="flex items-center justify-between border-b border-[#d0d7de] pb-2 mb-4">
            <h2 className="font-semibold">Feed</h2>
            <button className="flex items-center gap-1 text-sm text-[#0969da] hover:bg-[#f6f8fa] px-2 py-1 rounded-md">
              <Filter size={14} /> Filter
            </button>
          </div>

          {/* Repository Card */}
          <div className="p-4 border border-[#d0d7de] rounded-lg bg-white mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-gray-800 rounded-full"></div>
              <span className="text-sm">
                <span className="font-bold">hiteshchoudhary</span> created a
                repository
              </span>
              <span className="text-xs text-gray-500">17 hours ago</span>
            </div>
            <div className="ml-8 border border-[#d0d7de] rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-blue-600 font-bold hover:underline cursor-pointer">
                  hiteshchoudhary/vibe-translator
                </h3>
                <button className="flex items-center gap-1 px-3 py-1 text-xs border border-[#d0d7de] rounded-md bg-[#f6f8fa] hover:bg-[#ebedf0]">
                  <Star size={14} /> Star
                </button>
              </div>
              <p className="text-sm font-semibold mb-2">vibe-translator</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>{" "}
                  Shell
                </span>
                <span className="flex items-center gap-1">
                  <Star size={12} /> 5
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <aside className="hidden w-80 border-l border-[#d0d7de] p-6 xl:block bg-white">
        <h2 className="text-[14px] font-semibold mb-6 text-[#1f2328]">
          Latest from our changelog
        </h2>

        <div className="relative">
          <div className="absolute left-[5px] top-2 bottom-8 w-[1px] bg-[#d0d7de]"></div>

          {/* <div className="space-y-6">
      {changelogItems.map((item, index) => (
        <div key={index} className="relative pl-6">
          <div className="absolute left-0 top-1.5 w-[11px] h-[11px] rounded-full bg-[#d0d7de] border-2 border-white z-10"></div>
          
          <div className="text-[12px] leading-snug">
            <p className="text-[#636c76] mb-1">{item.date}</p>
            <p className="text-[#1f2328] hover:text-[#0969da] cursor-pointer font-medium">
              {item.text}
            </p>
          </div>
        </div>
      ))}
    </div> */}
        </div>

        <button className="mt-4 ml-6 text-[12px] text-[#636c76] hover:text-[#0969da] transition-colors">
          View changelog →
        </button>
      </aside>
    </div>
  );
};

export default Home;

// onClick={() => setFilterOpen(true)}

//  <FilterModal
//     open={filterOpen}
//     onClose={() => setFilterOpen(false)}
//     title="Filter repositories"
//     options={[
//       "All",
//       "JavaScript",
//       "React",
//       "TypeScript",
//       "Recently updated",
//     ]}
//     onSelect={setFilterValue}
//   />
