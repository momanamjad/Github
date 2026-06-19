import React, { useState, useEffect } from "react";
import { MessageSquare, ArrowUp, Check, Plus, ArrowLeft, Lightbulb, HelpCircle, MessageCircle } from "lucide-react";
import { apiClient } from "@/services/apiClient";
import { useGitHub } from "@/contexts/GitHubContext";

const DiscussionsTab = ({ repoId, isOwner }) => {
  const { user } = useGitHub();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New discussion form states
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("general");

  // New reply state
  const [replyBody, setReplyBody] = useState("");

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      const url = categoryFilter === "all" 
        ? `/repos/${repoId}/discussions` 
        : `/repos/${repoId}/discussions?category=${categoryFilter}`;
      const res = await apiClient(url);
      setDiscussions(res.data || []);
    } catch (err) {
      console.error("Failed to load discussions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, [repoId, categoryFilter]);

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    try {
      const res = await apiClient(`/repos/${repoId}/discussions`, {
        method: "POST",
        body: JSON.stringify({ title, body, category })
      });
      setShowCreateModal(false);
      setTitle("");
      setBody("");
      setCategory("general");
      await fetchDiscussions();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to create discussion");
    }
  };

  const handleUpvote = async (discussionId) => {
    try {
      const res = await apiClient(`/repos/${repoId}/discussions/${discussionId}/upvote`, {
        method: "POST"
      });
      // Update local state
      setDiscussions(prev => 
        prev.map(d => d._id === discussionId ? { ...d, upvotes: res.data.upvotes } : d)
      );
      if (selectedDiscussion && selectedDiscussion._id === discussionId) {
        setSelectedDiscussion(prev => ({ ...prev, upvotes: res.data.upvotes }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddReply = async (e) => {
    e.preventDefault();
    if (!replyBody.trim()) return;
    try {
      const res = await apiClient(`/repos/${repoId}/discussions/${selectedDiscussion._id}/replies`, {
        method: "POST",
        body: JSON.stringify({ body: replyBody })
      });
      setSelectedDiscussion(res.data);
      setReplyBody("");
      fetchDiscussions(); // Refresh list to update counts
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleAnswer = async (replyId) => {
    try {
      const res = await apiClient(`/repos/${repoId}/discussions/${selectedDiscussion._id}/replies/${replyId}/answer`, {
        method: "PUT"
      });
      setSelectedDiscussion(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const CategoryIcon = ({ cat, size = 16 }) => {
    switch (cat) {
      case "ideas":
        return <Lightbulb size={size} className="text-[#e3b341]" />;
      case "qna":
        return <HelpCircle size={size} className="text-[#8250df]" />;
      default:
        return <MessageCircle size={size} className="text-[#0969da]" />;
    }
  };

  if (selectedDiscussion) {
    // Thread Detail View
    const upvoted = user && selectedDiscussion.upvotes.includes(user._id || user.id);
    const answers = selectedDiscussion.replies.filter(r => r.isAnswer);

    return (
      <div className="py-4 space-y-4 text-left">
        <button
          onClick={() => setSelectedDiscussion(null)}
          className="text-[#0969da] dark:text-[#58a6ff] hover:underline text-sm font-medium flex items-center gap-1 bg-transparent border-0 cursor-pointer mb-2"
        >
          <ArrowLeft size={16} /> Back to discussions
        </button>

        {/* Title block */}
        <div className="border-b border-[#d0d7de] dark:border-[#30363d] pb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="capitalize text-xs font-semibold px-2 py-0.5 rounded-full border border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22] text-[#57606a] dark:text-[#8b949e] flex items-center gap-1">
              <CategoryIcon cat={selectedDiscussion.category} size={12} />
              {selectedDiscussion.category === "qna" ? "Q&A" : selectedDiscussion.category}
            </span>
            <span className="text-xs text-[#57606a] dark:text-[#8b949e]">
              Started by <span className="font-semibold">{selectedDiscussion.creator?.login}</span> · {new Date(selectedDiscussion.created_at).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1f2328] dark:text-white">
            {selectedDiscussion.title}
          </h1>
        </div>

        {/* Topic details and replies layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4">
            {/* Main post body */}
            <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-lg overflow-hidden bg-white dark:bg-[#161b22]">
              <div className="px-4 py-2 bg-[#f6f8fa] dark:bg-[#161b22] border-b border-[#d0d7de] dark:border-[#30363d] text-xs text-[#57606a] dark:text-[#8b949e] flex justify-between">
                <span><span className="font-semibold text-[#1f2328] dark:text-white">{selectedDiscussion.creator?.login}</span> commented</span>
              </div>
              <div className="p-4 text-[14px] leading-relaxed text-[#1f2328] dark:text-[#c9d1d9] whitespace-pre-line">
                {selectedDiscussion.body}
              </div>
            </div>

            {/* Render accepted answers section (Q&A mode) */}
            {selectedDiscussion.category === "qna" && answers.length > 0 && (
              <div className="border border-green-200 dark:border-green-900 bg-green-50/20 dark:bg-green-900/10 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-semibold text-green-700 dark:text-green-400 flex items-center gap-1.5">
                  <Check size={16} className="bg-green-600 text-white rounded-full p-0.5" />
                  Accepted Answer
                </h3>
                {answers.map(answer => (
                  <div key={answer._id} className="text-[14px] leading-relaxed text-[#1f2328] dark:text-[#c9d1d9]">
                    <div className="text-xs text-[#57606a] dark:text-[#8b949e] mb-1">
                      Answered by <span className="font-semibold">{answer.author?.login}</span>
                    </div>
                    {answer.body}
                  </div>
                ))}
              </div>
            )}

            {/* Replies List Header */}
            <div className="text-sm font-semibold text-[#24292f] dark:text-white border-b border-[#d0d7de] dark:border-[#30363d] pb-2 pt-4">
              Replies ({selectedDiscussion.replies?.length || 0})
            </div>

            {/* List replies */}
            <div className="space-y-4">
              {(selectedDiscussion.replies || []).map((reply) => (
                <div 
                  key={reply._id} 
                  className={`border rounded-lg overflow-hidden bg-white dark:bg-[#161b22] ${
                    reply.isAnswer ? "border-green-600 dark:border-green-600 ring-1 ring-green-600/30" : "border-[#d0d7de] dark:border-[#30363d]"
                  }`}
                >
                  <div className="px-4 py-2 bg-[#f6f8fa] dark:bg-[#161b22] border-b border-[#d0d7de] dark:border-[#30363d] text-xs text-[#57606a] dark:text-[#8b949e] flex justify-between items-center">
                    <span>
                      <span className="font-semibold text-[#1f2328] dark:text-white">{reply.author?.login}</span> commented {new Date(reply.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      {reply.isAnswer && (
                        <span className="text-[10px] font-semibold text-white bg-green-600 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Check size={10} /> Answer
                        </span>
                      )}
                      {isOwner && selectedDiscussion.category === "qna" && (
                        <button
                          onClick={() => handleToggleAnswer(reply._id)}
                          className={`text-[10px] font-semibold border rounded px-1.5 py-0.5 transition-colors cursor-pointer bg-white dark:bg-[#21262d] ${
                            reply.isAnswer 
                              ? "text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20" 
                              : "text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-950/20"
                          }`}
                        >
                          {reply.isAnswer ? "Unmark Answer" : "Mark Answer"}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="p-4 text-[14px] leading-relaxed text-[#1f2328] dark:text-[#c9d1d9] whitespace-pre-line">
                    {reply.body}
                  </div>
                </div>
              ))}
            </div>

            {/* Write Reply Box */}
            <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-lg overflow-hidden bg-white dark:bg-[#161b22] mt-6">
              <div className="px-4 py-2.5 bg-[#f6f8fa] dark:bg-[#161b22] border-b border-[#d0d7de] dark:border-[#30363d] text-xs font-semibold text-[#57606a] dark:text-[#8b949e]">
                Write a reply
              </div>
              <form onSubmit={handleAddReply} className="p-4 space-y-3">
                <textarea
                  rows="4"
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder="Type your reply here"
                  className="w-full border border-[#d0d7de] dark:border-[#30363d] rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0969da] dark:focus:ring-[#58a6ff] bg-white dark:bg-[#0d1117] text-[#1f2328] dark:text-white"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#2da44e] hover:bg-[#2c974b] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer border-0"
                  >
                    Reply
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right sidebar action */}
          <div className="space-y-4">
            <button
              onClick={() => handleUpvote(selectedDiscussion._id)}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-semibold transition-colors cursor-pointer ${
                upvoted 
                  ? "bg-blue-50 text-blue-600 border-blue-200" 
                  : "bg-[#f6f8fa] text-[#24292f] border-[#d0d7de] hover:bg-[#ebedf0]"
              }`}
            >
              <ArrowUp size={16} className={upvoted ? "fill-blue-600 text-blue-600" : "text-[#57606a]"} />
              Upvote ({selectedDiscussion.upvotes?.length || 0})
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 space-y-4 text-left">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#24292f] dark:text-white">Discussions</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2da44e] hover:bg-[#2c974b] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer border-0"
        >
          <Plus size={14} /> New discussion
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar category filters */}
        <div className="space-y-1">
          {[
            { id: "all", label: "All Categories", icon: MessageSquare },
            { id: "general", label: "General", icon: MessageCircle },
            { id: "qna", label: "Q&A", icon: HelpCircle },
            { id: "ideas", label: "Ideas", icon: Lightbulb },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md text-left transition-colors cursor-pointer border-0 ${
                categoryFilter === cat.id
                  ? "bg-[#ECEEF0] dark:bg-[#21262d] text-[#24292f] dark:text-white"
                  : "bg-transparent text-[#57606a] dark:text-[#8b949e] hover:bg-[#f6f8fa] dark:hover:bg-[#161b22]"
              }`}
            >
              <cat.icon size={14} />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* List of discussions */}
        <div className="md:col-span-3">
          {loading ? (
            <div className="p-12 text-center text-[#57606a] dark:text-[#8b949e]">
              Loading discussions...
            </div>
          ) : discussions.length === 0 ? (
            <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md p-12 text-center bg-gray-50 dark:bg-[#161b22] text-[#57606a] dark:text-[#8b949e]">
              No discussions started in this category. Be the first to start one!
            </div>
          ) : (
            <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md divide-y divide-[#d0d7de] dark:divide-[#30363d] bg-white dark:bg-[#161b22] overflow-hidden">
              {discussions.map(d => {
                const upvoted = user && d.upvotes?.includes(user._id || user.id);
                return (
                  <div key={d._id} className="p-4 flex gap-4 items-start hover:bg-[#f6f8fa] dark:hover:bg-[#1f242c] transition-colors">
                    {/* Upvote side button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpvote(d._id);
                      }}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border w-11 h-12 shrink-0 cursor-pointer transition-colors ${
                        upvoted 
                          ? "bg-blue-50 text-blue-600 border-blue-200" 
                          : "bg-white dark:bg-[#0d1117] text-[#24292f] border-[#d0d7de] dark:border-[#30363d] hover:bg-[#f6f8fa]"
                      }`}
                    >
                      <ArrowUp size={14} className={upvoted ? "text-blue-600" : "text-[#57606a]"} />
                      <span className="text-[11px] font-bold mt-0.5">{d.upvotes?.length || 0}</span>
                    </button>

                    {/* Content strip */}
                    <div 
                      onClick={() => setSelectedDiscussion(d)}
                      className="flex-1 min-w-0 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="capitalize text-[10px] font-semibold px-2 py-0.5 rounded-full border border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22] text-[#57606a] dark:text-[#8b949e] flex items-center gap-1">
                          <CategoryIcon cat={d.category} size={10} />
                          {d.category === "qna" ? "Q&A" : d.category}
                        </span>
                        <span className="text-[11px] text-[#57606a] dark:text-[#8b949e]">
                          By <span className="font-semibold">{d.creator?.login}</span> · {new Date(d.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-[#1f2328] dark:text-white hover:text-[#0969da] hover:underline">
                        {d.title}
                      </h3>
                      <p className="text-xs text-[#57606a] dark:text-[#8b949e] line-clamp-2 mt-1 whitespace-pre-line leading-relaxed">
                        {d.body}
                      </p>
                    </div>

                    {/* Replies count */}
                    <div className="flex items-center gap-1.5 text-xs text-[#57606a] dark:text-[#8b949e] shrink-0 font-medium">
                      <MessageSquare size={14} />
                      {d.replies?.length || 0}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Discussion Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-lg max-w-xl w-full p-6 text-[#1f2328] shadow-2xl relative z-[60]">
            <h3 className="text-lg font-bold mb-4 text-[#1f2328] dark:text-white">Start a New Discussion</h3>
            <form onSubmit={handleCreateDiscussion} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs text-[#57606a] dark:text-[#8b949e] mb-1 font-semibold">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0969da] text-[#1f2328] dark:text-white"
                >
                  <option value="general">General</option>
                  <option value="qna">Q&A</option>
                  <option value="ideas">Ideas</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#57606a] dark:text-[#8b949e] mb-1 font-semibold">Title</label>
                <input
                  type="text"
                  required
                  placeholder="Give your topic a clear title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0969da] text-[#1f2328] dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-[#57606a] dark:text-[#8b949e] mb-1 font-semibold">Body</label>
                <textarea
                  required
                  rows="6"
                  placeholder="Describe your suggestion, show off your code, or ask your question..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded p-2 text-sm h-36 resize-none focus:outline-none focus:ring-1 focus:ring-[#0969da] text-[#1f2328] dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#21262d] text-[#24292f] dark:text-[#c9d1d9] hover:bg-gray-100 text-sm font-semibold rounded-md transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2da44e] hover:bg-[#2c974b] text-sm font-semibold rounded-md transition-colors cursor-pointer text-white"
                >
                  Start topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscussionsTab;
