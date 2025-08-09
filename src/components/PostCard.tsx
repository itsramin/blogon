import { Card, Tag, Typography } from "antd";
import { Link } from "react-router-dom";
import { CalendarOutlined } from "@ant-design/icons";
import { format } from "date-fns";
import { BlogPost } from "../types";

interface PostCardProps {
  post: BlogPost;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { Title } = Typography;

  return (
    <Card
      className="shadow-sm hover:shadow-md transition-shadow duration-200 h-full"
      style={{
        direction: "rtl",
        textAlign: "start",
      }}
    >
      <div className="flex-1">
        <Title level={4} className="mb-2 line-clamp-2">
          <Link
            to={`/post/${post.url}`}
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

      <div
        className={`flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100 `}
      >
        <div className={`flex items-center`}>
          <CalendarOutlined size={14} className="px-1" />
          {format(new Date(post.updatedAt), "MMM d, yyyy")}
        </div>
        <div>
          {post.categories?.map((category) => (
            <Tag key={category} color="blue">
              {category}
            </Tag>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default PostCard;
