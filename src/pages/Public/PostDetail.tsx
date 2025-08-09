import React, { useEffect, useState } from "react";
import { Typography, Tag, Card, Button } from "antd";
import { useParams, Link } from "react-router-dom";
import { xmlStorage } from "../../utils/xmlStorage";
import { BlogPost } from "../../types";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  ExportOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";

const { Title, Text, Paragraph } = Typography;

export const PostDetail: React.FC = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    if (slug) {
      loadPost(slug);
    }
  }, [slug]);

  const loadPost = async (postSlug: string) => {
    setLoading(true);
    try {
      const foundPost = await xmlStorage.getPostBySlug(postSlug);
      if (foundPost && foundPost.status === "published") {
        setPost(foundPost);

        // Load related posts
        const allPosts = await xmlStorage.getPublishedPosts();
        const related = allPosts
          .filter((p) => p.id !== foundPost.id)
          .filter((p) =>
            p.categories.some((cat) => foundPost.categories.includes(cat))
          )
          .slice(0, 3);
        setRelatedPosts(related);
      }
    } catch (error) {
      console.error("Failed to load post:", error);
    }
    setLoading(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.excerpt || "Check out this post",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // You could show a message here
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <Text className="mt-4 text-gray-600">Loading post...</Text>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <Title level={2}>Post not found</Title>
          <Text className="text-gray-600 mb-6">
            The post you're looking for doesn't exist or has been removed.
          </Text>
          <Link to="/">
            <Button type="primary" icon={<ArrowLeftOutlined size={16} />}>
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <title>{post.metaTitle || post.title} | Weblog</title>
      <meta
        name="description"
        content={post.metaDescription || post.excerpt || post.title}
      />
      <meta property="og:title" content={post.title} />
      <meta
        property="og:description"
        content={post.metaDescription || post.excerpt || post.title}
      />
      <meta property="og:type" content="article" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-6">
          <Link to="/">
            <Button icon={<ArrowLeftOutlined size={16} />} type="text">
              Back to Posts
            </Button>
          </Link>
        </div>

        {/* Post Header */}
        <Card className="shadow-sm mb-8">
          <div className="mb-4">
            {post.categories.map((category) => (
              <Tag key={category} color="blue" className="mb-2">
                {category}
              </Tag>
            ))}
          </div>

          <Title level={1} className="mb-4">
            {post.title}
          </Title>

          {post.excerpt && (
            <Paragraph className="text-lg text-gray-600 mb-6">
              {post.excerpt}
            </Paragraph>
          )}

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-6 text-gray-500">
              <span className="flex items-center">
                <UserOutlined size={16} className="mr-2" />
                {post.author}
              </span>
              <span className="flex items-center">
                <CalendarOutlined size={16} className="mr-2" />
                {format(
                  new Date(post.publishedAt || post.createdAt),
                  "MMMM d, yyyy"
                )}
              </span>
            </div>

            <Button
              icon={<ExportOutlined size={16} />}
              onClick={handleShare}
              type="text"
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
        {post.tags.length > 0 && (
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
                      to={`/post/${relatedPost.slug}`}
                      className="text-gray-800 hover:text-blue-600 transition-colors"
                    >
                      {relatedPost.title}
                    </Link>
                  </Title>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{relatedPost.author}</span>
                    <span>
                      {format(
                        new Date(
                          relatedPost.publishedAt || relatedPost.createdAt
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
