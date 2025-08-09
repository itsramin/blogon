import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, List, Typography, Tag, Button } from 'antd';
import { Link } from 'react-router-dom';
import { xmlStorage } from '../../utils/xmlStorage';
import { BlogPost } from '../../types';

import {
  CalendarOutlined,
  EditOutlined,
  EyeOutlined,
 FileTextOutlined,
 LineChartOutlined
} from "@ant-design/icons";
import { format } from 'date-fns';

const { Title } = Typography;

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalViews: 0,
  });
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const allPosts = await xmlStorage.getAllPosts();
    const publishedPosts = allPosts.filter(post => post.status === 'published');
    const draftPosts = allPosts.filter(post => post.status === 'draft');
    
    setStats({
      totalPosts: allPosts.length,
      publishedPosts: publishedPosts.length,
      draftPosts: draftPosts.length,
      totalViews: Math.floor(Math.random() * 10000) + 1000, // Mock data
    });

    // Get recent posts (last 5)
    const recent = allPosts
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
    setRecentPosts(recent);
  };

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, icon, color }) => (
    <Card className="shadow-sm">
      <Statistic
        title={title}
        value={value}
        prefix={<div className={`text-${color}-600`}>{icon}</div>}
        valueStyle={{ color: `var(--ant-color-${color}-6)` }}
      />
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Title level={2} className="mb-0">Dashboard</Title>
        <Button type="primary" size="large">
          <Link to="/admin/posts/new" className="text-white">
            <FileTextOutlined size={16} className="mr-2" />
            New Post
          </Link>
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Posts"
            value={stats.totalPosts}
            icon={<FileTextOutlined size={20} />}
            color="blue"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Published"
            value={stats.publishedPosts}
            icon={<EyeOutlined size={20} />}
            color="green"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Drafts"
            value={stats.draftPosts}
            icon={<EditOutlined size={20} />}
            color="orange"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Views"
            value={stats.totalViews}
            icon={<LineChartOutlined size={20} />}
            color="purple"
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
                      <Button type="link" size="small">
                        <EditOutlined size={14} />
                        Edit
                      </Button>
                    </Link>
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
                        <Tag color={post.status === 'published' ? 'green' : 'orange'}>
                          {post.status}
                        </Tag>
                      </div>
                    }
                    description={
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <CalendarOutlined size={14} className="mr-1" />
                          {format(new Date(post.updatedAt), 'MMM d, yyyy')}
                        </span>
                        <span>by {post.author}</span>
                        {post.categories.length > 0 && (
                          <span>in {post.categories.join(', ')}</span>
                        )}
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
            <div className="space-y-3">
              <Link to="/admin/posts/new">
                <Button type="primary" block size="large">
                  <FileTextOutlined size={16} className="mr-2" />
                  Create New Post
                </Button>
              </Link>
              <Link to="/admin/posts">
                <Button block size="large">
                  <EditOutlined size={16} className="mr-2" />
                  Manage Posts
                </Button>
              </Link>
              <Link to="/admin/categories">
                <Button block size="large">
                  Manage Categories
                </Button>
              </Link>
              <Link to="/admin/tags">
                <Button block size="large">
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