import { useState, useEffect, useCallback } from "react";
import { message } from "antd";
import { blogStorage } from "../storage/blogStorage";
import { fetchFeedPosts, isValidFeedUrl } from "../services/feedService";

function useFollowings() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feeds, setFeeds] = useState<string[]>([]);

  const loadFollowedFeeds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const blogInfo = await blogStorage.getBlogInfo();
      const followedFeeds = blogInfo.followedFeeds || [];
      setFeeds(followedFeeds);
    } catch (err) {
      console.error("Failed to load followed feeds:", err);
      setError("Failed to load subscriptions");
      message.error("Failed to load followed feeds");
    } finally {
      setLoading(false);
    }
  }, []);

  const removeFeed = useCallback(
    async (feedUrl: string) => {
      setLoading(true);
      setError(null);
      try {
        const updatedFeeds = feeds.filter((feed) => feed !== feedUrl);
        await blogStorage.updateBlogInfo({ followedFeeds: updatedFeeds });
        setFeeds(updatedFeeds);
        message.success("Feed removed successfully");
      } catch (err) {
        console.error("Failed to remove feed:", err);
        setError("Failed to remove feed");
        message.error("Failed to remove feed");
      } finally {
        setLoading(false);
      }
    },
    [feeds]
  );

  const addFeed = useCallback(
    async (url: string) => {
      setLoading(true);
      setError(null);
      try {
        // Validate URL format
        if (!isValidFeedUrl(url)) {
          message.error("Please enter a valid RSS feed URL");
          return false;
        }

        // Check for duplicates
        if (feeds.includes(url)) {
          message.warning("This feed is already in your subscriptions");
          return false;
        }

        // Test the feed URL
        await fetchFeedPosts(url);

        const updatedFeeds = [...feeds, url];
        await blogStorage.updateBlogInfo({ followedFeeds: updatedFeeds });
        setFeeds(updatedFeeds);
        message.success("Feed added successfully");
        return true;
      } catch (err) {
        console.error("Failed to add feed:", err);
        setError("Failed to add feed");
        message.error(
          "Failed to fetch feed. Please check the URL and try again."
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [feeds]
  );

  useEffect(() => {
    loadFollowedFeeds();
  }, [loadFollowedFeeds]);

  return {
    feeds,
    loading,
    error,
    removeFeed,
    addFeed,
    refreshFeeds: loadFollowedFeeds,
  };
}

export default useFollowings;
