# Full-Scale Multi-User Backend Architecture for GitHub Clone

This guide outlines exactly how to upgrade your React GitHub clone into a **full-scale, multi-user application** using Node.js and MongoDB. Everything mapped here perfectly matches the frontend components and structures you have already built.

---

## 1. Core Concepts of a "Multi-User" System

To ensure every user sees *their* repositories, *their* profile, and *their* starred items, the backend relies on **Relational Tracking**:
- Every item created in the database (Repo, Star, Issue, Pin) is strictly linked to a **User ID (`owner`)**.
- When the frontend requests data (e.g., viewing `/momanamjad/repositories`), the backend looks up the User ID for `momanamjad`, and fetches only the repositories linked to that ID.
- **Authentication (JWT)** ensures that users can only edit or delete data that belongs to *their* ID.

---

## 2. Comprehensive Database Schemas (Mongoose)

Based on your frontend's `userData.json` and `storageService.js`, you need the following collections in MongoDB:

### A. User Collection (`models/User.js`)
Handles profiles, authentication, and social stats.
```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  login: { type: String, required: true, unique: true }, // Username (e.g., momanamjad)
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed password
  avatar_url: { type: String, default: "" },
  name: { type: String, default: "" },
  bio: { type: String, default: "" },
  company: { type: String, default: "" },
  blog: { type: String, default: "" }, // Portfolio URL
  location: { type: String, default: "" },
  twitter_username: { type: String, default: "" },
  
  // Follow system (Count is cached here for quick loading)
  followers_count: { type: Number, default: 0 },
  following_count: { type: Number, default: 0 },
  
  // Custom Status (Emoji + Text)
  status: {
    emoji: { type: String, default: "" },
    text: { type: String, default: "" },
    isBusy: { type: Boolean, default: false }
  }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('User', userSchema);
```

### B. Repository Collection (`models/Repository.js`)
Stores all repositories. The `owner` field connects the repo to a User.
```javascript
const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  full_name: { type: String, unique: true }, // e.g., "momanamjad/github-clone"
  description: { type: String, default: "" },
  private: { type: Boolean, default: false },
  visibility: { type: String, enum: ['public', 'private'], default: 'public' },
  language: { type: String, default: "" },
  homepage: { type: String, default: "" },
  topics: [{ type: String }],
  
  // Stats
  stargazers_count: { type: Number, default: 0 },
  forks_count: { type: Number, default: 0 },
  open_issues_count: { type: Number, default: 0 },
  
  // The crucial link to the User
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Virtual File System (Matching your frontend's fileTree)
  fileTree: [{
    type: { type: String, enum: ['dir', 'file'] },
    name: { type: String },
    path: { type: String },
    content: { type: String }, // Present only if it's a file
    children: [] // Nested items if it's a dir
  }],

  pushed_at: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Ensure a user cannot have two repos with the same name
repositorySchema.index({ owner: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Repository', repositorySchema);
```

### C. Star & Pin Collections (`models/Activity.js` & `models/Pin.js`)
Instead of putting arrays of starred/pinned repos inside the User model, we use relational tables. This allows infinite scaling.

**Pinned Repo Schema (`models/Pin.js`)**
```javascript
const pinSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  repository: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository', required: true },
  pinned_at: { type: Date, default: Date.now }
});
```

**Star Schema (`models/Star.js`)**
```javascript
const starSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  repository: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository', required: true },
  starred_at: { type: Date, default: Date.now }
});
```

### D. Contribution Graph Data (`models/Contribution.js`)
Your frontend uses `ContributionGraph` in `Profile.jsx`. To populate this, you need a record of daily activity.
```javascript
const contributionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // e.g., "2024-03-14"
  count: { type: Number, default: 1 } // Number of commits/actions that day
});
```

---

## 3. Required API Endpoints

To make your frontend fully functional, build these precise routes in Express:

### Users & Authentication
*   `POST /api/auth/register` - Create account, hash password, return JWT.
*   `POST /api/auth/login` - Verify credentials, return JWT.
*   `GET /api/users/:username` - Fetch public profile data (used in `Profile.jsx`).
*   `PUT /api/users/profile` - Update profile details (Bio, location, status). Requires JWT token.

### Repositories
*   `GET /api/users/:username/repos` - Get all public repos for a specific user.
*   `GET /api/repos/:owner/:repoName` - Get details & `fileTree` for a specific repo (used in `RepoDetails.jsx`).
*   `POST /api/repos` - Create a new repo for the logged-in user. Automatically adds initial `README.md` to `fileTree`. Requires JWT.
*   `DELETE /api/repos/:id` - Delete repo. Backend must verify the logged-in user actually owns it! Requires JWT.

### Pins & Stars
*   `GET /api/users/:username/pinned` - Fetch pinned repos.
*   `POST /api/repos/:id/pin` - Toggle pin status. Requires JWT.
*   `GET /api/users/:username/starred` - Fetch starred repos.
*   `POST /api/repos/:id/star` - Toggle star status (increases `stargazers_count` on the Repo). Requires JWT.

### Contributions (The Graph)
*   `GET /api/users/:username/contributions` - Returns an array of `{ date, count }` to feed into your `ContributionGraph` component. Note: Whenever a user creates a repo or modifies a file, the backend should automatically increment the contribution count for that day.

---

## 4. Frontend Integration Guide (What You Must Change)

Once this backend is built, you need to strip out `storageService.js` and connect React to the live APIs.

### A. Ditch LocalStorage & use React Context / Redux
1. Remove all logic in `src/services/storageService.js`.
2. Update `src/services/GithubApi.jsx` to use `fetch` or `axios` pointing to your Node server.
   ```javascript
   // Old (Mocked)
   export const getUser = async (username) => {
     // returning local JSON
   };

   // New (Live API)
   export const getUser = async (username) => {
     const response = await fetch(`http://localhost:5000/api/users/${username}`);
     return response.json();
   }
   ```

### B. Managing Dates & Times correctly
Currently, your mock data has hardcoded dates (`"created_at": "2023-01-15T10:20:00Z"`). 
When you use MongoDB, Mongoose automatically generates real timestamps (`created_at`, `updated_at`). 
Your frontend components (like `RepoList`) should use libraries like `date-fns` or native `Date().toLocaleDateString()` to dynamically render "Updated 2 hours ago" or "Created on Mar 14".

### C. Implementing the Contribution Graph
If you are using `react-github-calendar`, it naturally calls the real GitHub API. To make it read from *your* database, you must pass custom data to it:
```jsx
// Fetch data from /api/users/:username/contributions
const myData = [
  { date: '2024-01-01', count: 5, level: 2 },
  { date: '2024-01-02', count: 0, level: 0 }
];

// Pass it to the component
<GitHubCalendar username="does_not_matter" data={myData} />
```

---

## 5. Next Steps for You

1. Create a completely new folder outside of your frontend (e.g., `github-clone-api`).
2. Run `npm init -y` and `npm install express mongoose dotenv cors bcryptjs jsonwebtoken`.
3. Create the Database Models exactly as shown in Section 2 above.
4. Replace the old `getStoredUser` and `getStoredRepositories` functions in your frontend Context API with actual network calls!
