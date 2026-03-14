# Full-Stack GitHub Clone: Backend Guide

This guide explains how to build a Node.js backend for your GitHub clone, specifically focusing on how to make it **multi-user** so that each user has their own separate repositories, authentication, and data privacy.

## 1. How "Multi-User" Works (The Concept)
To make your app support multiple users:
1. **Authentication:** Users must register and log in. When they log in, the server gives them a digital "key" (called a **JWT** - JSON Web Token).
2. **Identification:** Every time the frontend asks for data (like "give me my repos" or "create a new repo"), it sends this key. The server looks at the key, figures out *who* is asking, and only returns or modifies *their* data.
3. **Relationships in Database:** Every Repository saved in the database will have an `owner` field attached to it. If User A creates a repo, its `owner` is User A. When User B logs in, they only see repos where `owner` is User B. For a brand new user, the database simply finds zero repos matching their ID.

---

## 2. Choosing the Tech Stack
For a Node.js backend, this is the standard stack (often called the MERN stack):
*   **Runtime:** Node.js
*   **Web Framework:** Express.js (makes creating APIs easy and handles routing).
*   **Database:** MongoDB (a flexible NoSQL database, great for Javascript).
*   **ODM (Object Data Modeling):** Mongoose (helps Node.js talk to MongoDB easily).
*   **Authentication:** JSON Web Tokens (JWT) & bcryptjs (for encrypting passwords securely).

---

## 3. Database Schema Design (MongoDB)

*Note: For the massive, complete production-ready schemas (including Stars, Pins, and Contribution graphs), please refer to your `FULL_BACKEND_ARCHITECTURE.md` file!*

You will need main "Collections" (think of them as tables) in your database. Here are the two foundational ones: **Users** and **Repositories**.

### User Schema (`models/User.js`)
```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // This will be encrypted!
  avatarUrl: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
```

### Repository Schema (`models/Repository.js`)
```javascript
const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  isPrivate: { type: Boolean, default: false },
  language: { type: String }, 
  // This is the magic link that connects a repo to a specific user!
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Repository', repositorySchema);
```

### Activity Schemas (Stars & Pins)
To handle pinning and starring dynamically, you should create relational tables.
```javascript
// models/Pin.js
const mongoose = require('mongoose');
const pinSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  repository: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository', required: true },
  pinned_at: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Pin', pinSchema);
```

---

## 4. API Endpoints Required

Here are the APIs (URLs) your frontend React app will communicate with:

### Authentication APIs (Public - no login required)
*   `POST /api/auth/register` - Send username, email, password to create a new user account.
*   `POST /api/auth/login` - Verify credentials and return the JWT token to the frontend.

### Repository APIs (Protected - requires JWT token)
*   `GET /api/repos` - Fetch all repos for the **currently logged-in user**. (If new user, it returns `[]` an empty array).
*   `POST /api/repos` - Create a new repo. The server automatically attaches the logged-in user's ID as the `owner`.
*   `GET /api/repos/:id` - Fetch details of a specific repo.
*   `PUT /api/repos/:id` - Update a repo (e.g., change name or description).
*   `DELETE /api/repos/:id` - Delete a repo.

---

## 5. Step-by-Step Implementation Guide (Where to Start!)

**Your first step for building the backend is here!**
Since you are new to Node.js, follow these exact steps to set up your backend project. I highly recommend building this in a brand new folder, completely separate from your React frontend code.

### Step 1: Initialize the Project
1. Create a new folder anywhere on your computer (e.g., `github-clone-backend`).
2. Open that folder in VS Code, and open the integrated terminal.
3. Run `npm init -y` to generate a `package.json` file.

### Step 2: Install Required Packages
Run this command in the terminal to install all the tools you need:
```bash
npm install express mongoose dotenv cors bcryptjs jsonwebtoken
```
Then install nodemon (this automatically restarts your server when you save a file):
```bash
npm install nodemon --save-dev
```

### Step 3: Set up Folder Structure
Create the following folders and files inside your backend directory:
```text
github-clone-backend/
├── .env                  # For secret variables (like passwords and database links)
├── index.js              # The main entry point of your server
├── middleware/
│   └── auth.js           # Protects routes using JWT
├── models/
│   ├── User.js           # User schema code (from step 3)
│   └── Repository.js     # Repo schema code (from step 3)
└── routes/
    ├── auth.js           # Login and Register logic
    └── repos.js          # Repo creation, fetching and deleting logic
```

### Step 4: Add run script to package.json
Open your `package.json` and change the `"scripts"` section to look like this:
```json
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js"
}
```

### Step 5: The `.env` File Setup
Create a `.env` file in the root folder to store your secrets. **Important: Never upload this file to GitHub!**
```env
PORT=5000
MONGODB_URI=mongodb+srv://<your_username>:<your_password>@cluster0.mongodb.net/github-clone?retryWrites=true&w=majority
JWT_SECRET=super_secret_jwt_key_that_only_the_server_knows_123!
```
*(Note: You will need to create a free MongoDB Atlas account online to get your actual `MONGODB_URI` string)*

### Step 6: Essential Boilerplate (`index.js`)
This is the starting block of your server. Put this in `index.js`:
```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors()); // Allows your React frontend (on port 3000) to talk to this backend (on port 5000)
app.use(express.json()); // Allows the server to read incoming JSON data

// Connect to Database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB!'))
  .catch((err) => console.log('Database Error:', err));

// Basic Route to test if server is up
app.get('/', (req, res) => {
  res.send('GitHub Clone Backend is running!');
});

// We will link the specific routes here later
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/repos', require('./routes/repos'));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```
To test this, type `npm run dev` in your terminal. You should see "Server running on port 5000" and "Successfully connected to MongoDB!".

### Step 7: The "Auth Middleware" (The Secret Sauce)
This piece of code is how the server knows *who* is making the request. Put this in `middleware/auth.js`:
```javascript
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // 1. Get token from the frontend's request header
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).json({ message: "No token, authorization denied" });

  try {
    // 2. Extract token (Usually looks like "Bearer eyJhbGciOi...")
    const token = authHeader.split(' ')[1];
    
    // 3. Verify the token using your secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Attach the user's ID to the request object so subsequent routes can use it
    req.user = decoded.user;
    next(); // Move on to the actual API route (e.g. creating the repo)
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};
```

### Step 8: Creating the Repo Route (`routes/repos.js`)
Here is an example of what your protected routes look like. Notice how we use `auth` and `req.user.id`:
```javascript
const express = require('express');
const router = express.Router();
const Repository = require('../models/Repository');
const auth = require('../middleware/auth'); // Import the secret sauce

// [GET] /api/repos
// Fetch ONLY the logged-in user's repos
router.get('/', auth, async (req, res) => {
  try {
    // req.user.id was placed there by our auth.js middleware!
    const myRepos = await Repository.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json(myRepos); // If new user, this naturally returns []
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// [POST] /api/repos
// Create a new repo for the logged in user
router.post('/', auth, async (req, res) => {
  try {
    const newRepo = new Repository({
      name: req.body.name,
      description: req.body.description,
      isPrivate: req.body.isPrivate,
      language: req.body.language,
      owner: req.user.id // Automatically assign the logged-in user as the owner!
    });
    
    const savedRepo = await newRepo.save();
    res.json(savedRepo);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
```

---

## 6. What Else You Might Be Missing

Since you are transitioning from just frontend to full-stack, here are some critical concepts you must be aware of:

1. **Password Hashing:** NEVER save a user's password as plain text in the database. When building your `/api/auth/register` route, you will use `bcryptjs` to encrypt it.
2. **Frontend State Switch:** Right now, your React app probably holds "repos" in a simple `useState([])` variable that disappears on refresh, or pulls from local mock data. You will need to rewrite your React components to use `fetch()` or `axios` to get data from your new Node API.
3. **Local Storage for JWT Tokens:** When a user logs in, the backend sends the JWT key. Your frontend must permanently save this token (usually in `localStorage.setItem('token', data.token)`).
4. **Sending Headers in React:** On every single API call React makes to protected routes (like fetching repos), you must manually attach that token to the request headers:
   ```javascript
   // Example React fetch call
   fetch('http://localhost:5000/api/repos', {
     method: 'GET',
     headers: {
       'Authorization': `Bearer ${localStorage.getItem('token')}`
     }
   })
   ```
5. **CORS (Cross-Origin Resource Sharing):** Mentioned in Step 6, but vital. Browsers block communication between different ports (localhost:3000 to localhost:5000) for security. The `cors` package you installed on the backend is strictly required to unblock this.
6. **Error Handling:** If a user tries to create a repo with no name, your server should gracefully respond with a `400 Bad Request` status and a friendly message, instead of crashing.
