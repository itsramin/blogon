import React, { useEffect, useState } from "react";
import { generateRSS } from "../../services/rssService";
import { useBlog } from "../../hooks/useBlog";
import usePosts from "../../hooks/usePosts";

const RSSFeed: React.FC = () => {
  const { blogInfo } = useBlog();
  const { posts } = usePosts();
  const [rssContent, setRssContent] = useState("");

  useEffect(() => {
    if (blogInfo && posts) {
      const rss = generateRSS({ blogInfo, posts });
      setRssContent(rss);
    }
  }, [blogInfo, posts]);

  return (
    <pre className="whitespace-pre-wrap break-all">
      {rssContent || "Generating RSS feed..."}
    </pre>
  );
};

export default RSSFeed;
