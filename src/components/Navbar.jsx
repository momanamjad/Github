import { IoLogoGithub } from "react-icons/io";
import { CiMenuBurger } from "react-icons/ci";
import { RiGitRepositoryLine } from "react-icons/ri";
import { IoIosGitPullRequest } from "react-icons/io";
import { VscIssues } from "react-icons/vsc";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
   const [value, setValue] = useState("");
  const navigate = useNavigate();
const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    navigate(`/${value.trim()}`);
    setValue("");
  };
  return (
   <header className="bg-github-bg border-b border-github-border">
  <div className="max-w-7xl mx-auto h-16 px-4 flex items-center justify-between">

       <div className="flex items-center gap-2">

          <span title="Open Menu">
            <CiMenuBurger />
          </span>{" "}
          <IoLogoGithub />
          <span className="font-semibold text-github-text">momanamjad</span>
        </div>

 <form onSubmit={handleSubmit}>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="
              bg-github-panel border border-github-border
              rounded-md px-3 py-1.5 w-64
              text-sm text-github-text
              placeholder-github-muted
              focus:outline-none focus:ring-1 focus:ring-github-link
            "
            placeholder="Search username"
          />
        </form>

        <div className="flex items-center gap-4">
          {[
            <VscIssues />,
            <IoIosGitPullRequest />,
            <RiGitRepositoryLine />,
          ].map((item,index) => (
            <span
              key={index}
              className="
                text-github-text
                px-2 py-1 rounded-md
                hover:bg-github-panelHover
                cursor-pointer
              "
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
