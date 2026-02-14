# GitHub Clone - Routes and Data Documentation

## Table of Contents
1. [Application Routes](#application-routes)
2. [Pages and Their Data Sources](#pages-and-their-data-sources)
3. [Tabs/Sub-Routes and Their Data Sources](#tabssub-routes-and-their-data-sources)
4. [Data Source References](#data-sources-references)
5. [Navigation Mappings](#navigation-mappings)

---

## Application Routes

### Main Routes Structure (App.jsx)
```
Routes
├── <OpenMenuLayout> (Layout wrapper with Navbar)
│   ├── / → Home Page
│   ├── /issues → Issues Page
│   ├── /pull-requests → Pull Requests Page
│   ├── /repositories → Repositories Page
│   ├── /projects → Projects Page
│   ├── /discussions → Discussions Page
│   ├── /codespaces → Codespaces Page
│   ├── /copilot → Copilot Page
│   ├── /explore → Explore Page
│   ├── /marketplace → Marketplace Page
│   ├── /mcp-registry → MCP Registry Page
│   ├── /new → New Repo Page
│   └── /profile/stars → Stars (Global Route)
│
├── /new → New Repo Page
│
└── /:username (ProfileLayout - Layout with Navbar, Tabs, Sidebar)
    ├── / → Overview Tab
    ├── /repositories → Repositories Tab
    ├── /stars → Stars Tab (Profile-specific)
    └── /:username/:repo → Repo Details Page
```

### Route Configuration Details

| Route | Component | Template | Data Source | Description |
|-------|-----------|----------|-------------|-------------|
| `/` | Home | OpenMenuLayout | Local State | Home feed with repositories |
| `/issues` | Issues | OpenMenuLayout | Local State | GitHub Issues page |
| `/pull-requests` | PullRequests | OpenMenuLayout | Local State | GitHub Pull Requests page |
| `/repositories` | Repositories | OpenMenuLayout | Local State | All Repositories |
| `/projects` | Projects | OpenMenuLayout | Local State | GitHub Projects |
| `/discussions` | Discussions | OpenMenuLayout | Local State | GitHub Discussions |
| `/codespaces` | Codespaces | OpenMenuLayout | Local State | GitHub Codespaces |
| `/copilot` | Copilot | OpenMenuLayout | Local State | GitHub Copilot page |
| `/explore` | Explore | OpenMenuLayout | Local State | Explore page |
| `/marketplace` | Marketplace | OpenMenuLayout | Local State | GitHub Marketplace |
| `/mcp-registry` | MCPRegistry | OpenMenuLayout | Local State | MCP Registry |
| `/new` | NewRepoPage | No Layout | Local State | Create new repository |
| `/profile/stars` | Stars | OpenMenuLayout | Static Data | Starred repos globally |
| `/:username` | Overview | ProfileLayout | API / Static Data | User profile overview |
| `/:username/repositories` | Repositories | ProfileLayout | Local State | User's repositories tab |
| `/:username/stars` | Stars | ProfileLayout | Static Data | User's starred repos |
| `/:username/projects` | Projects | ProfileLayout | Local State | User's projects tab |
| `/:username/packages` | Packages | ProfileLayout | Local State | User's packages tab |
| `/:username/:repo` | RepoDetails | ProfileLayout | API / Static Data | Repository details |

---

## Pages and Their Data Sources

### 1. Home (`src/pages/Home.jsx`)
- **Route:** `/`
- **Template:** OpenMenuLayout (Navbar only)
- **Data Source:** Local hardcoded state
- **Data:**
  - Repository list (hardcoded array of repo names)
  - Filter state
- **Key Components Used:**
  - NewRepoBtn
  - FilterModal

### 2. Profile (`src/pages/Profile.jsx`)
- **Route:** `/:username`
- **Template:** ProfileLayout (Navbar + Tabs + Sidebar)
- **Data Source:** **GitHub API** (`src/services/GithubApi.jsx`)
  - `getUser(username)` - Fetches user profile
  - `getRepos(username)` - Fetches user repositories
- **Data:**
  - User profile data (name, avatar, bio, followers, etc.)
  - Repositories list
  - Contribution graph
  - Pinned repositories
- **Key Components Used:**
  - ProfileSidebar
  - Tabs
  - PinnedRepos
  - ContributionGraph
  - RepoList
  - RepoFilterBar

### 3. Overview Tab (`src/components/features/tabs/Overview.jsx`)
- **Route:** `/:username` (index route)
- **Template:** ProfileLayout
- **Data Source:** GitHub API (from parent Profile page)
- **Data:**
  - User profile (from parent)
  - Pinned repositories
  - Contribution calendar

### 4. Repositories Tab (`src/components/features/tabs/Repositories.jsx`)
- **Route:** `/:username/repositories`
- **Template:** ProfileLayout
- **Data Source:** Local hardcoded state
- **Data:**
  - Repository list with filters
  - Sort options
  - View mode (list/grid)
- **Features:**
  - Search functionality
  - Filter by type (my-contributions, sources, forks, mirrors, templates)
  - Sort options (relevance, stars, recently-updated, name)

### 5. Stars Tab (`src/components/features/tabs/Stars.jsx`)
- **Route 1:** `/:username/stars` (with sidebar)
- **Route 2:** `/profile/stars` (global, with navbar only)
- **Template:** ProfileLayout OR OpenMenuLayout
- **Data Source:** **Static Data** (`src/services/staticData.js`)
  - `getStaticStarredRepos(username)` - Returns starred repositories
- **Data:**
  - Starred repositories array
  - Filter options (type, language)
  - Sort options
  - Create lists functionality
- **Key Data Fields:**
  ```javascript
  {
    id: number,
    name: string,
    full_name: string, // "owner/repo"
    owner: {
      login: string,
      avatar_url: string,
      type: string // "Organization" or "User"
    },
    html_url: string,
    description: string,
    stargazers_count: number,
    language: string,
    forks_count: number,
    archived: boolean,
    visibility: string,
    updated_at: string // ISO date
  }
  ```

### 6. Projects Page (`src/pages/Projects.jsx`)
- **Route:** `/projects`
- **Template:** OpenMenuLayout
- **Data Source:** Local hardcoded state
- **Data:**
  - Project list
  - Recently viewed projects
  - Owned projects
  - Contributed projects

### 7. Repositories Page (`src/pages/Repositories.jsx`)
- **Route:** `/repositories`
- **Template:** OpenMenuLayout
- **Data Source:** Local hardcoded state
- **Data:**
  - Repository list
  - Filter options (my-contributions, sources, forks, mirrors, templates, archived, private)
  - Sort options
  - View mode (list/grid)

### 8. Issues Page (`src/pages/Issues.jsx`)
- **Route:** `/issues`
- **Template:** OpenMenuLayout
- **Data Source:** Local hardcoded state
- **Data:**
  - Issue list with tabs
  - Filter and search

### 9. Pull Requests Page (`src/pages/PullRequests.jsx`)
- **Route:** `/pull-requests`
- **Template:** OpenMenuLayout
- **Data Source:** Local hardcoded state
- **Data:**
  - PR list with tabs
  - Filter and search

### 10. Discussions Page (`src/pages/Discussions.jsx`)
- **Route:** `/discussions`
- **Template:** OpenMenuLayout
- **Data Source:** Local hardcoded state
- **Data:**
  - Discussion list

### 11. Codespaces Page (`src/pages/Codespaces.jsx`)
- **Route:** `/codespaces`
- **Template:** OpenMenuLayout
- **Data Source:** Local hardcoded state
- **Data:**
  - Codespaces list

### 12. Copilot Page (`src/pages/Copilot.jsx`)
- **Route:** `/copilot`
- **Template:** OpenMenuLayout
- **Data Source:** Local hardcoded state
- **Data:**
  - Static UI with call-to-action

### 13. Explore Page (`src/pages/Explore.jsx`)
- **Route:** `/explore`
- **Template:** OpenMenuLayout
- **Data Source:** Local hardcoded state
- **Data:**
  - Trending repositories

### 14. Marketplace Page (`src/pages/Marketplace.jsx`)
- **Route:** `/marketplace`
- **Template:** OpenMenuLayout
- **Data Source:** Local hardcoded state
- **Data:**
  - Marketplace apps and actions

### 15. MCP Registry Page (`src/pages/MCPRegistry.jsx`)
- **Route:** `/mcp-registry`
- **Template:** OpenMenuLayout
- **Data Source:** Local hardcoded state
- **Data:**
  - MCP registry list

### 16. New Repo Page (`src/components/features/NewRepoPage.jsx`)
- **Route:** `/new`
- **Template:** No Layout (standalone)
- **Data Source:** Local state
- **Data:**
  - Form fields for creating new repo

### 17. Repo Details Page (`src/components/features/RepoDetails.jsx`)
- **Route:** `/:username/:repo`
- **Template:** ProfileLayout
- **Data Source:** GitHub API OR Static Data
  - Primary: `getRepos(username)` from API
  - Fallback: Static data
- **Data:**
  - Repository metadata
  - File list
  - README content
  - Contributors

---

## Tabs/Sub-Routes and Their Data Sources

### Profile Tabs (visible when `:username` route is active)

The profile layout displays 5 tabs accessed via the `<Tabs>` component in `src/components/layout/Tabs.jsx`:

| Tab | Route | Icon | Component | Data Source |
|-----|-------|------|-----------|-------------|
| Overview | `/:username` | OverviewIcon | Overview.jsx | GitHub API |
| Repositories | `/:username/repositories` | RepositoryIcon | Repositories.jsx | Local State |
| Projects | `/:username/projects` | ProjectsIcon | Projects.jsx | Local State |
| Packages | `/:username/packages` | PackageIcon | Packages.jsx | Local State |
| Stars | `/:username/stars` | StarsIcon | Stars.jsx | Static Data |

**Note:** The tabs component uses `useParams()` to get the `username` and dynamically builds route links with the pattern `/:username/{tabPath}`.

---

## Data Sources References

### 1. GitHub API (`src/services/GithubApi.jsx`)
**Functions Available:**
- `getUser(username)` - Fetches user profile data
- `getRepos(username)` - Fetches user repositories

**Used in:**
- Profile page (Overview tab)
- Repo Details page

**Authentication:** Token-based (GITHUB_TOKEN environment variable)

### 2. Static Data (`src/services/staticData.js`)
**Key Exports:**
```javascript
// User data
STATIC_USERS[username]
createUserData(username)

// Repository data
STATIC_REPOS[username]
getStaticRepos(username)
getStaticPinnedRepos(username)
getStaticStarredRepos(username) // ⭐ Used for Stars tab

// Generated data
generateReposForUser(username)
generatePinnedReposForUser(username)
generateStarredReposForUser(username)
```

**Starred Repos Data:**
Located in `generateStarredReposForUser()` function, contains 3 repos:
1. facebook/react
2. vuejs/vue
3. nodejs/node

Each with full metadata (stars, language, forks, etc.)

**Used in:**
- Stars tab (both `/:username/stars` and `/profile/stars`)
- Profile sidebar repos
- Pinned repos display

---

## Navigation Mappings

### Navbar Routes (`src/components/layout/Navbar.jsx`)
```javascript
const routeMap = {
  Home: "/",
  Issues: "/issues",
  "Pull requests": "/pull-requests",
  Repositories: "/repositories",
  Projects: "/projects",
  Stars: "/stars",  // Global stars route
  Discussions: "/discussions",
  Codespaces: "/codespaces",
  Copilot: "/copilot",
  Explore: "/explore",
  MarketPlace: "/marketplace",
  "MCP Registory": "/mcp-registry",
};
```

### GitHub Sidebar Menu Routes (`src/components/layout/GithubOpenMenu.jsx`)
Same as Navbar routeMap - points to the same routes.

### Profile Tabs Routes (`src/components/layout/Tabs.jsx`)
```javascript
Routes are dynamically generated using `useParams()`:
- ${username} → Overview
- ${username}/repositories → Repositories
- ${username}/projects → Projects
- ${username}/packages → Packages
- ${username}/stars → Stars
```

---

## Data Flow Summary

### Global Pages (with Navbar)
```
User clicks nav button → Navigate to route → OpenMenuLayout renders with Navbar
→ Route component loads → Component uses local state for data
```

**Example: Home Page**
- Route: `/`
- Navigation: navbar
- Data: Local state (hardcoded repos array)
- Layout: OpenMenuLayout (Navbar only)

---

### Profile Pages (with Navbar, Tabs, and Sidebar)
```
User navigates to /:username
→ ProfileLayout renders with Navbar, Tabs, and Sidebar
→ Profile.jsx fetches data from GitHub API
→ Tab route determines which tab component renders
→ Each tab uses its own data (API or local state)
```

**Example: User Overview**
- Route: `/:username`
- Navigation: Navbar + Tabs
- Data: GitHub API (user profile, repos, contributions)
- Layout: ProfileLayout

**Example: User Stars**
- Route: `/:username/stars`
- Navigation: Navbar + Tabs
- Data: Static Data (generateStarredReposForUser)
- Layout: ProfileLayout
- Component: Stars.jsx
- Data fetching: `useEffect` hook calls `getStaticStarredRepos('momanamjad')`

---

### Global Stars Page (with Navbar only)
```
User clicks "Stars" in Navbar
→ Navigate to /profile/stars
→ OpenMenuLayout renders with Navbar
→ Stars.jsx component loads
→ Uses static data from getStaticStarredRepos()
```

- Route: `/profile/stars`
- Navigation: Navbar (no Tabs visible)
- Data: Static Data
- Layout: OpenMenuLayout

---

## Key Points

1. **Stars Tab Location:** Accessible in two ways:
   - As part of user profile: `/:username/stars` (shows with sidebar)
   - Global route: `/profile/stars` (shows without sidebar)

2. **Data Source for Stars:** Always uses `getStaticStarredRepos()` from `staticData.js`

3. **Profile Data:** Comes from GitHub API for real users, falls back to static data when needed

4. **Layout System:**
   - **OpenMenuLayout:** Navigation bar only (global pages)
   - **ProfileLayout:** Navigation bar + Profile tabs + Sidebar (profile pages)

5. **Tabs Navigation:** Uses React Router's `NavLink` with dynamic username parameter

6. **Current User:** Most pages reference 'momanamjad' as the default user

---

## File Structure Reference

```
src/
├── App.jsx                      # Main routing configuration
├── pages/                       # Top-level page components
│   ├── Profile.jsx             # User profile page (fetches API data)
│   ├── Home.jsx                # Home page
│   ├── Repositories.jsx        # Repositories page
│   ├── Issues.jsx              # Issues page
│   ├── PullRequests.jsx        # Pull Requests page
│   ├── Projects.jsx            # Projects page
│   ├── Discussions.jsx         # Discussions page
│   ├── Codespaces.jsx          # Codespaces page
│   ├── Copilot.jsx             # Copilot page
│   ├── Explore.jsx             # Explore page
│   ├── Marketplace.jsx         # Marketplace page
│   ├── MCPRegistry.jsx         # MCP Registry page
│   ├── ProfileLayout.jsx       # Layout wrapper for profile
│   └── index.js                # Page exports
├── components/
│   ├── features/
│   │   ├── tabs/
│   │   │   ├── Overview.jsx    # Overview tab
│   │   │   ├── Repositories.jsx # Repositories tab
│   │   │   ├── Stars.jsx       # ⭐ Stars tab (uses static data)
│   │   │   ├── Projects.jsx    # Projects tab
│   │   │   └── Packages.jsx    # Packages tab
│   │   ├── RepoDetails.jsx     # Repository details page
│   │   └── NewRepoPage.jsx     # New repo creation page
│   ├── layout/
│   │   ├── Navbar.jsx          # Top navigation bar
│   │   ├── Tabs.jsx            # Profile tabs navigation
│   │   ├── ProfileSidebar.jsx  # User profile sidebar
│   │   ├── GithubOpenMenu.jsx  # GitHub sidebar menu
│   │   └── Topbar.jsx          # Top bar actions
│   └── ...
├── services/
│   ├── GithubApi.jsx           # API service (getUser, getRepos)
│   └── staticData.js           # Static data (users, repos, starred)
├── contexts/
│   └── TabsContext.jsx         # Context for tab state
├── hooks/                       # Custom React hooks
├── lib/
│   └── utils.js                # Utility functions
└── utils/
    └── LanguageColors.jsx      # Language color mapping
```

---

## Last Updated
February 14, 2026

---

## Notes for Developers

- Always check `src/services/staticData.js` for available data before making API calls
- Use `getStaticStarredRepos(username)` for stars data
- Profile pages require a username parameter from URL
- Global pages don't require authentication or user context
- All routes are configured in `App.jsx`
- Sidebar is only visible in ProfileLayout (profile-specific pages)
