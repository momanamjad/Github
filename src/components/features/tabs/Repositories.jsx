import { useParams, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useGitHub } from "@/contexts/GitHubContext";
import RepoList from "@features/RepoList";
import RepoFilterBar from "@features/RepoFilterBar";
import { Skeleton } from 'boneyard-js/react';
import { RepoSkeleton } from "@features/RepoSkeleton";

const Repositories = () => {
  const { username } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { repositories: allRepos } = useGitHub();
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading delay for skeleton demonstration
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, [username]);

  // Filter out repos not owned by the current profile user
  const repos = useMemo(() => {
    return allRepos.filter(r => (r.owner?.login || "momanamjad").toLowerCase() === username.toLowerCase());
  }, [allRepos, username]);

  const search = searchParams.get("q") || "";
  const language = searchParams.get("language") || "All";
  const sort = searchParams.get("sort") || "updated";
  const type = searchParams.get("type") || "all";

  const updateFilters = (updates) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "All" && value !== "all" && value !== "updated") {
        nextParams.set(key, value);
      } else {
        nextParams.delete(key);
      }
    });
    setSearchParams(nextParams);
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
        <RepoList repos={filteredRepos} />
      </Skeleton>
    </>
  );
};

export default Repositories;
 