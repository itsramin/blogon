import { useEffect, useState, useCallback } from "react";
import { message } from "antd";
import { blogStorage } from "../storage/blogStorage";
import { Category } from "../types";

function useTaxonomy() {
  const [categories, setCategories] = useState<Category[]>([]);
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
      message.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  const addCategory = useCallback(async (name: string) => {
    setLoading(true);
    setError(null);
    try {
      const newCategory = {
        id: Date.now().toString(),
        name,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
      };

      // In a real implementation, this would be saved to storage
      // For now, we'll update local state
      setCategories((prev) => [...prev, newCategory]);
      message.success(`Category "${name}" added successfully`);
    } catch (error) {
      console.error("Failed to add category:", error);
      setError("Failed to add category");
      message.error("Failed to add category");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategory = useCallback(async (id: string, newName: string) => {
    setLoading(true);
    setError(null);
    try {
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === id
            ? {
                ...cat,
                name: newName,
                slug: newName.toLowerCase().replace(/\s+/g, "-"),
              }
            : cat
        )
      );
      message.success("Category updated successfully");
    } catch (error) {
      console.error("Failed to update category:", error);
      setError("Failed to update category");
      message.error("Failed to update category");
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      message.success("Category deleted successfully");
    } catch (error) {
      console.error("Failed to delete category:", error);
      setError("Failed to delete category");
      message.error("Failed to delete category");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    refreshCategories: loadCategories,
  };
}

export default useTaxonomy;
