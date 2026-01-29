// import { Book, Repo, Star } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Book, Library, Star, Folder, Package } from "lucide-react";

const tabs = [
  { name: "Overview", icon: Book },
  { name: "Repositories", icon: Library },
  { name: "Projects", icon: Folder },
  { name: "Packages", icon: Package },
  { name: "Stars", icon: Star },
];

const Tabs = ({ username }) => {
  return (
    //     <div className="border-b border-github-border bg-github-bg">
    //       <div className="max-w-7xl mx-auto px-4">
    //         <nav className="flex gap-6">
    //           {tabs.map((tab) => {
    //             const Icon = tab.icon;
    //             const active = tab.name === "Overview";

    //             return (
    //               <button
    //                 key={tab.name}
    //                 className={`
    //                   flex items-center gap-2 px-2 py-3
    //                   text-sm font-medium
    //                   border-b-2
    //                   ${
    //                     active
    //                       ? "border-orange-500 text-github-text"
    //                       : "border-transparent text-github-muted hover:text-github-text"
    //                   }
    //                   hover:bg-transparent
    //                 `}
    //               >
    //                 <Icon size={16} />
    //                 {tab.name}
    //                 {tab.count && (
    //                   <span className="
    //                     bg-github-panel text-xs px-2 py-0.5 rounded-full
    //                   ">
    //                     {tab.count}
    //                   </span>
    //                 )}
    //               </button>
    //             );
    //           })}
    //         </nav>
    //       </div>
    //     </div>
    //   );
    // };
    <div className="border-b bg-[#EFF2F5] border-github-border">
      <div className="max-w-7xl mx-auto px-4">
        <nav className="flex gap-6">
          <Tab to={`/${username}`} icon={Book} label="Overview" end />
          <Tab
            to={`/${username}/repositories`}
            icon={Library}
            label="Repositories"
          />
          <Tab to={`/${username}/Projects`} icon={Folder} label="Projects" />

          <Tab to={`/${username}/Packages`} icon={Package} label="Packages" />
          <Tab to={`/${username}/stars`} icon={Star} label="Stars" />
        </nav>
      </div>
    </div>
  );
};

const Tab = ({ to, icon: Icon, label, end }) => {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `
        flex items-center gap-2 px-2 py-3 text-sm font-medium
        border-b-2
        ${
          isActive
            ? "border-orange-500 text-github-text"
            : "border-transparent text-github-muted hover:text-github-text"
        }
        `
      }
    >
      <Icon size={16} />
      {label}
    </NavLink>
  );
};

export default Tabs;
