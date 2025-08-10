import { Button } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import useFollowings from "../../hooks/useFollowings";

function Followings() {
  const { feeds, removeFeed } = useFollowings();

  return (
    <div className="max-h-96 overflow-y-auto">
      <h4 className="font-medium mb-2">Your Subscriptions ({feeds.length})</h4>
      {feeds.length === 0 ? (
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
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Followings;
