import { useEffect, useState } from "react";
import { xmlStorage } from "../utils/xmlStorage";
import { message } from "antd";

function useFollowings() {
  const [loading, setLoading] = useState(true);
  const [feeds, setFeeds] = useState<string[]>([]);
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
  const removeFeed = async (feedUrl: string) => {
    const updatedFeeds = feeds.filter((feed) => feed !== feedUrl);
    await xmlStorage.updateBlogInfo({ followedFeeds: updatedFeeds });
    setFeeds(updatedFeeds);
    message.success("Feed removed successfully");
    loadFollowedPosts();
  };

  return { feeds, loading, removeFeed };
}

export default useFollowings;
