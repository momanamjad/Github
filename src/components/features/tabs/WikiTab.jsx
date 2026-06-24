import { useState, useEffect } from 'react';
import { getWikiPages, getWikiPage, saveWikiPage, deleteWikiPage } from '../../../services/GithubApi.jsx';
import MarkdownRenderer from '../../common/MarkdownRenderer';
import { Book, Plus, Edit, Trash2, Save, FileText, ChevronRight } from 'lucide-react';

export default function WikiTab({ repoId, isOwner }) {
  const [pages, setPages] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState('home');
  const [currentPage, setCurrentPage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchPages = async (selectSlugAfterFetch = null) => {
    try {
      const pageList = await getWikiPages(repoId);
      setPages(pageList);
      
      // Determine which slug to select
      let slugToSelect = selectSlugAfterFetch || selectedSlug;
      if (pageList.length > 0 && !selectSlugAfterFetch) {
        // If 'home' page exists, default to it, otherwise default to the first page
        const hasHome = pageList.some(p => p.slug === 'home');
        slugToSelect = hasHome ? 'home' : pageList[0].slug;
      }
      
      if (slugToSelect && pageList.some(p => p.slug === slugToSelect)) {
        setSelectedSlug(slugToSelect);
        loadPage(slugToSelect);
      } else {
        setCurrentPage(null);
      }
    } catch (err) {
      console.error('Failed to fetch wiki pages:', err);
    }
  };

  const loadPage = async (slug) => {
    setLoading(true);
    try {
      const pageData = await getWikiPage(repoId, slug);
      setCurrentPage(pageData);
      setTitle(pageData?.title || '');
      setContent(pageData?.content || '');
    } catch (err) {
      console.error('Failed to load wiki page:', err);
      setCurrentPage(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [repoId]);

  const handleSelectPage = (slug) => {
    setEditMode(false);
    setIsCreating(false);
    setSelectedSlug(slug);
    loadPage(slug);
  };

  const handleStartCreate = () => {
    setIsCreating(true);
    setEditMode(true);
    setTitle('');
    setContent('');
  };

  const handleStartEdit = () => {
    setIsCreating(false);
    setEditMode(true);
    setTitle(currentPage?.title || '');
    setContent(currentPage?.content || '');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      const saved = await saveWikiPage(repoId, title, content);
      setEditMode(false);
      setIsCreating(false);
      await fetchPages(saved.slug);
    } catch (err) {
      console.error('Failed to save wiki page:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete the wiki page "${currentPage?.title}"?`)) return;
    try {
      await deleteWikiPage(repoId, currentPage.slug);
      setEditMode(false);
      setIsCreating(false);
      // Select another page if available
      const remaining = pages.filter(p => p.slug !== currentPage.slug);
      const nextSlug = remaining.length > 0 ? remaining[0].slug : null;
      await fetchPages(nextSlug);
    } catch (err) {
      console.error('Failed to delete wiki page:', err);
    }
  };

  if (editMode) {
    return (
      <div className="max-w-4xl mx-auto py-4 text-left">
        <div className="flex items-center justify-between border-b border-[#d0d7de] dark:border-[#30363d] pb-2 mb-4">
          <h2 className="text-xl font-semibold text-[#1f2328] dark:text-white">
            {isCreating ? 'Create new wiki page' : `Edit ${currentPage?.title}`}
          </h2>
          <button
            onClick={() => { setEditMode(false); setIsCreating(false); }}
            className="px-3 py-1.5 border border-[#d0d7de] dark:border-[#30363d] rounded bg-[#f6f8fa] dark:bg-[#21262d] text-xs font-semibold text-[#24292f] dark:text-[#c9d1d9] hover:bg-gray-100 dark:hover:bg-[#30363d] cursor-pointer"
          >
            Cancel
          </button>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Page Title</label>
            <input
              type="text"
              required
              disabled={!isCreating} // slugs are immutable on edit to preserve page URLs
              placeholder="e.g. Home, Getting Started"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-[#d0d7de] dark:border-[#30363d] rounded-md bg-white dark:bg-[#161b22] text-[#1f2328] dark:text-[#c9d1d9] focus:outline-none focus:ring-1 focus:ring-[#0969da] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Content (Markdown supported)</label>
            <textarea
              placeholder="Write page content in markdown format..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-96 px-3 py-2 border border-[#d0d7de] dark:border-[#30363d] rounded-md bg-white dark:bg-[#161b22] text-[#1f2328] dark:text-[#c9d1d9] focus:outline-none focus:ring-1 focus:ring-[#0969da] font-mono text-sm resize-y"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#2da44e] hover:bg-[#2c974b] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer border-0 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Page'}</span>
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-4 text-left">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column: Wiki Content */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="py-20 text-center text-sm text-[#57606a]">Loading page...</div>
          ) : currentPage ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between border-b border-[#d0d7de] dark:border-[#30363d] pb-2 gap-3">
                <div className="flex items-center gap-2">
                  <Book className="w-5 h-5 text-[#57606a]" />
                  <h1 className="text-2xl font-semibold text-[#1f2328] dark:text-white">
                    {currentPage.title}
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#57606a] dark:text-[#8b949e]">
                    Last updated by <span className="font-semibold">{currentPage.author?.login || 'unknown'}</span>
                  </span>
                  {isOwner && (
                    <>
                      <button
                        onClick={handleStartEdit}
                        className="flex items-center gap-1 p-1.5 border border-[#d0d7de] dark:border-[#30363d] rounded bg-[#f6f8fa] dark:bg-[#21262d] text-xs font-semibold text-[#24292f] dark:text-[#c9d1d9] hover:bg-gray-100 dark:hover:bg-[#30363d] cursor-pointer"
                        title="Edit page"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={handleDelete}
                        className="flex items-center gap-1 p-1.5 border border-[#d0d7de] dark:border-[#30363d] rounded bg-[#f6f8fa] dark:bg-[#21262d] text-xs font-semibold text-[#cf222e] hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                        title="Delete page"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="bg-white dark:bg-[#0d1117] p-6 border border-[#d0d7de] dark:border-[#30363d] rounded-lg prose max-w-none dark:prose-invert">
                <MarkdownRenderer content={currentPage.content || '*No content.*'} />
              </div>
            </div>
          ) : (
            <div className="py-20 text-center border border-dashed border-[#d0d7de] dark:border-[#30363d] rounded-lg bg-[#f6f8fa] dark:bg-[#161b22] px-4">
              <Book className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-[#1f2328] dark:text-white mb-1">Welcome to the wiki!</h3>
              <p className="text-sm text-[#57606a] dark:text-[#8b949e] max-w-md mx-auto mb-4">
                Wikis provide a place in your repository to share details about your project, tutorials, and document configurations.
              </p>
              {isOwner && (
                <button
                  onClick={handleStartCreate}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#2da44e] hover:bg-[#2c974b] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer border-0 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create the first page</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Sidebar Navigation */}
        <div className="w-full md:w-64 shrink-0 space-y-4">
          <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-lg bg-[#f6f8fa] dark:bg-[#161b22] p-4">
            <div className="flex items-center justify-between mb-3 border-b border-[#d0d7de] dark:border-[#30363d] pb-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pages</h3>
              {isOwner && pages.length > 0 && (
                <button
                  onClick={handleStartCreate}
                  className="p-1 hover:bg-[#ebedf0] dark:hover:bg-[#30363d] rounded cursor-pointer text-gray-600 dark:text-gray-300 border-0 bg-transparent"
                  title="Create page"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
            {pages.length === 0 ? (
              <div className="text-xs text-gray-500 italic py-2">No pages found.</div>
            ) : (
              <ul className="space-y-1">
                {pages.map(p => (
                  <li key={p.slug}>
                    <button
                      onClick={() => handleSelectPage(p.slug)}
                      className={`w-full flex items-center justify-between text-left px-2.5 py-1.5 rounded text-xs font-semibold cursor-pointer border-0 bg-transparent hover:bg-[#eaeef2] dark:hover:bg-[#21262d] ${selectedSlug === p.slug ? 'text-[#0969da] dark:text-[#58a6ff] bg-white dark:bg-[#0d1117] shadow-sm border border-[#d0d7de] dark:border-[#30363d]' : 'text-gray-700 dark:text-gray-300'}`}
                    >
                      <span className="truncate flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                        {p.title}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-50" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
