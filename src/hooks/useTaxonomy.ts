import { useEffect, useState, useCallback } from "react";
import { blogStorage } from "../storage/blogStorage";

function useTaxonomy() {
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const loadedCategories = await blogStorage.getAllCategories();
      setCategories(loadedCategories);
    } catch (err) {
      console.error("Failed to load categories:", err);
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);
  const loadTags = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const loadedTags = await blogStorage.getAllTags();
      setTags(loadedTags);
    } catch (err) {
      console.error("Failed to load tags:", err);
      setError("Failed to load tags");
    } finally {
      setLoading(false);
    }
  }, []);

  const addCategory = useCallback(async (name: string) => {
    setLoading(true);
    setError(null);
    try {
      await blogStorage.addCategory(name);
      const updatedCategories = await blogStorage.getAllCategories();
      setCategories(updatedCategories);
    } catch (error) {
      console.error("Failed to add category:", error);
      setError("Failed to add category");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategory = useCallback(
    async (oldName: string, newName: string) => {
      setLoading(true);
      setError(null);
      try {
        await blogStorage.updateCategory(oldName, newName);
        const updatedCategories = await blogStorage.getAllCategories();
        setCategories(updatedCategories);
      } catch (error) {
        console.error("Failed to update category:", error);
        setError("Failed to update category");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteCategory = useCallback(async (name: string) => {
    setLoading(true);
    setError(null);
    try {
      await blogStorage.deleteCategory(name);
      const updatedCategories = await blogStorage.getAllCategories();
      setCategories(updatedCategories);
    } catch (error) {
      console.error("Failed to delete category:", error);
      setError("Failed to delete category");
    } finally {
      setLoading(false);
    }
  }, []);

  const addTag = useCallback(async (name: string) => {
    setLoading(true);
    setError(null);
    try {
      await blogStorage.addTag(name);
      const updatedTags = await blogStorage.getAllTags();
      setTags(updatedTags);
    } catch (error) {
      console.error("Failed to add Tag:", error);
      setError("Failed to add Tag");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTag = useCallback(async (oldName: string, newName: string) => {
    setLoading(true);
    setError(null);
    try {
      await blogStorage.updateTag(oldName, newName);
      const updatedTags = await blogStorage.getAllTags();
      setTags(updatedTags);
    } catch (error) {
      console.error("Failed to update tag:", error);
      setError("Failed to update tag");
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTag = useCallback(async (name: string) => {
    setLoading(true);
    setError(null);
    try {
      await blogStorage.deleteTag(name);
      const updatedTags = await blogStorage.getAllTags();
      setTags(updatedTags);
    } catch (error) {
      console.error("Failed to delete tag:", error);
      setError("Failed to delete tag");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
    loadTags();
  }, [loadCategories, loadTags]);

  return {
    categories,
    tags,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    addTag,
    updateTag,
    deleteTag,
    refreshCategories: loadCategories,
    refreshTags: loadTags,
  };
}

export default useTaxonomy;
