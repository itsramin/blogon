import { useEffect, useState } from "react";
import { Card, List, Spin, Button, Modal, message } from "antd";
import { BlogPost } from "../../types";
import { xmlStorage } from "../../utils/xmlStorage";
import { fetchFeedPosts } from "../../services/feedService";
import PostCard from "../../components/PostCard";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";

const FollowedFeed = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  //   const [form] = Form.useForm();
  const [feeds, setFeeds] = useState<string[]>([]);
  //   const [addingFeed, setAddingFeed] = useState(false);

  useEffect(() => {
    loadFollowedPosts();
  }, []);

  const loadFollowedPosts = async () => {
    setLoading(true);
    await xmlStorage.initialize();
    const blogInfo = await xmlStorage.getBlogInfo();
    const followedFeeds = blogInfo.followedFeeds || [];
    setFeeds(followedFeeds);

    if (followedFeeds.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const allPosts = await Promise.all(
        followedFeeds.map((feedUrl) => fetchFeedPosts(feedUrl))
      );

      setPosts(
        allPosts
          .flat()
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
      );
    } catch (error) {
      message.error("Failed to load some feeds");
    }
    setLoading(false);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  //   const handleAddFeed = async () => {
  //     try {
  //       const values = await form.validateFields();
  //       const newFeedUrl = values.feedUrl.trim();

  //       if (!isValidFeedUrl(newFeedUrl)) {
  //         message.error("Please enter a valid RSS feed URL");
  //         return;
  //       }

  //       if (feeds.includes(newFeedUrl)) {
  //         message.warning("This feed is already in your subscriptions");
  //         return;
  //       }

  //       setAddingFeed(true);
  //       try {
  //         // Test the feed URL
  //         await fetchFeedPosts(newFeedUrl);

  //         const updatedFeeds = [...feeds, newFeedUrl];
  //         await xmlStorage.updateBlogInfo({ followedFeeds: updatedFeeds });
  //         setFeeds(updatedFeeds);
  //         form.resetFields();
  //         message.success("Feed added successfully");
  //         loadFollowedPosts();
  //       } catch (error) {
  //         message.error(
  //           "Failed to fetch feed. Please check the URL and try again."
  //         );
  //       }
  //     } catch (error) {
  //       console.error("Validation failed:", error);
  //     } finally {
  //       setAddingFeed(false);
  //     }
  //   };

  const handleRemoveFeed = async (feedUrl: string) => {
    const updatedFeeds = feeds.filter((feed) => feed !== feedUrl);
    await xmlStorage.updateBlogInfo({ followedFeeds: updatedFeeds });
    setFeeds(updatedFeeds);
    message.success("Feed removed successfully");
    loadFollowedPosts();
  };

  return (
    <div className="w-full mx-auto ">
      <Card
        title="Followed Blogs Feed"
        extra={
          <Button type="primary" onClick={showModal} icon={<PlusOutlined />}>
            Manage Subscriptions
          </Button>
        }
      >
        {loading ? (
          <div className="text-center py-12">
            <Spin size="large" />
            <p className="mt-4 text-gray-600">Loading followed posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">
              You're not following any blogs yet.
            </p>
          </div>
        ) : (
          <List
            itemLayout="vertical"
            dataSource={posts}
            renderItem={(post) => (
              <List.Item>
                <PostCard post={post} />
                <div className="text-xs text-gray-500 mt-2">
                  Source: {new URL(post.link).hostname}
                </div>
              </List.Item>
            )}
          />
        )}
      </Card>

      <Modal
        title="Manage Subscriptions"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        {/* <div className="mb-6">
          <Form form={form} layout="inline" onFinish={handleAddFeed}>
            <Form.Item
              name="feedUrl"
              rules={[
                { required: true, message: "Please input a feed URL" },
                {
                  validator: (_, value) =>
                    !value || isValidFeedUrl(value.trim())
                      ? Promise.resolve()
                      : Promise.reject("Please enter a valid URL"),
                },
              ]}
              className="flex-1"
            >
              <Input
                placeholder="Enter RSS feed URL"
                style={{ width: "400px" }}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={addingFeed}
                icon={<PlusOutlined />}
              >
                Add Feed
              </Button>
            </Form.Item>
          </Form>
        </div> */}

        <div className="max-h-96 overflow-y-auto">
          <h4 className="font-medium mb-2">
            Your Subscriptions ({feeds.length})
          </h4>
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
                    onClick={() => handleRemoveFeed(feedUrl)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default FollowedFeed;
