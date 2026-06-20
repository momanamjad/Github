import React, { useState, useEffect } from 'react';
import { PackageIcon, SearchIcon, StarIcon, DownloadIcon, CodeIcon, FilterIcon, GraphIcon, PlusIcon, XIcon, GlobeIcon, TerminalIcon } from '@primer/octicons-react';
import { apiClient } from '../services/apiClient';
import { useGitHub } from '../contexts/GitHubContext';

const MCPRegistry = () => {
  const { user } = useGitHub();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('stdio');
  const [command, setCommand] = useState('');
  const [argsInput, setArgsInput] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('tools');
  const [registering, setRegistering] = useState(false);

  const categories = [
    { id: 'all', label: 'All packages' },
    { id: 'ai', label: 'AI & ML' },
    { id: 'data', label: 'Data processing' },
    { id: 'web', label: 'Web frameworks' },
    { id: 'tools', label: 'Developer tools' },
    { id: 'testing', label: 'Testing' },
    { id: 'security', label: 'Security' }
  ];

  const fetchServers = async () => {
    try {
      setLoading(true);
      let queryUrl = `/mcp?category=${selectedCategory}`;
      if (searchQuery.trim()) {
        queryUrl += `&q=${encodeURIComponent(searchQuery.trim())}`;
      }
      const res = await apiClient(queryUrl);
      if (res && res.data) {
        setServers(res.data);
      }
    } catch (err) {
      console.error('Failed to load MCP servers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServers();
  }, [selectedCategory, searchQuery]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setRegistering(true);
    try {
      const args = argsInput.split(',').map(s => s.trim()).filter(Boolean);
      await apiClient('/mcp', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          description,
          type,
          command,
          args,
          url,
          category
        })
      });
      setShowRegisterModal(false);
      // Reset form
      setName('');
      setDescription('');
      setType('stdio');
      setCommand('');
      setArgsInput('');
      setUrl('');
      setCategory('tools');
      await fetchServers();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to register MCP server');
    } finally {
      setRegistering(false);
    }
  };

  const handleStar = async (serverId) => {
    if (!user) {
      alert('Please log in to star MCP servers.');
      return;
    }
    try {
      const res = await apiClient(`/mcp/${serverId}/star`, { method: 'POST' });
      if (res && res.data) {
        setServers(prev => prev.map(s => s._id === serverId ? { ...s, starsCount: res.data.starsCount, isStarred: res.data.isStarred } : s));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117] text-[#1f2328] dark:text-[#c9d1d9] text-left transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <PackageIcon size={32} className="text-purple-600 dark:text-purple-400" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">MCP Registry</h1>
            </div>
            <p className="text-lg text-[#57606a] dark:text-[#8b949e]">
              Discover and share Model Context Protocol servers
            </p>
          </div>
          {user && (
            <button
              onClick={() => setShowRegisterModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#2da44f] hover:bg-[#2c974b] text-white rounded-md text-sm font-semibold border-0 cursor-pointer transition-colors"
            >
              <PlusIcon size={16} />
              Register server
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-2xl">
            <SearchIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-[#8b949e]" />
            <input
              type="text"
              placeholder="Search MCP servers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-[#30363d] rounded-lg bg-white dark:bg-[#161b22] text-[#1f2328] dark:text-[#c9d1d9] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            />
          </div>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <PackageIcon size={32} className="text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-200">{servers.length}</p>
                <p className="text-sm text-purple-700 dark:text-purple-300">Total servers registered</p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <DownloadIcon size={32} className="text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">
                  {servers.reduce((sum, s) => sum + (s.downloads || 0), 0)}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">Total downloads</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <GraphIcon size={32} className="text-green-600 dark:text-green-400" />
              <div>
                <p className="text-2xl font-bold text-green-900 dark:text-green-200">
                  {servers.reduce((sum, s) => sum + (s.starsCount || 0), 0)}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">Total stars</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar categories */}
          <div className="lg:col-span-1">
            <div className="border border-gray-300 dark:border-[#30363d] rounded-lg p-4 bg-white dark:bg-[#161b22]">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Categories</h3>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm border-0 cursor-pointer transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 font-semibold'
                        : 'bg-transparent text-gray-700 dark:text-[#8b949e] hover:bg-gray-100 dark:hover:bg-[#30363d]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main List */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4 border-b border-gray-200 dark:border-[#30363d] pb-2">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Showing {servers.length} {servers.length === 1 ? 'server' : 'servers'}
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12 text-sm text-[#57606a] dark:text-[#8b949e]">Loading registered MCP servers...</div>
            ) : servers.length === 0 ? (
              <div className="text-center py-12 border border-gray-300 dark:border-[#30363d] border-dashed rounded-lg bg-gray-50 dark:bg-[#161b22] text-sm text-gray-500 dark:text-[#8b949e]">
                No MCP servers found in this category. Register one to share it!
              </div>
            ) : (
              <div className="space-y-4">
                {servers.map((server) => (
                  <div
                    key={server._id}
                    className="border border-gray-300 dark:border-[#30363d] rounded-lg p-6 hover:shadow-md transition-shadow bg-white dark:bg-[#161b22]"
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-2 mb-2">
                          <PackageIcon size={18} className="text-purple-600 dark:text-purple-400" />
                          <h3 className="text-base font-bold text-[#0969da] dark:text-[#58a6ff] hover:underline">
                            {server.name}
                          </h3>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#30363d]">
                            {server.type === 'sse' ? <GlobeIcon size={12} className="mr-1" /> : <TerminalIcon size={12} className="mr-1" />}
                            {server.type}
                          </span>
                        </div>

                        <p className="text-xs text-[#57606a] dark:text-[#8b949e] mb-2">
                          registered by <span className="font-semibold">{server.creator?.login || 'unknown'}</span>
                        </p>

                        {server.description && (
                          <p className="text-sm text-[#24292f] dark:text-[#c9d1d9] mb-3">{server.description}</p>
                        )}

                        {server.type === 'stdio' && server.command && (
                          <div className="bg-gray-50 dark:bg-[#0d1117] p-2.5 rounded font-mono text-[11px] text-gray-700 dark:text-gray-300 mb-3 border border-gray-200 dark:border-[#30363d]">
                            <code>{server.command} {server.args?.join(' ')}</code>
                          </div>
                        )}

                        {server.type === 'sse' && server.url && (
                          <div className="bg-gray-50 dark:bg-[#0d1117] p-2.5 rounded font-mono text-[11px] text-gray-700 dark:text-gray-300 mb-3 border border-gray-200 dark:border-[#30363d]">
                            <code>SSE URL: {server.url}</code>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-xs text-[#57606a] dark:text-[#8b949e] mt-2">
                          <button
                            onClick={() => handleStar(server._id)}
                            className={`flex items-center gap-1 bg-transparent border-0 cursor-pointer ${server.isStarred ? 'text-yellow-600 font-bold' : 'text-gray-500 hover:text-yellow-600'}`}
                          >
                            <StarIcon size={14} className={server.isStarred ? 'text-yellow-500 fill-yellow-500' : ''} />
                            {server.starsCount || 0}
                          </button>
                          <span>{server.downloads || 0} downloads</span>
                          <span>Category: <span className="font-semibold capitalize">{server.category}</span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#161b22] border border-gray-300 dark:border-[#30363d] rounded-lg max-w-lg w-full overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#30363d]">
              <h3 className="font-bold text-gray-900 dark:text-white">Register MCP Server</h3>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="bg-transparent border-0 cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <XIcon size={16} />
              </button>
            </div>
            <form onSubmit={handleRegister} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#30363d] rounded bg-white dark:bg-[#0d1117] text-gray-900 dark:text-white focus:outline-none"
                  placeholder="e.g. filesystem-server"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#30363d] rounded bg-white dark:bg-[#0d1117] text-gray-900 dark:text-white focus:outline-none h-20"
                  placeholder="What does this server do?"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#30363d] rounded bg-white dark:bg-[#0d1117] text-gray-900 dark:text-white focus:outline-none"
                >
                  <option value="tools">Developer Tools</option>
                  <option value="ai">AI & ML</option>
                  <option value="data">Data Processing</option>
                  <option value="web">Web Frameworks</option>
                  <option value="testing">Testing</option>
                  <option value="security">Security</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Connection Type</label>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input
                      type="radio"
                      name="mcp_type"
                      checked={type === 'stdio'}
                      onChange={() => setType('stdio')}
                    />
                    Stdio (Command line execution)
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input
                      type="radio"
                      name="mcp_type"
                      checked={type === 'sse'}
                      onChange={() => setType('sse')}
                    />
                    SSE (Server Sent Events endpoint)
                  </label>
                </div>
              </div>
              
              {type === 'stdio' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Command *</label>
                    <input
                      type="text"
                      required={type === 'stdio'}
                      value={command}
                      onChange={e => setCommand(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-[#30363d] rounded bg-white dark:bg-[#0d1117] text-gray-900 dark:text-white focus:outline-none"
                      placeholder="e.g. npx"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Args (comma-separated)</label>
                    <input
                      type="text"
                      value={argsInput}
                      onChange={e => setArgsInput(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-[#30363d] rounded bg-white dark:bg-[#0d1117] text-gray-900 dark:text-white focus:outline-none"
                      placeholder="e.g. -y, @modelcontextprotocol/server-filesystem, /path"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">SSE Connection URL *</label>
                  <input
                    type="url"
                    required={type === 'sse'}
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#30363d] rounded bg-white dark:bg-[#0d1117] text-gray-900 dark:text-white focus:outline-none"
                    placeholder="e.g. http://localhost:3001/mcp"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-[#30363d] rounded text-sm font-semibold bg-white dark:bg-[#21262d] text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registering}
                  className="px-4 py-2 bg-[#2da44f] hover:bg-[#2c974b] text-white rounded text-sm font-semibold border-0 cursor-pointer"
                >
                  {registering ? 'Registering...' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MCPRegistry;
