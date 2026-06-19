import Navbar from "@layout/Navbar";
import ProfileSidebar from "@layout/ProfileSidebar";
import Tabs from "@layout/Tabs";
import PinnedRepos from "@features/PinnedRepos";
import ContributionGraph from "@common/ContributionGraph";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Loader from "@common/Loader";
import Error from "@common/Error";
import { getUser, getRepos } from "@services/GithubApi.jsx";
import { GitHubCalendar } from "react-github-calendar";
import RepoList from "@features/RepoList";
import RepoFilterBar from "@features/RepoFilterBar";


const Profile = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const userData = await getUser(username);
        const repoData = await getRepos(username);

        setUser(userData);
        setRepos(repoData);
      } catch {
        setError("User not found");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) return <Loader />;
  if (error) return <Error message={error} />;

  return (
    <>
      <Navbar />
      <Tabs />

      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto">
        <ProfileSidebar user={user} />
        <div className="flex-1">
          <RepoList repos={repos} />
          <ContributionGraph username={user.login} contributions={user.contributions} />
        </div>
      </div>
    </>
  );
};

export default Profile;
