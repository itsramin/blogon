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
}

export interface BlogData {
  blogInfo: BlogInfo;
  posts: BlogPost[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: "admin" | "editor";
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}
export interface Subscription {
  targetUrl: string;
  secret: string;
  webhookUrl: string;
}

export interface WebhookPayload {
  event: "post_published";
  data: BlogPost;
}
