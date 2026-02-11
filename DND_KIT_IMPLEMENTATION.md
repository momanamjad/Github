# DnD-Kit Integration — Implementation Details

This document explains how I integrated drag-and-drop reordering for pinned repositories using the `@dnd-kit` family of packages, what files were modified, how the implementation works, and how you can test or extend it.

## Packages installed

I used the following packages (already in your project during edits):

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

## Files modified

- `src/components/features/PinnedRepos.jsx` — added `DndContext`, `SortableContext`, sensors, drag end handler, `SortableItem` wrapper. Also persists reorder to `localStorage` under `pinnedOrder:<username>`.
- `src/components/features/PinnedRepoCard.jsx` — accepts drag props (`dragHandleProps`) and `style`, renders the six-dot SVG drag handle and passes listeners/attributes.

## Key implementation points

1. Dnd setup in `PinnedRepos.jsx`

```js
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// sensors
const sensors = useSensors(useSensor(PointerSensor));

// derive ids for SortableContext
const ids = repos.map(r => r.name || r.id || `${r.author}/${r.name}`);

// handle drag end and persist
const handleDragEnd = event => {
  const { active, over } = event;
  if (!over) return;
  if (active.id !== over.id) {
    const oldIndex = ids.indexOf(active.id);
    const newIndex = ids.indexOf(over.id);
    const newArray = arrayMove(repos, oldIndex, newIndex);
    setRepos(newArray);
    localStorage.setItem(`pinnedOrder:${username}`, JSON.stringify(newArray.map(r => r.name || r.id)));
  }
};

/* render */
<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
  <SortableContext items={ids} strategy={rectSortingStrategy}>
    {repos.map(repo => <SortableItem key={id} id={id} repo={repo} />)}
  </SortableContext>
</DndContext>
```

2. Sortable item wrapper (`SortableItem`)

I used `useSortable` to get the `attributes`, `listeners`, `setNodeRef`, `transform`, `transition`, and `isDragging`. Those are used to produce a `style` object and to pass `attributes`/`listeners`/`ref` into the `PinnedRepoCard` as `dragHandleProps` so the card can be moved and styled while dragging.

```js
function SortableItem({ id, repo, repoUrl }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.9 : 1 };

  return (
    <PinnedRepoCard
      id={id}
      name={repo.name}
      ...
      dragHandleProps={{ attributes, listeners, ref: setNodeRef }}
      style={style}
    />
  );
}
```

3. Card receives `dragHandleProps` and `style`

In `PinnedRepoCard.jsx`, the card uses `ref={dragHandleProps?.ref}` and spreads `dragHandleProps?.attributes` on the article, and renders a button that spreads `dragHandleProps?.listeners` (so the six-dot button acts as a drag handle). The requested six-dot SVG was added as that button's content.

```js
<article ref={dragHandleProps?.ref} style={style} {...(dragHandleProps?.attributes || {})}>
  ...
  <button {...(dragHandleProps?.listeners || {})} aria-label="Drag"> /* six-dot SVG here */ </button>
</article>
```

## Local persistence

- When the user reorders pinned repos, the new order is saved to `localStorage` under the key `pinnedOrder:<username>` as an array of repo names/ids. This is a simple demo persistence approach; server-side persistence would require an API.

## How to test manually

1. Start dev server

```bash
npm run dev
```

2. Open the profile page that shows pinned repos (example: `/momanamjad`)
3. Click and drag the six-dot handle on any pinned card to reorder it. The card will move and the page will persist the new order to `localStorage`.
4. Build to verify compilation

```bash
npm run build
```

## Notes & possible improvements

- Apply persisted order on initial load: the implementation saves order to `localStorage`, but if you'd like the saved order applied on initial fetch, I can add code that reads `localStorage` and reorders the fetched `repos` accordingly.
- Use `@dnd-kit/sortable` animation utilities (or `useSortable` animations) to get smooth reflow/animations.
- Make drag-handle-only dragging enforced (currently the handle is the primary drag listener; clicking other parts should not start drag — listeners are attached to the button). If you prefer the entire card draggable, we can attach listeners to the article instead.
- Persist reorder back to a server (requires API).

## Files to review

- `src/components/features/PinnedRepos.jsx`
- `src/components/features/PinnedRepoCard.jsx`

If you'd like, I can now:

- (A) Load persisted `localStorage` order on initial fetch
- (B) Add smooth animations for reorder
- (C) Ensure drag is strictly limited to the handle only

Reply with `A`, `B`, `C`, or `all` and I'll implement the chosen enhancement(s).
