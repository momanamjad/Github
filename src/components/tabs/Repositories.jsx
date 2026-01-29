import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getRepos } from "@/services/GithubApi";
import RepoList from "../RepoList";
import RepoFilterBar from "../RepoFilterBar";

const Repositories = () => {
  const { username } = useParams();

  const [repos, setRepos] = useState([]);
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("All");
  const [sort, setSort] = useState("updated");

  useEffect(() => {
    getRepos(username).then(setRepos);
  }, [username]);

  const filteredRepos = useMemo(() => {
    let result = [...repos];

    // 🔍 Search
    if (search) {
      result = result.filter((repo) =>
        repo.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // 🌐 Language filter
    if (language !== "All") {
      result = result.filter((repo) => repo.language === language);
    }

    // 🔃 Sorting
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
  }, [repos, search, language, sort]);

  const languages = [
    "All",
    ...new Set(repos.map((r) => r.language).filter(Boolean)),
  ];

  return (
    <>
      <RepoFilterBar
        search={search}
        setSearch={setSearch}
        language={language}
        setLanguage={setLanguage}
        sort={sort}
        setSort={setSort}
        languages={languages}
      />

      <RepoList repos={filteredRepos} />
    </>
  );
};

export default Repositories;
