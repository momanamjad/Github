import { lazy } from 'react';


export const Home = lazy(() => import('./Home'));
export const Issues = lazy(() => import('./Issues'));
export const PullRequests = lazy(() => import('./PullRequests'));
export const Repositories = lazy(() => import('./Repositories'));
export const Projects = lazy(() => import('./Projects'));
export const Discussions = lazy(() => import('./Discussions'));
export const Codespaces = lazy(() => import('./Codespaces'));
export const Copilot = lazy(() => import('./Copilot'));
export const Explore = lazy(() => import('./Explore'));
export const Marketplace = lazy(() => import('./Marketplace'));
export const MCPRegistry = lazy(() => import('./MCPRegistry'));
export const Terminal = lazy(() => import('./Terminal'));
