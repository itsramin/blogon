import { BlogData, BlogInfo, BlogPost, Category, Tag } from "../types";

const STORAGE_PREFIX = "weblog_";

// Simulate XML storage using localStorage for demo purposes
// In production, this would interface with Vercel's file system or KV database

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const createSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

export const xmlStorage = {
  async importFromXML(xmlString: string): Promise<BlogData> {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");

    // Parse blog info (same as before)
    const blogInfoNode = xmlDoc.querySelector("BLOG_INFO");
    const blogInfo: BlogInfo = {
      domain: blogInfoNode?.querySelector("DOMAIN")?.textContent?.trim() || "",
      title: blogInfoNode?.querySelector("TITLE")?.textContent?.trim() || "",
      shortDescription:
        blogInfoNode?.querySelector("SHORT_DESCRIPTION")?.textContent?.trim() ||
        "",
      fullDescription:
        blogInfoNode?.querySelector("FULL_DESCRIPTION")?.textContent?.trim() ||
        "",
      owner: {
        userName:
          blogInfoNode
            ?.querySelector("OWNER USER USER_NAME")
            ?.textContent?.trim() || "",
        firstName:
          blogInfoNode
            ?.querySelector("OWNER USER FIRST_NAME")
            ?.textContent?.trim() || "",
        lastName:
          blogInfoNode
            ?.querySelector("OWNER USER LAST_NAME")
            ?.textContent?.trim() || "",
      },
      authors: Array.from(
        blogInfoNode?.querySelectorAll("AUTHORS USER") || []
      ).map((userNode) => ({
        userName:
          userNode.querySelector("USER_NAME")?.textContent?.trim() || "",
        firstName:
          userNode.querySelector("FIRST_NAME")?.textContent?.trim() || "",
        lastName:
          userNode.querySelector("LAST_NAME")?.textContent?.trim() || "",
      })),
    };

    // Parse posts
    const postNodes = xmlDoc.querySelectorAll("POSTS POST");
    const posts: BlogPost[] = Array.from(postNodes).map((postNode) => {
      const tags = Array.from(postNode.querySelectorAll("TAGS TAG NAME")).map(
        (tagNode) => tagNode.textContent?.trim() || ""
      );

      const categories = Array.from(
        postNode.querySelectorAll("CATEGORIES CATEGORY NAME")
      ).map((catNode) => catNode.textContent?.trim() || "");

      return {
        id:
          postNode.querySelector("NUMBER")?.textContent?.trim() || generateId(),
        title: postNode.querySelector("TITLE")?.textContent?.trim() || "",
        content: postNode.querySelector("CONTENT")?.textContent?.trim() || "",
        author: {
          userName:
            postNode.querySelector("AUTHOR USER_NAME")?.textContent?.trim() ||
            blogInfo.owner.userName,
          firstName:
            postNode.querySelector("AUTHOR FIRST_NAME")?.textContent?.trim() ||
            blogInfo.owner.firstName,
          lastName:
            postNode.querySelector("AUTHOR LAST_NAME")?.textContent?.trim() ||
            blogInfo.owner.lastName,
        },
        createdAt:
          postNode.querySelector("CREATED_DATE")?.textContent?.trim() ||
          new Date().toISOString(),
        updatedAt:
          postNode.querySelector("LAST_MODIFIED_DATE")?.textContent?.trim() ||
          new Date().toISOString(),
        status: "published", // Assume all imported posts are published
        tags,
        categories,
        url: postNode.querySelector("URL")?.textContent?.trim() || "",
        link: postNode.querySelector("LINK")?.textContent?.trim() || "",
        number: parseInt(
          postNode.querySelector("NUMBER")?.textContent?.trim() || "0",
          10
        ),
      };
    });

    // Save imported posts to localStorage
    localStorage.setItem(`${STORAGE_PREFIX}posts`, JSON.stringify(posts));

    // Also save categories if they exist in any post
    const allCategories = Array.from(
      new Set(posts.flatMap((post) => post.categories))
    ).map((name, index) => ({
      id: (index + 1).toString(),
      name,
      slug: createSlug(name),
    }));

    if (allCategories.length > 0) {
      localStorage.setItem(
        `${STORAGE_PREFIX}categories`,
        JSON.stringify(allCategories)
      );
    }

    return {
      blogInfo,
      posts,
    };
  },
  // Posts
  async getAllPosts(): Promise<BlogPost[]> {
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}posts`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error loading posts:", error);
      return [];
    }
  },

  async getPostById(id: string): Promise<BlogPost | null> {
    const posts = await this.getAllPosts();
    return posts.find((post) => post.id === id) || null;
  },

  async savePost(post: BlogPost): Promise<void> {
    const posts = await this.getAllPosts();
    const existingIndex = posts.findIndex((p) => p.id === post.id);

    if (existingIndex >= 0) {
      posts[existingIndex] = { ...post, updatedAt: new Date().toISOString() };
    } else {
      posts.push(post);
    }

    localStorage.setItem(`${STORAGE_PREFIX}posts`, JSON.stringify(posts));
  },

  async deletePost(id: string): Promise<void> {
    const posts = await this.getAllPosts();
    const filteredPosts = posts.filter((post) => post.id !== id);
    localStorage.setItem(
      `${STORAGE_PREFIX}posts`,
      JSON.stringify(filteredPosts)
    );
  },

  async getPublishedPosts(): Promise<BlogPost[]> {
    const posts = await this.getAllPosts();
    return posts
      .filter((post) => post.status === "published")
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime()
      );
  },

  // Categories
  async getAllCategories(): Promise<Category[]> {
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}categories`);
      return data
        ? JSON.parse(data)
        : [
            {
              id: "1",
              name: "Technology",
              slug: "technology",
              description: "Tech news and tutorials",
            },
            {
              id: "2",
              name: "Lifestyle",
              slug: "lifestyle",
              description: "Life and wellness tips",
            },
            {
              id: "3",
              name: "Business",
              slug: "business",
              description: "Business insights and strategies",
            },
          ];
    } catch (error) {
      console.error("Error loading categories:", error);
      return [];
    }
  },

  async saveCategory(category: Category): Promise<void> {
    const categories = await this.getAllCategories();
    const existingIndex = categories.findIndex((c) => c.id === category.id);

    if (existingIndex >= 0) {
      categories[existingIndex] = category;
    } else {
      categories.push(category);
    }

    localStorage.setItem(
      `${STORAGE_PREFIX}categories`,
      JSON.stringify(categories)
    );
  },

  // Tags
  async getAllTags(): Promise<Tag[]> {
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}tags`);
      return data
        ? JSON.parse(data)
        : [
            { id: "1", name: "React", slug: "react" },
            { id: "2", name: "TypeScript", slug: "typescript" },
            { id: "3", name: "Web Development", slug: "web-development" },
          ];
    } catch (error) {
      console.error("Error loading tags:", error);
      return [];
    }
  },

  async saveTag(tag: Tag): Promise<void> {
    const tags = await this.getAllTags();
    const existingIndex = tags.findIndex((t) => t.id === tag.id);

    if (existingIndex >= 0) {
      tags[existingIndex] = tag;
    } else {
      tags.push(tag);
    }

    localStorage.setItem(`${STORAGE_PREFIX}tags`, JSON.stringify(tags));
  },
};
