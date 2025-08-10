import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ConfigProvider } from "antd";
import { AuthProvider } from "./context/AuthContext";
import { PublicLayout } from "./components/Layout/PublicLayout";
import { AdminLayout } from "./components/Layout/AdminLayout";

// Public Pages
import { Home } from "./pages/Public/Home";

// Admin Pages
import { AdminLogin } from "./pages/Admin/Login";
import { Dashboard } from "./pages/Admin/Dashboard";
import Settings from "./pages/Admin/Settings";
import PostEditor from "./pages/Admin/Posts/PostEditor";
import PostDetail from "./pages/Public/PostDetail";
import PostList from "./pages/Admin/Posts/PostList";
import TagsPage from "./pages/Admin/Tags";
import CategoriesPage from "./pages/Admin/Categories";
import Followings from "./pages/Admin/Followings";

const antTheme = {
  token: {
    borderRadius: 6,
    fontSize: 14,
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
};

function App() {
  return (
    <ConfigProvider theme={antTheme}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <PublicLayout>
                  <Home />
                </PublicLayout>
              }
            />

            <Route
              path="/post/:slug"
              element={
                <PublicLayout>
                  <PostDetail />
                </PublicLayout>
              }
            />

            {/* Admin Login (no layout) */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              }
            />

            <Route
              path="/admin/posts"
              element={
                <AdminLayout>
                  <PostList />
                </AdminLayout>
              }
            />

            <Route
              path="/admin/posts/new"
              element={
                <AdminLayout>
                  <PostEditor />
                </AdminLayout>
              }
            />

            <Route
              path="/admin/posts/edit/:id"
              element={
                <AdminLayout>
                  <PostEditor />
                </AdminLayout>
              }
            />

            {/* Placeholder routes for categories and tags management */}
            <Route
              path="/admin/categories"
              element={
                <AdminLayout>
                  <CategoriesPage />
                </AdminLayout>
              }
            />

            <Route
              path="/admin/tags"
              element={
                <AdminLayout>
                  <TagsPage />
                </AdminLayout>
              }
            />

            <Route
              path="/admin/settings"
              element={
                <AdminLayout>
                  <Settings />
                </AdminLayout>
              }
            />

            <Route
              path="/admin/followings"
              element={
                <AdminLayout>
                  <Followings />
                </AdminLayout>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
