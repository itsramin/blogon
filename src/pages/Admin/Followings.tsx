import { useState } from "react";
import { Button, Input, List, Spin, Alert, Popconfirm, message } from "antd";
import { useFeed } from "../../hooks/useFeed";

const Followings = () => {
  const [newFeedUrl, setNewFeedUrl] = useState("");
  const { rssFeeds, loading, error, addRssFeed, removeRssFeed } = useFeed();

  const handleAddFeed = async () => {
    if (!newFeedUrl) return;
    try {
      await addRssFeed(newFeedUrl);
      setNewFeedUrl("");
      message.success("RSS feed added successfully");
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const handleRemoveFeed = async (url: string) => {
    try {
      await removeRssFeed(url);
      message.success("RSS feed removed successfully");
    } catch (err) {
      message.error("Failed to remove RSS feed");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6 flex gap-2">
        <Input
          value={newFeedUrl}
          onChange={(e) => setNewFeedUrl(e.target.value)}
          placeholder="Enter RSS URL (e.g., https://other-blog.com/rss.xml)"
          size="large"
        />
        <Button
          type="primary"
          onClick={handleAddFeed}
          size="large"
          loading={loading}
          disabled={!newFeedUrl}
        >
          Add Feed
        </Button>
      </div>

      {error && (
        <Alert message={error} type="error" showIcon className="mb-4" />
      )}

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Your RSS Feeds</h2>
        {loading ? (
          <div className="text-center">
            <Spin />
          </div>
        ) : rssFeeds.length > 0 ? (
          <List
            bordered
            dataSource={rssFeeds}
            renderItem={(url) => (
              <List.Item
                actions={[
                  <Popconfirm
                    title="Are you sure to delete this feed?"
                    onConfirm={() => handleRemoveFeed(url)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="link" danger>
                      Remove
                    </Button>
                  </Popconfirm>,
                ]}
              >
                {url}
              </List.Item>
            )}
          />
        ) : (
          <p className="text-gray-500">No RSS feeds added yet</p>
        )}
      </div>
    </div>
  );
};

export default Followings;
