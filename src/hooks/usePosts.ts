import { useEffect, useState } from "react";
import { xmlStorage } from "../utils/xmlStorage";
import { message } from "antd";
import { BlogPost, Category } from "../types";

function usePosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

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

      setPosts(publishedPosts);
      setCategories(allCategories);
    } catch (error) {
      console.error("Failed to load data:", error);
      message.error("Failed to load posts. Please try again later.");
    }
    setLoading(false);
  };

  return { posts, categories, loading };
}

export default usePosts;
