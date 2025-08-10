import React from "react";
import { Layout, Menu } from "antd";
import { Link, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Header } from "./Header";
import {
  SettingOutlined,
  FolderOpenOutlined,
  BarChartOutlined,
  FileTextOutlined,
  TagOutlined,
  LinkOutlined,
} from "@ant-design/icons";

const { Sider, Content } = Layout;

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const menuItems = [
    {
      key: "/admin",
      icon: <BarChartOutlined size={16} />,
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
          icon: <FileTextOutlined size={16} />,
          label: <Link to="/admin/posts">Posts</Link>,
        },
        {
          key: "/admin/categories",
          icon: <FolderOpenOutlined size={16} />,
          label: <Link to="/admin/categories">Categories</Link>,
        },
        {
          key: "/admin/tags",
          icon: <TagOutlined size={16} />,
          label: <Link to="/admin/tags">Tags</Link>,
        },
      ],
    },
    {
      type: "divider" as const,
    },
    {
      key: "/admin/followings",
      icon: <LinkOutlined size={16} />,
      label: <Link to="/admin/followings">Followings</Link>,
    },
    {
      type: "divider" as const,
    },
    {
      key: "/admin/settings",
      icon: <SettingOutlined size={16} />,
      label: <Link to="/admin/settings">Settings</Link>,
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Header />
      <Layout>
        <Sider
          width={250}
          className="bg-white border-r border-gray-200"
          theme="light"
        >
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            defaultSelectedKeys={["/admin"]}
            className="border-none mt-4"
            items={menuItems}
          />
        </Sider>
        <Layout>
          <Content className="bg-gray-50 p-6">{children}</Content>
        </Layout>
      </Layout>
    </Layout>
  );
};
