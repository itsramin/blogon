import React from "react";
import { Layout } from "antd";
import { Header } from "./Header";

const { Content } = Layout;

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <Layout className="min-h-screen">
      <Header />
      <Content className="bg-gray-50">{children}</Content>
    </Layout>
  );
};
