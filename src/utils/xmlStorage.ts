import { BlogData, BlogPost, Category, Tag } from "../types";

const STORAGE_PREFIX = "weblog_";

// GitHub Gist Configuration
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

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

const getGistId = (): string => {
  return localStorage.getItem(`${STORAGE_PREFIX}gistId`) || "";
};

const setGistId = (id: string): void => {
  localStorage.setItem(`${STORAGE_PREFIX}gistId`, id);
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

// GitHub Gist API helpers
const saveToGist = async (xmlContent: string): Promise<void> => {
  if (!GITHUB_TOKEN) {
    throw new Error("GitHub token not configured");
  }

  const gistId = getGistId();
  const gistData = {
    description: "Blog Posts Backup",
    public: false,
    files: {
      "posts.xml": { content: xmlContent },
    },
  };

  const url = gistId
    ? `https://api.github.com/gists/${gistId}`
    : "https://api.github.com/gists";

  const response = await fetch(url, {
    method: gistId ? "PATCH" : "POST",
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github.v3+json",
    },
    body: JSON.stringify(gistData),
  });

  if (!response.ok) {
    throw new Error(`Gist save failed: ${response.statusText}`);
  }

  if (!gistId) {
    const data = await response.json();
    setGistId(data.id);
  }
};

const loadFromGist = async (): Promise<string> => {
  const gistId = getGistId();
  if (!GITHUB_TOKEN || !gistId) {
    throw new Error("GitHub token or Gist ID not configured");
  }

  const response = await fetch(`https://api.github.com/gists/${gistId}`, {
    headers: { Authorization: `token ${GITHUB_TOKEN}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to load Gist: ${response.statusText}`);
  }

  const data = await response.json();
  return data.files["posts.xml"].content;
};

export const xmlStorage = {
  privateCache: {
    posts: [] as BlogPost[],
    categories: [] as Category[],
    tags: [] as Tag[],
    initialized: false,
  },

  async initialize(): Promise<void> {
    if (this.privateCache.initialized) return;

    try {
      const xmlString = await loadFromGist();
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
      console.error("Failed to initialize from Gist, using defaults", error);
      this.privateCache.posts = [];
      this.privateCache.categories = getDefaultCategories();
      this.privateCache.tags = getDefaultTags();
      this.privateCache.initialized = true;
    }
  },

  async importFromXML(xmlString: string): Promise<BlogData> {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "text/xml");

      const blogInfoNode = xmlDoc.querySelector("BLOG_INFO");
      const blogInfo = {
        domain:
          blogInfoNode?.querySelector("DOMAIN")?.textContent?.trim() ||
          getDefaultBlogInfo().domain,
        title:
          blogInfoNode?.querySelector("TITLE")?.textContent?.trim() ||
          getDefaultBlogInfo().title,
        shortDescription:
          blogInfoNode
            ?.querySelector("SHORT_DESCRIPTION")
            ?.textContent?.trim() || getDefaultBlogInfo().shortDescription,
        fullDescription:
          blogInfoNode
            ?.querySelector("FULL_DESCRIPTION")
            ?.textContent?.trim() || getDefaultBlogInfo().fullDescription,
        owner: {
          userName:
            blogInfoNode
              ?.querySelector("OWNER USER USER_NAME")
              ?.textContent?.trim() || getDefaultBlogInfo().owner.userName,
          firstName:
            blogInfoNode
              ?.querySelector("OWNER USER FIRST_NAME")
              ?.textContent?.trim() || getDefaultBlogInfo().owner.firstName,
          lastName:
            blogInfoNode
              ?.querySelector("OWNER USER LAST_NAME")
              ?.textContent?.trim() || getDefaultBlogInfo().owner.lastName,
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

    try {
      const xml = await this.exportToXML();
      await saveToGist(xml);
    } catch (error) {
      console.error("Failed to save to Gist:", error);
      throw error;
    }
  },

  async deletePost(id: string): Promise<void> {
    await this.initialize();
    this.privateCache.posts = this.privateCache.posts.filter(
      (post) => post.id !== id
    );

    try {
      const xml = await this.exportToXML();
      await saveToGist(xml);
    } catch (error) {
      console.error("Failed to update Gist after deletion:", error);
      throw error;
    }
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

  async getAllCategories(): Promise<Category[]> {
    await this.initialize();
    if (this.privateCache.categories.length === 0) {
      return getDefaultCategories();
    }
    return [...this.privateCache.categories];
  },

  async getAllTags(): Promise<Tag[]> {
    await this.initialize();
    if (this.privateCache.tags.length === 0) {
      return getDefaultTags();
    }
    return [...this.privateCache.tags];
  },

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
