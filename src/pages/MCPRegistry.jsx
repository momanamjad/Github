import React, { useState, useEffect } from 'react';
import { Package, Search, Star, Download, Code, Filter, TrendingUp, Plus, X, Globe, Terminal } from 'lucide-react';
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
    <div className="min-h-screen bg-white text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Package className="w-8 h-8 text-purple-600" />
              <h1 className="text-3xl font-bold text-gray-900">MCP Registry</h1>
            </div>
            <p className="text-lg text-gray-600">
              Discover and share Model Context Protocol servers
            </p>
          </div>
          {user && (
            <button
              onClick={() => setShowRegisterModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-md text-sm font-semibold cursor-pointer border-0 transition-colors"
            >
              <Plus size={16} />
              Register server
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search MCP servers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            />
          </div>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-purple-900">{servers.length}</p>
                <p className="text-sm text-purple-700">Total servers registered</p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <Download className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-900">
                  {servers.reduce((sum, s) => sum + (s.downloads || 0), 0)}
                </p>
                <p className="text-sm text-blue-700">Total downloads</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-900">
                  {servers.reduce((sum, s) => sum + (s.starsCount || 0), 0)}
                </p>
                <p className="text-sm text-green-700">Total stars</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar categories */}
          <div className="lg:col-span-1">
            <div className="border border-gray-300 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories</h3>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors border-0 cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-purple-50 text-purple-600 font-semibold'
                        : 'bg-transparent text-gray-700 hover:bg-gray-100'
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
            <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
              <p className="text-sm font-semibold text-gray-900">
                Showing {servers.length} {servers.length === 1 ? 'server' : 'servers'}
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12 text-sm text-gray-500">Loading registered MCP servers...</div>
            ) : servers.length === 0 ? (
              <div className="text-center py-12 border border-gray-300 border-dashed rounded-lg bg-gray-50 text-sm text-gray-500">
                No MCP servers found in this category. Register one to share it!
              </div>
            ) : (
              <div className="space-y-4">
                {servers.map((server) => (
                  <div
                    key={server._id}
                    className="border border-gray-300 rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="w-5 h-5 text-purple-600" />
                          <h3 className="text-base font-bold text-blue-600 hover:underline">
                            {server.name}
                          </h3>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                            {server.type === 'sse' ? <Globe size={10} className="mr-1" /> : <Terminal size={10} className="mr-1" />}
                            {server.type}
                          </span>
                        </div>

                        <p className="text-xs text-gray-500 mb-2">
                          registered by <span className="font-semibold">{server.creator?.login || 'unknown'}</span>
                        </p>

                        {server.description && (
                          <p className="text-sm text-gray-600 mb-3">{server.description}</p>
                        )}

                        {server.type === 'stdio' && server.command && (
                          <div className="bg-gray-50 dark:bg-gray-800 p-2.5 rounded font-mono text-[11px] text-gray-700 dark:text-gray-300 mb-3 border border-gray-200">
                            <code>{server.command} {server.args?.join(' ')}</code>
                          </div>
                        )}

                        {server.type === 'sse' && server.url && (
                          <div className="bg-gray-50 dark:bg-gray-800 p-2.5 rounded font-mono text-[11px] text-gray-700 dark:text-gray-300 mb-3 border border-gray-200">
                            <code>SSE URL: {server.url}</code>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-2">
                          <button
                            onClick={() => handleStar(server._id)}
                            className={`flex items-center gap-1 bg-transparent border-0 cursor-pointer ${server.isStarred ? 'text-yellow-600 font-bold' : 'text-gray-500 hover:text-yellow-600'}`}
                          >
                            <Star size={12} className={server.isStarred ? 'fill-yellow-600 text-yellow-600' : ''} />
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

      {/* Registration Modal Overlay */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-gray-300 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden text-left">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">Register new MCP Server</h3>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer text-base"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleRegister} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700">Server Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. @mcp/weather-server"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700">Description</label>
                <textarea
                  placeholder="What capabilities does this MCP server provide?"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-xs outline-none focus:border-blue-500"
                >
                  <option value="ai">AI & ML</option>
                  <option value="data">Data processing</option>
                  <option value="web">Web frameworks</option>
                  <option value="tools">Developer tools</option>
                  <option value="testing">Testing</option>
                  <option value="security">Security</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700">Connection Protocol</label>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center text-xs text-gray-700">
                    <input
                      type="radio"
                      name="mcpType"
                      checked={type === 'stdio'}
                      onChange={() => setType('stdio')}
                      className="mr-1.5"
                    />
                    Stdio (Local command)
                  </label>
                  <label className="flex items-center text-xs text-gray-700">
                    <input
                      type="radio"
                      name="mcpType"
                      checked={type === 'sse'}
                      onChange={() => setType('sse')}
                      className="mr-1.5"
                    />
                    SSE (Remote URL)
                  </label>
                </div>
              </div>

              {type === 'stdio' ? (
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1 space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">Command</label>
                    <input
                      type="text"
                      placeholder="e.g. npx"
                      value={command}
                      onChange={(e) => setCommand(e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-xs outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">Arguments (comma separated)</label>
                    <input
                      type="text"
                      placeholder="-y, @modelcontextprotocol/server-weather"
                      value={argsInput}
                      onChange={(e) => setArgsInput(e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-xs outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">SSE Endpoint URL *</label>
                  <input
                    type="url"
                    required={type === 'sse'}
                    placeholder="https://mcp-server.example.com/sse"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-xs outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div className="p-4 border-t border-gray-200 flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-100 rounded-md text-xs font-semibold text-gray-700 cursor-pointer bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registering}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-md text-xs font-semibold cursor-pointer border-0"
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
