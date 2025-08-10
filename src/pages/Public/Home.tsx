import React, { useState } from "react";
import { Card, Typography, Input, Select, Pagination, Spin, Tabs } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import PostCard from "../../components/PostCard";
import { useAuth } from "../../context/AuthContext";
import FollowedFeed from "../Admin/FollowedFeed";
import useFollowings from "../../hooks/useFollowings";
import usePosts from "../../hooks/usePosts";

const { Text } = Typography;
const { Search: SearchInput } = Input;

export const Home: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const { isAuthenticated } = useAuth();
  const { feeds } = useFollowings();
  const {
    posts: filteredPosts,
    loading,
    categories,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
  } = usePosts();

  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const myPosts = (
    <>
      {loading ? (
        <div className="text-center py-12">
          <Spin size="large" />
          <Text className="mt-4 block text-gray-600">Loading posts...</Text>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <Text className="text-xl text-gray-600">
            {searchTerm || selectedCategory !== "all"
              ? "No posts found matching your criteria."
              : "No posts available yet."}
          </Text>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-y-6">
            {paginatedPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

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
    </>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
      {/* Search and Filters */}
      <Card className="shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <SearchInput
            placeholder="Search posts..."
            prefix={<SearchOutlined />}
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
            loading={loading}
          >
            <Select.Option value="all">All Categories</Select.Option>
            {categories.map((category) => (
              <Select.Option key={category.id} value={category.name}>
                {category.name}
              </Select.Option>
            ))}
          </Select>
        </div>
      </Card>

      {isAuthenticated && feeds && feeds.length > 0 ? (
        <Tabs
          items={[
            {
              key: "posts",
              label: "My posts",
              children: myPosts,
            },
            { key: "feeds", label: "Followings", children: <FollowedFeed /> },
          ]}
        />
      ) : (
        myPosts
      )}
    </div>
  );
};
