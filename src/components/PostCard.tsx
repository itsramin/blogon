import { Button, Card, Tag, Typography } from "antd";
import { Link } from "react-router-dom";
import { BlogPost } from "../types";
import { formatIranianDate } from "../util/dateFormatter";
import { useAuth } from "../context/AuthContext";
import { IoBrushOutline, IoCalendarClearOutline } from "react-icons/io5";

interface PostCardProps {
  post: BlogPost;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { Title } = Typography;
  const { isAuthenticated } = useAuth();

  return (
    <Card
      className="shadow-sm   hover:shadow-md transition-shadow duration-200 h-full flex flex-col"
      styles={{ body: { flex: 1, display: "flex", flexDirection: "column" } }}
      style={{
        direction: "rtl",
        textAlign: "start",
      }}
    >
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <Title level={4} className="mb-2">
            <Link to={`/post/${post.url}`}>{post.title}</Link>
          </Title>
          {isAuthenticated && (
            <Link to={`/admin/posts/edit/${post.id}`}>
              <Button icon={<IoBrushOutline size={16} className="mt-1" />} />
            </Link>
          )}
        </div>

        <div
          className=" max-w-none break-words "
          dangerouslySetInnerHTML={{ __html: post.content }}
          style={{
            lineHeight: "1.7",
            fontSize: "14px",
          }}
        />
      </div>

      <div className="flex items-center justify-between text-sm text-gray-400 mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center">
          <IoCalendarClearOutline
            size={16}
            className="mx-1 mb-1 text-gray-400"
          />
          {formatIranianDate(post.updatedAt)}
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
