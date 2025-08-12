export interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: {
    userName: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
  status: "draft" | "published";
  tags: string[];
  categories: string[];
  url: string;
  link: string;
  number: number;
}

export interface BlogInfo {
  domain: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  owner: {
    userName: string;
    firstName: string;
    lastName: string;
  };
  authors: Array<{
    userName: string;
    firstName: string;
    lastName: string;
  }>;
  rssFeeds: string[];
}

export interface BlogData {
  blogInfo: BlogInfo;
  posts: BlogPost[];
}

export interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
}
