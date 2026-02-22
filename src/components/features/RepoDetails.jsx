import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getRepo, getRepoContents } from "@services/GithubApi.jsx";
import RepoHeader from "@features/RepoHeader";
import RepoFileList from "@features/RepoFileList";
import { getTree } from "@services/fileSystemService.js";
import FileExplorer from "@components/FileExplorer.jsx";
import FileEditor from "@components/FileEditor.jsx";

const RepoDetails = () => {
  const { username, repo } = useParams();

  const [repoData, setRepoData] = useState(null);
  const [files, setFiles] = useState([]); // used for remote contents
  const [fileTree, setFileTree] = useState([]); // local filesystem
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRepo = async () => {
      try {
        setLoading(true);
        setError(null);

        const repoInfo = await getRepo(username, repo);
        let contents;
        setRepoData(repoInfo);
        if (repoInfo.fileTree) {
          // owned local repository – load from fileSystemService
          const tree = getTree(repoInfo.id);
          setFileTree(tree);
          contents = tree;
        } else {
          contents = await getRepoContents(username, repo);
        }
        setFiles(contents);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadRepo();
  }, [username, repo]);

  if (loading) {
    return <p className="text-github-muted p-6">Loading repository…</p>;
  }

  if (error) {
    return (
      <p className="text-red-500 p-6">
        {error}
      </p>
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
    // updateNode already called by FileEditor; just refresh local copy
    if (selectedFile && selectedFile.path === path) {
      setSelectedFile({ ...selectedFile, content: newContent });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <RepoHeader repo={repoData} />
      {repoData?.fileTree ? (
        <div className="flex gap-8">
          <div className="w-1/3 bg-github-panel p-4 rounded">
            <FileExplorer
              repoId={repoData.id}
              tree={fileTree}
              onSelect={handleSelect}
              refreshTree={refreshTree}
            />
          </div>
          <div className="flex-1">
            {selectedFile ? (
              <FileEditor
                repoId={repoData.id}
                file={selectedFile}
                onSave={handleSaveFile}
              />
            ) : (
              <p className="p-4 text-github-muted">Select a file to view/edit</p>
            )}
          </div>
        </div>
      ) : (
        <RepoFileList files={files} />
      )}
    </div>
  );
};

export default RepoDetails;
