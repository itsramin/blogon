import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Input,
  Select,
  Pagination,
  Spin,
  message,
  Button,
} from "antd";
import { xmlStorage } from "../../utils/xmlStorage";
import { BlogPost, Category } from "../../types";
import { SearchOutlined } from "@ant-design/icons";
import PostCard from "../../components/PostCard";
import { fetchFeedPosts, isValidFeedUrl } from "../../services/feedService";

const { Text } = Typography;
const { Search: SearchInput } = Input;

export const Home: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [feeds, setFeeds] = useState<string[]>([]);
  const pageSize = 6;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Initialize storage first
      await xmlStorage.initialize();

      const [publishedPosts, allCategories] = await Promise.all([
        xmlStorage.getPublishedPosts(),
        xmlStorage.getAllCategories(),
      ]);

      setPosts(publishedPosts);
      setCategories(allCategories);
    } catch (error) {
      console.error("Failed to load data:", error);
      message.error("Failed to load posts. Please try again later.");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadFollowedPosts();
  }, []);

  const loadFollowedPosts = async () => {
    setLoading(true);
    await xmlStorage.initialize();
    const blogInfo = await xmlStorage.getBlogInfo();
    const followedFeeds = blogInfo.followedFeeds || [];
    setFeeds(followedFeeds);

    if (followedFeeds.length === 0) {
      setLoading(false);
      return;
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

  const handleAddFeed = async (url: string) => {
    try {
      if (!isValidFeedUrl(url)) {
        message.error("Please enter a valid RSS feed URL");
        return;
      }

      if (feeds.includes(url)) {
        message.warning("This feed is already in your subscriptions");
        return;
      }

      try {
        // Test the feed URL
        await fetchFeedPosts(url);

        const updatedFeeds = [...feeds, url];
        await xmlStorage.updateBlogInfo({ followedFeeds: updatedFeeds });
        setFeeds(updatedFeeds);

        message.success("Feed added successfully");
        loadFollowedPosts();
      } catch (error) {
        message.error(
          "Failed to fetch feed. Please check the URL and try again."
        );
      }
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
      <Button
        onClick={() => {
          const url = `${window.location.origin}/feed.xml`;
          handleAddFeed(url);
        }}
      >
        Follow Me
      </Button>
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

      {/* Posts Grid */}
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
    </div>
  );
};
