import Profile from "@pages/Profile";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProfileLayout from "@pages/ProfileLayout";
import Overview from "@features/tabs/Overview";
import Repositories from "@features/tabs/Repositories";
import Stars from "@features/tabs/Stars";
import RepoDetails from "@features/RepoDetails";
import NewRepoPage from "@features/NewRepoPage";
import * as Pages from "./pages";
import OpenMenuLayout from "./layout/OpenMenuLayout";

const App = () => {
  return (
    <>
      <div className="min-h-screen bg-github-bg text-github-text text-[14px] leading-normal">
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
            <Route path="/:username/:repo" element={<RepoDetails />} />
          </Route>
        </Routes>
      </div>
    </>
  );
};

export default App;
