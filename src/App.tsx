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
import { PostDetail } from "./pages/Public/PostDetail";

// Admin Pages
import { AdminLogin } from "./pages/Admin/Login";
import { Dashboard } from "./pages/Admin/Dashboard";
import { PostList } from "./pages/Admin/Posts/PostList";
import { PostEditor } from "./pages/Admin/Posts/PostEditor";
import Followings from "./pages/Admin/Followings";
import Settings from "./pages/Admin/Settings";

const antTheme = {
  token: {
    colorPrimary: "#1890FF",
    colorSuccess: "#52C41A",
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
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                      Categories Management
                    </h2>
                    <p className="text-gray-600">
                      Categories management interface will be implemented here.
                    </p>
                  </div>
                </AdminLayout>
              }
            />

            <Route
              path="/admin/tags"
              element={
                <AdminLayout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                      Tags Management
                    </h2>
                    <p className="text-gray-600">
                      Tags management interface will be implemented here.
                    </p>
                  </div>
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
