import { BlogPost, Category, Tag } from '../types';

const STORAGE_PREFIX = 'weblog_';

// Simulate XML storage using localStorage for demo purposes
// In production, this would interface with Vercel's file system or KV database

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const createSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

export const xmlStorage = {
  // Posts
  async getAllPosts(): Promise<BlogPost[]> {
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}posts`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading posts:', error);
      return [];
    }
  },

  async getPostById(id: string): Promise<BlogPost | null> {
    const posts = await this.getAllPosts();
    return posts.find(post => post.id === id) || null;
  },

  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    const posts = await this.getAllPosts();
    return posts.find(post => post.slug === slug) || null;
  },

  async savePost(post: BlogPost): Promise<void> {
    const posts = await this.getAllPosts();
    const existingIndex = posts.findIndex(p => p.id === post.id);
    
    if (existingIndex >= 0) {
      posts[existingIndex] = { ...post, updatedAt: new Date().toISOString() };
    } else {
      posts.push(post);
    }
    
    localStorage.setItem(`${STORAGE_PREFIX}posts`, JSON.stringify(posts));
  },

  async deletePost(id: string): Promise<void> {
    const posts = await this.getAllPosts();
    const filteredPosts = posts.filter(post => post.id !== id);
    localStorage.setItem(`${STORAGE_PREFIX}posts`, JSON.stringify(filteredPosts));
  },

  async getPublishedPosts(): Promise<BlogPost[]> {
    const posts = await this.getAllPosts();
    return posts
      .filter(post => post.status === 'published')
      .sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
  },

  // Categories
  async getAllCategories(): Promise<Category[]> {
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}categories`);
      return data ? JSON.parse(data) : [
        { id: '1', name: 'Technology', slug: 'technology', description: 'Tech news and tutorials' },
        { id: '2', name: 'Lifestyle', slug: 'lifestyle', description: 'Life and wellness tips' },
        { id: '3', name: 'Business', slug: 'business', description: 'Business insights and strategies' }
      ];
    } catch (error) {
      console.error('Error loading categories:', error);
      return [];
    }
  },

  async saveCategory(category: Category): Promise<void> {
    const categories = await this.getAllCategories();
    const existingIndex = categories.findIndex(c => c.id === category.id);
    
    if (existingIndex >= 0) {
      categories[existingIndex] = category;
    } else {
      categories.push(category);
    }
    
    localStorage.setItem(`${STORAGE_PREFIX}categories`, JSON.stringify(categories));
  },

  // Tags
  async getAllTags(): Promise<Tag[]> {
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}tags`);
      return data ? JSON.parse(data) : [
        { id: '1', name: 'React', slug: 'react' },
        { id: '2', name: 'TypeScript', slug: 'typescript' },
        { id: '3', name: 'Web Development', slug: 'web-development' }
      ];
    } catch (error) {
      console.error('Error loading tags:', error);
      return [];
    }
  },

  async saveTag(tag: Tag): Promise<void> {
    const tags = await this.getAllTags();
    const existingIndex = tags.findIndex(t => t.id === tag.id);
    
    if (existingIndex >= 0) {
      tags[existingIndex] = tag;
    } else {
      tags.push(tag);
    }
    
    localStorage.setItem(`${STORAGE_PREFIX}tags`, JSON.stringify(tags));
  }
};