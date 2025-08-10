import { useEffect, useState } from "react";
import { message } from "antd";
import usePosts from "./usePosts";

function useTaxonomy() {
  const { categories: initialCategories, refreshPosts } = usePosts();
  const [categories, setCategories] = useState(initialCategories);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const addCategory = async (name: string) => {
    setLoading(true);
    try {
      // In a real implementation, this would call xmlStorage
      // For now, we'll simulate it with local state
      const newCategory = {
        id: Date.now().toString(),
        name,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
      };
      setCategories([...categories, newCategory]);
      message.success(`Category "${name}" added successfully`);
    } catch (error) {
      console.error("Failed to add category:", error);
      message.error("Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: string, newName: string) => {
    setLoading(true);
    try {
      setCategories(
        categories.map((cat) =>
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
      message.error("Failed to update category");
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    setLoading(true);
    try {
      setCategories(categories.filter((cat) => cat.id !== id));
      message.success("Category deleted successfully");
    } catch (error) {
      console.error("Failed to delete category:", error);
      message.error("Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    refreshCategories: refreshPosts, // Reuse posts refresh to get updated categories
  };
}

export default useTaxonomy;
