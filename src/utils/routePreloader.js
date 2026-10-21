import { prefetchUser, prefetchRepo } from '../services/GithubApi';

const preloadedChunks = new Set();

const chunkLoaders = {
  '/': () => import('../pages/Home'),
  '/issues': () => import('../pages/Issues'),
  '/pull-requests': () => import('../pages/PullRequests'),
  '/repositories': () => import('../pages/Repositories'),
  '/projects': () => import('../pages/Projects'),
  '/discussions': () => import('../pages/Discussions'),
  '/codespaces': () => import('../pages/Codespaces'),
  '/copilot': () => import('../pages/Copilot'),
  '/explore': () => import('../pages/Explore'),
  '/marketplace': () => import('../pages/Marketplace'),
  '/mcp-registry': () => import('../pages/MCPRegistry'),
  '/new': () => import('../components/features/NewRepoPage'),
};

/**
 * Preloads both the route chunk and its corresponding API data on hover/touch
 */
export const preloadRoute = (href) => {
  if (!href || typeof href !== 'string') return;
  const path = href.split('?')[0].split('#')[0].toLowerCase();

  // 1. Preload Route Chunk if static match
  if (chunkLoaders[path] && !preloadedChunks.has(path)) {
    preloadedChunks.add(path);
    chunkLoaders[path]().catch(() => {});
    return;
  }

  // 2. Identify dynamic routes
  const segments = path.replace(/^\//, '').split('/');
  if (segments.length === 2 && segments[0] && segments[1]) {
    // Repo route: /:username/:repo
    const [owner, repo] = segments;
    if (!preloadedChunks.has('__repo_details__')) {
      preloadedChunks.add('__repo_details__');
      import('../components/features/RepoDetails').catch(() => {});
    }
    prefetchRepo(owner, repo);
  } else if (segments.length === 1 && segments[0]) {
    // User profile route: /:username
    const username = segments[0];
    if (!preloadedChunks.has('__profile__')) {
      preloadedChunks.add('__profile__');
      import('../pages/ProfileLayout').catch(() => {});
      import('../components/features/tabs/Overview').catch(() => {});
      import('../components/features/tabs/Repositories').catch(() => {});
    }
    prefetchUser(username);
  }
};

/**
 * Attach global hover/touchstart delegation to prefetch routes instantly (Turbo-style)
 */
export const initRoutePreloader = () => {
  if (typeof window === 'undefined') return;

  const handlePointerInteraction = (e) => {
    const anchor = e.target.closest('a[href], button[data-to]');
    if (!anchor) return;

    const href = anchor.getAttribute('href') || anchor.getAttribute('data-to');
    if (!href || href.startsWith('http') || href.startsWith('//') || href.startsWith('#')) return;

    preloadRoute(href);
  };

  document.addEventListener('mouseover', handlePointerInteraction, { passive: true });
  document.addEventListener('touchstart', handlePointerInteraction, { passive: true });
};
