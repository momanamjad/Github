import PinnedRepoCard from "./PinnedRepoCard";
import { useState, useEffect } from "react";

const PinnedRepos = ({ username }) => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPinned = async () => {
      try {
        const response = await fetch(
          `https://pinned.berrysauce.dev/${username}`,
        );
        const data = await response.json();
        setRepos(data);
      } catch (error) {
        console.error("Error fetching pinned repos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPinned();
  }, [username]);

  if (loading) return <p className="px-4">Loading pins...</p>;
  // else if (repos.length === 0) return null;
  return (
    <section className="px-4 mt-8">
      <h2 className="mb-4 text-[16px] font-semibold">Pinned</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {repos.map((repo) => (
          <PinnedRepoCard
            key={repo.name}
            name={repo.name}
            desc={repo.description}
            stars={repo.stars}
            language={repo.language}
            repoUrl={`https://github.com/${repo.author}/${repo.name}`}
          />
        ))}
      </div>
    </section>
  );
};

export default PinnedRepos;
