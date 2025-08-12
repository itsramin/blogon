import React from "react";
import { Layout } from "antd";
import { Header } from "./Header";
import { Link } from "react-router-dom";

const { Content, Footer } = Layout;

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <Layout className="min-h-screen">
      <Header />
      <Content className="bg-gray-50">{children}</Content>
      <Footer className="text-center text-gray-500">
        <Link to={"/about"}>About</Link>
      </Footer>
    </Layout>
  );
};
