# Quick Reference Guide - Using localStorage in This App

## 🎯 Quick Start

### **The 3 Main Services:**

1. **userData.json** - Default data (read-only)
2. **storageService.js** - Functions to manage data
3. **GithubApi.jsx** - Bridge between components and storage

---

## 📚 Common Tasks

### **1. Get All Repositories**
```javascript
import { getStoredRepositories } from "@services/storageService.js";

const repos = getStoredRepositories();
// repos.forEach(repo => console.log(repo.name));
```

### **2. Create New Repository** 
```javascript
import { addRepository } from "@services/storageService.js";

const newRepo = {
  name: "my-app",
  description: "My awesome app",
  // ... other properties
};
addRepository(newRepo);
// the service will automatically assign an `id` and attach a
// minimal `fileTree` array (src/ folder + README.md) so the repo
// can be browsed/edited immediately.
```

### **3. Get User Info**
```javascript
import { getStoredUser } from "@services/storageService.js";

const user = getStoredUser();
// console.log(user.login); // "momanamjad"
```

### **4. Pin a Repository**
```javascript
import { pinRepository } from "@services/storageService.js";

const repo = repos[0];
pinRepository(repo);
```

### **5. Star a Repository**
```javascript
import { starRepository } from "@services/storageService.js";

const repo = repos[0];
starRepository(repo);
```

### **6. Delete Repository**
```javascript
import { deleteRepository } from "@services/storageService.js";

deleteRepository(1); // Delete repo with ID 1
```

### **7. Update Repository**
```javascript
import { updateRepository } from "@services/storageService.js";

updateRepository(1, {
  description: "New description",
  stargazers_count: 10
});
```

---

## 🏗️ Architecture at a Glance

```
Component (e.g., NewRepoPage.jsx)
    ↓ imports functions from
src/services/storageService.js
    ↓ functions read/write to
Browser's localStorage
    ↓ also used by
src/services/GithubApi.jsx
    ↓ which provides data to
Other Components
```

---

## 💾 localStorage Keys

```javascript
{
  'github_user': {...user data...},
  'github_repositories': [{...}, {...}, ...],
  'github_pinned_repositories': [{...}, {...}, ...],
  'github_starred_repositories': [{...}, {...}, ...]
}
```

---

## ✅ The Create Repository Flow

1. User fills form on `/new`
2. Click "Create repository"
3. `handleSubmit()` validates input
4. `addRepository()` creates object
5. Saves to localStorage
6. Shows success message
7. Redirects to `/repositories`
8. New repo appears in list ✨

---

## 🔍 Debug Tips

**Check what's in storage:**
```javascript
// console.log(localStorage.getItem('github_repositories'));
```

**Check storage stats:**
```javascript
import { getStorageStats } from "@services/storageService.js";
console.log(getStorageStats());
```

**Clear everything:**
```javascript
import { clearAllStorage } from "@services/storageService.js";
clearAllStorage();
```

---

## 📖 For Detailed Info:

See: **ADD_REPOSITORY_TUTORIAL.md**

---

## 🎓 You're All Set!

Your app now has:
- ✅ Data stored in JSON format
- ✅ localStorage persistence
- ✅ Create new repository functionality
- ✅ Full CRUD operations available
- ✅ Comprehensive documentation

Start creating repositories! 🚀
