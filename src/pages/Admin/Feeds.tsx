import React, { useEffect } from "react";
import { Spin, Alert, List } from "antd";
import { useFeed } from "../../hooks/useFeed";

const Feeds: React.FC = () => {
  const { rssFeeds, posts, loading, error, fetchRSS } = useFeed();

  // Load all RSS feeds on component mount
  useEffect(() => {
    if (rssFeeds.length > 0) {
      // Fetch all feeds in parallel
      Promise.all(rssFeeds.map(fetchRSS));
    }
  }, [rssFeeds, fetchRSS]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      {error && (
        <Alert message={error} type="error" showIcon className="mb-4" />
      )}

      {loading ? (
        <div className="text-center py-10">
          <Spin size="large" />
          <p className="mt-4">Loading posts from RSS feeds...</p>
        </div>
      ) : posts.length > 0 ? (
        <div>
          <h2 className="text-2xl font-bold mb-4">Posts from Your RSS Feeds</h2>
          <List
            itemLayout="vertical"
            size="large"
            dataSource={posts}
            renderItem={(post) => (
              <List.Item key={post.id}>
                <List.Item.Meta
                  title={<a href={post.link}>{post.title}</a>}
                  description={
                    <>
                      <span>
                        by {post.author.firstName} {post.author.lastName}
                      </span>
                      <span className="ml-4">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </>
                  }
                />
                <p className="mt-2 line-clamp-3">{post.content}</p>
                <div className="mt-2">
                  {post.categories.map((cat) => (
                    <span
                      key={cat}
                      className="bg-gray-100 px-2 py-1 mr-2 text-sm rounded"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </List.Item>
            )}
          />
        </div>
      ) : (
        <p className="text-center py-6 text-gray-500">
          {rssFeeds.length === 0
            ? "You haven't added any RSS feeds yet. Add some in the Followings section."
            : "No posts found in your RSS feeds."}
        </p>
      )}
    </div>
  );
};

export default Feeds;
