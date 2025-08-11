import { useEffect, useState, useCallback } from "react";
import { BlogPost } from "../types";
import { blogStorage } from "../storage/blogStorage";

function usePosts() {
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [publishedPosts] = await Promise.all([
        blogStorage.getPublishedPosts(),
      ]);

      setAllPosts(publishedPosts);
    } catch (error) {
      console.error("Failed to load data:", error);
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, []);

  const getPostById = useCallback(
    async (id: string): Promise<BlogPost | null> => {
      setLoading(true);
      setError(null);
      try {
        const post = await blogStorage.getPostById(id);
        return post;
      } catch (error) {
        console.error("Failed to get post by ID:", error);
        setError("Failed to load post");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const savePost = useCallback(
    async (post: BlogPost): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        await blogStorage.savePost(post);
        await loadData();
      } catch (error) {
        console.error("Failed to save post:", error);
        setError("Failed to save post");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [loadData]
  );

  const deletePost = useCallback(
    async (id: string): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        await blogStorage.deletePost(id);
        await loadData();
      } catch (error) {
        console.error("Failed to delete post:", error);
        setError("Failed to delete post");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [loadData]
  );

  const addPostsFromXML = useCallback(
    async (xmlContent: string): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        await blogStorage.addPostsFromXML(xmlContent);
        await loadData();
      } catch (error) {
        console.error("Failed to import posts:", error);
        setError("Failed to import posts");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [loadData]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    posts: allPosts,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    refreshPosts: loadData,
    getPostById,
    savePost,
    deletePost,
    addPostsFromXML,
  };
}

export default usePosts;
