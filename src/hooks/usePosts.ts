import { useEffect, useState, useCallback } from "react";
import { xmlStorage } from "../utils/xmlStorage";
import { message } from "antd";
import { BlogPost, Category } from "../types";

function usePosts() {
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Initialize storage first
      await xmlStorage.initialize();

      const [publishedPosts, allCategories] = await Promise.all([
        xmlStorage.getPublishedPosts(),
        xmlStorage.getAllCategories(),
      ]);

      setAllPosts(publishedPosts);
      setCategories(allCategories);
      setFilteredPosts(publishedPosts); // Initialize filteredPosts with all posts
    } catch (error) {
      console.error("Failed to load data:", error);
      message.error("Failed to load posts. Please try again later.");
    }
    setLoading(false);
  };

  // Filter posts based on search term and category
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

  // Re-filter whenever search term, category, or posts change
  useEffect(() => {
    filterPosts();
  }, [searchTerm, selectedCategory, allPosts, filterPosts]);

  const getPostById = useCallback(
    async (id: string): Promise<BlogPost | null> => {
      setLoading(true);
      try {
        await xmlStorage.initialize();
        const post = await xmlStorage.getPostById(id);
        return post;
      } catch (error) {
        console.error("Failed to get post by ID:", error);
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
      try {
        await xmlStorage.initialize();
        await xmlStorage.savePost(post);
        message.success("Post saved successfully");
        await loadData(); // Refresh the posts list
      } catch (error) {
        console.error("Failed to save post:", error);
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
      try {
        await xmlStorage.initialize();
        await xmlStorage.deletePost(id);
        message.success("Post deleted successfully");
        await loadData(); // Refresh the posts list
      } catch (error) {
        console.error("Failed to delete post:", error);
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
      try {
        await xmlStorage.initialize();
        await xmlStorage.addPostsFromXML(xmlContent);
        message.success("Posts imported successfully");
        await loadData();
      } catch (error) {
        console.error("Failed to import posts:", error);
        message.error("Failed to import posts");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [loadData]
  );

  return {
    posts: filteredPosts,
    allPosts,
    categories,
    loading,
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
