import { BlogData, BlogInfo, BlogPost } from "../types";
import { getDefaultBlogInfo } from "./defaults";
import { generateId, escapeXml } from "./helpers";

export const importFromXML = async (xmlString: string): Promise<BlogData> => {
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
        blogInfoNode?.querySelector("SHORT_DESCRIPTION")?.textContent?.trim() ||
        getDefaultBlogInfo().shortDescription,
      fullDescription:
        blogInfoNode?.querySelector("FULL_DESCRIPTION")?.textContent?.trim() ||
        getDefaultBlogInfo().fullDescription,
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
};

export const exportToXML = (blogInfo: BlogInfo, posts: BlogPost[]): string => {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<BLOG_DATA>
  <BLOG_INFO>
    <DOMAIN>${blogInfo.domain}</DOMAIN>
    <TITLE>${escapeXml(blogInfo.title)}</TITLE>
    <SHORT_DESCRIPTION>${escapeXml(
      blogInfo.shortDescription
    )}</SHORT_DESCRIPTION>
    <FULL_DESCRIPTION>${escapeXml(blogInfo.fullDescription)}</FULL_DESCRIPTION>
    <OWNER>
      <USER>
        <USER_NAME>${blogInfo.owner.userName}</USER_NAME>
        <FIRST_NAME>${blogInfo.owner.firstName}</FIRST_NAME>
        <LAST_NAME>${blogInfo.owner.lastName}</LAST_NAME>
      </USER>
    </OWNER>`;

  if (blogInfo.authors && blogInfo.authors.length > 0) {
    xml += `
    <AUTHORS>`;
    blogInfo.authors.forEach((author) => {
      xml += `
      <USER>
        <USER_NAME>${author.userName}</USER_NAME>
        <FIRST_NAME>${author.firstName}</FIRST_NAME>
        <LAST_NAME>${author.lastName}</LAST_NAME>
      </USER>`;
    });
    xml += `
    </AUTHORS>`;
  }

  xml += `
  </BLOG_INFO>
  <POSTS>`;

  posts.forEach((post) => {
    xml += `
    <POST>
      <NUMBER>${post.number}</NUMBER>
      <TITLE>${escapeXml(post.title)}</TITLE>
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
          <NAME>${escapeXml(category)}</NAME>
        </CATEGORY>`;
    });

    xml += `
      </CATEGORIES>
      <TAGS>`;

    post.tags.forEach((tag) => {
      xml += `
        <TAG>
          <NAME>${escapeXml(tag)}</NAME>
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
};
