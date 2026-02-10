import { File, Folder } from "lucide-react";

const RepoFileList = ({ files }) => {
  return (
    <div className="mt-4 border border-github-border rounded-md">
      {files.map((item) => (
        <div
          key={item.path}
          className="
            flex items-center gap-2 px-4 py-2
            border-b border-github-border
            hover:bg-[#EFF2F5]
            cursor-pointer
          "
        >
          {item.type === "dir" ? (
            <Folder size={16} />
          ) : (
            <File size={16} />
          )}

          <span className="text-github-link">{item.name}</span>
        </div>
      ))}
    </div>
  );
};

export default RepoFileList;
