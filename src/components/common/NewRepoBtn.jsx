import React from "react";
import { useNavigate } from "react-router-dom";
import ReposotoryIcon from "../../../public/customIcons/ReposotoryIcon";

const NewRepoBtn = ({ size, _children }) => {
  const navigate = useNavigate();
  const handleNewRepoClick = () => {
    navigate("/new");
  };
  let sizeClasses = '';

  switch (size) {
    case 'small':
      sizeClasses = 'px-2  py-1  ';
      break;
    case 'large':
      sizeClasses = 'px-6 py-3  ';
      break;
    case 'medium':
    default:
      sizeClasses = 'px-4 py-2 ';
      break;
  }
  return (
    <div>
      <button
        className={` dropdown-item gap-1.5 flex items-center bg-[#1F883D] rounded-md w-auto    text-[17px] font-semibold text-white ${sizeClasses}`}
        onClick={handleNewRepoClick}
      >
        <ReposotoryIcon width="18" height="18" fill="white" color="white" />
        <span>New</span>
      </button>
    </div>
  );
};

export default NewRepoBtn;
