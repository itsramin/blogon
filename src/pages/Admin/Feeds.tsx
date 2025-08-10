import { useEffect, useState } from "react";
import { List, Spin, message, Button } from "antd";
import { BlogPost } from "../../types";
import PostCard from "../../components/PostCard";
import useFollowings from "../../hooks/useFollowings";
import { blogStorage } from "../../storage/blogStorage";
import { fetchBlogPosts } from "../../services/blogService";
import { ReloadOutlined } from "@ant-design/icons";

const Feeds = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  const { feeds } = useFollowings();

  useEffect(() => {
    loadFollowedPosts();

    // Set up refresh interval (every 5 minutes)
    const interval = setInterval(() => {
      setLastUpdated(Date.now());
    }, 300000);

    return () => clearInterval(interval);
  }, [feeds, lastUpdated]);

  const loadFollowedPosts = async () => {
    setLoading(true);
    try {
      // Try to fetch from blogs directly
      const directPosts = await Promise.all(
        feeds.map(async (blogUrl) => {
          try {
            const response = await fetchBlogPosts(blogUrl);
            return response;
          } catch (error) {
            console.error(`Failed to fetch from ${blogUrl}:`, error);
            return [];
          }
        })
      );

      // Get any posts received via webhooks
      const allPosts = await blogStorage.getAllPosts();
      const webhookPosts = allPosts.filter((post) => post.isExternal);

      // Combine and deduplicate posts
      const combinedPosts = [...directPosts.flat(), ...webhookPosts];
      const uniquePosts = combinedPosts.filter(
        (post, index, self) => index === self.findIndex((p) => p.id === post.id)
      );

      setPosts(
        uniquePosts.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    } catch (error) {
      console.error("Failed to load posts:", error);
      message.error("Failed to load some blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLastUpdated(Date.now());
    message.success("Refreshing posts...");
  };

  return (
    <div className="w-full mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Followed Blogs Feed</h2>
        <Button
          onClick={handleRefresh}
          loading={loading}
          icon={<ReloadOutlined />}
        >
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">
            {feeds.length > 0
              ? "No posts found from followed blogs"
              : "You're not following any blogs yet."}
          </p>
        </div>
      ) : (
        <List
          itemLayout="vertical"
          dataSource={posts}
          renderItem={(post) => (
            <List.Item>
              <PostCard post={post} />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">
                  Source: {post.source || new URL(post.link).hostname}
                </span>
                {post.isExternal && (
                  <span className="text-xs text-blue-500">
                    Received via WebSub
                  </span>
                )}
              </div>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default Feeds;
