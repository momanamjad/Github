
import PinnedRepos from "@features/PinnedRepos";
import ContributionGraph from "@common/ContributionGraph";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Loader from "@common/Loader";
import ErrorComponent from "@common/Error";
import { getUser, getRepos, getPinnedRepos } from "@services/GithubApi.jsx";



const Profile = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [pinnedRepos, setPinnedRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const userData = await getUser(username);
        if (!userData) {
          throw new Error("User not found");
        }
        const repoData = await getRepos(username);
        const pinnedData = await getPinnedRepos(username);

        setUser(userData);
        setRepos(repoData);
        setPinnedRepos(pinnedData || []);
      } catch (err) {
        if (err?.status === 404 || err?.response?.status === 404 || err?.message === "User not found") {
          setError("User not found");
        } else if (err?.status === 500 || err?.response?.status === 500) {
          setError("Server error. Please try again later.");
        } else {
          setError("Failed to load profile. Check your connection.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) return <Loader />;
  if (error) return <ErrorComponent message={error} />;

  return (
    <div className="flex flex-col lg:flex-row max-w-7xl mx-auto">
      <ProfileSidebar user={user} />
      <div className="flex-1">
        <RepoList repos={repos} />
        <ContributionGraph username={user.login} contributions={user.contributions ?? []} />
        {pinnedRepos?.length > 0 && (
          <PinnedRepos username={user.login} repos={pinnedRepos} />
        )}
      </div>
    </div>
  );
};

export default Profile;
