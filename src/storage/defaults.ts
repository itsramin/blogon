import { BlogInfo, Category, Tag } from "../types";

export const getDefaultBlogInfo = (): BlogInfo => ({
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

export const getDefaultCategories = (): Category[] => [
  { id: "1", name: "Technology", slug: "technology" },
  { id: "2", name: "Lifestyle", slug: "lifestyle" },
  { id: "3", name: "Business", slug: "business" },
];

export const getDefaultTags = (): Tag[] => [
  { id: "1", name: "React", slug: "react" },
  { id: "2", name: "TypeScript", slug: "typescript" },
  { id: "3", name: "Web Development", slug: "web-development" },
];
