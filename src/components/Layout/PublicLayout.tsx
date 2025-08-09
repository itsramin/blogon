import React from "react";
import { Layout } from "antd";
import { Header } from "./Header";

const { Content, Footer } = Layout;

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <Layout className="min-h-screen">
      <Header />
      <Content className="bg-gray-50">{children}</Content>
      <Footer className="bg-white border-t border-gray-200 text-center">
        {/* <div className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-gray-600">
            © 2025 Weblog Platform. Built with React, TypeScript, and Ant Design.
          </p>
        </div> */}
      </Footer>
    </Layout>
  );
};
