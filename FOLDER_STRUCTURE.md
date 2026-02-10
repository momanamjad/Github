# GitHub Clone Project - Folder Structure Documentation

## Project Structure Overview

This project follows a **feature-based, scalable folder structure** that separates concerns and improves maintainability.

```
src/
├── components/
│   ├── common/              # Shared, reusable components
│   │   ├── Check.jsx
│   │   ├── ContributionGraph.jsx
│   │   ├── Error.jsx
│   │   ├── Loader.jsx
│   │   └── index.js         # Named exports for easy imports
│   │
│   ├── layout/              # Layout wrapper components
│   │   ├── GithubOpenMenu.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProfileSidebar.jsx
│   │   ├── Tabs.jsx
│   │   ├── Topbar.jsx
│   │   └── index.js
│   │
│   ├── features/            # Feature-specific components
│   │   ├── CreateNew.jsx
│   │   ├── EditProfileModal.jsx
│   │   ├── GitHubSearch.jsx
│   │   ├── GitHubSidebarModal.jsx
│   │   ├── GitHubUserMenu.jsx
│   │   ├── NewRepoPage.jsx
│   │   ├── OpenIssueModal.jsx
│   │   ├── PinnedRepoCard.jsx
│   │   ├── PinnedRepos.jsx
│   │   ├── RealTimeComponent.jsx
│   │   ├── RepoDetails.jsx
│   │   ├── RepoFileList.jsx
│   │   ├── RepoFilterBar.jsx
│   │   ├── RepoHeader.jsx
│   │   ├── RepoList.jsx
│   │   ├── RepoSelector.jsx
│   │   ├── SearchInput.jsx
│   │   ├── tabs/            # Tab-specific components
│   │   │   ├── Overview.jsx
│   │   │   ├── Packages.jsx
│   │   │   ├── Projects.jsx
│   │   │   ├── Repositories.jsx
│   │   │   └── Stars.jsx
│   │   └── index.js
│   │
│   └── ui/                  # UI/Radix UI components
│       ├── avatar.jsx
│       ├── button.jsx
│       ├── card.jsx
│       ├── checkbox.jsx
│       ├── dialog.jsx
│       ├── input.jsx
│       ├── label.jsx
│       ├── select.jsx
│       ├── textarea.jsx
│       └── index.js
│
├── pages/                   # Page components (full-page views)
│   ├── Home.jsx
│   ├── Profile.jsx
│   └── ProfileLayout.jsx
│
├── services/                # API calls and external service integrations
│   └── GithubApi.jsx
│
├── lib/                     # Utility functions and helpers
│   └── utils.js
│
├── utils/                   # Non-component utilities
│   └── LanguageColors.jsx
│
├── hooks/                   # Custom React hooks (empty, ready for expansion)
│
├── constants/               # Application constants (empty, ready for expansion)
│
├── styles/                  # Global styles (empty, ready for expansion)
│
├── App.jsx                  # Main app component
├── main.jsx                 # React entry point
└── index.css                # Global styles
```

## Folder Categories Explained

### 1. **components/common**
Reusable components used across multiple features:
- Loader, Error, Check components
- Contribution Graph (used in multiple places)
- These components are **feature-agnostic**

### 2. **components/layout**
Layout wrapper components that form the page structure:
- Navbar (top navigation)
- Sidebar (profile sidebar)
- Tabs (tab navigation)
- Topbar (action bar)
- These typically contain other components

### 3. **components/features**
Feature-specific components organized by functionality:
- Repository-related: RepoList, RepoDetails, RepoFilterBar, RepoHeader, RepoFileList
- Profile-related: EditProfileModal, RealTimeComponent, PinnedRepos, PinnedRepoCard
- Modals & Menus: CreateNew, OpenIssueModal, GitHubSearch, GitHubUserMenu, GitHubSidebarModal
- Page sections: NewRepoPage
- **Sub-folder tabs/**: Tab-specific views for different content types

### 4. **components/ui**
Radix UI and atomic UI components:
- Form elements: Input, Button, Textarea, Checkbox
- Layout: Card, Dialog
- Data display: Avatar
- Select, Label for forms
- These are the **building blocks** for other components

### 5. **pages**
Full-page views that use multiple components and establish routes:
- Home page
- Profile page (main profile view)
- ProfileLayout (wrapper for profile tabs)

### 6. **services**
External API integration and business logic:
- GithubApi.jsx: All GitHub API calls
- Centralized data fetching

### 7. **lib**
Pure utility functions:
- utils.js: General helper functions (cn, merging classes, etc.)

### 8. **utils**
Non-component utilities and constants:
- LanguageColors.jsx: Language color mapping

### 9. **hooks** & **constants** & **styles** (Ready for use)
Empty folders prepared for future organization:
- hooks/: Custom React hooks (useGithubUser, useRepoData, etc.)
- constants/: App-wide constants (API_BASE_URL, DEFAULT_VALUES, etc.)
- styles/: Shared CSS-in-JS or styled component definitions

## Import Aliases

The project uses **import aliases** configured in `vite.config.js` for cleaner, more maintainable imports:

### Available Aliases:

```javascript
"@"         → src/
"@components" → src/components
"@common"    → src/components/common
"@layout"    → src/components/layout
"@features"  → src/components/features
"@ui"        → src/components/ui
"@pages"     → src/pages
"@services"  → src/services
"@utils"     → src/utils
"@lib"       → src/lib
"@hooks"     → src/hooks
"@constants" → src/constants
```

### Example Imports:

**Old way (before reorganization):**
```javascript
import Navbar from "../../../components/layout/Navbar";
import { getUser } from "../services/GithubApi";
import RepoList from "../components/RepoList";
```

**New way (after reorganization):**
```javascript
import Navbar from "@layout/Navbar";
import { getUser } from "@services/GithubApi";
import RepoList from "@features/RepoList";
```

## Best Practices

1. **Import Organization**
   - Always use aliases (@) for absolute imports
   - Group imports: external libraries first, then internal modules
   - Use index.js files in component folders for cleaner exports

2. **Component Ownership**
   - Common components are for general-purpose reuse
   - Feature components are self-contained and feature-specific
   - Layout components manage page structure
   - UI components are the atomic building blocks

3. **File Naming**
   - PascalCase for components: `MyComponent.jsx`
   - camelCase for utilities: `myHelper.js`
   - UPPERCASE for constants: `API_KEY`, `DEFAULT_VALUES`

4. **Export Pattern**
   - Always use named exports with index.js files:
   ```javascript
   // components/features/index.js
   export { default as RepoList } from './RepoList';
   
   // Usage
   import { RepoList, RepoHeader } from '@features';
   ```

## Benefits of This Structure

✅ **Scalability**: Easy to add new features without cluttering existing folders
✅ **Maintainability**: Clear separation of concerns
✅ **Reusability**: Common components isolated and easily shareable
✅ **Readability**: Import paths are clear and semantic
✅ **Team Collaboration**: New developers understand the structure immediately
✅ **Testing**: Components are organized by concern, making unit tests easier

## Future Additions

- Add hooks/ folder with custom React hooks
- Create constants/ folder for configuration values
- Add styles/ folder for CSS-in-JS if needed
- Consider adding a components/forms folder if forms become complex
