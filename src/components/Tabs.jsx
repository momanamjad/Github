import { NavLink } from "react-router-dom";
import { Book, Library, Star, Folder, Package } from "lucide-react";
import OverviewIcon from "../../public/customIcons/OverviewIcon";
import ReposotoryIcon from "../../public/customIcons/ReposotoryIcon";
import ProjectsIcon from "../../public/customIcons/ProjectsIcon";
import PackageIcon from "../../public/customIcons/PackageIcon";
import StarsIcon from "../../public/customIcons/StarsIcon";

const Tabs = ({ username }) => {
  return (
    <div className="pl-4 py-0  bg-[#F6F8FA] ">
      <div className="border-b  transition-colors duration-200 ease-in">
        <div className="  mx-auto text-[14px]  ">
          <nav className="flex gap-2 text-[14px] ">
            <Tab to={`/${username}`} icon={OverviewIcon} label="Overview" end   />

            <Tab
              to={`/${username}/repositories`}
              icon={ReposotoryIcon}
              label="Repositories"
            />
            <Tab
              to={`/${username}/Projects`}
              icon={ProjectsIcon}
              label="Projects"
            />

            <Tab
              to={`/${username}/Packages`}
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
    <>
      <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
          `
        flex items-center gap-2 px-2 py-3 text-sm 
        border-b-3 text-[#1f2328]
        ${
          isActive
            ? " border-[#FD8C73] text-black hover:bg-[#ebeff2] rounded-t-md rounded-b-none font-medium "
            : "border-transparent text-[#1f2328] hover:text-github-text  hover:bg-[#ebeff2] transition-colors duration-200 ease-in  rounded-t-md rounded-b-none"
        }
        `
        }
      >
        <Icon size={16} />
        {label}
      </NavLink>
    </>
  );
};

export default Tabs;
