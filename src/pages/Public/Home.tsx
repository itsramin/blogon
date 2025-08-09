import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Tag, Input, Select, Pagination } from 'antd';
import { Link } from 'react-router-dom';
import { xmlStorage } from '../../utils/xmlStorage';
import { BlogPost, Category } from '../../types';
import {
  CalendarOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { format } from 'date-fns';

const { Title, Text, Paragraph } = Typography;
const { Search: SearchInput } = Input;

export const Home: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [publishedPosts, allCategories] = await Promise.all([
        xmlStorage.getPublishedPosts(),
        xmlStorage.getAllCategories()
      ]);
      
      setPosts(publishedPosts);
      setCategories(allCategories);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
    setLoading(false);
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           post.categories.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const PostCard: React.FC<{ post: BlogPost }> = ({ post }) => (
    <Card
      className="shadow-sm hover:shadow-md transition-shadow duration-200 h-full"
      cover={
        post.featuredImage ? (
          <img
            alt={post.title}
            src={post.featuredImage}
            className="h-48 w-full object-cover"
          />
        ) : (
          <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <Text className="text-white text-lg font-semibold">
              {post.title.substring(0, 2).toUpperCase()}
            </Text>
          </div>
        )
      }
    >
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <div className="mb-3">
            {post.categories.map(category => (
              <Tag key={category} color="blue" className="mb-1">
                {category}
              </Tag>
            ))}
          </div>
          
          <Title level={4} className="mb-2 line-clamp-2">
            <Link 
              to={`/post/${post.slug}`}
              className="text-gray-800 hover:text-blue-600 transition-colors"
            >
              {post.title}
            </Link>
          </Title>
          
          <Paragraph className="text-gray-600 mb-4 line-clamp-3">
            {post.excerpt || stripHtml(post.content).substring(0, 150) + '...'}
          </Paragraph>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <UserOutlined size={14} className="mr-1" />
              {post.author}
            </span>
            <span className="flex items-center">
              <CalendarOutlined size={14} className="mr-1" />
              {format(new Date(post.publishedAt || post.createdAt), 'MMM d, yyyy')}
            </span>
          </div>
          <Link 
            to={`/post/${post.slug}`}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Read more
          </Link>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <Title level={1} className="mb-4 text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome to Weblog
        </Title>
        <Text className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover insightful articles, tutorials, and stories from our community of writers and experts.
        </Text>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <SearchInput
            placeholder="Search posts..."
            prefix={<SearchOutlined size={16} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
            size="large"
          />
          <Select
            value={selectedCategory}
            onChange={setSelectedCategory}
            size="large"
            style={{ width: 200 }}
          >
            <Select.Option value="all">All Categories</Select.Option>
            {categories.map(category => (
              <Select.Option key={category.id} value={category.name}>
                {category.name}
              </Select.Option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Posts Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <Text className="mt-4 text-gray-600">Loading posts...</Text>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <Text className="text-xl text-gray-600">
            {searchTerm || selectedCategory !== 'all' 
              ? 'No posts found matching your criteria.' 
              : 'No posts available yet.'}
          </Text>
        </div>
      ) : (
        <>
          <Row gutter={[24, 24]}>
            {paginatedPosts.map(post => (
              <Col key={post.id} xs={24} md={12} lg={8}>
                <PostCard post={post} />
              </Col>
            ))}
          </Row>
          
          {filteredPosts.length > pageSize && (
            <div className="mt-8 text-center">
              <Pagination
                current={currentPage}
                total={filteredPosts.length}
                pageSize={pageSize}
                onChange={setCurrentPage}
                showSizeChanger={false}
                showQuickJumper
                showTotal={(total, range) => 
                  `${range[0]}-${range[1]} of ${total} posts`
                }
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};