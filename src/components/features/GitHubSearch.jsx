import { useState, useEffect, useRef } from 'react';
import { Search, X, Book, FileText, FileCode2, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getRepos, searchReposApi } from '@services/GithubApi.jsx';
import { useGitHub } from '@/contexts/GitHubContext';
import ReposotoryIcon from '../../../public/customIcons/ReposotoryIcon';
import { useScrollLock } from '../../hooks/useScrollLock';

const OPERATOR_SUGGESTIONS = [
  { label: 'stars:>10', value: 'stars:>10 ' },
  { label: 'stars:>100', value: 'stars:>100 ' },
  { label: 'forks:>5', value: 'forks:>5 ' },
  { label: 'forks:>50', value: 'forks:>50 ' },
  { label: 'language:JavaScript', value: 'language:JavaScript ' },
  { label: 'language:TypeScript', value: 'language:TypeScript ' },
  { label: 'language:HTML', value: 'language:HTML ' },
  { label: 'language:CSS', value: 'language:CSS ' },
  { label: 'visibility:public', value: 'visibility:public ' },
  { label: 'visibility:private', value: 'visibility:private ' }
];

export default function GitHubSearch({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { repositories: repos, user } = useGitHub();
  const modalRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useScrollLock(isOpen);

  const username = user?.login || "moman";

  useEffect(() => {
    if (isOpen) {
      if (inputRef.current) inputRef.current.focus();

      // Auto-prefill search query async so we don't call setState directly in effect
      const pathParts = location.pathname.split('/').filter(Boolean);
      const id = setTimeout(() => {
        if (pathParts.length === 1 && pathParts[0].toLowerCase() === username.toLowerCase()) {
          setSearchQuery(`owner:${username} `);
        } else if (pathParts.length >= 2 && pathParts[0].toLowerCase() === username.toLowerCase()) {
          setSearchQuery(`repo:${username}/${pathParts[1]} `);
        } else {
          setSearchQuery('');
        }
      }, 0);
      return () => clearTimeout(id);
    } else {
      // Clear query async when modal closes
      const clearId = setTimeout(() => {
        setSearchQuery('');
        setSearchResults([]);
      }, 0);
      return () => clearTimeout(clearId);
    }
  }, [isOpen, location.pathname, username]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Debounced backend search
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await searchReposApi(query);
        // Backend pagination returns { repos, total } or similar, but searchReposApi resolves res.data. Let's make sure it handles either arrays or nested properties.
        const reposList = results?.repos || (Array.isArray(results) ? results : []);
        setSearchResults(reposList);
      } catch (err) {
        console.error("Search query failed:", err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleOwnerClick = () => {
    onClose();
    navigate(`/${username}`);
  };

  const handleRepoClick = (repoName, ownerName) => {
    onClose();
    navigate(`/${ownerName || username}/${repoName}`);
  };

  const handleCodeClick = (_path) => {
    onClose();
    // mock navigation — path would be used in real implementation
  };

  const isOwnerSearch = searchQuery.toLowerCase().startsWith('owner:');
  const isRepoSearch = searchQuery.toLowerCase().startsWith('repo:');

  // get current suggestions matching last typed word
  const getSuggestions = () => {
    if (!searchQuery) return [];
    const words = searchQuery.split(/\s+/);
    const lastWord = words[words.length - 1];
    if (!lastWord) return [];

    return OPERATOR_SUGGESTIONS.filter(item =>
      item.label.toLowerCase().startsWith(lastWord.toLowerCase()) &&
      !searchQuery.includes(item.label.split(':')[0] + ':')
    );
  };

  const selectSuggestion = (val) => {
    const words = searchQuery.split(/\s+/);
    words[words.length - 1] = val;
    setSearchQuery(words.join(' '));
    if (inputRef.current) inputRef.current.focus();
  };

  const suggestions = getSuggestions();

  // Show searchResults if query is present, otherwise fallback to local user repositories
  const filteredRepos = searchQuery.trim()
    ? searchResults
    : repos;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#e4e9ed99]/50 transition-opacity backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="flex min-h-full items-start justify-center p-2 sm:p-4 pt-10">
        <div
          ref={modalRef}
          className="relative w-full max-w-[850px] bg-white rounded-xl shadow-2xl flex flex-col border border-[#d0d7de] overflow-hidden"
        >
          {/* Search Input */}
          <div className="relative flex items-center px-4 py-3 border-b border-[#d0d7de] bg-white">
            <Search className="h-[18px] w-[18px] text-[#59636e]" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search or jump to..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 ml-3 bg-transparent text-[#1F2328] placeholder-[#636c76] focus:outline-none text-[15px]"
            />
            {isLoading && (
              <Loader2 className="h-4 w-4 text-[#0969da] animate-spin mr-2" />
            )}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 mr-2 text-white bg-[#818B98] hover:bg-[#59636e] rounded-full transition-colors"
              >
                <X className="h-3 w-3" strokeWidth={3} />
              </button>
            )}
            <div className="flex items-center justify-center p-1 rounded hover:bg-[#f3f4f6]">
              <button onClick={onClose} className="p-1 text-[#59636e] hover:text-[#1f2328] outline-none">
                <X className="w-5 h-5 block border border-[#d0d7de] rounded shadow-sm bg-[#f6f8fa] p-0.5" />
              </button>
            </div>

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute left-10 top-full mt-1 z-10 w-64 bg-white border border-[#d0d7de] rounded-md shadow-lg py-1">
                <div className="px-3 py-1.5 text-xs font-semibold text-[#59636e] bg-[#f6f8fa] border-b border-[#d0d7de]">
                  Filter suggestions
                </div>
                {suggestions.map(s => (
                  <div
                    key={s.label}
                    onClick={() => selectSuggestion(s.value)}
                    className="px-3 py-1.5 hover:bg-[#f3f4f6] text-sm text-[#1f2328] cursor-pointer font-mono hover:text-[#0969da]"
                  >
                    {s.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto bg-white">
            {/* 1. STATE: repo search */}
            {isRepoSearch && (
              <>
                <div className="py-2">
                  <div
                    className="flex items-center justify-between px-4 py-2 hover:bg-[#f3f4f6] cursor-pointer group"
                    onClick={() => onClose()}
                  >
                    <div className="flex items-center gap-3">
                      <Search className="w-4 h-4 text-[#59636e]" />
                      <span className="text-sm font-medium text-[#1F2328]">{searchQuery.trim()}</span>
                    </div>
                    <span className="text-xs text-[#59636E]">Search in this repository</span>
                  </div>
                  <div
                    className="flex items-center justify-between px-4 py-2 hover:bg-[#f3f4f6] cursor-pointer group"
                    onClick={() => { setSearchQuery(`owner:${username}`); }}
                  >
                    <div className="flex items-center gap-3">
                      <Search className="w-4 h-4 text-[#59636e]" />
                      <span className="text-sm text-[#0969da]">user:{username}</span>
                    </div>
                    <span className="text-xs text-[#59636E]">Search in this owner</span>
                  </div>
                </div>

                <div className="px-4 py-2 border-t border-[#d0d7de]">
                  <h3 className="text-xs font-semibold text-[#59636E] mb-1">Repositories</h3>
                  <div className="space-y-1">
                    {repos.slice(0, 4).map((repo) => (
                      <div
                        key={repo.name}
                        onClick={() => handleRepoClick(repo.name, repo.owner?.login)}
                        className="flex justify-between items-center group cursor-pointer hover:bg-[#f3f4f6] -mx-2 px-2 py-2 rounded-md transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <ReposotoryIcon className="w-4 h-4 text-[#59636e]" />
                          <span className="text-sm text-[#1F2328] group-hover:text-[#0969da]">{repo.owner?.login || username}/{repo.name}</span>
                        </div>
                        <span className="text-xs text-[#59636E] opacity-0 group-hover:opacity-100 transition-opacity">Jump to</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* 2. STATE: empty or general search */}
            {!isRepoSearch && !isOwnerSearch && (
              <>
                <div className="px-4 py-3 bg-[#f6f8fa] border-b border-[#d0d7de] text-left select-none">
                  <h4 className="text-xs font-bold text-[#59636e] uppercase tracking-wider mb-2">Filter operators</h4>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <button
                      onClick={() => setSearchQuery(q => q + 'stars:>5 ')}
                      className="px-2 py-1 bg-white border border-[#d0d7de] rounded hover:bg-[#eaeef2] transition-colors cursor-pointer font-mono text-[#57606a]"
                    >
                      stars:&gt;5
                    </button>
                    <button
                      onClick={() => setSearchQuery(q => q + 'forks:>2 ')}
                      className="px-2 py-1 bg-white border border-[#d0d7de] rounded hover:bg-[#eaeef2] transition-colors cursor-pointer font-mono text-[#57606a]"
                    >
                      forks:&gt;2
                    </button>
                    <button
                      onClick={() => setSearchQuery(q => q + 'language:TypeScript ')}
                      className="px-2 py-1 bg-white border border-[#d0d7de] rounded hover:bg-[#eaeef2] transition-colors cursor-pointer font-mono text-[#57606a]"
                    >
                      language:TypeScript
                    </button>
                    <button
                      onClick={() => setSearchQuery(q => q + 'visibility:public ')}
                      className="px-2 py-1 bg-white border border-[#d0d7de] rounded hover:bg-[#eaeef2] transition-colors cursor-pointer font-mono text-[#57606a]"
                    >
                      visibility:public
                    </button>
                  </div>
                </div>

                <div className="px-4 py-2 mt-1">
                  <h3 className="text-xs font-semibold text-[#59636E] mb-1">Owners</h3>
                  <div
                    onClick={handleOwnerClick}
                    className="flex justify-between items-center group cursor-pointer hover:bg-[#f3f4f6] -mx-2 px-2 py-2 rounded-md transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Book className="w-4 h-4 text-[#59636e]" />
                      <span className="text-sm text-[#1F2328] group-hover:text-[#0969da]">{username}</span>
                    </div>
                    <span className="text-xs text-[#59636E] opacity-0 group-hover:opacity-100 transition-opacity">Jump to</span>
                  </div>
                </div>

                <div className="px-4 py-2 border-t border-[#d0d7de]">
                  <h3 className="text-xs font-semibold text-[#59636E] mb-1">Repositories</h3>
                  <div className="space-y-1">
                    {filteredRepos.map((repo) => (
                      <div
                        key={repo.name}
                        onClick={() => handleRepoClick(repo.name, repo.owner?.login)}
                        className="flex justify-between items-center group cursor-pointer hover:bg-[#f3f4f6] -mx-2 px-2 py-2 rounded-md transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <ReposotoryIcon className="w-4 h-4 text-[#59636e]" />
                          <span className="text-sm text-[#1F2328] group-hover:text-[#0969da]">{repo.owner?.login || username}/{repo.name}</span>
                        </div>
                        <span className="text-xs text-[#59636E] opacity-0 group-hover:opacity-100 transition-opacity">Jump to</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* 3. STATE: owner search */}
            {isOwnerSearch && (
              <>
                <div className="px-4 py-2">
                  <h3 className="text-xs font-semibold text-[#59636E] mb-1">Repositories</h3>
                  <div className="space-y-1">
                    {repos.slice(0, 4).map((repo) => (
                      <div
                        key={repo.name}
                        onClick={() => handleRepoClick(repo.name, repo.owner?.login)}
                        className="flex justify-between items-center group cursor-pointer hover:bg-[#f3f4f6] -mx-2 px-2 py-2 rounded-md transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <ReposotoryIcon className="w-4 h-4 text-[#59636e]" />
                          <span className="text-sm text-[#1F2328] group-hover:text-[#0969da]">{repo.owner?.login || username}/{repo.name}</span>
                        </div>
                        <span className="text-xs text-[#59636E] opacity-0 group-hover:opacity-100 transition-opacity">Jump to</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="px-4 py-2 border-t border-[#d0d7de]">
                  <h3 className="text-xs font-semibold text-[#59636E] mb-1">Code</h3>
                  <div className="space-y-1">
                    <div onClick={() => handleCodeClick()} className="flex justify-between items-center group cursor-pointer hover:bg-[#f3f4f6] -mx-2 px-2 py-2 rounded-md transition-colors">
                      <div className="flex items-start gap-3">
                        <FileText className="w-4 h-4 text-[#59636e] mt-0.5" />
                        <div className="flex flex-col">
                          <span className="text-sm text-[#1F2328] group-hover:text-[#0969da]">README.md</span>
                          <span className="text-xs text-[#59636E]">{username}/{repos[0]?.name || 'Github'}</span>
                        </div>
                      </div>
                      <span className="text-xs text-[#59636E] opacity-0 group-hover:opacity-100 transition-opacity">Jump to</span>
                    </div>

                    <div onClick={() => handleCodeClick()} className="flex justify-between items-center group cursor-pointer hover:bg-[#f3f4f6] -mx-2 px-2 py-2 rounded-md transition-colors">
                      <div className="flex items-start gap-3">
                        <FileCode2 className="w-4 h-4 text-[#59636e] mt-0.5" />
                        <div className="flex flex-col">
                          <span className="text-sm text-[#1F2328] group-hover:text-[#0969da]">App.jsx</span>
                          <span className="text-xs text-[#59636E]">{username}/{repos[0]?.name || 'Github'} • src/</span>
                        </div>
                      </div>
                      <span className="text-xs text-[#59636E] opacity-0 group-hover:opacity-100 transition-opacity">Jump to</span>
                    </div>
                  </div>
                </div>
              </>
            )}

          </div>

          <div className="px-4 py-3 border-t border-[#d0d7de] bg-white flex justify-between items-center">
            <span className="text-xs text-[#0969da] hover:underline cursor-pointer">Search syntax tips</span>
            <span className="text-xs text-[#59636e] hover:text-[#0969da] cursor-pointer">Give feedback</span>
          </div>
        </div>
      </div>
    </div>
  );
}