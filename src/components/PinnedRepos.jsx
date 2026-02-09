import { useState, useEffect } from "react";
import PinnedRepoCard from "./PinnedRepoCard";

const PinnedRepos = ({ username }) => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPinned = async () => {
      if (!username) return;

      try {
        setLoading(true);

        const url = `https://pinned.berrysauce.dev/get/${username}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setRepos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching pinned repos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPinned();
  }, [username]);

  if (loading)
    return (
      <p className="px-4 text-[#8b949e]">Loading pinned repositories...</p>
    );
  if (repos.length === 0) return null;

  return (
    <section className="px-4 mt-8">
      <h2 className="mb-4 text-[16px] font-semibold text-white">Pinned</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {repos.map((repo, index) => (
          <PinnedRepoCard
            key={repo.name || index}
            name={repo.name}
            desc={repo.description}
            stars={repo.stars}
            language={repo.language}
            repoUrl={`https://github.com/${repo.author}/${repo.name}`}
            languageColor={repo.languageColor}
          />
        ))}
      </div>
    </section>
  );
};

export default PinnedRepos;
