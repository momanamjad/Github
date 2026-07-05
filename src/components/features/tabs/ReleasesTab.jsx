import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../services/apiClient';
import { TagIcon, TrashIcon, DownloadIcon, PlusIcon, InfoIcon } from '@primer/octicons-react';
import MarkdownRenderer from '../../common/MarkdownRenderer';
import { useGitHub } from '../../../contexts/GitHubContext';

export default function ReleasesTab({ repoId, isOwner }) {
  const { user } = useGitHub();
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDrafting, setIsDrafting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New release form states
  const [tagName, setTagName] = useState("");
  const [releaseName, setReleaseName] = useState("");
  const [releaseBody, setReleaseBody] = useState("");
  const [assets, setAssets] = useState([]); // Array of { name, size, downloadUrl }
  const [isPrerelease, setIsPrerelease] = useState(false);

  // Asset file upload state (mock helper)
  const [assetNameInput, setAssetNameInput] = useState("");
  const [assetSizeInput, setAssetSizeInput] = useState("1048576"); // 1MB default

  const fetchReleases = async () => {
    try {
      setLoading(true);
      const res = await apiClient(`/repos/${repoId}/releases`);
      if (res?.data) {
        setReleases(res.data);
      }
    } catch (err) {
      console.error("Failed to load releases:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (repoId) {
      fetchReleases();
    }
  }, [repoId]);

  const handleAddAsset = (e) => {
    e.preventDefault();
    if (!assetNameInput.trim()) return;
    
    const size = parseInt(assetSizeInput) || 0;
    const downloadUrl = `https://github-kappa-two.vercel.app/uploads/${encodeURIComponent(assetNameInput)}`;
    
    setAssets(prev => [...prev, { name: assetNameInput.trim(), size, downloadUrl }]);
    setAssetNameInput("");
  };

  const handleRemoveAsset = (idx) => {
    setAssets(prev => prev.filter((_, i) => i !== idx));
  };

  const handlePublishRelease = async (e) => {
    e.preventDefault();
    if (!tagName.trim() || !releaseName.trim()) return;

    setSubmitting(true);
    try {
      const res = await apiClient(`/repos/${repoId}/releases`, {
        method: 'POST',
        body: JSON.stringify({
          tagName: tagName.trim(),
          name: releaseName.trim(),
          body: releaseBody,
          assets,
          isPrerelease
        })
      });

      if (res?.success) {
        setReleases(prev => [res.data, ...prev]);
        setIsDrafting(false);
        // Clear inputs
        setTagName("");
        setReleaseName("");
        setReleaseBody("");
        setAssets([]);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to publish release: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRelease = async (id) => {
    if (!window.confirm("Are you sure you want to delete this release?")) return;
    try {
      const res = await apiClient(`/repos/${repoId}/releases/${id}`, { method: 'DELETE' });
      if (res?.success) {
        setReleases(prev => prev.filter(r => r._id !== id));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete release: " + err.message);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return <div className="text-center py-12 text-xs text-[#57606a]">Loading releases...</div>;
  }

  return (
    <div className="py-4 text-left max-w-4xl mx-auto space-y-6">
      {/* Header section */}
      <div className="flex items-center justify-between border-b border-[#d0d7de] dark:border-[#30363d] pb-3">
        <div>
          <h2 className="text-sm font-bold text-[#1f2328] dark:text-white">Releases</h2>
          <p className="text-[11px] text-[#57606a] dark:text-[#8b949e]">Tags, versions, and build asset downloads</p>
        </div>
        {isOwner && (
          <button
            onClick={() => setIsDrafting(!isDrafting)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold rounded border-0 cursor-pointer"
          >
            {isDrafting ? "Cancel" : (
              <>
                <PlusIcon size={14} />
                <span>Draft a new release</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Release Form (Drafting Mode) */}
      {isDrafting && (
        <form onSubmit={handlePublishRelease} className="border border-[#d0d7de] dark:border-[#30363d] rounded-md bg-[#f6f8fa] dark:bg-[#161b22] p-4 space-y-4 text-xs font-sans">
          <h3 className="font-semibold text-sm text-[#24292f] dark:text-white">Draft a new release</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1.5 text-gray-700 dark:text-gray-300">Choose a tag (e.g. v1.0.0)</label>
              <input
                type="text"
                required
                placeholder="v1.0.0"
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-xs outline-none"
              />
            </div>
            <div>
              <label className="block font-medium mb-1.5 text-gray-700 dark:text-gray-300">Release title</label>
              <input
                type="text"
                required
                placeholder="Initial Stable Release"
                value={releaseName}
                onChange={(e) => setReleaseName(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-xs outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1.5 text-gray-700 dark:text-gray-300">Describe this release (Release Notes)</label>
            <textarea
              placeholder="What's changed in this release? Supports markdown."
              rows={5}
              value={releaseBody}
              onChange={(e) => setReleaseBody(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-xs outline-none font-mono"
            />
          </div>

          {/* Preset templates Helper */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setReleaseBody(`## Changelog\n\n- Write features here...\n- Write bugfixes here...\n\n**Full Changelog**: https://github-kappa-two.vercel.app/compare/v0.9.0...${tagName || 'v1.0.0'}`)}
              className="px-2 py-1 bg-white dark:bg-[#21262d] border border-[#d0d7de] dark:border-[#30363d] text-[#57606a] dark:text-[#c9d1d9] rounded cursor-pointer font-semibold hover:bg-gray-100"
            >
              Load Changelog Template
            </button>
          </div>

          {/* Add Mock Assets */}
          <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] p-3 space-y-3">
            <h4 className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <DownloadIcon size={14} />
              Attach build binaries / files
            </h4>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="build-assets.zip"
                value={assetNameInput}
                onChange={(e) => setAssetNameInput(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded text-xs outline-none"
              />
              <select
                value={assetSizeInput}
                onChange={(e) => setAssetSizeInput(e.target.value)}
                className="px-2 py-1 bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded text-xs cursor-pointer"
              >
                <option value="524288">512 KB</option>
                <option value="1048576">1 MB</option>
                <option value="5242880">5 MB</option>
                <option value="10485760">10 MB</option>
                <option value="52428800">50 MB</option>
              </select>
              <button
                type="button"
                onClick={handleAddAsset}
                className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-[#21262d] dark:hover:bg-[#30363d] border border-[#d0d7de] dark:border-[#30363d] rounded font-semibold cursor-pointer"
              >
                Add File
              </button>
            </div>

            {/* Assets List */}
            {assets.length > 0 && (
              <div className="divide-y divide-[#d0d7de] dark:divide-[#30363d] border border-[#d0d7de] dark:border-[#30363d] rounded bg-[#f6f8fa] dark:bg-[#161b22]">
                {assets.map((asset, index) => (
                  <div key={index} className="px-3 py-2 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-gray-400">📄</span>
                      <span className="font-mono text-gray-700 dark:text-gray-300 truncate">{asset.name}</span>
                      <span className="text-gray-400 font-semibold">({formatBytes(asset.size)})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAsset(index)}
                      className="text-red-500 hover:text-red-700 bg-transparent border-0 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pre-release options */}
          <label className="flex items-center gap-2 cursor-pointer font-semibold text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={isPrerelease}
              onChange={(e) => setIsPrerelease(e.target.checked)}
              className="rounded accent-purple-600"
            />
            <span>Set as a pre-release (marks this release as unstable)</span>
          </label>

          <div className="flex justify-end gap-2 border-t border-[#d0d7de] dark:border-[#30363d] pt-3">
            <button
              type="button"
              onClick={() => setIsDrafting(false)}
              className="px-3 py-1.5 border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 rounded bg-white dark:bg-[#21262d] hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-3.5 py-1.5 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white font-semibold rounded cursor-pointer border-0"
            >
              {submitting ? "Publishing..." : "Publish release"}
            </button>
          </div>
        </form>
      )}

      {/* Releases list timeline view */}
      <div className="space-y-6">
        {releases.map(release => (
          <div key={release._id || release.id} className="flex gap-4">
            {/* Timeline Left Gutter Icon */}
            <div className="hidden sm:flex flex-col items-center shrink-0">
              <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 flex items-center justify-center text-purple-600">
                <TagIcon size={16} />
              </div>
              <div className="w-0.5 h-full bg-[#d0d7de]/50 dark:bg-[#30363d]/50 mt-2"></div>
            </div>

            {/* Release Card Main Body (styled exactly like GitHub) */}
            <div className="flex-1 border border-[#d0d7de] dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] overflow-hidden">
              <div className="bg-[#f6f8fa] dark:bg-[#161b22] px-4 py-3 border-b border-[#d0d7de] dark:border-[#30363d] flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-[#0969da] dark:text-[#58a6ff] bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 rounded-full flex items-center gap-1 border border-blue-200/40">
                    <TagIcon size={12} />
                    {release.tagName}
                  </span>
                  {release.isPrerelease && (
                    <span className="px-2 py-0.5 rounded-full bg-[#fff8c5] dark:bg-[#6e4e00]/20 text-[#9e6a03] dark:text-[#f2cc60] font-bold text-[10px] border border-yellow-200/40 uppercase">
                      Pre-release
                    </span>
                  )}
                  <span className="text-gray-400">·</span>
                  <img
                    src={release.author?.avatar_url || "/profile.webp"}
                    alt="avatar"
                    className="w-4 h-4 rounded-full border object-cover"
                  />
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{release.author?.login || 'system'}</span>
                  <span className="text-[#57606a] dark:text-[#8b949e]">released this on {new Date(release.createdAt || release.created_at).toLocaleDateString()}</span>
                </div>
                {isOwner && (
                  <button
                    onClick={() => handleDeleteRelease(release._id || release.id)}
                    className="p-1 text-red-500 hover:text-red-700 bg-transparent border-0 cursor-pointer"
                    title="Delete release"
                  >
                    <TrashIcon size={14} />
                  </button>
                )}
              </div>

              {/* Contents & Notes */}
              <div className="p-4 space-y-4">
                <h3 className="text-md sm:text-lg font-bold text-[#1f2328] dark:text-white text-left">
                  {release.name}
                </h3>

                <div className="prose dark:prose-invert text-xs sm:text-sm text-gray-800 dark:text-gray-200">
                  {release.body ? (
                    <MarkdownRenderer content={release.body} />
                  ) : (
                    <i className="text-gray-400 text-xs">No description provided.</i>
                  )}
                </div>

                <hr className="border-[#d0d7de] dark:border-[#30363d]" />

                {/* Assets / Downloads */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Assets</h4>
                  <div className="divide-y divide-[#d0d7de]/50 dark:divide-[#30363d]/50 border border-[#d0d7de]/50 dark:border-[#30363d]/50 rounded bg-[#f6f8fa]/30 dark:bg-transparent">
                    {/* Source Code downloads */}
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); alert("Mock download started: Source code (zip)"); }}
                      className="px-3.5 py-2 flex items-center justify-between text-xs hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors font-semibold text-[#0969da] dark:text-[#58a6ff] no-underline"
                    >
                      <span className="flex items-center gap-2">
                        📦 <span>Source code (zip)</span>
                      </span>
                      <span className="text-gray-400 font-normal">zip</span>
                    </a>

                    {/* Custom assets downloads */}
                    {release.assets?.map((asset, idx) => (
                      <a
                        key={idx}
                        href="#"
                        onClick={(e) => { e.preventDefault(); alert(`Mock download started: ${asset.name}`); }}
                        className="px-3.5 py-2 flex items-center justify-between text-xs hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors font-semibold text-[#0969da] dark:text-[#58a6ff] no-underline"
                      >
                        <span className="flex items-center gap-2">
                          📄 <span>{asset.name}</span>
                        </span>
                        <span className="text-gray-400 font-semibold">{formatBytes(asset.size)}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {releases.length === 0 && (
          <div className="border border-dashed border-[#d0d7de] dark:border-[#30363d] rounded-lg p-12 text-center text-gray-400 text-xs">
            <TagIcon size={24} className="mb-2" />
            <p>No releases found. Version releases represent stable builds of your repository.</p>
          </div>
        )}
      </div>
    </div>
  );
}
