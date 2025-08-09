import { Card, Tag, Typography } from "antd";
import { Link } from "react-router-dom";
import { CalendarOutlined } from "@ant-design/icons";
import { format } from "date-fns";
import { BlogPost } from "../types";

const PostCard: React.FC<{ post: BlogPost }> = ({ post }) => {
  const { Title } = Typography;
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 h-full">
      <div className="flex-1">
        <Title level={4} className="mb-2 line-clamp-2">
          <Link
            to={`/post/${post.slug}`}
            className="text-gray-800 hover:text-blue-600 transition-colors"
          >
            {post.title}
          </Link>
        </Title>

        <div
          className="prose prose-lg max-w-none break-words"
          dangerouslySetInnerHTML={{ __html: post.content }}
          style={{
            lineHeight: "1.7",
            fontSize: "16px",
          }}
        />
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
        <div className="flex items-center">
          <CalendarOutlined size={14} className="mr-1" />
          {format(new Date(post.publishedAt || post.createdAt), "MMM d, yyyy")}
        </div>
        <div className="">
          {post.categories.map((category) => (
            <Tag key={category} color="blue" className="">
              {category}
            </Tag>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default PostCard;
