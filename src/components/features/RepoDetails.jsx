import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getRepo } from "@services/GithubApi.jsx";
import RepoHeader from "@features/RepoHeader";
import RepoFileList from "@features/RepoFileList";
import { getTree } from "@services/fileSystemService.js";
import FileExplorer from "@components/FileExplorer.jsx";
import FileEditor from "@components/FileEditor.jsx";

const RepoDetails = () => {
  const { username, repo } = useParams();

  const [repoData, setRepoData] = useState(null);
  const [files, setFiles] = useState([]);
  const [fileTree, setFileTree] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRepo = async () => {
      try {
        setLoading(true);
        setError(null);

        const repoInfo = await getRepo(username, repo);
        setRepoData(repoInfo);

        if (repoInfo.fileTree) {
          const tree = getTree(repoInfo.id);
          setFileTree(tree);
          setFiles(tree);
        } else {
          // For repos without a fileTree, show a default structure
          const defaultContents = [
            {
              name: "src",
              path: "src",
              type: "dir",
              html_url: `https://github.com/${username}/${repo}/tree/main/src`,
            },
            {
              name: "README.md",
              path: "README.md",
              type: "file",
              size: 2048,
              html_url: `https://github.com/${username}/${repo}/blob/main/README.md`,
            },
            {
              name: "package.json",
              path: "package.json",
              type: "file",
              size: 845,
              html_url: `https://github.com/${username}/${repo}/blob/main/package.json`,
            },
          ];
          setFiles(defaultContents);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadRepo();
  }, [username, repo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex items-center gap-3 text-[#636c76]">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-[14px]">Loading repository…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="border border-[#d0d7de] rounded-md p-6 bg-white text-center">
          <p className="text-[#cf222e] text-[14px] font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const refreshTree = () => {
    if (!repoData) return;
    const tree = getTree(repoData.id);
    setFileTree([...tree]);
  };

  const handleSelect = (node) => {
    if (node && node.type === "file") {
      setSelectedFile(node);
    } else {
      setSelectedFile(null);
    }
  };

  const handleSaveFile = (path, newContent) => {
    if (selectedFile && selectedFile.path === path) {
      setSelectedFile({ ...selectedFile, content: newContent });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
      <RepoHeader repo={repoData} />

      {repoData?.fileTree ? (
        <div className="py-4 sm:py-6">
          {/* Responsive: stacked on mobile, side-by-side on desktop */}
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* File Explorer */}
            <div className="w-full lg:w-[340px] xl:w-[380px] shrink-0">
              <FileExplorer
                repoId={repoData.id}
                tree={fileTree}
                onSelect={handleSelect}
                refreshTree={refreshTree}
              />
            </div>

            {/* File Editor */}
            <div className="flex-1 min-w-0">
              {selectedFile ? (
                <FileEditor
                  repoId={repoData.id}
                  file={selectedFile}
                  onSave={handleSaveFile}
                />
              ) : (
                <div className="border border-[#d0d7de] rounded-md bg-white p-8 sm:p-12 text-center">
                  <svg className="mx-auto mb-3 text-[#d0d7de]" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14,2 14,8 20,8" />
                  </svg>
                  <p className="text-[14px] text-[#636c76]">
                    Select a file to view or edit
                  </p>
                  <p className="text-[12px] text-[#8b949e] mt-1">
                    Click on a file in the explorer to open it here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="py-4 sm:py-6">
          <RepoFileList files={files} />
        </div>
      )}
    </div>
  );
};

export default RepoDetails;
