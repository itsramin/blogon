import React, { useEffect, useState } from "react";
import { Typography, Tag, Card, Button, message, Divider } from "antd";
import { useParams, Link } from "react-router-dom";
import { BlogPost } from "../../types";
import usePosts from "../../hooks/usePosts";
import { formatIranianDate } from "../../util/dateFormatter";
import { IoCalendarClearOutline, IoPersonOutline } from "react-icons/io5";

const { Title, Text } = Typography;

const PostDetail: React.FC = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const { posts, loading } = usePosts();

  useEffect(() => {
    if (slug) {
      loadPost(slug);
    }
  }, [slug, posts]);

  const loadPost = async (postUrl: string) => {
    try {
      const foundPost = posts.find((p) => p.url === postUrl);

      if (foundPost && foundPost.status === "published") {
        setPost(foundPost);

        const related = posts
          .filter((p) => p.id !== foundPost.id && p.status === "published")
          .filter((p) =>
            p.categories?.some((cat) => foundPost.categories?.includes(cat))
          )
          .slice(0, 3);
        setRelatedPosts(related);
      }
    } catch (error) {
      console.error("Failed to load post:", error);
      message.error("Failed to load post");
    }
  };

  if (loading && !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card loading={true} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card>
          <Title level={3}>Post not found</Title>
          <p>The post you're looking for doesn't exist or isn't published.</p>
          <Link to="/">
            <Button type="primary" className="mt-4">
              Back to Home
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <title>{post.title} | Weblog</title>
      <meta name="description" content={post.content?.substring(0, 160)} />
      <meta property="og:title" content={post.title} />
      <meta
        property="og:description"
        content={post.content?.substring(0, 160)}
      />
      <meta property="og:type" content="article" />
      {post.link && <meta property="og:url" content={post.link} />}

      <div
        className="max-w-4xl mx-auto px-4 py-8 "
        style={{
          direction: "rtl",
          textAlign: "start",
        }}
      >
        <Card className="shadow-sm">
          {/* Post Header */}
          <div className="mb-6">
            <Title level={1} className="mb-4 text-2xl sm:text-3xl md:text-4xl">
              {post.title}
            </Title>

            <div className="flex items-center text-gray-400 gap-x-4">
              <div className="flex items-center ">
                <IoCalendarClearOutline className="mx-2" />
                <Text className="text-gray-400">
                  {formatIranianDate(post.updatedAt || post.createdAt)}
                </Text>
              </div>
              <div className="flex items-center ">
                <IoPersonOutline className="mx-2" /> {post.author.firstName}{" "}
                {post.author.lastName}
              </div>
            </div>
          </div>

          <Divider className="my-6" />

          {/* Post Content */}
          <div
            className="max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: post.content }}
            style={{
              lineHeight: "1.7",
              fontSize: "16px",
            }}
          />

          {/* Categories and Tags */}
          {(post.categories?.length > 0 || post.tags?.length > 0) && (
            <>
              <Divider className="my-6" />
              <div className="mb-8 flex flex-col md:flex-row md:justify-between gap-2">
                {post.categories?.length > 0 && (
                  <div>
                    <Title level={4} className="mb-2">
                      Categories
                    </Title>
                    <div className="flex flex-wrap gap-2">
                      {post.categories.map((category) => (
                        <Tag key={category} color="blue">
                          {category}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}
                {post.tags?.length > 0 && (
                  <div>
                    <Title level={4} className="mb-2">
                      Tags
                    </Title>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Tag key={tag} color="purple">
                          {tag}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <>
              <Divider className="my-6" />
              <div>
                <Title level={3} className="mb-6">
                  Related Posts
                </Title>
                <div className="space-y-4">
                  {relatedPosts.map((relatedPost) => (
                    <div
                      key={relatedPost.id}
                      className="pb-4 border-b border-gray-100 last:border-b-0"
                    >
                      <Title level={5} className="mb-1">
                        <Link
                          to={`/post/${relatedPost.url}`}
                          className="text-gray-800 hover:text-blue-600 transition-colors"
                        >
                          {relatedPost.title}
                        </Link>
                      </Title>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-500">
                        <Text>{relatedPost.author.userName}</Text>
                        <Text className="hidden sm:block">•</Text>
                        <Text>
                          {formatIranianDate(post.updatedAt || post.createdAt)}
                        </Text>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </>
  );
};

export default PostDetail;
