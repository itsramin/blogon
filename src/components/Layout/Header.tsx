import { Layout, Button } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useBlog } from "../../hooks/useBlog";

const { Header: AntHeader } = Layout;

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { blogInfo } = useBlog();

  const isAdminRoute = location.pathname.startsWith("/admin");

  if (isAdminRoute) {
    return (
      <AntHeader className="bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link
            to="/admin"
            className="flex items-center space-x-2 text-lg sm:text-xl font-bold text-gray-800"
          >
            <span>{blogInfo?.title || "blog"}</span>
          </Link>
        </div>
      </AntHeader>
    );
  }

  return (
    <AntHeader className="bg-white border-b border-gray-200 px-6 md:px-10">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-full">
        <Link
          to="/"
          className="flex items-center space-x-2 text-lg sm:text-xl font-bold text-gray-800"
        >
          <span>{blogInfo?.title || "blog"}</span>
        </Link>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {isAuthenticated ? (
            <Button type="primary" onClick={() => navigate("/admin")}>
              Dashboard
            </Button>
          ) : (
            <Button type="primary" onClick={() => navigate("/admin/login")}>
              Login
            </Button>
          )}
        </div>
      </div>
    </AntHeader>
  );
};
