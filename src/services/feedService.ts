import { BlogPost } from "../types";

export const fetchFeedPosts = async (feedUrl: string): Promise<BlogPost[]> => {
  try {
    // Fetch the RSS feed
    const response = await fetch(feedUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");

    // Check for parsing errors
    const parserError = xmlDoc.querySelector("parsererror");
    if (parserError) {
      throw new Error("Error parsing XML feed");
    }

    // Extract items from the feed
    const items = Array.from(xmlDoc.querySelectorAll("item, entry")); // Supports both RSS and Atom feeds

    return items.map((item): BlogPost => {
      const getElementText = (selector: string) => {
        const element = item.querySelector(selector);
        return element ? element.textContent?.trim() || "" : "";
      };

      const title = getElementText("title");
      const link = getElementText("link");
      const pubDate = getElementText("pubDate, published, date");
      const description = getElementText("description, summary");
      const content = getElementText("content\\:encoded, content");
      const author = getElementText("author, dc\\:creator, creator");
      const guid = getElementText("guid, id");

      // Extract categories/tags
      const categories = Array.from(
        item.querySelectorAll("category, category term")
      )
        .map((cat) => cat.textContent?.trim() || "")
        .filter(Boolean);

      // Extract URL path safely
      let urlPath = "";
      try {
        urlPath = link ? new URL(link).pathname : "";
      } catch (e) {
        console.warn("Invalid post URL", link);
      }

      return {
        id: guid || Math.random().toString(36).substr(2, 9),
        title: title || "Untitled Post",
        content: content || description || "",
        author: {
          userName: author || "external-author",
          firstName: "",
          lastName: "",
        },
        createdAt: pubDate || new Date().toISOString(),
        updatedAt: pubDate || new Date().toISOString(),
        status: "published",
        tags: [],
        categories: categories,
        url: urlPath,
        link: link || "",
        number: Date.now(),
      };
    });
  } catch (error) {
    console.error(`Error fetching feed: ${feedUrl}`, error);
    return [];
  }
};

export const isValidFeedUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (e) {
    return false;
  }
};
