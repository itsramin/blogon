import React, { useState } from "react";
import { Layout, Menu, Drawer, Button } from "antd";
import { Link, useLocation, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Header as AdminHeader } from "./Header";
import {
  SettingOutlined,
  FolderOpenOutlined,
  BarChartOutlined,
  FileTextOutlined,
  TagOutlined,
  // LinkOutlined,
  MenuOutlined,
  EyeOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

const { Content } = Layout;

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, loading, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const menuItems = [
    {
      key: "/admin",
      icon: <BarChartOutlined />,
      label: <Link to="/admin">Dashboard</Link>,
    },
    {
      type: "divider" as const,
    },
    {
      key: "content-management",
      label: "Manage Blog",
      type: "group" as const,
      children: [
        {
          key: "/admin/posts",
          icon: <FileTextOutlined />,
          label: <Link to="/admin/posts">Posts</Link>,
        },
        {
          key: "/admin/categories",
          icon: <FolderOpenOutlined />,
          label: <Link to="/admin/categories">Categories</Link>,
        },
        {
          key: "/admin/tags",
          icon: <TagOutlined />,
          label: <Link to="/admin/tags">Tags</Link>,
        },
      ],
    },
    // {
    //   type: "divider" as const,
    // },
    // {
    //   key: "/admin/followings",
    //   icon: <LinkOutlined />,
    //   label: <Link to="/admin/followings">Followings</Link>,
    // },
    {
      type: "divider" as const,
    },
    {
      key: "/admin/settings",
      icon: <SettingOutlined />,
      label: <Link to="/admin/settings">Settings</Link>,
    },
    {
      key: "/",
      icon: <EyeOutlined />,
      label: <Link to="/">Visit blog</Link>,
    },
    {
      type: "divider" as const,
    },
    {
      key: "/logout",
      icon: <LogoutOutlined />,
      label: (
        <Button type="text" onClick={handleLogout}>
          Logout
        </Button>
      ),
    },
  ];

  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
  };

  return (
    <Layout className="min-h-screen relative">
      <AdminHeader />
      <div className="md:hidden absolute top-4 right-4 z-10">
        <Button
          type="default"
          icon={<MenuOutlined />}
          onClick={toggleDrawer}
          className="flex items-center justify-center"
        />
      </div>
      <Layout>
        {/* Desktop Sider */}
        <Layout.Sider
          width={250}
          className="bg-white border-r border-gray-200 hidden md:block"
          theme="light"
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
        >
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            defaultSelectedKeys={["/admin"]}
            className="border-none mt-4"
            items={menuItems}
          />
        </Layout.Sider>

        {/* Mobile Drawer */}
        <Drawer
          title="Menu"
          placement="right"
          onClose={toggleDrawer}
          open={drawerVisible}
          width={250}
          styles={{ body: { padding: 0 } }}
        >
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            defaultSelectedKeys={["/admin"]}
            className="border-none"
            items={menuItems}
            onClick={toggleDrawer}
          />
        </Drawer>

        <Layout>
          <Content className="bg-gray-50 p-4 sm:p-6 md:ml-0">
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};
