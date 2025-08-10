import { BlogInfo, BlogPost, Category, Tag } from "../types";
import { loadFromGist, saveToGist } from "./gistService";
import { importFromXML, exportToXML } from "./xmlParser";
import { generateId, createSlug } from "./helpers";
import {
  getDefaultBlogInfo,
  getDefaultCategories,
  getDefaultTags,
} from "./defaults";

class BlogStorage {
  private cache = {
    posts: [] as BlogPost[],
    categories: [] as Category[],
    tags: [] as Tag[],
    initialized: false,
  };

  async initialize(): Promise<void> {
    if (this.cache.initialized) return;

    try {
      const xmlString = await loadFromGist();
      const data = await importFromXML(xmlString);

      this.cache.posts = data.posts;
      this.cache.categories = data.posts.flatMap((post) =>
        post.categories
          .map((name) => ({
            id: generateId(),
            name,
            slug: createSlug(name),
          }))
          .filter(
            (cat, index, self) =>
              self.findIndex((c) => c.name === cat.name) === index
          )
      );
      this.cache.tags = data.posts.flatMap((post) =>
        post.tags
          .map((name) => ({
            id: generateId(),
            name,
            slug: createSlug(name),
          }))
          .filter(
            (tag, index, self) =>
              self.findIndex((t) => t.name === tag.name) === index
          )
      );

      this.cache.initialized = true;
    } catch (error) {
      console.error("Failed to initialize from Gist, using defaults", error);
      this.cache.posts = [];
      this.cache.categories = getDefaultCategories();
      this.cache.tags = getDefaultTags();
      this.cache.initialized = true;
    }
  }

  async getAllPosts(): Promise<BlogPost[]> {
    await this.initialize();
    return [...this.cache.posts];
  }

  async getPostById(id: string): Promise<BlogPost | null> {
    await this.initialize();
    return this.cache.posts.find((post) => post.id === id) || null;
  }

  async savePost(post: BlogPost): Promise<void> {
    await this.initialize();
    const existingIndex = this.cache.posts.findIndex((p) => p.id === post.id);

    const postToSave = {
      ...post,
      updatedAt: new Date().toISOString(),
      url: post.url || createSlug(post.title),
      link: post.link || `/post/${post.url || createSlug(post.title)}`,
    };

    if (existingIndex >= 0) {
      this.cache.posts[existingIndex] = postToSave;
    } else {
      postToSave.id = postToSave.id || generateId();
      postToSave.createdAt = postToSave.createdAt || new Date().toISOString();
      postToSave.number = postToSave.number || Date.now();
      this.cache.posts.push(postToSave);
    }

    try {
      const xml = await this.exportData();
      await saveToGist(xml);
    } catch (error) {
      console.error("Failed to save to Gist:", error);
      throw error;
    }
  }

  async deletePost(id: string): Promise<void> {
    await this.initialize();
    this.cache.posts = this.cache.posts.filter((post) => post.id !== id);

    try {
      const xml = await this.exportData();
      await saveToGist(xml);
    } catch (error) {
      console.error("Failed to update Gist after deletion:", error);
      throw error;
    }
  }

  async getPublishedPosts(): Promise<BlogPost[]> {
    await this.initialize();
    return this.cache.posts
      .filter((post) => post.status === "published")
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  }

  async getAllCategories(): Promise<Category[]> {
    await this.initialize();
    if (this.cache.categories.length === 0) {
      return getDefaultCategories();
    }
    return [...this.cache.categories];
  }

  async getAllTags(): Promise<Tag[]> {
    await this.initialize();
    if (this.cache.tags.length === 0) {
      return getDefaultTags();
    }
    return [...this.cache.tags];
  }

  async getBlogInfo(): Promise<BlogInfo> {
    await this.initialize();
    try {
      const xmlString = await loadFromGist();
      const data = await importFromXML(xmlString);
      return data.blogInfo;
    } catch (error) {
      console.error("Failed to load blog info from XML, using defaults", error);
      return getDefaultBlogInfo();
    }
  }

  async addPostsFromXML(xmlString: string): Promise<void> {
    try {
      const parsedData = await importFromXML(xmlString);
      const existingPostNumbers = new Set(
        this.cache.posts.map((p) => p.number)
      );

      const newPosts = parsedData.posts.filter(
        (post) => !existingPostNumbers.has(post.number)
      );

      this.cache.posts = [...this.cache.posts, ...newPosts];

      newPosts.forEach((post) => {
        post.categories.forEach((category) => {
          if (!this.cache.categories.some((c) => c.name === category)) {
            this.cache.categories.push({
              id: generateId(),
              name: category,
              slug: createSlug(category),
            });
          }
        });

        post.tags.forEach((tag) => {
          if (!this.cache.tags.some((t) => t.name === tag)) {
            this.cache.tags.push({
              id: generateId(),
              name: tag,
              slug: createSlug(tag),
            });
          }
        });
      });

      const xml = await this.exportData();
      await saveToGist(xml);
    } catch (error) {
      console.error("Failed to add posts from XML:", error);
      throw error;
    }
  }

  async updateBlogInfo(updates: Partial<BlogInfo>): Promise<void> {
    await this.initialize();

    let currentInfo: BlogInfo;
    try {
      const xmlString = await loadFromGist();
      const data = await importFromXML(xmlString);
      currentInfo = data.blogInfo;
    } catch (error) {
      console.error("Failed to load current blog info, using defaults", error);
      currentInfo = getDefaultBlogInfo();
    }

    const updatedInfo = { ...currentInfo, ...updates };
    const updatedPosts = this.cache.posts.map((post) => {
      if (post.author.userName === currentInfo.owner.userName) {
        return {
          ...post,
          author: {
            ...post.author,
            userName: updatedInfo.owner.userName,
            firstName: updatedInfo.owner.firstName,
            lastName: updatedInfo.owner.lastName,
          },
        };
      }
      return post;
    });

    this.cache.posts = updatedPosts;
    const xml = exportToXML(updatedInfo, this.cache.posts);

    try {
      await saveToGist(xml);
    } catch (error) {
      console.error("Failed to save updated blog info:", error);
      throw error;
    }
  }

  private async exportData(): Promise<string> {
    const blogInfo = await this.getBlogInfo();
    return exportToXML(blogInfo, this.cache.posts);
  }
}

export const blogStorage = new BlogStorage();
