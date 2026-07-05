import { Component, lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate, useParams, useLocation, Link } from "react-router-dom";
import * as Pages from "./pages";
import OpenMenuLayout from "./layout/OpenMenuLayout";
import { initializeStorage } from "@services/storageService";
import { useGitHub, GitHubProvider } from "@contexts/GitHubContext";
import { useDocumentTitle } from "@hooks/useDocumentTitle";
import Buddy from "./bot/Buddy";
import GoogleSignInButton from "./components/features/GoogleSignInButton";
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
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <div className="spinner" aria-label="Loading..." role="status" />
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
  const { pathname } = useLocation();



  useEffect(() => {
    setLoginUsername('');
    setEmail('');
    setPassword('');
    setErrorMsg('');
  }, [activeTab]);

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
    <div className="min-h-screen flex flex-col items-center justify-start sm:justify-center bg-white dark:bg-[#0d1117] sm:bg-[#f6f8fa] text-[#24292f] dark:text-[#c9d1d9] font-sans p-4 sm:p-6 py-8 sm:py-12">
      <div className="w-full max-w-[340px] sm:max-w-[440px] flex flex-col items-center">
        <div className="mb-6 text-[#24292f] dark:text-white">
          <svg height="48" viewBox="0 0 16 16" version="1.1" width="48" fill="currentColor">
            <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.35 3.12.88 0 .48.01 1.03.01 1.24 0 .21-.15.46-.55.38A8.013 8.013 0 0 1 0 8c0-4.42 3.58-8 8-8z"></path>
          </svg>
        </div>

        <div className="w-full bg-transparent sm:bg-white sm:dark:bg-[#161b22] border-0 sm:border border-[#d0d7de] sm:dark:border-[#30363d] rounded-none sm:rounded-lg shadow-none sm:shadow-md p-2 sm:p-8">
          <h2 className="text-xl font-normal text-center mb-6 text-[#24292f] dark:text-white">
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
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-[#24292f] dark:text-white">Password</label>
                {activeTab === 'login' && (
                  <Link to="/forgot-password" className="text-xs text-[#0969da] dark:text-[#58a6ff] hover:underline">
                    Forgot password?
                  </Link>
                )}
              </div>
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

          <div className="relative flex py-3 items-center">
            <div className="flex-grow border-t border-[#d0d7de] dark:border-[#30363d]"></div>
            <span className="flex-shrink mx-3 text-[#57606a] dark:text-[#8b949e] text-xs font-normal">or</span>
            <div className="flex-grow border-t border-[#d0d7de] dark:border-[#30363d]"></div>
          </div>

          <GoogleSignInButton
            onSuccess={(u) => {
              if (u?.login) {
                navigate(`/${u.login}`);
              } else {
                navigate("/");
              }
            }}
            onFailure={(err) => {
              const msg = err.error === 'popup_closed_by_user' ? 'Sign-in was cancelled.' : 'Google Sign-In failed. Please try again.';
              setErrorMsg(msg);
            }}
          />

          <div className="mt-6 text-center text-sm border-t border-[#d0d7de] dark:border-[#30363d] pt-4">
            {activeTab === 'login' ? (
              <p className="text-[#57606a] dark:text-[#8b949e]">
                New to GitHub?{' '}
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

const RequireAuth = ({ children }) => {
  const { user } = useGitHub();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return children;
};

const AppContent = () => {
  const { user } = useGitHub();

  return (
    <div className="min-h-screen bg-github-bg text-github-text text-[14px] leading-normal">
      {user && <Buddy />}
      <Routes>
        {/* Public Routes */}
        <Route path="/forgot-password" element={<ErrorBoundary fallback={<ErrorPage />}><Suspense fallback={<PageLoader />}><Pages.ForgotPassword /></Suspense></ErrorBoundary>} />
        <Route path="/reset-password"  element={<ErrorBoundary fallback={<ErrorPage />}><Suspense fallback={<PageLoader />}><Pages.ResetPassword /></Suspense></ErrorBoundary>} />

        {/* Home Route */}
        {user ? (
          <Route element={<OpenMenuLayout />}>
            <Route path="/" element={<ErrorBoundary fallback={<ErrorPage />}><Suspense fallback={<PageLoader />}><Pages.Home /></Suspense></ErrorBoundary>} />
          </Route>
        ) : (
          <Route path="/" element={<AuthPage />} />
        )}

        {/* Protected Routes Wrapper */}
        <Route element={<RequireAuth><OpenMenuLayout /></RequireAuth>}>
          <Route path="/issues"        element={<ErrorBoundary fallback={<ErrorPage />}><Suspense fallback={<PageLoader />}><Pages.Issues /></Suspense></ErrorBoundary>} />
          <Route path="/pull-requests" element={<ErrorBoundary fallback={<ErrorPage />}><Suspense fallback={<PageLoader />}><Pages.PullRequests /></Suspense></ErrorBoundary>} />
          <Route path="/repositories"  element={<ErrorBoundary fallback={<ErrorPage />}><Suspense fallback={<PageLoader />}><Pages.Repositories /></Suspense></ErrorBoundary>} />
          <Route path="/projects"      element={<ErrorBoundary fallback={<ErrorPage />}><Suspense fallback={<PageLoader />}><Pages.Projects /></Suspense></ErrorBoundary>} />
          <Route path="/discussions"   element={<ErrorBoundary fallback={<ErrorPage />}><Suspense fallback={<PageLoader />}><Pages.Discussions /></Suspense></ErrorBoundary>} />
          <Route path="/codespaces"    element={<ErrorBoundary fallback={<ErrorPage />}><Suspense fallback={<PageLoader />}><Pages.Codespaces /></Suspense></ErrorBoundary>} />
          <Route path="/copilot"       element={<ErrorBoundary fallback={<ErrorPage />}><Suspense fallback={<PageLoader />}><Pages.Copilot /></Suspense></ErrorBoundary>} />
          <Route path="/explore"       element={<ErrorBoundary fallback={<ErrorPage />}><Suspense fallback={<PageLoader />}><Pages.Explore /></Suspense></ErrorBoundary>} />
          <Route path="/marketplace"   element={<ErrorBoundary fallback={<ErrorPage />}><Suspense fallback={<PageLoader />}><Pages.Marketplace /></Suspense></ErrorBoundary>} />
          <Route path="/mcp-registry"  element={<ErrorBoundary fallback={<ErrorPage />}><Suspense fallback={<PageLoader />}><Pages.MCPRegistry /></Suspense></ErrorBoundary>} />
          <Route path="/terminal"      element={<ErrorBoundary fallback={<ErrorPage />}><Suspense fallback={<PageLoader />}><Pages.Terminal /></Suspense></ErrorBoundary>} />
          <Route path="/search"        element={<ErrorBoundary fallback={<ErrorPage />}><Suspense fallback={<PageLoader />}><Pages.Search /></Suspense></ErrorBoundary>} />
          <Route path="/new"           element={<ErrorBoundary fallback={<ErrorPage />}><Suspense fallback={<PageLoader />}><NewRepoPage /></Suspense></ErrorBoundary>} />
          <Route path="/profile/stars" element={<ErrorBoundary fallback={<ErrorPage />}><Suspense fallback={<PageLoader />}><Stars /></Suspense></ErrorBoundary>} />
          <Route path="/stars"         element={<Navigate to={user?.login ? `/${user.login}/stars` : '/'} replace />} />
        </Route>

        {/* Profile routes */}
        <Route path="/:username" element={<RequireAuth><ProfileLayout /></RequireAuth>}>
          <Route index               element={<Suspense fallback={<PageLoader />}><Overview /></Suspense>} />
          <Route path="repositories" element={<Suspense fallback={<PageLoader />}><Repositories /></Suspense>} />
          <Route path="projects"     element={<Suspense fallback={<PageLoader />}><ProjectsTab /></Suspense>} />
          <Route path="packages"     element={<Suspense fallback={<PageLoader />}><PackagesTab /></Suspense>} />
          <Route path="stars"        element={<Suspense fallback={<PageLoader />}><Stars /></Suspense>} />
          <Route path="followers"    element={<NavigateToQuery tab="followers" />} />
          <Route path="following"    element={<NavigateToQuery tab="following" />} />
          <Route path=":repo"        element={<Suspense fallback={<PageLoader />}><RepoDetails /></Suspense>} />
        </Route>
      </Routes>
    </div>
  );
};

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const ErrorPage = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-[#0d1117] text-[#24292f] dark:text-[#c9d1d9] p-4 text-center">
    <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
    <p className="text-sm text-muted-foreground mb-4">
      An error occurred while trying to load this page.
    </p>
    <button
      onClick={() => window.location.reload()}
      className="px-4 py-2 bg-[#2da44e] hover:bg-[#2c974b] text-white font-semibold text-sm rounded-md shadow-sm cursor-pointer"
    >
      Reload page
    </button>
  </div>
);

import useTheme from "./hooks/useTheme";

const App = () => {
  useDocumentTitle();
  const [theme] = useTheme();
  const location = useLocation();
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    initializeStorage();
  }, []);

  // ARIA live announcement on route change
  useEffect(() => {
    const pageTitle = document.title || 'Page loaded';
    setAnnouncement(`Navigated to ${pageTitle}`);

    // Focus management: move focus to the first h1 or main container
    setTimeout(() => {
      const firstHeading = document.querySelector('h1');
      if (firstHeading) {
        firstHeading.setAttribute('tabIndex', '-1');
        firstHeading.focus();
      } else {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          mainContent.focus();
        }
      }
    }, 100);
  }, [location.pathname]);

  return (
    <GitHubProvider>
      <ErrorBoundary fallback={<ErrorPage />}>
        {/* Screen Reader announcer */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {announcement}
        </div>
        <AppContent />
      </ErrorBoundary>
    </GitHubProvider>
  );
};

export default App;
