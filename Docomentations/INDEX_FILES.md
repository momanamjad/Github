# Index Files in this App

This document lists the `index` files in the project and a short description of what they re-export or group.

- **`src/components/common/index.js`**
  - Re-exports small shared components used across the app: `Check`, `ContributionGraph`, `Error`, `Loader`.
  - Purpose: central place to import common UI helpers and small widgets.

- **`src/components/features/index.js`**
  - Re-exports feature-level components (menus, modals, repo-related components) and tab components.
  - Purpose: single entry for all feature components so other modules can `import { CreateNew, GitHubUserMenu, Stars } from '.../components/features'`.

- **`src/components/layout/index.js`**
  - Re-exports layout-related components: `GithubOpenMenu`, `Navbar`, `ProfileSidebar`, `Tabs`, `Topbar`.
  - Purpose: group layout building blocks used by pages and the app shell.

- **`src/components/ui/index.js`**
  - Re-exports UI primitives and Radix-wrapped components: dialogs, avatar pieces, card parts, `Button`, `Input`, `Label`, `Textarea`, `Checkbox`, `Select`, etc.
  - Purpose: central API for UI primitives / design-system components.

- **`src/pages/index.js`**
  - Re-exports top-level page components: `Home`, `Issues`, `PullRequests`, `Repositories`, `Projects`, `Discussions`, `Codespaces`, `Copilot`, `Explore`, `Marketplace`, `MCPRegistry`.
  - Purpose: single place to import route page components.

Notes:
- Using these `index.js` re-export files keeps imports concise and consistent across the codebase.
- If you add new components, add them to the appropriate `index.js` so other modules can import from the folder root.
