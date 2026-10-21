
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
  const initialUser = cachedInitial?.user ?? cachedInitial?.data?.user ?? null;
  const initialRepos = cachedInitial?.repos ?? cachedInitial?.data?.repos ?? [];
  const initialPins = (cachedInitial?.pins || cachedInitial?.data?.pins || []).map(p => p.repository).filter(Boolean);

  const [user, setUser] = useState(initialUser);
  const [repos, setRepos] = useState(initialRepos);
  const [pinnedRepos, setPinnedRepos] = useState(initialPins);
  const [loading, setLoading] = useState(!initialUser);
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

  if (loading && !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-72 shrink-0 space-y-4">
            <div className="w-48 h-48 rounded-full bg-gray-200 dark:bg-gray-800 mx-auto lg:mx-0" />
            <div className="h-6 w-44 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded mt-4" />
          </div>
          <div className="flex-1 space-y-4">
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-44 w-full bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-32 w-full bg-gray-200 dark:bg-gray-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !user) return <ErrorComponent message={error} />;

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
