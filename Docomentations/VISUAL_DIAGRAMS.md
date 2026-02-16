# Visual Diagrams - Understanding the Code Flow

## 🔄 Overall Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER ENVIRONMENT                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐         ┌──────────────────┐              │
│  │   Components     │         │   App.jsx        │              │
│  │  (NewRepoPage,   │         │   (initializes   │              │
│  │  Repositories,   │         │    storage)      │              │
│  │  Profile, etc)   │         └────────┬─────────┘              │
│  └────────┬─────────┘                  │                        │
│           │                            │                        │
│           └────────────┬───────────────┘                        │
│                        │                                         │
│               (import functions)                                 │
│                        │                                         │
│                        ▼                                         │
│           ┌─────────────────────────────┐                       │
│           │  storageService.js          │                       │
│           │  ───────────────────────    │                       │
│           │  • getStoredUser()          │                       │
│           │  • getStoredRepositories()  │                       │
│           │  • addRepository()          │                       │
│           │  • deleteRepository()       │                       │
│           │  • pinRepository()          │                       │
│           │  • starRepository()         │                       │
│           │  • and more...              │                       │
│           └────────────┬────────────────┘                       │
│                        │                                         │
│              (read/write operations)                             │
│                        │                                         │
│                        ▼                                         │
│           ┌─────────────────────────────┐                       │
│           │  Browser localStorage       │                       │
│           │  ───────────────────────    │                       │
│           │  • github_user              │                       │
│           │  • github_repositories      │                       │
│           │  • github_pinned_repos      │                       │
│           │  • github_starred_repos     │                       │
│           └─────────────────────────────┘                       │
│                                                                   │
│           ┌─────────────────────────────┐                       │
│           │  userData.json              │                       │
│           │  ───────────────────────    │                       │
│           │  (Loaded on first use)      │                       │
│           └─────────────────────────────┘                       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🆕 Create Repository Flow (Detailed)

```
┌─────────────────────────────────────────────────────────────────┐
│                       USER INTERACTION                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. User navigates to /new page                                  │
│                 │                                                │
│                 ▼                                                │
│  2. NewRepoPage component renders with form                      │
│     ┌──────────────────────────────────────┐                    │
│     │ Repository Name: [____________]      │                    │
│     │ Description:    [____________]       │                    │
│     │ Visibility:     [Public ▼]           │                    │
│     │ License:        [None ▼]             │                    │
│     │ [CREATE REPOSITORY] button           │                    │
│     └──────────────────────────────────────┘                    │
│                 │                                                │
│      User types and clicks "CREATE REPOSITORY"                   │
│                 │                                                │
│                 ▼                                                │
│  3. handleSubmit() function triggered                            │
│     ┌──────────────────────────────────────┐                    │
│     │ e.preventDefault()                   │                    │
│     │ [Prevent page refresh]               │                    │
│     └──────────────────────────────────────┘                    │
│                 │                                                │
│                 ▼                                                │
│  4. Validate repository name                                     │
│     ┌──────────────────────────────────────┐                    │
│     │ if (repoName is empty)               │                    │
│     │   → Show alert & return              │                    │
│     │ else                                 │                    │
│     │   → Continue to next step            │                    │
│     └──────────────────────────────────────┘                    │
│                 │                                                │
│                 ▼                                                │
│  5. Create newRepo object                                        │
│     ┌──────────────────────────────────────┐                    │
│     │ const newRepo = {                    │                    │
│     │   name: "my-awesome-app",            │                    │
│     │   description: "...",                │                    │
│     │   private: false,                    │                    │
│     │   ... [20+ properties]               │                    │
│     │ }                                    │                    │
│     └──────────────────────────────────────┘                    │
│                 │                                                │
│                 ▼                                                │
│  6. Call addRepository(newRepo)                                  │
│                 │                                                │
│                 ▼                                                │
│     ┌────────────────────────────────────────────┐              │
│     │   INSIDE addRepository() function          │              │
│     ├────────────────────────────────────────────┤              │
│     │                                            │              │
│     │  a. Get existing repos from localStorage  │              │
│     │     getStoredRepositories()                │              │
│     │              │                             │              │
│     │              ▼                             │              │
│     │     repos = [{id:1,...}, {id:2,...}]  │              │
│     │                                            │              │
│     │  b. Generate new unique ID                │              │
│     │     newId = 3                             │              │
│     │                                            │              │
│     │  c. Add all properties to newRepo         │              │
│     │     ├─ id: 3                              │              │
│     │     ├─ node_id: "R_kgDOGrJ_Dg"            │              │
│     │     ├─ owner: {...}                       │              │
│     │     ├─ created_at: "2024-12-15T..."       │              │
│     │     └─ [more...]                          │              │
│     │                                            │              │
│     │  d. Add to repos array                    │              │
│     │     repos.push(repoWithId)               │              │
│     │     repos.length is now 3                │              │
│     │                                            │              │
│     │  e. Save back to localStorage            │              │
│     │     localStorage.setItem(                 │              │
│     │       'github_repositories',              │              │
│     │       JSON.stringify(repos)               │              │
│     │     )                                     │              │
│     │                                            │              │
│     │  f. Return updated repos array            │              │
│     │     ✅ Complete!                          │              │
│     │                                            │              │
│     └────────────────────────────────────────────┘              │
│                 │                                                │
│                 ▼                                                │
│  7. Set success message                                          │
│     ✅ Repository "my-awesome-app" created successfully!         │
│                 │                                                │
│                 ▼                                                │
│  8. Wait 2 seconds                                               │
│     setTimeout(() => { ... }, 2000)                              │
│                 │                                                │
│                 ▼                                                │
│  9. Navigate to /repositories                                    │
│     navigate("/repositories")                                    │
│                 │                                                │
│                 ▼                                                │
│  10. Repositories page loads                                     │
│      └─ getRepos() is called                                     │
│      └─ Fetches from localStorage                                │
│      └─ New repo is in the list!                                 │
│                                                                   │
│  ✨ SUCCESS! ✨                                                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💾 Data Structure Flow

```
┌──────────────────────────────────────┐
│  User fills form in NewRepoPage       │
│  ┌────────────────────────────────┐  │
│  │ name: "my-app"                 │  │
│  │ description: "My awesome app"  │  │
│  │ visibility: "public"           │  │
│  └────────────────────────────────┘  │
└──────────────────────┬────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  addRepository() creates complete object                      │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ {                                                        ││
│  │   id: 6,                        (auto-generated)        ││
│  │   node_id: "R_kgDOGrJ_Fg",      (auto-generated)        ││
│  │   name: "my-app",               (from form input)       ││
│  │   full_name: "momanamjad/my-app", (constructed)         ││
│  │   private: false,               (from visibility field) ││
│  │   description: "My awesome app", (from form input)      ││
│  │   owner: {                      (from user data)        ││
│  │     login: "momanamjad",                                ││
│  │     avatar_url: "...",                                  ││
│  │     ...                                                 ││
│  │   },                                                    ││
│  │   html_url: "https://github.com/...", (constructed)    ││
│  │   created_at: "2024-12-15T14:30:00Z", (current time)   ││
│  │   updated_at: "2024-12-15T14:30:00Z", (current time)   ││
│  │   pushed_at: "2024-12-15T14:30:00Z",  (current time)   ││
│  │   fork: false,                  (default)              ││
│  │   language: null,               (default)              ││
│  │   has_issues: true,             (default)              ││
│  │   has_projects: true,           (default)              ││
│  │   has_downloads: true,          (default)              ││
│  │   has_wiki: true,               (default)              ││
│  │   stargazers_count: 0,          (default)              ││
│  │   forks_count: 0,               (default)              ││
│  │   topics: []                    (empty array)          ││
│  │ }                                                       ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────┬─────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────┐
│  Convert to JSON string              │
│  └─ JSON.stringify(repoObject)       │
│                                      │
│  Result: (as text)                   │
│  {"id":6,"node_id":"R_kgDOGrJ_Fg"... │
└──────────────────────┬────────────────┘
                       │
                       ▼
┌──────────────────────────────────────┐
│  Save to browser localStorage        │
│                                      │
│  localStorage.setItem(               │
│    'github_repositories',            │
│    jsonString                        │
│  )                                   │
│                                      │
│  Key: 'github_repositories'          │
│  Value: (JSON string of all repos)   │
└──────────────────────┬────────────────┘
                       │
                       ▼
┌──────────────────────────────────────┐
│  When needed, retrieve and convert   │
│  back to JavaScript object           │
│  └─ JSON.parse(retrievedString)      │
│                                      │
│  Now it's usable in your code!       │
└──────────────────────────────────────┘
```

---

## 🔄 Component Data Flow

```
┌─────────────────────────────────────┐
│  App.jsx (Root Component)           │
│  useEffect(() => {                  │
│    initializeStorage();             │
│  })                                 │
└────────────┬──────────────────────┬─┘
             │                      │
    ┌────────▼──────┐    ┌──────────▼──────┐
    │ NewRepoPage   │    │ Repositories    │
    │ (Create New)  │    │ (Display List)  │
    │               │    │                 │
    │ Uses:         │    │ Uses:           │
    │ addRepository │    │ getRepos()      │
    │ (write)       │    │ (read)          │
    └────────┬──────┘    └──────────┬──────┘
             │                      │
             └──────────┬───────────┘
                        │
                        ▼
        ┌──────────────────────────┐
        │  GithubApi.jsx           │
        │  (Bridge/Adapter)        │
        │                          │
        │  getRepos() →            │
        │  getStoredRepositories()│
        └────────────┬─────────────┘
                     │
                     ▼
        ┌──────────────────────────┐
        │ storageService.js        │
        │ (All functions)          │
        └────────────┬─────────────┘
                     │
                     ▼
        ┌──────────────────────────┐
        │  Browser localStorage    │
        │  (Persistent Storage)    │
        └──────────────────────────┘
```

---

## 📊 State Management

```
Form Input (NewRepoPage.jsx)
    ↓
State: formData
┌──────────────────────────┐
│ owner: "momanamjad"      │
│ repoName: ""             │
│ description: ""          │
│ visibility: "public"     │
│ license: "none"          │
└──────────────────────────┘
    ↓ onChange
handleInputChange() → updates state
    ↓
Form renders with new values
    ↓ onClick submit
handleSubmit()
    ├─ Create object from state
    ├─ Call addRepository()
    ├─ Set success message
    └─ Navigate to /repositories
```

---

## 🔐 localStorage Keys Map

```
Browser localStorage
│
├─ github_user
│  └─ {
│       login: "momanamjad",
│       name: "Monam Amjad",
│       avatar_url: "...",
│       followers: 125,
│       ...
│     }
│
├─ github_repositories
│  └─ [
│       { id: 1, name: "github-clone", ... },
│       { id: 2, name: "react-portfolio", ... },
│       { id: 3, name: "my-new-app", ... },  ← NEW
│       ...
│     ]
│
├─ github_pinned_repositories
│  └─ [
│       { name: "github-clone", ... },
│       { name: "python-data-science", ... },
│       ...
│     ]
│
└─ github_starred_repositories
   └─ [
        { full_name: "facebook/react", ... },
        { full_name: "vuejs/vue", ... },
        ...
      ]
```

---

## ✨ Key Takeaways

1. **One-way flow:** Components → storageService → localStorage
2. **Automatic ID generation:** Each new repo gets unique ID
3. **Persistent:** Data survives page refreshes
4. **Complete objects:** All properties auto-added (owner, timestamps, etc.)
5. **Easy to debug:** Open DevTools → Application → LocalStorage

---

## 🎯 Remember:

```
Form Data → Object → JSON → localStorage → JSON → Object → Display
```

That's the complete flow! 🚀
