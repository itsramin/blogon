import React, { useState } from "react";
import { Layout, Menu, Drawer, Button } from "antd";
import { Link, useLocation, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Header as AdminHeader } from "./Header";

import {
  IoDocumentsOutline,
  IoEyeOutline,
  IoFolderOpenOutline,
  IoLogOutOutline,
  IoMenuOutline,
  IoPricetagsOutline,
  IoSettingsOutline,
  IoSpeedometerOutline,
} from "react-icons/io5";

const { Content, Footer, Sider } = Layout;

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, loading, logout } = useAuth();
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
      icon: <IoSpeedometerOutline size={16} className="mb-1" />,
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
          icon: <IoDocumentsOutline size={16} className="mb-1" />,
          label: <Link to="/admin/posts">Posts</Link>,
        },
        {
          key: "/admin/categories",
          icon: <IoFolderOpenOutline size={16} className="mb-1" />,
          label: <Link to="/admin/categories">Categories</Link>,
        },
        {
          key: "/admin/tags",
          icon: <IoPricetagsOutline size={16} className="mb-1" />,
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
      icon: <IoSettingsOutline size={16} className="mb-1" />,
      label: <Link to="/admin/settings">Settings</Link>,
    },
    {
      key: "/",
      icon: <IoEyeOutline size={16} className="mb-1" />,
      label: <Link to="/">Visit blog</Link>,
    },
    {
      type: "divider" as const,
    },
    {
      key: "/logout",
      icon: <IoLogOutOutline size={16} className="mb-1" />,
      label: <div onClick={handleLogout}>Logout</div>,
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
          type="text"
          icon={<IoMenuOutline size={16} />}
          onClick={toggleDrawer}
          className="flex items-center justify-center"
        />
      </div>
      <Layout>
        {/* Desktop Sider */}
        <Sider
          width={250}
          className="bg-white border-r border-gray-200 hidden md:block "
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
      <Footer className="text-center text-gray-500 ">
        <Link to={"/about"}>About</Link>
      </Footer>
    </Layout>
  );
};
