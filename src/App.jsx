import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import * as Pages from "./pages";
import OpenMenuLayout from "./layout/OpenMenuLayout";
import { initializeStorage } from "@services/storageService";
import { useGitHub, GitHubProvider } from "@contexts/GitHubContext";
import { useDocumentTitle } from "@hooks/useDocumentTitle";
import Buddy from "./bot/Buddy";
import "./bones/registry";


const Profile       = lazy(() => import("@pages/Profile"));
const ProfileLayout = lazy(() => import("@pages/ProfileLayout"));
const Overview      = lazy(() => import("@features/tabs/Overview"));
const Repositories  = lazy(() => import("@features/tabs/Repositories"));
const Stars         = lazy(() => import("@features/tabs/Stars"));
const Followers     = lazy(() => import("@features/tabs/Followers"));
const Following     = lazy(() => import("@features/tabs/Following"));
const ProjectsTab   = lazy(() => import("@features/tabs/Projects"));
const PackagesTab   = lazy(() => import("@features/tabs/Packages"));
const RepoDetails   = lazy(() => import("@features/RepoDetails"));
const NewRepoPage   = lazy(() => import("@features/NewRepoPage"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
  </div>
);


const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [loginUsername, setLoginUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, register } = useGitHub();

  const navigate = useNavigate();

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      let loggedUser;
      if (activeTab === "login") {
        const res = await login(email, password);
        loggedUser = res?.data?.user;
      } else {
        const res = await register(loginUsername, email, password);
        loggedUser = res?.data?.user;
      }
      if (loggedUser?.login) {
        navigate(`/${loggedUser.login}`);
      } else {
        navigate("/");
      }
    } catch (err) {
      setErrorMsg(err.message || "Authentication failed. Please check details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f8fa] dark:bg-[#0d1117] text-[#24292f] dark:text-[#c9d1d9] font-sans p-4">
      <div className="w-full max-w-[440px] flex flex-col items-center">
        <div className="mb-6 text-[#24292f] dark:text-white">
          <svg height="48" viewBox="0 0 16 16" version="1.1" width="48" fill="currentColor">
            <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.35 3.12.88 0 .48.01 1.03.01 1.24 0 .21-.15.46-.55.38A8.013 8.013 0 0 1 0 8c0-4.42 3.58-8 8-8z"></path>
          </svg>
        </div>

        <div className="w-full bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-center mb-6 text-[#24292f] dark:text-white">
            {activeTab === 'login' ? 'Sign in to GitHub' : 'Create an account'}
          </h2>

          {errorMsg && (
            <div className="mb-4 p-3 text-sm text-[#ff7b72] bg-[#f85149]/10 border border-[#f85149]/30 rounded-md">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {activeTab === 'register' && (
              <div>
                <label className="block text-sm font-medium mb-1.5 text-[#24292f] dark:text-white">Username</label>
                <input
                  type="text"
                  required
                  placeholder="Username"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md focus:outline-none focus:border-[#0969da] dark:focus:border-[#58a6ff] text-sm text-[#1f2328] dark:text-white focus:ring-1 focus:ring-[#0969da] dark:focus:ring-[#58a6ff]"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5 text-[#24292f] dark:text-white">Email address</label>
              <input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md focus:outline-none focus:border-[#0969da] dark:focus:border-[#58a6ff] text-sm text-[#1f2328] dark:text-white focus:ring-1 focus:ring-[#0969da] dark:focus:ring-[#58a6ff]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-[#24292f] dark:text-white">Password</label>
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md focus:outline-none focus:border-[#0969da] dark:focus:border-[#58a6ff] text-sm text-[#1f2328] dark:text-white focus:ring-1 focus:ring-[#0969da] dark:focus:ring-[#58a6ff]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-[#238636] text-white text-sm font-semibold rounded-md hover:bg-[#2ea043] transition-colors focus:outline-none focus:ring-2 focus:ring-[#238636]/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-h-[38px]"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : activeTab === 'login' ? (
                'Sign In'
              ) : (
                'Register'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm border-t border-[#d0d7de] dark:border-[#30363d] pt-4">
            {activeTab === 'login' ? (
              <p className="text-[#57606a] dark:text-[#8b949e]">
                New to GitHub Clone?{' '}
                <button
                  type="button"
                  onClick={() => { setActiveTab('register'); setErrorMsg(""); }}
                  className="text-[#0969da] dark:text-[#58a6ff] hover:underline cursor-pointer bg-transparent border-0 font-medium"
                >
                  Create an account
                </button>
              </p>
            ) : (
              <p className="text-[#57606a] dark:text-[#8b949e]">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setActiveTab('login'); setErrorMsg(""); }}
                  className="text-[#0969da] dark:text-[#58a6ff] hover:underline cursor-pointer bg-transparent border-0 font-medium"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const NavigateToQuery = ({ tab }) => {
  const { username } = useParams();
  return <Navigate to={`/${username}?tab=${tab}`} replace />;
};

const AppContent = () => {
  const { user } = useGitHub();

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-github-bg text-github-text text-[14px] leading-normal">
      <Suspense fallback={<PageLoader />}>
        <Buddy />
        <Routes>
          <Route element={<OpenMenuLayout />}>
            <Route path="/"              element={<Pages.Home />} />
            <Route path="/issues"        element={<Pages.Issues />} />
            <Route path="/pull-requests" element={<Pages.PullRequests />} />
            <Route path="/repositories"  element={<Pages.Repositories />} />
            <Route path="/projects"      element={<Pages.Projects />} />
            <Route path="/discussions"   element={<Pages.Discussions />} />
            <Route path="/codespaces"    element={<Pages.Codespaces />} />
            <Route path="/copilot"       element={<Pages.Copilot />} />
            <Route path="/explore"       element={<Pages.Explore />} />
            <Route path="/marketplace"   element={<Pages.Marketplace />} />
            <Route path="/mcp-registry"  element={<Pages.MCPRegistry />} />
            <Route path="/terminal"      element={<Pages.Terminal />} />
            <Route path="/new"           element={<NewRepoPage />} />
            <Route path="/profile/stars" element={<Stars />} />
            <Route path="/stars"         element={<Navigate to={`/${user.login}/stars`} replace />} />
          </Route>

          {/* Profile routes */}
          <Route path="/:username" element={<ProfileLayout />}>
            <Route index               element={<Overview />} />
            <Route path="repositories" element={<Repositories />} />
            <Route path="projects"     element={<ProjectsTab />} />
            <Route path="packages"     element={<PackagesTab />} />
            <Route path="stars"        element={<Stars />} />
            <Route path="followers"    element={<NavigateToQuery tab="followers" />} />
            <Route path="following"    element={<NavigateToQuery tab="following" />} />
            <Route path=":repo"        element={<RepoDetails />} />
          </Route>
        </Routes>
      </Suspense>
    </div>
  );
};

const App = () => {
  useDocumentTitle();

  useEffect(() => {
    initializeStorage();

    // Automatic dark/light mode system theme listener
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const updateTheme = () => {
      if (media.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    updateTheme();
    media.addEventListener('change', updateTheme);
    return () => media.removeEventListener('change', updateTheme);
  }, []);

  return (
    <GitHubProvider>
      <AppContent />
    </GitHubProvider>
  );
};

export default App;
