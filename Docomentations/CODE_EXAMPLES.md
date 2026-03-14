# Code Examples - Real-World Use Cases

## 📁 Table of Contents
1. [Getting Data](#getting-data)
2. [Creating Data](#creating-data)
3. [Updating Data](#updating-data)
4. [Deleting Data](#deleting-data)
5. [Advanced Examples](#advanced-examples)

---

## Getting Data

### **Example 1: Display All Repositories**

```jsx
import React, { useState, useEffect } from 'react';
import { getStoredRepositories } from '@services/storageService.js';

function RepositoriesList() {
  const [repos, setRepos] = useState([]);

  useEffect(() => {
    // Get repositories from localStorage
    const allRepos = getStoredRepositories();
    setRepos(allRepos);
  }, []);

  return (
    <div>
      <h1>My Repositories</h1>
      <ul>
        {repos.map(repo => (
          <li key={repo.id}>
            <h3>{repo.name}</h3>
            <p>{repo.description}</p>
            <span>⭐ {repo.stargazers_count} stars</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RepositoriesList;
```

### **Example 2: Get User Profile**

```jsx
import { getStoredUser } from '@services/storageService.js';

function UserProfile() {
  const user = getStoredUser();

  if (!user) {
    return <p>User not found</p>;
  }

  return (
    <div>
      <img src={user.avatar_url} alt={user.login} width={100} />
      <h1>{user.name}</h1>
      <p>{user.bio}</p>
      <p>📍 {user.location}</p>
      <p>⭐ {user.followers} followers</p>
    </div>
  );
}

export default UserProfile;
```

### **Example 3: Get Single Repository**

```jsx
import { getStoredRepositories } from '@services/storageService.js';

function getRepoByName(repoName) {
  const repos = getStoredRepositories();
  return repos.find(repo => repo.name === repoName);
}

// Usage:
const myRepo = getRepoByName('github-clone');
// console.log(myRepo); // { id: 1, name: "github-clone", ... }
```

### **Example 4: Get Pinned Repositories**

```jsx
import { getStoredPinnedRepos } from '@services/storageService.js';

function PinnedRepos() {
  const pinnedRepos = getStoredPinnedRepos();

  return (
    <div>
      <h2>Pinned Repositories</h2>
      <div className="grid">
        {pinnedRepos.map(repo => (
          <div key={repo.name} className="card">
            <h3>{repo.name}</h3>
            <p>{repo.description}</p>
            <span>Language: {repo.language}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PinnedRepos;
```

---

## Creating Data

### **Example 1: Create Repository with Form**

```jsx
import { addRepository } from '@services/storageService.js';
import { useState } from 'react';

function CreateRepo() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    visibility: 'public'
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate
    if (!form.name.trim()) {
      alert('Repository name is required');
      return;
    }

    // Create object
    const newRepo = {
      name: form.name,
      description: form.description,
      private: form.visibility === 'private',
      fork: false,
      has_issues: true,
      has_projects: true,
      has_downloads: true,
      language: null,
      topics: [],
    };

    // Save to localStorage
    addRepository(newRepo);

    // Reset form
    setForm({ name: '', description: '', visibility: 'public' });
    alert('Repository created!');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Repository name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />
      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <select
        value={form.visibility}
        onChange={(e) => setForm({ ...form, visibility: e.target.value })}
      >
        <option value="public">Public</option>
        <option value="private">Private</option>
      </select>
      <button type="submit">Create Repository</button>
    </form>
  );
}

export default CreateRepo;
```

### **Example 2: Batch Create Multiple Repositories**

```jsx
import { addRepository, getStoredRepositories } from '@services/storageService.js';

function createMultipleRepos() {
  const repos = [
    {
      name: 'frontend-app',
      description: 'React-based frontend application',
      language: 'JavaScript'
    },
    {
      name: 'backend-api',
      description: 'Node.js REST API',
      language: 'JavaScript'
    },
    {
      name: 'mobile-app',
      description: 'React Native mobile app',
      language: 'JavaScript'
    }
  ];

  repos.forEach(repo => {
    addRepository(repo);
  });

  // console.log(`Created ${repos.length} repositories`);
}

// Usage:
createMultipleRepos();
```

---

## Updating Data

### **Example 1: Update Repository Description**

```jsx
import { updateRepository, getStoredRepositories } from '@services/storageService.js';

function updateRepoDescription(repoId, newDescription) {
  updateRepository(repoId, {
    description: newDescription,
    updated_at: new Date().toISOString()
  });
  // console.log('Repository updated!');
}

// Usage:
updateRepoDescription(1, 'Updated description');
```

### **Example 2: Update Star Count**

```jsx
import { updateRepository } from '@services/storageService.js';

function addStar(repoId) {
  const repos = getStoredRepositories();
  const repo = repos.find(r => r.id === repoId);
  
  if (repo) {
    updateRepository(repoId, {
      stargazers_count: repo.stargazers_count + 1
    });
  }
}

// Usage:
addStar(1); // Add 1 star to repo with ID 1
```

### **Example 3: Pin a Repository**

```jsx
import { pinRepository, getStoredRepositories } from '@services/storageService.js';

function pinTheRepo(repoId) {
  const repos = getStoredRepositories();
  const repo = repos.find(r => r.id === repoId);
  
  if (repo) {
    pinRepository(repo);
    // console.log(`Pinned: ${repo.name}`);
  }
}

// Usage:
pinTheRepo(1);
```

### **Example 4: Star a Repository**

```jsx
import { starRepository, getStoredRepositories } from '@services/storageService.js';

function starTheRepo(repoId) {
  const repos = getStoredRepositories();
  const repo = repos.find(r => r.id === repoId);
  
  if (repo) {
    starRepository(repo);
    // console.log(`Starred: ${repo.name}`);
  }
}

// Usage:
starTheRepo(1);
```

---

## Deleting Data

### **Example 1: Delete Repository**

```jsx
import { deleteRepository } from '@services/storageService.js';

function deleteRepo(repoId) {
  const confirmed = window.confirm(
    'Are you sure you want to delete this repository?'
  );
  
  if (confirmed) {
    deleteRepository(repoId);
    // console.log('Repository deleted!');
  }
}

// Usage:
deleteRepo(1);
```

### **Example 2: Unpin Repository**

```jsx
import { unpinRepository } from '@services/storageService.js';

function unpinRepo(repoName) {
  unpinRepository(repoName);
  // console.log(`Unpinned: ${repoName}`);
}

// Usage:
unpinRepo('github-clone');
```

### **Example 3: Unstar Repository**

```jsx
import { unstarRepository } from '@services/storageService.js';

function unstarRepo(repoFullName) {
  unstarRepository(repoFullName);
  // console.log(`Unstarred: ${repoFullName}`);
}

// Usage:
unstarRepo('facebook/react');
```

---

## Advanced Examples

### **Example 1: Search Repository**

```jsx
import { getStoredRepositories } from '@services/storageService.js';

function searchRepositories(searchTerm) {
  const repos = getStoredRepositories();
  
  return repos.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );
}

// Usage:
const results = searchRepositories('react');
// console.log(results); // All repos with 'react' in name or description
```

### **Example 2: Sort Repositories**

```jsx
import { getStoredRepositories } from '@services/storageService.js';

function getSortedRepos(sortBy = 'name') {
  const repos = getStoredRepositories();
  
  switch(sortBy) {
    case 'name':
      return [...repos].sort((a, b) => a.name.localeCompare(b.name));
    case 'stars':
      return [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count);
    case 'updated':
      return [...repos].sort((a, b) => 
        new Date(b.updated_at) - new Date(a.updated_at)
      );
    default:
      return repos;
  }
}

// Usage:
const byStars = getSortedRepos('stars');
const byName = getSortedRepos('name');
const byDate = getSortedRepos('updated');
```

### **Example 3: Filter by Language**

```jsx
import { getStoredRepositories } from '@services/storageService.js';

function getReposByLanguage(language) {
  const repos = getStoredRepositories();
  return repos.filter(repo => repo.language === language);
}

// Usage:
const jsRepos = getReposByLanguage('JavaScript');
const pythonRepos = getReposByLanguage('Python');
```

### **Example 4: Get Statistics**

```jsx
import { getStoredRepositories, getStorageStats } from '@services/storageService.js';

function getRepoStatistics() {
  const repos = getStoredRepositories();
  
  return {
    totalRepos: repos.length,
    totalStars: repos.reduce((sum, r) => sum + r.stargazers_count, 0),
    languages: [...new Set(repos.map(r => r.language).filter(l => l))],
    publicRepos: repos.filter(r => !r.private).length,
    privateRepos: repos.filter(r => r.private).length,
    averageStars: Math.round(
      repos.reduce((sum, r) => sum + r.stargazers_count, 0) / repos.length
    ),
  };
}

// Usage:
const stats = getRepoStatistics();
// console.log(`Total repos: ${stats.totalRepos}`);
// console.log(`Total stars: ${stats.totalStars}`);
// console.log(`Languages: ${stats.languages.join(', ')}`);
```

### **Example 5: Build Repository with Default Values**

```jsx
import { addRepository, getStoredUser } from '@services/storageService.js';

function createRepoFromTemplate(name, description) {
  const user = getStoredUser();
  
  const newRepo = {
    name,
    description,
    private: false,
    fork: false,
    owner: {
      login: user.login,
      id: user.id,
      avatar_url: user.avatar_url,
      type: 'User'
    },
    language: null,
    has_issues: true,
    has_projects: true,
    has_downloads: true,
    has_wiki: true,
    has_pages: false,
    archived: false,
    disabled: false,
    forks_count: 0,
    open_issues_count: 0,
    stargazers_count: 0,
    license: null,
    topics: [],
    visibility: 'public'
  };
  
  addRepository(newRepo);
  return newRepo;
}

// Usage:
const newRepo = createRepoFromTemplate(
  'my-awesome-project',
  'An awesome new project'
);
```

### **Example 6: Full CRUD Component**

```jsx
import React, { useState, useEffect } from 'react';
import {
  getStoredRepositories,
  addRepository,
  updateRepository,
  deleteRepository,
  pinRepository,
} from '@services/storageService.js';

function RepositoryManager() {
  const [repos, setRepos] = useState([]);
  const [newRepoName, setNewRepoName] = useState('');

  // Load repos
  useEffect(() => {
    setRepos(getStoredRepositories());
  }, []);

  // Create
  const handleCreate = () => {
    if (newRepoName.trim()) {
      addRepository({
        name: newRepoName,
        description: '',
      });
      setRepos(getStoredRepositories());
      setNewRepoName('');
    }
  };

  // Update
  const handleUpdate = (repoId) => {
    const newDesc = prompt('New description:');
    if (newDesc !== null) {
      updateRepository(repoId, { description: newDesc });
      setRepos(getStoredRepositories());
    }
  };

  // Delete
  const handleDelete = (repoId) => {
    if (window.confirm('Delete this repo?')) {
      deleteRepository(repoId);
      setRepos(getStoredRepositories());
    }
  };

  // Pin
  const handlePin = (repoId) => {
    const repo = repos.find(r => r.id === repoId);
    if (repo) {
      pinRepository(repo);
      alert('Repository pinned!');
    }
  };

  return (
    <div>
      <h1>Repository Manager</h1>
      
      <div>
        <input
          type="text"
          value={newRepoName}
          onChange={(e) => setNewRepoName(e.target.value)}
          placeholder="New repository name"
        />
        <button onClick={handleCreate}>Create</button>
      </div>

      <ul>
        {repos.map(repo => (
          <li key={repo.id}>
            <span>{repo.name}</span>
            <button onClick={() => handleUpdate(repo.id)}>Edit</button>
            <button onClick={() => handlePin(repo.id)}>Pin</button>
            <button onClick={() => handleDelete(repo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RepositoryManager;
```

---

## 💡 Common Patterns

### **Pattern 1: Fetch and Update**

```jsx
const repo = getStoredRepositories().find(r => r.id === 1);
if (repo) {
  updateRepository(repo.id, { 
    description: 'New desc',
    stargazers_count: repo.stargazers_count + 1 
  });
}
```

### **Pattern 2: Conditional Rendering**

```jsx
const repos = getStoredRepositories();
const hasRepos = repos.length > 0;

{hasRepos ? (
  <div>Your repos here</div>
) : (
  <p>No repositories found</p>
)}
```

### **Pattern 3: Error Handling**

```jsx
try {
  const repos = getStoredRepositories();
  if (!repos || repos.length === 0) {
    console.warn('No repositories found');
  }
} catch (error) {
  console.error('Error fetching repos:', error);
}
```

---

## 🎯 Best Practices

1. **Always destructure when importing:**
   ```jsx
   import { addRepository, getStoredRepositories } from '@services/storageService.js';
   ```

2. **Check for existence before using:**
   ```jsx
   const user = getStoredUser();
   if (user) {
     // Use user safely
   }
   ```

3. **Use try-catch for error handling:**
   ```jsx
   try {
     addRepository(newRepo);
   } catch (error) {
     console.error('Error creating repository:', error);
   }
   ```

4. **Don't modify data directly:**
   ```jsx
   // ❌ Wrong - Won't persist
   repos[0].name = 'new-name';
   
   // ✅ Correct - Persists
   updateRepository(repos[0].id, { name: 'new-name' });
   ```

---

Ready to use these examples! 🚀
