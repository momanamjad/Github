import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getRepo, getRepoContents } from "../services/GithubApi.jsx";
import RepoHeader from "../components/RepoHeader";
import RepoFileList from "../components/RepoFileList";

const RepoDetails = () => {
  const { username, repo } = useParams();

  const [repoData, setRepoData] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRepo = async () => {
      setLoading(true);
      const repoInfo = await getRepo(username, repo);
      const contents = await getRepoContents(username, repo);

      setRepoData(repoInfo);
      setFiles(contents);
      setLoading(false);
    };

    loadRepo();
  }, [username, repo]);

  if (loading) {
    return <p className="text-github-muted p-6">Loading repository…</p>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <RepoHeader repo={repoData} />
      <RepoFileList files={files} />
    </div>
  );
};

export default RepoDetails;
