// Header.tsx
import { Layout, Button, Drawer, Menu } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useBlog } from "../../hooks/useBlog";
import { useState } from "react";
import { IoMenuOutline } from "react-icons/io5";
import { GithubOutlined } from "@ant-design/icons"; // Add this import

const { Header: AntHeader } = Layout;

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, loginWithGitHub } = useAuth(); // Add loginWithGitHub
  const { blogInfo } = useBlog();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const isAdminRoute = location.pathname.startsWith("/admin");

  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const onClose = () => {
    setDrawerVisible(false);
  };

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
    <>
      <AntHeader className="bg-white border-b border-gray-200 px-4 sm:px-6 ">
        <div className="max-w-6xl mx-auto flex items-center justify-between relative h-full ">
          {/* Mobile menu button (hidden on desktop) */}
          <div className="md:hidden absolute top-0 right-0 z-10">
            <Button
              type="text"
              icon={<IoMenuOutline size={16} />}
              onClick={showDrawer}
              className="md:hidden"
            />
          </div>

          {/* Centered title */}
          <Link
            to="/"
            className="absolute left-1/2 transform  -translate-x-1/2 text-lg sm:text-2xl font-bold text-gray-800 whitespace-nowrap"
          >
            {blogInfo?.title || "blog"}
          </Link>

          {/* Desktop buttons (hidden on mobile) */}
          <div className="hidden sm:block">
            {isAuthenticated ? (
              <Button type="default" onClick={() => navigate("/admin")}>
                Dashboard
              </Button>
            ) : (
              <Button
                type="default"
                icon={<GithubOutlined />}
                onClick={loginWithGitHub} // Changed to use GitHub login directly
              >
                Sign in with GitHub
              </Button>
            )}
          </div>
        </div>
      </AntHeader>

      {/* Mobile Drawer */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={onClose}
        open={drawerVisible}
        width={250}
        className="sm:hidden"
      >
        <Menu mode="vertical">
          <Menu.Item key="home">
            <Link to="/" onClick={onClose}>
              Home
            </Link>
          </Menu.Item>
          {isAuthenticated ? (
            <Menu.Item key="dashboard">
              <Link to="/admin" onClick={onClose}>
                Dashboard
              </Link>
            </Menu.Item>
          ) : (
            <Menu.Item key="login">
              <Button
                type="text"
                icon={<GithubOutlined />}
                onClick={() => {
                  loginWithGitHub();
                  onClose();
                }}
                className="w-full text-left"
              >
                Sign in with GitHub
              </Button>
            </Menu.Item>
          )}
          <Menu.Item key="about">
            <Link to="/about" onClick={onClose}>
              About
            </Link>
          </Menu.Item>
        </Menu>
      </Drawer>
    </>
  );
};
