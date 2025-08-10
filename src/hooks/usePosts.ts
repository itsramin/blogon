import { useEffect, useState, useCallback } from "react";
import { message } from "antd";
import { BlogPost, Category } from "../types";
import { blogStorage } from "../storage/blogStorage";

function usePosts() {
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [publishedPosts, allCategories] = await Promise.all([
        blogStorage.getPublishedPosts(),
        blogStorage.getAllCategories(),
      ]);

      setAllPosts(publishedPosts);
      setCategories(allCategories);
      setFilteredPosts(publishedPosts);
    } catch (error) {
      console.error("Failed to load data:", error);
      setError("Failed to load posts");
      message.error("Failed to load posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  const filterPosts = useCallback(() => {
    const filtered = allPosts.filter((post) => {
      const matchesSearch =
        searchTerm === "" ||
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" ||
        post.categories.includes(selectedCategory);
      return matchesSearch && matchesCategory;
    });
    setFilteredPosts(filtered);
  }, [allPosts, searchTerm, selectedCategory]);

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
        message.error("Failed to load post");
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
        message.success("Post saved successfully");
        await loadData();
      } catch (error) {
        console.error("Failed to save post:", error);
        setError("Failed to save post");
        message.error("Failed to save post");
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
        message.success("Post deleted successfully");
        await loadData();
      } catch (error) {
        console.error("Failed to delete post:", error);
        setError("Failed to delete post");
        message.error("Failed to delete post");
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
        message.success("Posts imported successfully");
        await loadData();
      } catch (error) {
        console.error("Failed to import posts:", error);
        setError("Failed to import posts");
        message.error("Failed to import posts");
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

  useEffect(() => {
    filterPosts();
  }, [searchTerm, selectedCategory, allPosts, filterPosts]);

  return {
    posts: filteredPosts,
    allPosts,
    categories,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    refreshPosts: loadData,
    getPostById,
    savePost,
    deletePost,
    addPostsFromXML,
  };
}

export default usePosts;
