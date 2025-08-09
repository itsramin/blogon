import { BlogData, BlogPost, Category, Tag } from "../types";

const STORAGE_PREFIX = "weblog_";
const STATIC_XML_PATH = "/data/posts.xml";

// Helper functions
export const generateId = (): string => {
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

const getDefaultBlogInfo = () => ({
  domain: "myblog.com",
  title: "My Blog",
  shortDescription: "A blog about interesting things",
  fullDescription: "Detailed description of my blog's content and purpose",
  owner: {
    userName: "admin",
    firstName: "Admin",
    lastName: "User",
  },
  authors: [],
});

const getDefaultCategories = (): Category[] => [
  { id: "1", name: "Technology", slug: "technology" },
  { id: "2", name: "Lifestyle", slug: "lifestyle" },
  { id: "3", name: "Business", slug: "business" },
];

const getDefaultTags = (): Tag[] => [
  { id: "1", name: "React", slug: "react" },
  { id: "2", name: "TypeScript", slug: "typescript" },
  { id: "3", name: "Web Development", slug: "web-development" },
];

export const xmlStorage = {
  // In-memory cache
  privateCache: {
    posts: [] as BlogPost[],
    categories: [] as Category[],
    tags: [] as Tag[],
    initialized: false,
  },

  // Initialize the storage by loading the static XML
  async initialize(): Promise<void> {
    if (this.privateCache.initialized) return;

    try {
      const response = await fetch(STATIC_XML_PATH);
      if (!response.ok) throw new Error("Failed to load XML file");
      const xmlString = await response.text();
      const data = await this.importFromXML(xmlString);

      this.privateCache.posts = data.posts;
      this.privateCache.categories = data.posts.flatMap((post) =>
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
      this.privateCache.tags = data.posts.flatMap((post) =>
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

      this.privateCache.initialized = true;
    } catch (error) {
      console.error("Failed to initialize from XML, using defaults", error);
      this.privateCache.posts = [];
      this.privateCache.categories = getDefaultCategories();
      this.privateCache.tags = getDefaultTags();
      this.privateCache.initialized = true;
    }
  },

  // XML Import/Export
  async importFromXML(xmlString: string): Promise<BlogData> {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "text/xml");

      // Parse blog info
      const blogInfoNode = xmlDoc.querySelector("BLOG_INFO");
      const blogInfo = {
        domain:
          blogInfoNode?.querySelector("DOMAIN")?.textContent?.trim() || "",
        title: blogInfoNode?.querySelector("TITLE")?.textContent?.trim() || "",
        shortDescription:
          blogInfoNode
            ?.querySelector("SHORT_DESCRIPTION")
            ?.textContent?.trim() || "",
        fullDescription:
          blogInfoNode
            ?.querySelector("FULL_DESCRIPTION")
            ?.textContent?.trim() || "",
        owner: {
          userName:
            blogInfoNode
              ?.querySelector("OWNER USER USER_NAME")
              ?.textContent?.trim() || "admin",
          firstName:
            blogInfoNode
              ?.querySelector("OWNER USER FIRST_NAME")
              ?.textContent?.trim() || "Admin",
          lastName:
            blogInfoNode
              ?.querySelector("OWNER USER LAST_NAME")
              ?.textContent?.trim() || "User",
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
            postNode.querySelector("NUMBER")?.textContent?.trim() ||
            generateId(),
          title: postNode.querySelector("TITLE")?.textContent?.trim() || "",
          content: postNode.querySelector("CONTENT")?.textContent?.trim() || "",
          author: {
            userName:
              postNode.querySelector("AUTHOR USER_NAME")?.textContent?.trim() ||
              blogInfo.owner.userName,
            firstName:
              postNode
                .querySelector("AUTHOR FIRST_NAME")
                ?.textContent?.trim() || blogInfo.owner.firstName,
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
          status: "published",
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

      return { blogInfo, posts };
    } catch (error) {
      console.error("Error parsing XML:", error);
      return {
        blogInfo: getDefaultBlogInfo(),
        posts: [],
      };
    }
  },

  async exportToXML(): Promise<string> {
    await this.initialize();
    const posts = this.privateCache.posts;
    const blogInfo = getDefaultBlogInfo();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<BLOG_DATA>
  <BLOG_INFO>
    <DOMAIN>${blogInfo.domain}</DOMAIN>
    <TITLE>${blogInfo.title}</TITLE>
    <SHORT_DESCRIPTION>${blogInfo.shortDescription}</SHORT_DESCRIPTION>
    <FULL_DESCRIPTION>${blogInfo.fullDescription}</FULL_DESCRIPTION>
    <OWNER>
      <USER>
        <USER_NAME>${blogInfo.owner.userName}</USER_NAME>
        <FIRST_NAME>${blogInfo.owner.firstName}</FIRST_NAME>
        <LAST_NAME>${blogInfo.owner.lastName}</LAST_NAME>
      </USER>
    </OWNER>
  </BLOG_INFO>
  <POSTS>`;

    posts.forEach((post) => {
      xml += `
    <POST>
      <NUMBER>${post.number}</NUMBER>
      <TITLE>${this.escapeXml(post.title)}</TITLE>
      <CONTENT><![CDATA[${post.content}]]></CONTENT>
      <AUTHOR>
        <USER_NAME>${post.author.userName}</USER_NAME>
        <FIRST_NAME>${post.author.firstName}</FIRST_NAME>
        <LAST_NAME>${post.author.lastName}</LAST_NAME>
      </AUTHOR>
      <CREATED_DATE>${post.createdAt}</CREATED_DATE>
      <LAST_MODIFIED_DATE>${post.updatedAt}</LAST_MODIFIED_DATE>
      <STATUS>${post.status}</STATUS>
      <URL>${post.url}</URL>
      <LINK>${post.link}</LINK>
      <CATEGORIES>`;

      post.categories.forEach((category) => {
        xml += `
        <CATEGORY>
          <NAME>${this.escapeXml(category)}</NAME>
        </CATEGORY>`;
      });

      xml += `
      </CATEGORIES>
      <TAGS>`;

      post.tags.forEach((tag) => {
        xml += `
        <TAG>
          <NAME>${this.escapeXml(tag)}</NAME>
        </TAG>`;
      });

      xml += `
      </TAGS>
    </POST>`;
    });

    xml += `
  </POSTS>
</BLOG_DATA>`;

    return xml;
  },

  // Posts CRUD
  async getAllPosts(): Promise<BlogPost[]> {
    await this.initialize();
    return [...this.privateCache.posts];
  },

  async getPostById(id: string): Promise<BlogPost | null> {
    await this.initialize();
    return this.privateCache.posts.find((post) => post.id === id) || null;
  },

  async savePost(post: BlogPost): Promise<void> {
    await this.initialize();
    const existingIndex = this.privateCache.posts.findIndex(
      (p) => p.id === post.id
    );

    const postToSave = {
      ...post,
      updatedAt: new Date().toISOString(),
      url: post.url || createSlug(post.title),
      link: post.link || `/post/${post.url || createSlug(post.title)}`,
    };

    if (existingIndex >= 0) {
      this.privateCache.posts[existingIndex] = postToSave;
    } else {
      postToSave.id = postToSave.id || generateId();
      postToSave.createdAt = postToSave.createdAt || new Date().toISOString();
      postToSave.number = postToSave.number || Date.now();
      this.privateCache.posts.push(postToSave);
    }

    // Save to localStorage as fallback
    localStorage.setItem(
      `${STORAGE_PREFIX}posts`,
      JSON.stringify(this.privateCache.posts)
    );
  },

  async deletePost(id: string): Promise<void> {
    await this.initialize();
    this.privateCache.posts = this.privateCache.posts.filter(
      (post) => post.id !== id
    );
    localStorage.setItem(
      `${STORAGE_PREFIX}posts`,
      JSON.stringify(this.privateCache.posts)
    );
  },

  async getPublishedPosts(): Promise<BlogPost[]> {
    await this.initialize();
    return this.privateCache.posts
      .filter((post) => post.status === "published")
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  },

  // Categories
  async getAllCategories(): Promise<Category[]> {
    await this.initialize();
    if (this.privateCache.categories.length === 0) {
      return getDefaultCategories();
    }
    return [...this.privateCache.categories];
  },

  async saveCategory(category: Category): Promise<void> {
    await this.initialize();
    const existingIndex = this.privateCache.categories.findIndex(
      (c) => c.id === category.id
    );

    const categoryToSave = {
      ...category,
      slug: category.slug || createSlug(category.name),
    };

    if (existingIndex >= 0) {
      this.privateCache.categories[existingIndex] = categoryToSave;
    } else {
      categoryToSave.id = categoryToSave.id || generateId();
      this.privateCache.categories.push(categoryToSave);
    }

    localStorage.setItem(
      `${STORAGE_PREFIX}categories`,
      JSON.stringify(this.privateCache.categories)
    );
  },

  // Tags
  async getAllTags(): Promise<Tag[]> {
    await this.initialize();
    if (this.privateCache.tags.length === 0) {
      return getDefaultTags();
    }
    return [...this.privateCache.tags];
  },

  async saveTag(tag: Tag): Promise<void> {
    await this.initialize();
    const existingIndex = this.privateCache.tags.findIndex(
      (t) => t.id === tag.id
    );

    const tagToSave = {
      ...tag,
      slug: tag.slug || createSlug(tag.name),
    };

    if (existingIndex >= 0) {
      this.privateCache.tags[existingIndex] = tagToSave;
    } else {
      tagToSave.id = tagToSave.id || generateId();
      this.privateCache.tags.push(tagToSave);
    }

    localStorage.setItem(
      `${STORAGE_PREFIX}tags`,
      JSON.stringify(this.privateCache.tags)
    );
  },

  // Helper method to escape XML special characters
  escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case "&":
          return "&amp;";
        case "'":
          return "&apos;";
        case '"':
          return "&quot;";
        default:
          return c;
      }
    });
  },
};


