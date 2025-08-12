import { BlogInfo } from "../types";

export const getDefaultBlogInfo = (): BlogInfo => ({
  domain: "myblog.com",
  title: "My Blog",
  shortDescription: "A blog about interesting things",
  fullDescription: "Detailed description of my blog's content and purpose",
  owner: {
    userName: "username",
    firstName: "first name",
    lastName: "last name",
  },
  authors: [],
  rssFeeds: [],
});

export const getDefaultCategories = (): string[] => [];

export const getDefaultTags = (): string[] => [];
