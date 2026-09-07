import { useState, useEffect } from "react";
import { apiClient } from "@services/apiClient.js";

const BranchProtectionSettings = ({ repoData, branches }) => {
  const [selectedBranch, setSelectedBranch] = useState("main");
  const [protection, setProtection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Form states
  const [requirePrReviews, setRequirePrReviews] = useState(false);
  const [requiredApprovingReviewCount, setRequiredApprovingReviewCount] = useState(1);
  const [requireStatusChecks, setRequireStatusChecks] = useState(false);
  const [requireLinearHistory, setRequireLinearHistory] = useState(false);
  const [allowForcePushes, setAllowForcePushes] = useState(false);
  const [allowDeletions, setAllowDeletions] = useState(false);
  const [enforceAdmins, setEnforceAdmins] = useState(false);

  const repoId = repoData?._id || repoData?.id;

  const fetchProtection = async (branch) => {
    if (!repoId || !branch) return;
    try {
      setLoading(true);
      const res = await apiClient(`/repos/${repoId}/branches/${encodeURIComponent(branch)}/protection`);
      if (res && res.data) {
        const p = res.data;
        setProtection(p);
        setRequirePrReviews(p.require_pr_reviews);
        setRequiredApprovingReviewCount(p.required_approving_review_count);
        setRequireStatusChecks(p.require_status_checks);
        setRequireLinearHistory(p.require_linear_history);
        setAllowForcePushes(p.allow_force_pushes);
        setAllowDeletions(p.allow_deletions);
        setEnforceAdmins(p.enforce_admins);
      } else {
        setProtection(null);
        resetForm();
      }
    } catch (err) {
      console.error("Failed to load branch protection:", err);
      setProtection(null);
      resetForm();
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRequirePrReviews(false);
    setRequiredApprovingReviewCount(1);
    setRequireStatusChecks(false);
    setRequireLinearHistory(false);
    setAllowForcePushes(false);
    setAllowDeletions(false);
    setEnforceAdmins(false);
  };

  useEffect(() => {
    fetchProtection(selectedBranch);
  }, [repoId, selectedBranch]);

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    try {
      setSaving(true);
      const res = await apiClient(`/repos/${repoId}/branches/${encodeURIComponent(selectedBranch)}/protection`, {
        method: "PUT",
        body: JSON.stringify({
          require_pr_reviews: requirePrReviews,
          required_approving_review_count: requiredApprovingReviewCount,
          require_status_checks: requireStatusChecks,
          require_linear_history: requireLinearHistory,
          allow_force_pushes: allowForcePushes,
          allow_deletions: allowDeletions,
          enforce_admins: enforceAdmins
        })
      });
      if (res && res.data) {
        setProtection(res.data);
        setMessage({ text: "Branch protection rules updated successfully.", type: "success" });
      }
    } catch (err) {
      setMessage({ text: err.message || "Failed to update branch protection.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to remove protection rules for ${selectedBranch}?`)) return;
    try {
      await apiClient(`/repos/${repoId}/branches/${encodeURIComponent(selectedBranch)}/protection`, {
        method: "DELETE"
      });
      setProtection(null);
      resetForm();
      setMessage({ text: "Branch protection rules removed.", type: "success" });
    } catch (err) {
      setMessage({ text: err.message || "Failed to remove protection.", type: "error" });
    }
  };

  return (
    <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md p-6 bg-white dark:bg-[#161b22] space-y-4 text-left mt-4">
      <h3 className="text-base font-semibold text-[#1f2328] dark:text-white border-b border-[#d0d7de] dark:border-[#30363d] pb-2">
        Branch Protection Rules
      </h3>

      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-[#1f2328] dark:text-white">Select branch:</label>
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="px-3 py-1.5 bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-xs outline-none focus:border-[#58a6ff] min-w-[200px]"
        >
          {branches?.map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      {message.text && (
        <div className={`p-3 text-xs rounded-md border ${message.type === 'success' ? 'bg-[#3fb950]/10 border-[#3fb950]/30 text-[#3fb950]' : 'bg-[#f85149]/10 border-[#f85149]/30 text-[#f85149]'}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="text-xs text-[#57606a] py-4">Loading rules...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          {/* PR Reviews */}
          <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md overflow-hidden bg-[#f6f8fa] dark:bg-[#0d1117]">
            <div className="p-4 border-b border-[#d0d7de] dark:border-[#30363d]">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requirePrReviews}
                  onChange={(e) => setRequirePrReviews(e.target.checked)}
                  className="mt-1 cursor-pointer"
                />
                <div>
                  <div className="font-semibold text-sm text-[#1f2328] dark:text-white">Require a pull request before merging</div>
                  <div className="text-xs text-[#57606a] dark:text-[#8b949e] mt-1">When enabled, all commits must be made to a non-protected branch and submitted via a pull request before they can be merged into this branch.</div>
                </div>
              </label>
            </div>
            {requirePrReviews && (
              <div className="p-4 bg-white dark:bg-[#161b22] pl-10 space-y-2">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-medium text-[#1f2328] dark:text-white">Required approving reviews:</label>
                  <select
                    value={requiredApprovingReviewCount}
                    onChange={(e) => setRequiredApprovingReviewCount(Number(e.target.value))}
                    className="px-2 py-1 bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded text-xs outline-none"
                  >
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Status Checks */}
          <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md p-4 bg-[#f6f8fa] dark:bg-[#0d1117]">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={requireStatusChecks}
                onChange={(e) => setRequireStatusChecks(e.target.checked)}
                className="mt-1 cursor-pointer"
              />
              <div>
                <div className="font-semibold text-sm text-[#1f2328] dark:text-white">Require status checks to pass before merging</div>
                <div className="text-xs text-[#57606a] dark:text-[#8b949e] mt-1">Choose which status checks must pass before branches can be merged into one that matches this rule.</div>
              </div>
            </label>
          </div>

          {/* Linear History */}
          <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md p-4 bg-[#f6f8fa] dark:bg-[#0d1117]">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={requireLinearHistory}
                onChange={(e) => setRequireLinearHistory(e.target.checked)}
                className="mt-1 cursor-pointer"
              />
              <div>
                <div className="font-semibold text-sm text-[#1f2328] dark:text-white">Require linear history</div>
                <div className="text-xs text-[#57606a] dark:text-[#8b949e] mt-1">Prevent merge commits from being pushed to matching branches.</div>
              </div>
            </label>
          </div>

          {/* Enforce Admins */}
          <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md p-4 bg-[#f6f8fa] dark:bg-[#0d1117]">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={enforceAdmins}
                onChange={(e) => setEnforceAdmins(e.target.checked)}
                className="mt-1 cursor-pointer"
              />
              <div>
                <div className="font-semibold text-sm text-[#1f2328] dark:text-white">Include administrators</div>
                <div className="text-xs text-[#57606a] dark:text-[#8b949e] mt-1">Enforce all configured restrictions above for administrators.</div>
              </div>
            </label>
          </div>

          {/* Force Pushes */}
          <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md p-4 bg-[#f6f8fa] dark:bg-[#0d1117]">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={allowForcePushes}
                onChange={(e) => setAllowForcePushes(e.target.checked)}
                className="mt-1 cursor-pointer"
              />
              <div>
                <div className="font-semibold text-sm text-[#1f2328] dark:text-white">Allow force pushes</div>
                <div className="text-xs text-[#57606a] dark:text-[#8b949e] mt-1">Permit force pushes for all users with push access.</div>
              </div>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#d0d7de] dark:border-[#30363d]">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white text-xs font-semibold rounded-md transition-colors cursor-pointer border-0"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
            {protection && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-transparent text-[#cf222e] hover:bg-[#ffebe9] dark:hover:bg-red-950/30 border border-[#d0d7de] dark:border-[#30363d] text-xs font-semibold rounded-md transition-colors cursor-pointer"
              >
                Delete rule
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default BranchProtectionSettings;
