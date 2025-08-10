import { BlogInfo, BlogPost } from "../types";
import { format } from "date-fns";

export function generateRSS({
  posts,
  blogInfo,
}: {
  posts: BlogPost[];
  blogInfo: BlogInfo;
}): string {
  const publishedPosts = posts
    .filter((post) => post.status === "published")
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

  if (!blogInfo) return "";
  return `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <atom:link href="${
      blogInfo.domain
    }/rss.xml" rel="self" type="application/rss+xml" />
    <title>${escapeXml(blogInfo.title)}</title>
    <link>${blogInfo.domain}</link>
    <description>${escapeXml(blogInfo.shortDescription)}</description>
    <language>en-us</language>
    <lastBuildDate>${format(
      new Date(),
      "EEE, dd MMM yyyy HH:mm:ss xx"
    )}</lastBuildDate>
    ${publishedPosts.map(postToRSSItem).join("")}
  </channel>
</rss>`;

  function postToRSSItem(post: BlogPost): string {
    return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${blogInfo?.domain}${post.link}</link>
      <description>${escapeXml(
        truncateContent(post.content, 200)
      )}</description>
      <pubDate>${format(
        new Date(post.updatedAt),
        "EEE, dd MMM yyyy HH:mm:ss xx"
      )}</pubDate>
      <guid isPermaLink="true">${blogInfo?.domain}${post.link}</guid>
      ${post.categories
        ?.map((cat) => `<category>${escapeXml(cat)}</category>`)
        .join("")}
    </item>`;
  }

  function escapeXml(unsafe: string): string {
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
  }

  function truncateContent(content: string, length: number): string {
    return content.length > length
      ? content.substring(0, length) + "..."
      : content;
  }
}
