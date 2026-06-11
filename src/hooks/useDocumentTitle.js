import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ROUTE_TITLES = {
    '/': 'Home - GitHub Clone',
    '/issues': 'Issues - GitHub Clone',
    '/pull-requests': 'Pull Requests - GitHub Clone',
    '/repositories': 'Your Repositories - GitHub Clone',
    '/projects': 'Projects - GitHub Clone',
    '/discussions': 'Discussions - GitHub Clone',
    '/codespaces': 'Codespaces - GitHub Clone',
    '/copilot': 'GitHub Copilot - GitHub Clone',
    '/explore': 'Explore - GitHub Clone',
    '/marketplace': 'Marketplace - GitHub Clone',
    '/mcp-registry': 'MCP Registry - GitHub Clone',
    '/new': 'Create a New Repository - GitHub Clone',
};
const DEFAULT_TITLE = 'GitHub Clone - Build & Collaborate on Code';

export const useDocumentTitle = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Exact match first
        if (ROUTE_TITLES[pathname]) {
            document.title = ROUTE_TITLES[pathname];
            return;
        }

        // Dynamic route matching
        if (pathname.includes('/stars')) {
            document.title = 'Starred Repositories - GitHub Clone';
        } else if (pathname.includes('/repositories')) {
            document.title = 'Repositories - GitHub Clone';
        } else if (pathname.match(/^\/[^/]+\/[^/]+$/)) {
            // /:username/:repo → show repo name in title
            const parts = pathname.split('/');
            document.title = `${decodeURIComponent(parts[2])} / ${parts[1]} - GitHub Clone`;
        } else if (pathname.match(/^\/[^/]+$/)) {
            // /:username → profile page
            const username = pathname.slice(1);
            document.title = `${username} - GitHub Clone`;
        } else {
            document.title = DEFAULT_TITLE;
        }
    }, [pathname]);
};
