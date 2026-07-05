import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useGitHub } from "@contexts/GitHubContext";
import { getUser, getRepos } from "@services/GithubApi";
import { getTree } from "@services/fileSystemService";
import MarkdownRenderer from "@common/MarkdownRenderer";
import { BookIcon, PencilIcon } from "@primer/octicons-react";

const ProfileReadme = ({ username }) => {
  const { user } = useGitHub();
  const [readmeContent, setReadmeContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchProfileReadme = async () => {
      try {
        setLoading(true);

        // ── Fast path ─────────────────────────────────────────────────────────
        // The backend now embeds profileReadmeContent directly in the user object
        // returned by GET /auth/user/:username. Use it if present to avoid a
        // second round-trip for the file tree.
        const userProfile = await getUser(username);

        if (cancelled) return;

        if (userProfile?.profileReadmeContent) {
          setReadmeContent(userProfile.profileReadmeContent);
          return;
        }

        // ── Slow-path fallback ────────────────────────────────────────────────
        // Supports older backend versions or repos created before the
        // is_profile_readme flag existed.
        // Security: Only reads from a public repo whose name matches the username.
        const repos = await getRepos(username);

        if (cancelled) return;

        const specialRepo = repos.find(
          (r) =>
            r.name?.toLowerCase() === username.toLowerCase() &&
            r.visibility === "public" &&
            !r.is_deleted
        );

        if (!specialRepo) return;

        const id = specialRepo._id || specialRepo.id;
        if (!id) return;

        const tree = await getTree(id);

        if (cancelled) return;

        const readmeFile = tree.find(
          (f) => f.name?.toLowerCase() === "readme.md" && f.type === "file"
        );

        if (readmeFile?.content) {
          setReadmeContent(readmeFile.content);
        }
      } catch (err) {
        // Non-fatal: profile README is optional, don't surface errors to user
        console.warn("[ProfileReadme] Could not load profile README:", err.message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchProfileReadme();

    return () => {
      cancelled = true;
    };
  }, [username]);

  // Nothing to render — don't mount the card at all
  if (loading || !readmeContent) return null;

  const isOwner = user?.login?.toLowerCase() === username?.toLowerCase();

  return (
    <div className="mx-4 mt-6 border border-[#d0d7de] dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] p-4 sm:p-6 shadow-sm">
      {/* Card header */}
      <div className="flex items-center justify-between border-b border-[#d0d7de] dark:border-[#30363d] pb-3 mb-4">
        <div className="flex items-center gap-2">
          <BookIcon size={16} className="text-[#57606a] dark:text-[#8b949e]" />
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {username}
            <span className="text-gray-400 dark:text-gray-500 font-normal">/</span>
            README
            <span className="text-gray-400 dark:text-gray-500 font-normal">.md</span>
          </span>
        </div>

        {/* Only show edit link to the profile owner */}
        {isOwner && (
          <Link
            to={`/${username}/${username}`}
            className="flex items-center gap-1 text-xs text-[#0969da] dark:text-[#58a6ff] hover:underline"
            title="Edit profile README"
          >
            <PencilIcon size={14} />
            <span>Edit README</span>
          </Link>
        )}
      </div>

      {/* README rendered as safe markdown */}
      <div className="prose dark:prose-invert max-w-none text-[#24292f] dark:text-[#c9d1d9]">
        <MarkdownRenderer content={readmeContent} />
      </div>
    </div>
  );
};

export default ProfileReadme;
