import React, { useEffect, useState } from "react";
import { Typography, Tag, Card, Button, message } from "antd";
import { useParams, Link } from "react-router-dom";
import { BlogPost } from "../../types";
import {
  CalendarOutlined,
  ExportOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";
import usePosts from "../../hooks/usePosts";

const { Title } = Typography;

const PostDetail: React.FC = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const { allPosts, loading } = usePosts();

  useEffect(() => {
    if (slug) {
      loadPost(slug);
    }
  }, [slug, allPosts]);

  const loadPost = async (postUrl: string) => {
    try {
      // Find post by URL from the already loaded posts
      const foundPost = allPosts.find((p) => p.url === postUrl);

      if (foundPost && foundPost.status === "published") {
        setPost(foundPost);

        // Load related posts
        const related = allPosts
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

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: post?.title,
          text: post?.content?.substring(0, 100) || "Check out this post",
          url: post?.link || window.location.href,
        })
        .catch(() => {
          // Fallback if share fails
          copyToClipboard();
        });
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(post?.link || window.location.href);
    message.success("Link copied to clipboard!");
  };

  if (loading && !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card loading={true} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Post Header */}
        <Card className="shadow-sm mb-8">
          <div className="mb-4">
            {post.categories?.map((category) => (
              <Tag key={category} color="blue" className="mb-2">
                {category}
              </Tag>
            ))}
          </div>

          <Title level={1} className="mb-4">
            {post.title}
          </Title>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-6 text-gray-500">
              <span className="flex items-center">
                <UserOutlined size={16} className="mr-2" />
                {post.author.firstName} {post.author.lastName}
              </span>
              <span className="flex items-center">
                <CalendarOutlined size={16} className="mr-2" />
                {format(new Date(post.updatedAt), "MMMM d, yyyy")}
              </span>
            </div>

            <Button
              icon={<ExportOutlined size={16} />}
              onClick={handleShare}
              loading={loading}
            >
              Share
            </Button>
          </div>
        </Card>

        {/* Post Content */}
        <Card className="shadow-sm mb-8">
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
            style={{
              lineHeight: "1.7",
              fontSize: "16px",
            }}
          />
        </Card>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <Card className="shadow-sm mb-8">
            <Title level={4} className="mb-4">
              Tags
            </Title>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Tag key={tag} color="purple">
                  {tag}
                </Tag>
              ))}
            </div>
          </Card>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <Card className="shadow-sm">
            <Title level={3} className="mb-6">
              Related Posts
            </Title>
            <div className="space-y-4">
              {relatedPosts.map((relatedPost) => (
                <div
                  key={relatedPost.id}
                  className="border-b border-gray-100 pb-4 last:border-b-0"
                >
                  <Title level={5} className="mb-2">
                    <Link
                      to={`/post/${relatedPost.url}`}
                      className="text-gray-800 hover:text-blue-600 transition-colors"
                    >
                      {relatedPost.title}
                    </Link>
                  </Title>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{relatedPost.author.userName}</span>
                    <span>
                      {format(
                        new Date(
                          relatedPost.updatedAt || relatedPost.createdAt
                        ),
                        "MMM d, yyyy"
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </>
  );
};

export default PostDetail;
