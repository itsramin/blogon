import { BlogPost } from "../types";
import { message } from "antd";

export const fetchBlogPosts = async (
  blogUrl: string,
  timeout = 5000
): Promise<BlogPost[]> => {
  try {
    const normalizedUrl = blogUrl.replace(/\/+$/, "");
    const apiUrl = `${normalizedUrl}/api/posts`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(apiUrl, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const posts: BlogPost[] = await response.json();

    return posts.map((post) => ({
      ...post,
      source: new URL(normalizedUrl).hostname,
      isExternal: false,
    }));
  } catch (error: any) {
    console.error(`Failed to fetch posts from ${blogUrl}:`, error);
    if (error.name !== "AbortError") {
      message.warning(
        `Could not fetch posts from ${new URL(blogUrl).hostname}`
      );
    }
    return [];
  }
};

// Improved version with better timeout handling
export const verifyBlogUrl = async (
  url: string,
  timeout = 3000
): Promise<boolean> => {
  try {
    const normalizedUrl = url.replace(/\/+$/, "");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(`${normalizedUrl}/api/posts`, {
      method: "HEAD",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    return response.ok;
  } catch (error) {
    return false;
  }
};
