import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import * as Pages from "./pages";
import OpenMenuLayout from "./layout/OpenMenuLayout";
import { initializeStorage } from "@services/storageService.js";
import { GitHubProvider } from "@contexts/GitHubContext";
import { useDocumentTitle } from "@hooks/useDocumentTitle";

const Profile = lazy(() => import("@pages/Profile"));
const ProfileLayout = lazy(() => import("@pages/ProfileLayout"));
const Overview = lazy(() => import("@features/tabs/Overview"));
const Repositories = lazy(() => import("@features/tabs/Repositories"));
const Stars = lazy(() => import("@features/tabs/Stars"));
const RepoDetails = lazy(() => import("@features/RepoDetails"));
const NewRepoPage = lazy(() => import("@features/NewRepoPage"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-8 h-8 border-3 border-[#d0d7de] border-t-[#0969da] rounded-full animate-spin" />
  </div>
);

const App = () => {
  // Dynamic document title per route (SEO)
  useDocumentTitle();

  useEffect(() => {
    initializeStorage();
  }, []);

  return (
    <GitHubProvider>
      <div className="min-h-screen bg-github-bg text-github-text text-[14px] leading-normal">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<OpenMenuLayout />}>
              <Route path="/" element={<Pages.Home />} />
              <Route path="/issues" element={<Pages.Issues />} />
              <Route path="/pull-requests" element={<Pages.PullRequests />} />
              <Route path="/repositories" element={<Pages.Repositories />} />
              <Route path="/projects" element={<Pages.Projects />} />
              <Route path="/discussions" element={<Pages.Discussions />} />
              <Route path="/codespaces" element={<Pages.Codespaces />} />
              <Route path="/copilot" element={<Pages.Copilot />} />
              <Route path="/explore" element={<Pages.Explore />} />
              <Route path="/marketplace" element={<Pages.Marketplace />} />
              <Route path="/mcp-registry" element={<Pages.MCPRegistry />} />
              <Route path="/new" element={<NewRepoPage />} />
              <Route path="/profile/stars" element={<Stars />} />
              {/* Redirect plain /stars to the profile stars route to avoid it being
                  captured by the dynamic /:username route. */}
              <Route path="/stars" element={<Navigate to="/momanamjad/stars" replace />} />
            </Route>
            <Route path="/new" element={<NewRepoPage />} />
            <Route path="/:username" element={<ProfileLayout />}>
              <Route index element={<Overview />} />
              <Route path="repositories" element={<Repositories />} />
              <Route path="stars" element={<Stars />} />
              {/* nested under /:username, so path should be relative */}
              <Route path=":repo" element={<RepoDetails />} />
            </Route>
          </Routes>
        </Suspense>
      </div>
    </GitHubProvider>
  );
};

export default App;
