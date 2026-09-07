import { useState, useEffect } from 'react';
import { useGitHub } from '@contexts/GitHubContext';
import { apiClient } from '@services/apiClient';
import { Link } from 'react-router-dom';
import { CodeSquareIcon, LockIcon, PlusIcon } from '@primer/octicons-react';
import Navbar from '@components/layout/Navbar';
import MarkdownRenderer from '@components/common/MarkdownRenderer';

const GistsPage = () => {
  const { user } = useGitHub();
  const [gists, setGists] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Gist Form
  const [showNew, setShowNew] = useState(false);
  const [description, setDescription] = useState('');
  const [filename, setFilename] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchGists();
  }, [user]);

  const fetchGists = async () => {
    try {
      setLoading(true);
      const endpoint = user ? '/gists/user' : '/gists/public';
      const res = await apiClient(endpoint);
      setGists(res?.data?.data || res?.data || []);
    } catch (err) {
      console.error('Failed to fetch gists', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!content) return alert('Content is required');
    
    try {
      setSaving(true);
      const res = await apiClient('/gists', {
        method: 'POST',
        body: JSON.stringify({
          description,
          public: isPublic,
          files: [{ filename, content, language: 'markdown' }]
        })
      });
      
      if (res?.data) {
        setGists([res.data, ...gists]);
        setShowNew(false);
        setDescription('');
        setFilename('');
        setContent('');
      }
    } catch (err) {
      alert(err.message || 'Failed to create gist');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FA] dark:bg-[#0d1117]">
      <Navbar />
      
      <div className="max-w-[1012px] mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-normal text-[#1f2328] dark:text-white">
            {user ? 'Your Gists' : 'Discover Gists'}
          </h1>
          {user && !showNew && (
            <button 
              onClick={() => setShowNew(true)}
              className="px-3 py-1.5 bg-[#2da44e] text-white text-sm font-semibold rounded-md hover:bg-[#2c974b] flex items-center gap-2"
            >
              <PlusIcon /> New Gist
            </button>
          )}
        </div>

        {showNew && (
          <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md mb-8">
            <div className="p-4 border-b border-[#d0d7de] dark:border-[#30363d]">
              <input 
                type="text" 
                placeholder="Gist description..." 
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-sm outline-none"
              />
            </div>
            
            <div className="p-4">
              <div className="flex gap-4 mb-2">
                <input 
                  type="text" 
                  placeholder="Filename including extension..." 
                  value={filename}
                  onChange={e => setFilename(e.target.value)}
                  className="w-1/3 px-3 py-1.5 bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-sm outline-none"
                />
              </div>
              
              <textarea 
                rows={10}
                placeholder="File contents..."
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full px-3 py-2 bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-sm outline-none font-mono"
              />
              
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={!isPublic}
                    onChange={e => setIsPublic(!e.target.checked)}
                    id="secret-gist"
                  />
                  <label htmlFor="secret-gist" className="text-sm text-[#1f2328] dark:text-white flex items-center gap-1">
                    <LockIcon size={14} /> Secret Gist
                  </label>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowNew(false)}
                    className="px-4 py-1.5 bg-[#f6f8fa] dark:bg-[#21262d] text-[#24292f] dark:text-[#c9d1d9] border border-[#d0d7de] dark:border-[#30363d] text-sm font-semibold rounded-md hover:bg-[#f3f4f6] transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCreate}
                    disabled={saving}
                    className="px-4 py-1.5 bg-[#2da44e] text-white text-sm font-semibold rounded-md hover:bg-[#2c974b] transition-colors"
                  >
                    {saving ? 'Creating...' : 'Create Gist'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-10 text-[#57606a]">Loading gists...</div>
        ) : gists.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md">
            <CodeSquareIcon size={48} className="text-[#d0d7de] dark:text-[#30363d] mb-4" />
            <h3 className="text-lg font-semibold text-[#1f2328] dark:text-white">You don't have any gists yet.</h3>
            <p className="text-[#57606a] dark:text-[#8b949e] mt-1">Your snippets and pastes will appear here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {gists.map(gist => (
              <div key={gist._id} className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md overflow-hidden">
                <div className="p-3 border-b border-[#d0d7de] dark:border-[#30363d] flex items-center justify-between bg-[#f6f8fa] dark:bg-[#0d1117]">
                  <div className="flex items-center gap-2">
                    <img src={gist.owner.avatar_url || `https://github.com/identicons/${gist.owner.login}.png`} alt="" className="w-6 h-6 rounded-full" />
                    <Link to={`/${gist.owner.login}`} className="text-[#0969da] hover:underline font-semibold text-sm">
                      {gist.owner.login}
                    </Link>
                    <span className="text-[#57606a] dark:text-[#8b949e]">/</span>
                    <span className="text-[#0969da] font-semibold text-sm">
                      {gist.files[0]?.filename}
                    </span>
                    {!gist.public && <LockIcon size={14} className="text-[#57606a] dark:text-[#8b949e] ml-1" />}
                  </div>
                  <span className="text-xs text-[#57606a] dark:text-[#8b949e]">
                    Created {new Date(gist.created_at).toLocaleDateString()}
                  </span>
                </div>
                {gist.description && (
                  <div className="p-3 text-sm text-[#57606a] dark:text-[#8b949e] border-b border-[#d0d7de] dark:border-[#30363d]">
                    {gist.description}
                  </div>
                )}
                <div className="p-4 text-sm font-mono overflow-x-auto max-h-[300px]">
                  <pre className="text-[#1f2328] dark:text-[#c9d1d9] whitespace-pre-wrap">
                    {gist.files[0]?.content}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GistsPage;
