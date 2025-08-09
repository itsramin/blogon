import React from "react";
import { Layout, Menu, Button, Avatar, Dropdown } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  BookOutlined,
} from "@ant-design/icons";

const { Header: AntHeader } = Layout;

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const isAdminRoute = location.pathname.startsWith("/admin");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined size={16} />,
      label: "Profile",
    },
    {
      key: "settings",
      icon: <SettingOutlined size={16} />,
      label: "Settings",
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogoutOutlined size={16} />,
      label: "Logout",
      onClick: handleLogout,
    },
  ];

  if (isAdminRoute) {
    return (
      <AntHeader className="bg-white border-b border-gray-200 px-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link
            to="/admin"
            className="flex items-center space-x-2 text-xl font-bold text-gray-800"
          >
            <BookOutlined className="text-blue-600" size={24} />
            <span>Weblog Admin</span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {isAuthenticated && user && (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Button type="text" className="flex items-center space-x-2">
                <Avatar size="small" className="bg-blue-600">
                  {user.username.charAt(0).toUpperCase()}
                </Avatar>
                <span>{user.username}</span>
              </Button>
            </Dropdown>
          )}
        </div>
      </AntHeader>
    );
  }

  const publicMenuItems = [
    { key: "/", label: "Home" },
    { key: "/categories", label: "Categories" },
    { key: "/tags", label: "Tags" },
    { key: "/about", label: "About" },
  ];

  return (
    <AntHeader className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-full">
        <Link
          to="/"
          className="flex items-center space-x-2 text-xl font-bold text-gray-800"
        >
          <BookOutlined className="text-blue-600" size={24} />
          <span>Weblog</span>
        </Link>

        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          className="border-none flex-1 justify-center"
          items={publicMenuItems.map((item) => ({
            key: item.key,
            label: <Link to={item.key}>{item.label}</Link>,
          }))}
        />

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <Button type="primary" onClick={() => navigate("/admin")}>
              Dashboard
            </Button>
          ) : (
            <Button type="primary" onClick={() => navigate("/admin/login")}>
              Admin Login
            </Button>
          )}
        </div>
      </div>
    </AntHeader>
  );
};
