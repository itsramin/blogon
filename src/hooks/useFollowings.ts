import { useState, useEffect, useCallback } from "react";
import { message } from "antd";
import { blogStorage } from "../storage/blogStorage";

function isValidBlogUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

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

  // Modify the addFeed function
  const addFeed = useCallback(
    async (url: string) => {
      setLoading(true);
      setError(null);
      try {
        if (!isValidBlogUrl(url)) {
          message.error("Please enter a valid blog URL");
          return false;
        }

        if (feeds.includes(url)) {
          message.warning("You're already following this blog");
          return false;
        }

        try {
          const success = await blogStorage.subscribeToBlog(url);
          if (!success) throw new Error("Subscription failed");

          const updatedFeeds = [...feeds, url];
          setFeeds(updatedFeeds);
          return true;
        } catch (err: any) {
          console.error("Subscription error:", err);
          throw new Error(
            err.message.includes("CORS")
              ? "Could not subscribe (CORS issue). The blog may need to enable cross-origin requests."
              : "Failed to subscribe to blog"
          );
        }
      } catch (err: any) {
        setError(err.message);
        message.error(err.message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [feeds]
  );

  // Add this helper function

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
