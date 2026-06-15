import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PlayerProvider } from "@/contexts/PlayerContext";
import { CatalogProvider } from "@/contexts/CatalogContext";
import { FollowProvider } from "@/contexts/FollowContext";
import { PlaylistProvider } from "@/contexts/PlaylistContext";
import { GlobalPlayer } from "@/components/GlobalPlayer";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";

import ListenerHome from "./pages/listener/Home";
import Search from "./pages/listener/Search";
import Library from "./pages/listener/Library";
import Discover from "./pages/listener/Discover";
import PodcastDetail from "./pages/listener/PodcastDetail";
import CreatorProfile from "./pages/listener/CreatorProfile";
import Creators from "./pages/listener/Creators";
import Settings from "./pages/listener/Settings";

import Episodes from "./pages/studio/Episodes";
import Upload from "./pages/studio/Upload";
import Copilot from "./pages/studio/Copilot";
import MultiAgent from "./pages/studio/MultiAgent";
import Analytics from "./pages/studio/Analytics";
import Drafts from "./pages/studio/Drafts";

const queryClient = new QueryClient();

function Protected({ children, allowedRoles }: { children: JSX.Element; allowedRoles?: ("listener" | "creator" | "admin")[] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === "creator" ? "/studio" : "/app"} replace />;
  }
  return children;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CatalogProvider>
      <FollowProvider>
      <PlaylistProvider>
      <PlayerProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner theme="dark" position="top-center" />
          <BrowserRouter basename={window.location.pathname.startsWith("/projects/podify") ? "/projects/podify" : "/"}>
            <GlobalPlayer />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />

              <Route path="/app" element={<Protected><ListenerHome /></Protected>} />
              <Route path="/app/search" element={<Protected><Search /></Protected>} />
              <Route path="/app/library" element={<Protected><Library /></Protected>} />
              <Route path="/app/discover" element={<Protected><Discover /></Protected>} />
              <Route path="/app/creators" element={<Protected><Creators /></Protected>} />
              <Route path="/app/settings" element={<Protected><Settings /></Protected>} />
              <Route path="/podcast/:id" element={<Protected><PodcastDetail /></Protected>} />
              <Route path="/creator/:id" element={<Protected><CreatorProfile /></Protected>} />

              <Route path="/studio" element={<Protected><Episodes /></Protected>} />
              <Route path="/studio/upload" element={<Protected><Upload /></Protected>} />
              <Route path="/studio/copilot" element={<Protected><Copilot /></Protected>} />
              <Route path="/studio/multi-agent" element={<Protected><MultiAgent /></Protected>} />
              <Route path="/studio/analytics" element={<Protected><Analytics /></Protected>} />
              <Route path="/studio/drafts" element={<Protected><Drafts /></Protected>} />

              <Route path="/admin" element={<Protected allowedRoles={["admin"]}><Admin /></Protected>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </PlayerProvider>
      </PlaylistProvider>
      </FollowProvider>
      </CatalogProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
