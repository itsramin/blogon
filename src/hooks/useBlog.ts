import { useState, useEffect, useCallback } from "react";
import { message } from "antd";
import { BlogInfo } from "../types";
import { blogStorage } from "../storage/blogStorage";

export const useBlog = () => {
  const [blogInfo, setBlogInfo] = useState<BlogInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBlogInfo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const info = await blogStorage.getBlogInfo();
      setBlogInfo(info);
      return info;
    } catch (err) {
      console.error("Failed to load blog info:", err);
      setError("Failed to load blog settings");
      message.error("Failed to load blog settings");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBlogInfo = useCallback(
    async (values: Partial<BlogInfo>) => {
      setLoading(true);
      setError(null);
      try {
        await blogStorage.updateBlogInfo(values);
        const updatedInfo = await loadBlogInfo(); // Refresh the data
        message.success("Blog settings updated successfully");
        return updatedInfo;
      } catch (err) {
        console.error("Failed to update blog info:", err);
        setError("Failed to update blog settings");
        message.error("Failed to update blog settings");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadBlogInfo]
  );

  useEffect(() => {
    loadBlogInfo();
  }, [loadBlogInfo]);

  return {
    blogInfo,
    loading,
    error,
    loadBlogInfo,
    updateBlogInfo,
  };
};
