import { useState, useEffect } from "react";
import { apiClient } from "@services/apiClient.js";
import { useGitHub } from "@contexts/GitHubContext";
import { PackageIcon, DownloadIcon } from "@primer/octicons-react";

const PackagesTab = ({ repoData }) => {
  const { user } = useGitHub();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  // New package form (simple upload for now)
  const [showUpload, setShowUpload] = useState(false);
  const [name, setName] = useState('');
  const [version, setVersion] = useState('');
  const [desc, setDesc] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, [repoData]);

  const fetchPackages = async () => {
    if (!repoData) return;
    try {
      setLoading(true);
      const res = await apiClient(`/packages/repo/${repoData._id || repoData.id}`);
      setPackages(res?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select a package file');
    
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('name', name);
      formData.append('version', version);
      formData.append('description', desc);
      formData.append('repoId', repoData._id || repoData.id);
      formData.append('packageType', 'npm');
      formData.append('file', file);

      // Using fetch directly because apiClient sends application/json usually
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/packages/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      
      alert('Package uploaded successfully!');
      setShowUpload(false);
      setName('');
      setVersion('');
      setDesc('');
      setFile(null);
      fetchPackages();
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-[1012px] mx-auto py-6 text-left">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[#1f2328] dark:text-white">Packages</h2>
        {user && (repoData?.owner?._id === user.id || repoData?.owner === user.id) && (
          <button 
            onClick={() => setShowUpload(!showUpload)}
            className="px-3 py-1.5 bg-[#f6f8fa] dark:bg-[#21262d] text-[#24292f] dark:text-[#c9d1d9] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-sm font-semibold hover:bg-[#f3f4f6] transition-colors"
          >
            {showUpload ? 'Cancel' : 'Publish Package'}
          </button>
        )}
      </div>

      {showUpload && (
        <form onSubmit={handleUpload} className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md p-5 mb-8 space-y-4">
          <h3 className="font-semibold text-[#1f2328] dark:text-white">Publish a new package version</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#1f2328] dark:text-white mb-1">Package Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-1.5 bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-sm outline-none" placeholder="@org/my-package" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1f2328] dark:text-white mb-1">Version</label>
              <input type="text" required value={version} onChange={e => setVersion(e.target.value)} className="w-full px-3 py-1.5 bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-sm outline-none" placeholder="1.0.0" />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-[#1f2328] dark:text-white mb-1">Description</label>
            <input type="text" value={desc} onChange={e => setDesc(e.target.value)} className="w-full px-3 py-1.5 bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-sm outline-none" />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1f2328] dark:text-white mb-1">Package Tarball (.tgz)</label>
            <input type="file" required onChange={e => setFile(e.target.files[0])} className="w-full text-sm text-[#57606a]" />
          </div>

          <button type="submit" disabled={uploading} className="px-4 py-2 bg-[#2da44e] text-white text-sm font-semibold rounded-md hover:bg-[#2c974b] transition-colors disabled:opacity-50">
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-10 text-[#57606a]">Loading packages...</div>
      ) : packages.length === 0 ? (
        <div className="text-center py-20 bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md">
          <PackageIcon size={48} className="text-[#d0d7de] dark:text-[#30363d] mb-4" />
          <h3 className="text-lg font-semibold text-[#1f2328] dark:text-white">There are no packages yet.</h3>
          <p className="text-[#57606a] dark:text-[#8b949e] mt-1 mb-4">Learn how to publish a package to GitHub Packages.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {packages.map(pkg => (
            <div key={pkg._id} className="border border-[#d0d7de] dark:border-[#30363d] rounded-md p-4 bg-white dark:bg-[#161b22] flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-[#0969da] hover:underline cursor-pointer flex items-center gap-2">
                  <PackageIcon />
                  {pkg.name}
                </h3>
                <p className="text-sm text-[#57606a] dark:text-[#8b949e] mt-1">{pkg.description}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-[#57606a] dark:text-[#8b949e]">
                  <span>Type: <strong className="uppercase">{pkg.packageType}</strong></span>
                  <span>Latest version: <strong>{pkg.latest_version}</strong></span>
                </div>
              </div>
              <div className="text-right">
                <a 
                  href={pkg.versions[pkg.versions.length-1].tarballUrl}
                  download
                  className="px-3 py-1.5 bg-[#f6f8fa] dark:bg-[#21262d] text-[#24292f] dark:text-[#c9d1d9] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-xs font-semibold hover:bg-[#f3f4f6] flex items-center gap-2 transition-colors"
                >
                  <DownloadIcon size={14} /> Download Tarball
                </a>
                <p className="text-xs text-[#57606a] mt-2">
                  {(pkg.versions[pkg.versions.length-1].size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PackagesTab;
