import { Button, Input, message } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import useFollowings from "../../hooks/useFollowings";
import { useState } from "react";

function Followings() {
  const { feeds, removeFeed, addFeed, loading } = useFollowings();
  const [newFeedUrl, setNewFeedUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddFeed = async () => {
    if (!newFeedUrl.trim()) {
      message.warning("Please enter a feed URL");
      return;
    }

    setIsAdding(true);
    try {
      await addFeed(newFeedUrl.trim());
      setNewFeedUrl("");
      message.success("Feed added successfully");
    } catch (error) {
      console.error("Failed to add feed:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="max-h-96 overflow-y-auto">
      <h4 className="font-medium mb-2">Your Subscriptions ({feeds.length})</h4>

      {/* Add Feed Input Section */}
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Enter RSS feed URL"
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
          Add
        </Button>
      </div>

      {/* Feed List */}
      {loading ? (
        <p className="text-gray-500">Loading subscriptions...</p>
      ) : feeds.length === 0 ? (
        <p className="text-gray-500">No subscriptions yet</p>
      ) : (
        <div className="space-y-2">
          {feeds.map((feedUrl) => (
            <div
              key={feedUrl}
              className="flex justify-between items-center p-3 border rounded hover:bg-gray-50"
            >
              <span className="truncate">{feedUrl}</span>
              <Button
                danger
                type="text"
                icon={<DeleteOutlined />}
                onClick={() => removeFeed(feedUrl)}
                disabled={isAdding}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Followings;
