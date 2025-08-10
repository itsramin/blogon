import { useEffect, useState } from "react";
import { xmlStorage } from "../utils/xmlStorage";
import { message } from "antd";
import { fetchFeedPosts, isValidFeedUrl } from "../services/feedService";

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

  const addFeed = async (url: string) => {
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
      } catch (error) {
        message.error(
          "Failed to fetch feed. Please check the URL and try again."
        );
      }
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return { feeds, loading, removeFeed, addFeed };
}

export default useFollowings;
