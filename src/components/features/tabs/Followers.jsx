import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getUser } from "@/services/GithubApi";
import { apiClient } from "@/services/apiClient";
import { useGitHub } from "@/contexts/GitHubContext";

const FollowRowButton = ({ targetUser, onToggle }) => {
  const { user } = useGitHub();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && targetUser) {
      apiClient(`/auth/user/${targetUser.login}`)
        .then((res) => {
          setIsFollowing(res.data?.user?.isFollowing || false);
        })
        .catch(console.error);
    }
  }, [targetUser, user]);

  const handleToggle = async () => {
    if (!user) {
      alert("Please log in first.");
      return;
    }
    setLoading(true);
    try {
      const targetId = targetUser._id || targetUser.id;
      const res = await apiClient(`/users/${targetId}/follow`, { method: "POST" });
      const newState = res?.data?.message === "Followed";
      setIsFollowing(newState);
      if (onToggle) onToggle();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.login === targetUser.login) return null;

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-3 py-1 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
        isFollowing
          ? "bg-[#f6f8fa] text-[#24292f] border-[#d0d7de] hover:bg-[#f3f4f6]"
          : "bg-[#2da44e] text-white border-[#2da44e] hover:bg-[#2c974b]"
      }`}
    >
      {isFollowing ? "Unfollow" : "Follow"}
    </button>
  );
};

export default function Followers() {
  const { username } = useParams();
  const { user: currentUser } = useGitHub();
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFollowers = async () => {
    try {
      const targetUser = await getUser(username);
      const targetId = targetUser._id || targetUser.id;

      const res = await apiClient(`/users/${targetId}/followers`);
      const list = res.data || [];
      const extracted = list.map(item => item.follower).filter(Boolean);
      setFollowers(extracted);
    } catch (err) {
      setError(err.message || "Failed to load followers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchFollowers();
  }, [username]);

  if (loading) {
    return (
      <div className="py-8 text-center text-gray-500 dark:text-gray-400">
        <span className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin inline-block mr-2 align-middle"></span>
        Loading followers...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center text-red-500 font-medium">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="divide-y divide-[#d0d7de] dark:divide-[#30363d] border-t border-[#d0d7de] dark:border-[#30363d] mt-4">
      {followers.length > 0 ? (
        followers.map((follower) => (
          <div key={follower._id || follower.id} className="py-4 flex items-center justify-between gap-4 border-b border-[#d0d7de] dark:border-[#30363d]">
            <div className="flex items-center gap-3">
              <img
                src={follower.avatar_url || "/profile.webp"}
                alt={follower.login}
                className="w-12 h-12 rounded-full border border-[#d0d7de] dark:border-[#30363d] object-cover"
              />
              <div>
                <Link
                  to={`/${follower.login}`}
                  className="font-semibold text-sm text-[#0969da] dark:text-[#58a6ff] hover:underline"
                >
                  {follower.login}
                </Link>
                {follower.name && (
                  <span className="text-xs text-[#57606a] dark:text-[#8b949e] ml-2">
                    {follower.name}
                  </span>
                )}
                {follower.bio && (
                  <p className="text-xs text-[#24292f] dark:text-[#c9d1d9] mt-1">
                    {follower.bio}
                  </p>
                )}
              </div>
            </div>
            <FollowRowButton targetUser={follower} onToggle={fetchFollowers} />
          </div>
        ))
      ) : (
        <div className="py-12 text-center text-gray-500 dark:text-gray-400">
          No followers yet.
        </div>
      )}
    </div>
  );
}
