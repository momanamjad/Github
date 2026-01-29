import Navbar from "../components/Navbar";
import ProfileSidebar from "../components/ProfileSidebar";
import Tabs from "../components/Tabs";
import PinnedRepos from "../components/PinnedRepos";
import ContributionGraph from "../components/ContributionGraph";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import Error from "../components/Error";
import { getUser, getRepos } from "../services/githubApi";
import { GitHubCalendar } from "react-github-calendar";
import RepoList from "@/components/RepoList";
import RepoFilterBar from "../components/RepoFilterBar";

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

      {/* <GitHubCalendar username="momanamjad" /> */}

      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto">
        <ProfileSidebar user={user} />
        <div className="flex-1">
          <RepoList repos={repos} />
          <ContributionGraph username={user.login} />
        </div>
      </div>
    </>
  );
};

export default Profile;
