import { useParams, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useGitHub } from "@/contexts/GitHubContext";
import RepoList from "@features/RepoList";
import RepoFilterBar from "@features/RepoFilterBar";
import { Skeleton } from 'boneyard-js/react';
import { RepoSkeleton } from "@features/RepoSkeleton";
import { getRepos, getCachedRepos } from "@services/GithubApi";

const Repositories = () => {
  const { username } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useGitHub();
  const cachedInitial = getCachedRepos(username);
  const [repos, setRepos] = useState(() => cachedInitial || []);
  const [isLoading, setIsLoading] = useState(!cachedInitial);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const cached = getCachedRepos(username);
        if (!cached) {
          setIsLoading(true);
        }
        const data = await getRepos(username);
        setRepos(data || []);
      } catch (err) {
        console.error("Failed to load repositories:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRepos();

    window.addEventListener('github_repos_updated', fetchRepos);
    return () => {
      window.removeEventListener('github_repos_updated', fetchRepos);
    };
  }, [username]);

  const search = searchParams.get("q") || "";
  const language = searchParams.get("language") || "All";
  const sort = searchParams.get("sort") || "updated";
  const type = searchParams.get("type") || "all";
  const PAGE_SIZE = 30;
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const updateFilters = (updates) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("page"); // Reset pagination back to page 1 on filter changes
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "All" && value !== "all" && value !== "updated") {
        nextParams.set(key, value);
      } else {
        nextParams.delete(key);
      }
    });
    setSearchParams(nextParams);
  };

  const setPage = (newPage) => {
    const nextParams = new URLSearchParams(searchParams);
    if (newPage > 1) {
      nextParams.set("page", newPage);
    } else {
      nextParams.delete("page");
    }
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const setSearch = (val) => updateFilters({ q: val });
  const setLanguage = (val) => updateFilters({ language: val });
  const setSort = (val) => updateFilters({ sort: val });
  const setType = (val) => updateFilters({ type: val });

  const filteredRepos = useMemo(() => {
    let result = [...repos];

    // Search
    if (search) {
      result = result.filter(repo =>
        repo.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Language filter
    if (language !== "All") {
      result = result.filter(repo => repo.language === language);
    }

    // Type filter
    if (type === "sources") {
      result = result.filter(repo => !repo.fork);
    }

    if (type === "forks") {
      result = result.filter(repo => repo.fork);
    }

    if (type === "archived") {
      result = result.filter(repo => repo.archived);
    }

    if (type === "mirrors") {
      result = result.filter(repo => repo.mirror_url);
    }

    // Sorting
    if (sort === "stars") {
      result.sort((a, b) => b.stargazers_count - a.stargazers_count);
    }

    if (sort === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (sort === "updated") {
      result.sort(
        (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
      );
    }

    return result;
  }, [repos, search, language, sort, type]);

  const totalPages = Math.ceil(filteredRepos.length / PAGE_SIZE) || 1;
  const paginatedRepos = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredRepos.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredRepos, currentPage]);

  const languages = [
    "All",
    ...new Set(repos.map(r => r.language).filter(Boolean)),
  ];

  // Fixture for boneyard build step
  const fixture = (
    <div className="flex flex-col">
      <RepoSkeleton />
      <RepoSkeleton />
      <RepoSkeleton />
      <RepoSkeleton />
    </div>
  );

  return (
    <>
      <RepoFilterBar
        search={search}
        setSearch={setSearch}
        language={language}
        setLanguage={setLanguage}
        sort={sort}
        setSort={setSort}
        type={type}
        setType={setType}
        languages={languages}
      />

      <Skeleton 
        name="repo-list" 
        loading={isLoading} 
        fixture={fixture}
      >
        <RepoList repos={paginatedRepos} />

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 py-8 select-none">
            <div className="inline-flex rounded-md shadow-sm border border-github-border overflow-hidden">
              <button
                type="button"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className={`px-3 py-1.5 text-sm font-medium border-r border-github-border transition-colors ${
                  currentPage <= 1
                    ? "text-github-muted bg-github-panel/50 cursor-not-allowed"
                    : "text-[#0969DA] bg-github-panel hover:bg-github-border/40 cursor-pointer"
                }`}
              >
                Previous
              </button>
              <span className="px-4 py-1.5 text-sm text-github-text bg-github-panel font-medium flex items-center">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  currentPage >= totalPages
                    ? "text-github-muted bg-github-panel/50 cursor-not-allowed"
                    : "text-[#0969DA] bg-github-panel hover:bg-github-border/40 cursor-pointer"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Skeleton>
    </>
  );
};

export default Repositories;
 