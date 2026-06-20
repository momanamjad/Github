import React, { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, ProjectIcon, CheckIcon } from '@primer/octicons-react';
import { apiClient } from '@services/apiClient.js';

export default function ProjectsTab({ repoId }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardDesc, setNewCardDesc] = useState("");
  const [newCardCol, setNewCardCol] = useState("todo");

  const fetchCards = async () => {
    try {
      setLoading(true);
      const res = await apiClient(`/repos/${repoId}/projects`);
      if (res && res.data) {
        setCards(res.data);
      }
    } catch (err) {
      console.error("Failed to load project cards:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (repoId) {
      fetchCards();
    }
  }, [repoId]);

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;

    try {
      const res = await apiClient(`/repos/${repoId}/projects`, {
        method: "POST",
        body: JSON.stringify({
          title: newCardTitle.trim(),
          description: newCardDesc.trim(),
          column: newCardCol
        })
      });
      if (res && res.data) {
        setCards(prev => [...prev, res.data]);
        setNewCardTitle("");
        setNewCardDesc("");
        setIsAddingCard(false);
      }
    } catch (err) {
      console.error("Failed to create card:", err);
    }
  };

  const handleUpdateCardColumn = async (cardId, newCol) => {
    // Optimistic UI update
    setCards(prev => prev.map(c => c._id === cardId ? { ...c, column: newCol } : c));
    try {
      await apiClient(`/repos/${repoId}/projects/cards/${cardId}`, {
        method: "PATCH",
        body: JSON.stringify({ column: newCol })
      });
    } catch (err) {
      console.error("Failed to update column:", err);
      fetchCards(); // Rollback on error
    }
  };

  const handleDeleteCard = async (cardId) => {
    setCards(prev => prev.filter(c => c._id !== cardId));
    try {
      await apiClient(`/repos/${repoId}/projects/cards/${cardId}`, {
        method: "DELETE"
      });
    } catch (err) {
      console.error("Failed to delete card:", err);
      fetchCards();
    }
  };

  // Drag and Drop implementation
  const handleDragStart = (e, cardId) => {
    e.dataTransfer.setData("cardId", cardId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetCol) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData("cardId");
    if (cardId) {
      handleUpdateCardColumn(cardId, targetCol);
    }
  };

  const columns = [
    { id: "todo", name: "To Do", bg: "bg-gray-50 dark:bg-[#161b22]/50" },
    { id: "in_progress", name: "In Progress", bg: "bg-blue-50/30 dark:bg-[#1f2937]/20" },
    { id: "done", name: "Done", bg: "bg-green-50/20 dark:bg-[#064e3b]/10" }
  ];

  if (loading) {
    return <div className="text-center py-12 text-xs text-[#57606a]">Loading projects board...</div>;
  }

  return (
    <div className="space-y-6 py-4 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#1f2328] dark:text-white flex items-center gap-2">
            <ProjectIcon size={16} className="text-[#57606a]" />
            Projects Board
          </h2>
          <p className="text-xs text-[#57606a] dark:text-[#8b949e]">
            Drag and drop cards across columns to organize issues, pull requests, and features.
          </p>
        </div>
        <button
          onClick={() => setIsAddingCard(!isAddingCard)}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold rounded-md border-0 cursor-pointer"
        >
          <PlusIcon size={14} />
          Add Card
        </button>
      </div>

      {isAddingCard && (
        <form onSubmit={handleAddCard} className="border border-[#d0d7de] dark:border-[#30363d] rounded-md p-4 bg-[#f6f8fa] dark:bg-[#161b22] max-w-md space-y-3">
          <h3 className="text-xs font-bold text-gray-700 dark:text-gray-200">Create New Project Card</h3>
          <div>
            <input
              type="text"
              required
              placeholder="Card Title"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              className="w-full px-3 py-1.5 bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-xs outline-none"
            />
          </div>
          <div>
            <textarea
              placeholder="Description"
              value={newCardDesc}
              onChange={(e) => setNewCardDesc(e.target.value)}
              className="w-full px-3 py-1.5 bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-xs outline-none"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#57606a] dark:text-[#8b949e] mb-1">Column</label>
            <select
              value={newCardCol}
              onChange={(e) => setNewCardCol(e.target.value)}
              className="px-2.5 py-1.5 bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-xs outline-none"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingCard(false)}
              className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold rounded-md border-0 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold rounded-md border-0 cursor-pointer"
            >
              Save Card
            </button>
          </div>
        </form>
      )}

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map(col => {
          const colCards = cards.filter(c => c.column === col.id);
          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`rounded-lg border border-[#d0d7de] dark:border-[#30363d] p-3 flex flex-col min-h-[400px] ${col.bg}`}
            >
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#d0d7de] dark:border-[#30363d]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{col.name}</span>
                  <span className="px-2 py-0.2 bg-gray-200 dark:bg-[#30363d] text-gray-600 dark:text-gray-400 rounded-full text-[10px] font-bold">
                    {colCards.length}
                  </span>
                </div>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] pb-4">
                {colCards.map(card => (
                  <div
                    key={card._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, card._id)}
                    className="p-3 bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md shadow-sm cursor-grab active:cursor-grabbing hover:border-[#58a6ff] transition-all relative group"
                  >
                    <button
                      onClick={() => handleDeleteCard(card._id)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-transparent border-0 cursor-pointer"
                      title="Delete card"
                    >
                      ✕
                    </button>
                    <h4 className="text-xs font-bold text-[#1f2328] dark:text-white pr-4">{card.title}</h4>
                    {card.description && (
                      <p className="text-[11px] text-[#57606a] dark:text-[#8b949e] mt-1 line-clamp-2 leading-relaxed">
                        {card.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-400">
                      <span>By {card.creator?.login || "unknown"}</span>
                      {col.id === "done" && <CheckIcon size={12} className="text-green-500" />}
                    </div>
                  </div>
                ))}
                {colCards.length === 0 && (
                  <div className="text-center py-8 text-[11px] text-gray-400 border border-dashed border-gray-300 dark:border-gray-800 rounded-md">
                    No cards. Drag items here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
