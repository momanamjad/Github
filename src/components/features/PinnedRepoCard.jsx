import { Link } from "react-router-dom";
import DragIcon from "../../../public/customIcons/DragIcon";
import ReposotoryIcon from "../../../public/customIcons/ReposotoryIcon";
import StarsIcon from "../../../public/customIcons/StarsIcon";

const PinnedRepoCard = ({
  repo,
  stars,
  dragHandleProps,
  style,
}) => {
  return (
    <article
      style={style}
      ref={dragHandleProps?.ref}
      className="bg-[white] border border-[#C8D1DA] rounded-md p-4 transition flex flex-col justify-between  min-h-[114px]"
      {...(dragHandleProps?.attributes || {})}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <ReposotoryIcon className="mt-1 flex-shrink-0" />
            {/* use internal routing instead of external href */}
            <Link
              to={`/${repo.author}/${encodeURIComponent(repo.name)}`}
              className="text-[#0969DA] font-semibold text-[14px] hover:underline break-all"
            >
              {repo.name || "Repository"}
            </Link>
          </div>

          {/* Drag handle (six dots) */}
          <button
            {...(dragHandleProps?.listeners || {})}
            className="p-1 rounded hover:bg-slate-100 cursor-grab touch-none"
            style={{ touchAction: 'none' }}
            aria-label="Drag"
          >
            <DragIcon />
          </button>
        </div>

        <p className="text-[#8b949e] text-[12px] mt-2 leading-snug">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi
          omvbero, ratio
        </p>
      </div>
      <div className="flex items-center gap-4 text-xs text-[#8b949e] mt-4">
        <span className="flex items-center gap-1">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "#51e058" }}
          />
          Language
        </span>

        {stars > 0 && (
          <span className="flex items-center gap-1 text-black hover:text-[#0969DA]">
            <StarsIcon />
            2
          </span>
        )}
      </div>
    </article>
  );
};

export default PinnedRepoCard;
