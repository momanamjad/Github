import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
// import { getStarredRepos } from "../services/githubApi";
import RepoList from "../RepoList";
import { getStarredRepos } from "@/services/GithubApi";

const Stars = () => {
  const { username } = useParams();
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getStarredRepos(username)
      .then(setRepos)
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return <p className="text-github-muted py-6">Loading starred repositories…</p>;
  }

  if (repos.length === 0) {
    return (
      <p className="text-github-muted py-6">
        This user hasn’t starred any repositories yet.
      </p>
    );
  }

  return <RepoList repos={repos} />;
};

export default Stars;
