// import { Book, Repo, Star } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Book, Library, Star, Folder, Package } from "lucide-react";
import OverviewIcon from '../../public/customIcons/OverviewIcon'
import ReposotoryIcon from '../../public/customIcons/ReposotoryIcon'
import ProjectsIcon from '../../public/customIcons/ProjectsIcon'
import PackageIcon from '../../public/customIcons/PackageIcon'          
import StarsIcon from '../../public/customIcons/StarsIcon'
 

const Tabs = ({ username }) => {
  return (
    
   
    
    <div className="border-b bg-[#EFF2F5] border-github-border ">
      <div className="  mx-auto px-4  text-[#1f2328] ">
        <nav className="flex gap-6 text-[14px] ">
          <Tab to={`/${username}`} icon={OverviewIcon} label="Overview" end  />
      
          <Tab 
            to={`/${username}/repositories`}
            icon={ReposotoryIcon}
            label="Repositories"
          />
          <Tab to={`/${username}/Projects`} icon={ProjectsIcon} label="Projects" />

          <Tab to={`/${username}/Packages`} icon={PackageIcon} label="Packages" />
          <Tab to={`/${username}/stars`} icon={StarsIcon} label="Stars" />
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
            : "border-transparent text-github-muted hover:text-github-text hover:bg-[#C8D1DA]"
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
