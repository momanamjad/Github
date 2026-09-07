import { useEffect, useState } from "react";
import { useGitHub } from "@contexts/GitHubContext";
import { apiClient } from "@services/apiClient";
import { PeopleIcon, RepoIcon, GearIcon } from "@primer/octicons-react";
import { generateIdenticon } from "@utils/identicon";

const OrganizationDashboard = () => {
  const { user } = useGitHub();
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgLogin, setNewOrgLogin] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchOrgs = async () => {
    try {
      setLoading(true);
      const res = await apiClient(`/orgs/my-orgs`);
      if (res && res.data) {
        setOrgs(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchOrgs();
  }, [user]);

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      const res = await apiClient(`/orgs`, {
        method: "POST",
        body: JSON.stringify({
          login: newOrgLogin,
          name: newOrgName,
        })
      });
      if (res && res.data) {
        setOrgs([...orgs, res.data]);
        setShowCreateOrg(false);
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to create organization");
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-8">
      {/* Sidebar */}
      <div className="w-full lg:w-1/4">
        <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] overflow-hidden">
          <div className="p-4 border-b border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22]">
            <h2 className="text-sm font-semibold text-[#1f2328] dark:text-white">Organizations</h2>
          </div>
          <div className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
            {loading ? (
              <div className="p-4 text-center text-xs text-gray-500">Loading...</div>
            ) : orgs.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-500">You do not belong to any organizations.</div>
            ) : (
              orgs.map(org => (
                <div key={org._id} className="p-3 flex items-center gap-3 hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] cursor-pointer">
                  <img src={org.avatar_url || generateIdenticon(org.login)} alt="org avatar" className="w-8 h-8 rounded-md border" />
                  <div>
                    <div className="text-sm font-semibold text-[#1f2328] dark:text-white">{org.login}</div>
                    <div className="text-xs text-[#57606a] dark:text-[#8b949e]">Member</div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-3 border-t border-[#d0d7de] dark:border-[#30363d]">
            <button
              onClick={() => setShowCreateOrg(!showCreateOrg)}
              className="w-full text-center text-xs text-[#0969da] hover:underline cursor-pointer bg-transparent border-0"
            >
              + New Organization
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full lg:w-3/4">
        {showCreateOrg ? (
          <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] p-6 text-left">
            <h2 className="text-xl font-semibold mb-4 text-[#1f2328] dark:text-white">Create an Organization</h2>
            
            {errorMsg && (
              <div className="p-3 mb-4 text-xs rounded border bg-red-50 border-red-200 text-red-600">
                {errorMsg}
              </div>
            )}
            
            <form onSubmit={handleCreateOrg} className="space-y-4 max-w-md">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#1f2328] dark:text-white">Organization account name</label>
                <input
                  type="text"
                  required
                  value={newOrgLogin}
                  onChange={(e) => setNewOrgLogin(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-xs outline-none"
                  placeholder="e.g. acme-corp"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#1f2328] dark:text-white">Display Name (Optional)</label>
                <input
                  type="text"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-xs outline-none"
                  placeholder="e.g. Acme Corporation"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#2ea44f] hover:bg-[#2c974b] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer border-0 mt-2"
              >
                Create organization
              </button>
            </form>
          </div>
        ) : (
          <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] flex items-center justify-center min-h-[400px] text-center p-8">
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#f6f8fa] dark:bg-[#161b22] mb-4">
                <PeopleIcon size={32} className="text-[#57606a] dark:text-[#8b949e]" />
              </div>
              <h2 className="text-xl font-semibold text-[#1f2328] dark:text-white mb-2">Build together with Organizations</h2>
              <p className="text-sm text-[#57606a] dark:text-[#8b949e] max-w-md mx-auto mb-6">
                Organizations are shared accounts where businesses and open-source projects can collaborate across many projects at once.
              </p>
              <button
                onClick={() => setShowCreateOrg(true)}
                className="px-4 py-2 bg-[#f6f8fa] dark:bg-[#21262d] hover:bg-[#ebedf0] dark:hover:bg-[#30363d] border border-[#d0d7de] dark:border-[#30363d] text-sm font-semibold text-[#24292f] dark:text-white rounded cursor-pointer transition-colors"
              >
                New Organization
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationDashboard;
