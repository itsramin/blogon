import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Input,
  Select,
  Pagination,
  Spin,
  Tabs,
  FloatButton,
} from "antd";
import PostCard from "../../components/PostCard";
import { useAuth } from "../../context/AuthContext";
import usePosts from "../../hooks/usePosts";
import Feeds from "../Admin/Feeds";
import useTaxonomy from "../../hooks/useTaxonomy";
import { BlogPost } from "../../types";
import { useBlog } from "../../hooks/useBlog";
import { useNavigate } from "react-router-dom";
import { PlusOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { Search: SearchInput } = Input;

export const Home: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const { blogInfo } = useBlog();
  const { isAuthenticated } = useAuth();
  const { posts, loading } = usePosts();
  const { categories, tags } = useTaxonomy();
  const [selectedCategory, setCategory] = useState("all");
  const [selectedTagList, setTagList] = useState<string[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>(posts);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const navigate = useNavigate();

  const handleCategoryChange = (value: string) => {
    setCategory(value);
  };

  const handleTagChange = (values: string[]) => {
    setTagList(values);
  };

  useEffect(() => {
    let result = [...posts];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (post) =>
          post.title.toLowerCase().includes(term) ||
          post.content.toLowerCase().includes(term)
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter((post) =>
        post.categories.includes(selectedCategory)
      );
    }

    // Filter by tags
    if (selectedTagList.length > 0) {
      result = result.filter((post) =>
        selectedTagList.every((tag) => post.tags.includes(tag))
      );
    }

    setFilteredPosts(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [selectedCategory, selectedTagList, searchTerm, posts]);

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
            {searchTerm ||
            selectedCategory !== "all" ||
            selectedTagList.length > 0
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
      {blogInfo && (
        <div className="mb-8 text-center">
          {blogInfo.shortDescription && (
            <h2 className="text-xl text-gray-700 mb-2">
              {blogInfo.shortDescription}
            </h2>
          )}
          {blogInfo.fullDescription && (
            <p className="text-gray-600">{blogInfo.fullDescription}</p>
          )}
        </div>
      )}
      {/* Search and Filters */}
      <Card className="shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <SearchInput
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
            allowClear
            size="large"
          />
          <Select
            value={selectedCategory}
            onChange={handleCategoryChange}
            size="large"
            className="w-full sm:w-auto sm:min-w-[200px]"
            loading={loading}
          >
            <Select.Option value="all">All Categories</Select.Option>
            {categories.map((category) => (
              <Select.Option key={category} value={category}>
                {category}
              </Select.Option>
            ))}
          </Select>
          <Select
            mode="multiple"
            placeholder="Select tags"
            value={selectedTagList}
            onChange={handleTagChange}
            size="large"
            className="w-full sm:w-auto sm:min-w-[200px]"
            loading={loading}
          >
            {tags.map((tag) => (
              <Select.Option key={tag} value={tag}>
                {tag}
              </Select.Option>
            ))}
          </Select>
        </div>
      </Card>

      {isAuthenticated && false ? (
        <Tabs
          items={[
            {
              key: "posts",
              label: "My posts",
              children: myPosts,
            },
            { key: "feeds", label: "Followings", children: <Feeds /> },
          ]}
        />
      ) : (
        myPosts
      )}
      {isAuthenticated && (
        <FloatButton
          type="primary"
          onClick={() => navigate("/admin/posts/new")}
          tooltip="Create new post"
          icon={<PlusOutlined />}
        />
      )}
    </div>
  );
};
