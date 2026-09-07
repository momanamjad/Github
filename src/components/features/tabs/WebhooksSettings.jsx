import { useState, useEffect } from "react";
import { apiClient } from "@services/apiClient.js";

const WebhooksSettings = ({ repoData }) => {
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [payloadUrl, setPayloadUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const repoId = repoData?._id || repoData?.id;

  const fetchWebhooks = async () => {
    if (!repoId) return;
    try {
      setLoading(true);
      const res = await apiClient(`/repos/${repoId}/webhooks`);
      if (res && res.data) {
        setWebhooks(res.data);
      }
    } catch (err) {
      console.error("Failed to load webhooks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, [repoId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (!payloadUrl) return;

    try {
      setSaving(true);
      const res = await apiClient(`/repos/${repoId}/webhooks`, {
        method: "POST",
        body: JSON.stringify({
          url: payloadUrl,
          secret,
          events: ["push"],
          is_active: isActive
        })
      });
      
      if (res && res.data) {
        setWebhooks([res.data, ...webhooks]);
        setShowForm(false);
        setPayloadUrl("");
        setSecret("");
        setIsActive(true);
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to create webhook");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (webhookId) => {
    if (!window.confirm("Are you sure you want to delete this webhook?")) return;
    try {
      await apiClient(`/repos/${repoId}/webhooks/${webhookId}`, {
        method: "DELETE"
      });
      setWebhooks(webhooks.filter(w => w._id !== webhookId));
    } catch (err) {
      alert("Failed to delete webhook");
    }
  };

  const handlePing = async (webhookId) => {
    try {
      await apiClient(`/repos/${repoId}/webhooks/${webhookId}/ping`, {
        method: "POST"
      });
      alert("Ping event queued successfully!");
    } catch (err) {
      alert("Failed to ping webhook");
    }
  };

  return (
    <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md p-6 bg-white dark:bg-[#161b22] space-y-4 text-left">
      <div className="flex items-center justify-between border-b border-[#d0d7de] dark:border-[#30363d] pb-2">
        <h3 className="text-base font-semibold text-[#1f2328] dark:text-white">Webhooks</h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-3 py-1 bg-[#f6f8fa] dark:bg-[#21262d] hover:bg-[#ebedf0] dark:hover:bg-[#30363d] border border-[#d0d7de] dark:border-[#30363d] text-xs font-semibold text-[#24292f] dark:text-white rounded cursor-pointer transition-colors"
          >
            Add webhook
          </button>
        )}
      </div>

      <p className="text-xs text-[#57606a] dark:text-[#8b949e]">
        Webhooks allow external services to be notified when certain events happen. When the specified events happen, we’ll send a POST request to each of the URLs you provide.
      </p>

      {showForm && (
        <form onSubmit={handleSubmit} className="border border-[#d0d7de] dark:border-[#30363d] p-4 rounded bg-[#f6f8fa] dark:bg-[#0d1117] space-y-4">
          <h4 className="text-sm font-semibold text-[#1f2328] dark:text-white">New Webhook</h4>
          
          {errorMsg && (
            <div className="p-3 text-xs rounded border bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#1f2328] dark:text-white">Payload URL *</label>
            <input
              type="url"
              required
              placeholder="https://example.com/postreceive"
              value={payloadUrl}
              onChange={(e) => setPayloadUrl(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-xs outline-none focus:border-[#58a6ff]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#1f2328] dark:text-white">Secret</label>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-xs outline-none focus:border-[#58a6ff]"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="cursor-pointer"
            />
            <label htmlFor="isActive" className="text-xs font-medium text-[#1f2328] dark:text-white cursor-pointer">
              Active (We will deliver event details when this hook is triggered)
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 bg-[#2ea44f] hover:bg-[#2c974b] disabled:opacity-50 text-white text-xs font-semibold rounded-md transition-colors cursor-pointer border-0"
            >
              {saving ? "Adding..." : "Add webhook"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-1.5 bg-transparent border border-[#d0d7de] dark:border-[#30363d] hover:bg-[#f6f8fa] dark:hover:bg-[#30363d] text-[#24292f] dark:text-white text-xs font-semibold rounded-md transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {!loading && webhooks.length > 0 && (
        <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md overflow-hidden bg-white dark:bg-[#0d1117] divide-y divide-[#d0d7de] dark:divide-[#30363d]">
          {webhooks.map(webhook => (
            <div key={webhook._id} className="p-4 flex items-start justify-between">
              <div>
                <a href={webhook.url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-[#0969da] hover:underline">
                  {webhook.url}
                </a>
                <div className="text-xs text-[#57606a] dark:text-[#8b949e] mt-1 flex items-center gap-2">
                  <span className={`inline-block w-2 h-2 rounded-full ${webhook.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  {webhook.events.join(', ')} event(s)
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePing(webhook._id)}
                  className="px-2 py-1 bg-transparent hover:bg-[#f6f8fa] dark:hover:bg-[#30363d] border border-[#d0d7de] dark:border-[#30363d] text-[11px] font-semibold text-[#57606a] dark:text-[#8b949e] rounded cursor-pointer transition-colors"
                >
                  Ping
                </button>
                <button
                  onClick={() => handleDelete(webhook._id)}
                  className="px-2 py-1 bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-900 text-[11px] font-semibold text-red-600 rounded cursor-pointer transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && webhooks.length === 0 && !showForm && (
        <div className="text-center py-8 text-xs text-[#57606a] italic">
          No webhooks configured yet.
        </div>
      )}
    </div>
  );
};

export default WebhooksSettings;
