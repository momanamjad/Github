# Import Migration Guide

## Summary of Changes

All imports have been updated to use the new alias-based import system. This guide shows the mapping of old imports to new imports.

## Alias-Based Import System

### Configured Aliases (vite.config.js)
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

## Import Examples

### Common Components
| Old Import | New Import |
|-----------|-----------|
| `import Loader from "../components/Loader"` | `import Loader from "@common/Loader"` |
| `import Error from "../components/Error"` | `import Error from "@common/Error"` |
| `import ContributionGraph from "../components/ContributionGraph"` | `import ContributionGraph from "@common/ContributionGraph"` |

### Layout Components
| Old Import | New Import |
|-----------|-----------|
| `import Navbar from "../components/Navbar"` | `import Navbar from "@layout/Navbar"` |
| `import Tabs from "../components/Tabs"` | `import Tabs from "@layout/Tabs"` |
| `import ProfileSidebar from "../components/ProfileSidebar"` | `import ProfileSidebar from "@layout/ProfileSidebar"` |
| `import Topbar from "./Topbar"` | `import Topbar from "@layout/Topbar"` |

### Feature Components
| Old Import | New Import |
|-----------|-----------|
| `import RepoList from "../components/RepoList"` | `import RepoList from "@features/RepoList"` |
| `import CreateNew from "./CreateNew"` | `import CreateNew from "@features/CreateNew"` |
| `import PinnedRepos from "../components/PinnedRepos"` | `import PinnedRepos from "@features/PinnedRepos"` |
| `import NewRepoPage from "./NewRepoPage"` | `import NewRepoPage from "@features/NewRepoPage"` |

### Tab Components
| Old Import | New Import |
|-----------|-----------|
| `import Overview from "./components/tabs/Overview"` | `import Overview from "@features/tabs/Overview"` |
| `import Repositories from "./components/tabs/Repositories"` | `import Repositories from "@features/tabs/Repositories"` |
| `import Stars from "./components/tabs/Stars"` | `import Stars from "@features/tabs/Stars"` |

### UI Components
| Old Import | New Import |
|-----------|-----------|
| `import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"` | `import { Avatar, AvatarFallback, AvatarImage } from "@ui/avatar"` |
| `import { Card, CardContent } from "@/components/ui/card"` | `import { Card, CardContent } from "@ui/card"` |
| `import { Button } from "@/components/ui/button"` | `import { Button } from "@ui/button"` |
| `import { Input } from "@/components/ui/input"` | `import { Input } from "@ui/input"` |
| `import { Dialog, DialogContent } from "@/components/ui/dialog"` | `import { Dialog, DialogContent } from "@ui/dialog"` |

### Services
| Old Import | New Import |
|-----------|-----------|
| `import { getUser, getRepos } from "../services/GithubApi.jsx"` | `import { getUser, getRepos } from "@services/GithubApi.jsx"` |
| `import { getRepo, getRepoContents } from "../services/GithubApi.jsx"` | `import { getRepo, getRepoContents } from "@services/GithubApi.jsx"` |

### Utils
| Old Import | New Import |
|-----------|-----------|
| `import { languageColors } from "../utils/LanguageColors.jsx"` | `import { languageColors } from "@utils/LanguageColors.jsx"` |
| `import { cn } from "../lib/utils.js"` | `import { cn } from "@lib/utils.js"` |

### Pages
| Old Import | New Import |
|-----------|-----------|
| `import Profile from "./pages/Profile"` | `import Profile from "@pages/Profile"` |
| `import ProfileLayout from "./pages/ProfileLayout"` | `import ProfileLayout from "@pages/ProfileLayout"` |

## Why This Is Better

1. **No More Relative Path Hell**
   - ❌ Before: `../../../components/features/RepoList`
   - ✅ After: `@features/RepoList`

2. **Clear Intent**
   - `@layout/` clearly indicates layout components
   - `@features/` indicates feature-specific components
   - `@common/` indicates reusable, shared components

3. **Easier Refactoring**
   - Moving files around doesn't break imports
   - All paths are absolute and semantic

4. **Better IDE Support**
   - Better autocomplete and goto-definition
   - Cleaner intellisense suggestions

5. **Team Communication**
   - New developers instantly understand the structure
   - No confusion about import paths

## Files Updated

All component files have been updated with the new import aliases:

### Layout Components
- `src/components/layout/Navbar.jsx`
- `src/components/layout/ProfileSidebar.jsx`
- `src/components/layout/Topbar.jsx`
- `src/components/layout/Tabs.jsx`

### Feature Components
- `src/components/features/PinnedRepos.jsx`
- `src/components/features/RepoList.jsx`
- `src/components/features/RepoDetails.jsx`
- `src/components/features/EditProfileModal.jsx`
- `src/components/features/tabs/Overview.jsx`
- `src/components/features/tabs/Repositories.jsx`
- `src/components/features/tabs/Stars.jsx`

### Page Components
- `src/pages/ProfileLayout.jsx`
- `src/pages/Profile.jsx`

### Main App
- `src/App.jsx`

## Testing the New Structure

Run the development server to test:
```bash
npm run dev
```

Check that:
- ✅ No import errors in console
- ✅ All components render correctly
- ✅ Navigation works between pages
- ✅ API calls work as expected

## Rollback (if needed)

If you need to revert to old imports:
1. The old path references are documented above
2. Find and replace using the mapping tables
3. Or use your git history to see pre-reorganization state
