
import PinnedRepos from "@features/PinnedRepos";
import ContributionGraph from "@common/ContributionGraph";
import { useParams } from "react-router-dom";
import ErrorComponent from "@common/Error";
import { useUserProfile } from "@hooks/useQueries";

const Profile = () => {
  const { username } = useParams();
  const { data, isLoading, error: queryError } = useUserProfile(username);

  const user = data?.user ?? null;
  const repos = data?.repos ?? [];
  const pinnedRepos = (data?.pins || []).map((p) => p.repository).filter(Boolean);
  const loading = isLoading && !user;

  let error = null;
  if (queryError) {
    if (queryError?.statusCode === 404 || queryError?.message === "User not found") {
      error = "User not found";
    } else if (queryError?.statusCode === 500) {
      error = "Server error. Please try again later.";
    } else {
      error = "Failed to load profile. Check your connection.";
    }
  } else if (!isLoading && !user) {
    error = "User not found";
  }

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
