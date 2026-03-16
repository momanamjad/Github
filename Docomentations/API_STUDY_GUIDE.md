# Study Guide: GitHub Clone Full-Stack Integration 🎓

This document explains how your frontend connects to your backend. Review this to understand the "glue" that makes your application work live.

## 1. The Core: The API Client (`src/services/api.js`)
We use **Axios** to handle HTTP requests. This file simplifies every call:
- **Base URL**: It automatically uses `VITE_API_URL` (your Vercel backend URL) or `http://localhost:5000`.
- **Interceptors**: It automatically grabs the `token` from your `localStorage` and adds it to the headers. **You never have to manually send the token again.**

## 2. The Service Layer (`src/services/GithubApi.jsx`)
This file contains specific functions for every feature. Instead of writing URLs everywhere, we use these functions:

| Feature | Function | Backend Endpoint | Method |
| :--- | :--- | :--- | :--- |
| **Auth** | `getMe()` | `/auth/me` | `GET` |
| **Profile** | `getUser(username)` | `/auth/user/:username` | `GET` |
| **Repos** | `getRepos(username)` | `/repos` | `GET` |
| **Starring** | `toggleStar(id)` | `/repos/:id/star` | `POST` |
| **Pinning** | `togglePin(id)` | `/repos/:id/pin` | `POST` |
| **Search** | `searchUsers(q)` | `/auth/search` | `GET` |
| **Editing** | `updateProfile(data)` | `/auth/profile` | `PUT` |

## 3. Global State (`src/contexts/GitHubContext.jsx`)
This "Context" keeps track of who is logged in across the whole app.
- **`loading` state**: Prevents the UI from flashing "Login" before we check if you have a valid token.
- **`user` state**: Stores the logged-in user's data (username, email, etc.).

## 4. Feature Flow: How "Starring" Works
1.  **User Clicks**: A user clicks the "Star" button in `RepoList.jsx`.
2.  **Action**: `handleStarToggle` is called. It calls `toggleStar(repo._id)`.
3.  **Backend**: The backend looks up the repo in MongoDB, adds your ID to the `stars` collection, and increases the `stars_count`.
4.  **Frontend Update**: The frontend receives a "success" and updates the yellow star icon.

## 5. How to Test Your Integration
Since you are using **Vercel**, follow this testing loop:
1.  **Backend Change**: If you change a route, push to GitHub. Wait for Vercel to say "Ready".
2.  **Frontend Change**: If you update a component, push to GitHub.
3.  **Live Test**:
    -   Go to your live URL.
    -   **Register** a new account.
    -   **Create** a repository.
    -   **Star** it.
    -   **Refresh the page**. If it stays starred, your MongoDB connection is working!

---

### 💡 Pro Tip
Check your **Vercel Dashboard Logs** if something doesn't work. It will show you exactly why a request failed (e.g. `500 Server Error`).
