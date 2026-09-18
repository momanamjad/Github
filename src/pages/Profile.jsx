
import PinnedRepos from "@features/PinnedRepos";
import ContributionGraph from "@common/ContributionGraph";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Loader from "@common/Loader";
import ErrorComponent from "@common/Error";
import { getUserWithRepos, getCachedUserWithRepos } from "@services/GithubApi.jsx";

const Profile = () => {
  const { username } = useParams();
  const cachedInitial = getCachedUserWithRepos(username);
  const [user, setUser] = useState(() => cachedInitial?.data?.user ?? null);
  const [repos, setRepos] = useState(() => cachedInitial?.data?.repos ?? []);
  const [pinnedRepos, setPinnedRepos] = useState(() => {
    const pins = cachedInitial?.data?.pins || [];
    return pins.map(p => p.repository).filter(Boolean);
  });
  const [loading, setLoading] = useState(!cachedInitial);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const cached = getCachedUserWithRepos(username);
        if (!cached) {
          setLoading(true);
        }
        setError(null);

        const res = await getUserWithRepos(username);
        const userData = res?.data?.user;
        if (!userData) {
          throw new Error("User not found");
        }
        const repoData = res?.data?.repos || [];
        const pins = res?.data?.pins || [];
        const pinnedData = pins.map(p => p.repository).filter(Boolean);

        setUser(userData);
        setRepos(repoData);
        setPinnedRepos(pinnedData);
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

    const handleRevalidate = (e) => {
      if (e.detail?.username === username?.toLowerCase()) {
        const refreshed = getCachedUserWithRepos(username);
        if (refreshed?.data) {
          setUser(refreshed.data.user);
          setRepos(refreshed.data.repos || []);
          setPinnedRepos((refreshed.data.pins || []).map(p => p.repository).filter(Boolean));
        }
      }
    };

    window.addEventListener('github_profile_revalidated', handleRevalidate);
    return () => {
      window.removeEventListener('github_profile_revalidated', handleRevalidate);
    };
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
