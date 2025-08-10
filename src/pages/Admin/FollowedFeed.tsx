import { useEffect, useState } from "react";
import { List, Spin, message } from "antd";
import { BlogPost } from "../../types";
import { fetchFeedPosts } from "../../services/feedService";
import PostCard from "../../components/PostCard";
import useFollowings from "../../hooks/useFollowings";

const FollowedFeed = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const { feeds } = useFollowings();
  useEffect(() => {
    loadFollowedPosts();
  }, [feeds]);

  const loadFollowedPosts = async () => {
    try {
      const allPosts = await Promise.all(
        feeds.map((feedUrl) => fetchFeedPosts(feedUrl))
      );

      setPosts(
        allPosts
          .flat()
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
      );
    } catch (error) {
      message.error("Failed to load some feeds");
    }
    setLoading(false);
  };

  return (
    <div className="w-full mx-auto ">
      {loading ? (
        <div className="text-center py-12">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Loading followed posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">
            You're not following any blogs yet.
          </p>
        </div>
      ) : (
        <List
          itemLayout="vertical"
          dataSource={posts}
          renderItem={(post) => (
            <List.Item>
              <PostCard post={post} />
              <div className="text-xs text-gray-500 mt-2">
                Source: {new URL(post.link).hostname}
              </div>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default FollowedFeed;
