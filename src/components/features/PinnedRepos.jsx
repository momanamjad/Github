import { useState, useEffect } from "react";
import PinnedRepoCard from "./PinnedRepoCard";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const PinnedRepos = ({ username }) => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    const fetchPinned = async () => {
      if (!username) return;

      try {
        setLoading(true);

        const url = `https://pinned.berrysauce.dev/get/${username}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setRepos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching pinned repos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPinned();
  }, [username]);

  if (loading)
    return (
      <p className="px-4 text-[#8b949e]">Loading pinned repositories...</p>
    );
  if (repos.length === 0) return null;

  // derive ids for sortable context
  const ids = repos.map((r) => r.name || r.id || `${r.author}/${r.name}`);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      const oldIndex = ids.indexOf(active.id);
      const newIndex = ids.indexOf(over.id);
      const newArray = arrayMove(repos, oldIndex, newIndex);
      setRepos(newArray);
      try {
        localStorage.setItem(
          `pinnedOrder:${username}`,
          JSON.stringify(newArray.map((r) => r.name || r.id))
        );
      } catch (e) {
        // ignore
      }
    }
  };

  return (
    <section className="px-4 mt-8">
      <h2 className="mb-4 text-[16px] font-semibold text-white">Pinned</h2>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={ids} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {repos.map((repo) => {
              const id = repo.name || repo.id || `${repo.author}/${repo.name}`;
              return (
                <SortableItem key={id} id={id} repo={repo} repoUrl={`https://github.com/${repo.author}/${repo.name}`} />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </section>
  );
};

function SortableItem({ id, repo, repoUrl }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.9 : 1,
    zIndex: isDragging ? 99 : "auto",
  };

  return (
    <div>
      <PinnedRepoCard
        id={id}
        name={repo.name}
        desc={repo.description}
        stars={repo.stars}
        language={repo.language}
        repoUrl={repoUrl}
        languageColor={repo.languageColor}
        visibility={repo.visibility}
        dragHandleProps={{ attributes, listeners, ref: setNodeRef }}
        style={style}
      />
    </div>
  );
}

export default PinnedRepos;
