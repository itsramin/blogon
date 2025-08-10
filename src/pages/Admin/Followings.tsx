import { Button, Input, message, Spin } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import useFollowings from "../../hooks/useFollowings";
import { useState } from "react";

function Followings() {
  const { feeds, removeFeed, addFeed, loading, error, refreshFeeds } =
    useFollowings();

  const [newFeedUrl, setNewFeedUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddFeed = async () => {
    if (!newFeedUrl.trim()) {
      message.warning("Please enter a blog URL");
      return;
    }

    // Basic URL validation
    try {
      new URL(newFeedUrl.trim());
    } catch {
      message.error("Please enter a valid URL (e.g., https://example.com)");
      return;
    }

    setIsAdding(true);
    try {
      const success = await addFeed(newFeedUrl.trim());
      if (success) {
        setNewFeedUrl("");
        message.success("Blog subscribed successfully");
        refreshFeeds();
      }
    } catch (error: any) {
      console.error("Failed to add blog:", error);
      message.error(
        error.message.includes("CORS") ||
          error.message.includes("Failed to fetch")
          ? "Could not connect to blog (CORS issue). The blog may need to enable cross-origin requests."
          : "Failed to subscribe to blog"
      );
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveFeed = async (blogUrl: string) => {
    try {
      await removeFeed(blogUrl);
      message.success("Unsubscribed successfully");
    } catch (error) {
      console.error("Failed to unsubscribe:", error);
      message.error("Failed to unsubscribe");
    }
  };

  return (
    <div className="max-h-96 overflow-y-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-medium text-lg">
          Your Blog Subscriptions ({feeds.length})
        </h4>
        <Button size="small" onClick={refreshFeeds} disabled={loading}>
          Refresh
        </Button>
      </div>

      {/* Add Blog Input Section */}
      <div className="flex gap-2 mb-6">
        <Input
          placeholder="Enter blog URL (e.g., https://other-blog.com)"
          value={newFeedUrl}
          onChange={(e) => setNewFeedUrl(e.target.value)}
          onPressEnter={handleAddFeed}
          disabled={isAdding}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddFeed}
          loading={isAdding}
          disabled={isAdding}
        >
          Subscribe
        </Button>
      </div>

      {/* Error Message */}
      {error && <div className="mb-4 text-red-500">{error}</div>}

      {/* Blog List */}
      {loading ? (
        <div className="text-center py-8">
          <Spin />
          <p className="mt-2 text-gray-500">Loading subscriptions...</p>
        </div>
      ) : feeds.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            You're not subscribed to any blogs yet. <br />
            Enter a blog URL above to subscribe.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {feeds.map((blogUrl) => (
            <div
              key={blogUrl}
              className="flex justify-between items-center p-3 border rounded hover:bg-gray-50 transition-colors"
            >
              <span
                className="truncate text-blue-600 hover:text-blue-800"
                title={blogUrl}
              >
                {blogUrl}
              </span>
              <Button
                danger
                type="text"
                icon={<DeleteOutlined />}
                onClick={() => handleRemoveFeed(blogUrl)}
                disabled={isAdding}
                title="Unsubscribe"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Followings;
