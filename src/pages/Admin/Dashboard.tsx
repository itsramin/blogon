import React, { useEffect, useState } from "react";
import { Card, Row, Col, List, Typography, Tag, Button } from "antd";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import StatCard from "../../components/StatCard";
import usePosts from "../../hooks/usePosts";
import {
  IoAddOutline,
  IoBrushOutline,
  IoCalendarClearOutline,
  IoDocumentsOutline,
  IoEyeOutline,
  IoFileTrayOutline,
  IoFolderOpenOutline,
  IoPricetagsOutline,
} from "react-icons/io5";

const { Title } = Typography;

export const Dashboard: React.FC = () => {
  const { posts } = usePosts();
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
  });
  useEffect(() => {
    const publishedPosts = posts.filter((post) => post.status === "published");
    const draftPosts = posts.filter((post) => post.status === "draft");

    setStats({
      totalPosts: posts.length,
      publishedPosts: publishedPosts.length,
      draftPosts: draftPosts.length,
    });
  }, [posts]);

  const recentPosts = posts
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <Title level={2} className="mb-0">
          Dashboard
        </Title>
        <Link to="/admin/posts/new">
          <Button
            type="primary"
            icon={<IoAddOutline size={18} className="mt-1" />}
          >
            New Post
          </Button>
        </Link>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Posts"
            value={stats.totalPosts}
            icon={<IoDocumentsOutline size={20} />}
            color="blue"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Published"
            value={stats.publishedPosts}
            icon={<IoEyeOutline size={20} />}
            color="green"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Drafts"
            value={stats.draftPosts}
            icon={<IoFileTrayOutline size={20} />}
            color="orange"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Recent Posts" className="shadow-sm">
            <List
              itemLayout="horizontal"
              dataSource={recentPosts}
              renderItem={(post) => (
                <List.Item
                  actions={[
                    <Link key="edit" to={`/admin/posts/edit/${post.id}`}>
                      <Button type="link" icon={<IoBrushOutline size={14} />}>
                        <span className="hidden sm:inline-block">Edit</span>
                      </Button>
                    </Link>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/admin/posts/edit/${post.id}`}
                          className="text-gray-800 hover:text-blue-600"
                        >
                          {post.title}
                        </Link>
                        <Tag
                          color={
                            post.status === "published" ? "green" : "orange"
                          }
                        >
                          {post.status}
                        </Tag>
                      </div>
                    }
                    description={
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <IoCalendarClearOutline
                            size={14}
                            className="mr-1 mb-1"
                          />
                          {format(new Date(post.updatedAt), "MMM d, yyyy")}
                        </span>
                        <span className="hidden sm:inline-block">
                          by {post.author.firstName} {post.author.lastName}
                        </span>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Quick Actions" className="shadow-sm">
            <div className="space-y-3 flex flex-col">
              <Link to="/admin/posts/new">
                <Button
                  type="primary"
                  block
                  size="large"
                  icon={<IoAddOutline size={16} />}
                >
                  Create New Post
                </Button>
              </Link>
              <Link to="/admin/posts">
                <Button
                  block
                  size="large"
                  icon={<IoDocumentsOutline size={16} />}
                >
                  Manage Posts
                </Button>
              </Link>
              <Link to="/admin/categories">
                <Button
                  block
                  size="large"
                  icon={<IoFolderOpenOutline size={16} />}
                >
                  Manage Categories
                </Button>
              </Link>
              <Link to="/admin/tags">
                <Button
                  block
                  size="large"
                  icon={<IoPricetagsOutline size={16} />}
                >
                  Manage Tags
                </Button>
              </Link>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
