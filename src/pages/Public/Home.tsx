import React, { useEffect, useState } from "react";
import { Card, Typography, Input, Select, Pagination } from "antd";
import { xmlStorage } from "../../utils/xmlStorage";
import { BlogPost, Category } from "../../types";
import { SearchOutlined } from "@ant-design/icons";
import PostCard from "../../components/PostCard";

const { Text } = Typography;
const { Search: SearchInput } = Input;

export const Home: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
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
        xmlStorage.getAllCategories(),
      ]);

      setPosts(publishedPosts);
      setCategories(allCategories);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
    setLoading(false);
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || post.categories.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
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
            {categories.map((category) => (
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
            {searchTerm || selectedCategory !== "all"
              ? "No posts found matching your criteria."
              : "No posts available yet."}
          </Text>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-y-6">
            {paginatedPosts.map((post) => (
              <PostCard post={post} />
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
    </div>
  );
};
