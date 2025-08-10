import { useState, useCallback } from "react";
import { BlogPost } from "../types";
import { importFromXML } from "../storage/xmlParser";
import { useBlog } from "./useBlog";

export const useFeed = () => {
  const { blogInfo, updateBlogInfo } = useBlog();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRSS = useCallback(async (url: string) => {
    if (!url) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch RSS");

      const xmlString = await response.text();
      const { posts } = await importFromXML(xmlString);
      setPosts(posts);
    } catch (err) {
      console.error("RSS fetch error:", err);
      setError(
        "Invalid RSS URL or format. Please check the URL and try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const addRssFeed = useCallback(
    async (url: string) => {
      if (!blogInfo) return;

      // Check if URL already exists
      if (blogInfo.rssFeeds?.includes(url)) {
        throw new Error("This RSS feed is already in your list");
      }

      const updatedFeeds = [...(blogInfo.rssFeeds || []), url];
      await updateBlogInfo({ ...blogInfo, rssFeeds: updatedFeeds });
    },
    [blogInfo, updateBlogInfo]
  );

  const removeRssFeed = useCallback(
    async (url: string) => {
      if (!blogInfo) return;

      const updatedFeeds = (blogInfo.rssFeeds || []).filter(
        (feed) => feed !== url
      );
      await updateBlogInfo({ ...blogInfo, rssFeeds: updatedFeeds });
    },
    [blogInfo, updateBlogInfo]
  );

  return {
    rssFeeds: blogInfo?.rssFeeds || [],
    posts,
    loading,
    error,
    fetchRSS,
    addRssFeed,
    removeRssFeed,
  };
};
