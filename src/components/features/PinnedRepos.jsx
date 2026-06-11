import { useState, useEffect } from "react";
import PinnedRepoCard from "./PinnedRepoCard";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getPinnedRepos } from "@services/GithubApi";

const PinnedRepos = ({ username }) => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // A small distance to prevent accidental grabs
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 0, // 0 delay for instant grab on handle touch like native GitHub
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    const fetchPinned = async () => {
      if (!username) return;

      try {
        setLoading(true);
        const pinnedRepos = await getPinnedRepos(username);
        setRepos(Array.isArray(pinnedRepos) ? pinnedRepos : []);
      } catch (error) {
        console.error("Error fetching pinned repos:", error);
        setRepos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPinned();

    // Listen to custom event dispatched by RepoList.jsx
    const handlePinnedUpdate = () => {
      fetchPinned();
    };
    window.addEventListener('github_pinned_updated', handlePinnedUpdate);

    return () => {
      window.removeEventListener('github_pinned_updated', handlePinnedUpdate);
    };
  }, [username]);

  if (loading)
    return (
      <p className="px-4 text-[#8b949e]">Loading pinned repositories...</p>
    );
  if (repos.length === 0) return null;

  const ids = repos.map((r) => r.name || r.id || `${r.author}/${r.name}`);

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
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
      } catch (_e) {
        // ignore localStorage errors silently
      }
    }
  };

  return (
    <section className="px-4 mt-8">
      <h2 className="mb-4 text-[16px] font-semibold text-[#24292f]">Pinned</h2>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <SortableContext items={ids} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 ">
            {repos.map((repo) => {
              const id = repo.name || repo.id || `${repo.author || username}/${repo.name}`;
              return (
                <SortableItem key={id} id={id} repo={repo} author={username} />
              );
            })}
          </div>
        </SortableContext>
        
        <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.4" } } }),
        }}>
          {activeId ? (
            <SortableItem key="overlay" id={activeId} repo={repos.find(r => (r.name || r.id || `${r.author || username}/${r.name}`) === activeId)} author={username} isOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>
    </section>
  );
};

function SortableItem({ id, repo, isOverlay, author }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging && !isOverlay ? 0.3 : 1, // Dim the original card slot
  };

  return (
    <div ref={setNodeRef} style={style}>
      <PinnedRepoCard
        repo={repo}
        author={author}
        stars={repo.stars || repo.stargazers_count}
        language={repo.language}
        languageColor={repo.languageColor}
        visibility={repo.visibility}
        dragHandleProps={{ attributes, listeners }}
        isDragging={isDragging}
        isOverlay={isOverlay}
      />
    </div>
  );
}

export default PinnedRepos;
