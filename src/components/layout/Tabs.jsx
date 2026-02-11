import { NavLink } from "react-router-dom";
import { Book, Library, Star, Folder, Package } from "lucide-react";
import { OverviewIcon, ReposotoryIcon, ProjectsIcon, PackageIcon, StarsIcon } from "@ui/Icons";
import LoadingBar from 'react-top-loading-bar';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from "react";
import { useTabsContext } from "@/contexts/TabsContext";
// import { useTabsContext } from "@contexts/TabsContext";


const Tabs = ({ username }) => {

const [progress, setProgress] = useState(0);
    const location = useLocation();
    const { setHasTabsComponent } = useTabsContext();

  useEffect(() => {
    setHasTabsComponent(true);
    return () => setHasTabsComponent(false);
  }, [setHasTabsComponent]);

  useEffect(() => {
      setProgress(70);  
      const timer = setTimeout(() => setProgress(100), 400);  
      return () => clearTimeout(timer);
    }, [location]);




  return (
   <div>
    <LoadingBar
        color="#2188ff"  
        progress={progress}
        height={2}
        onLoaderFinished={() => setProgress(0)}
      />
     <div className="pl-4 py-0 bg-[#F6F8FA] border-b border-[#d0d7de]">
      <div className="mx-auto text-[14px]">
        <nav className="flex gap-2 ">
          <Tab to={`/${username}`} icon={OverviewIcon} label="Overview" end />
          <Tab
            to={`/${username}/repositories`}
            icon={ReposotoryIcon}
            label="Repositories"
          />
          <Tab
            to={`/${username}/projects`}
            icon={ProjectsIcon}
            label="Projects"
          />
          <Tab
            to={`/${username}/packages`}
            icon={PackageIcon}
            label="Packages"
          />
          <Tab to={`/${username}/stars`} icon={StarsIcon} label="Stars" />
        </nav>
      </div>
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
        `flex items-center gap-2 px-3 py-3 text-sm transition-colors duration-200
        ${
          isActive
            ? "border-b-3 border-[#FD8C73] text-black font-semibold -mb-[1px] z-10"
            : "  border-transparent text-[#1f2328] hover:bg-[#ebeff2] rounded-md"
        }`
      }
    >
      <Icon size={16} />
      <span>{label}</span>
    </NavLink>
  );
};
export default Tabs;
