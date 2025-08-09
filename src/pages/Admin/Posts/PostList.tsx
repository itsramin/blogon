import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Popconfirm,
  message,
  Typography,
  Input,
  Select,
} from "antd";
import { Link } from "react-router-dom";
import { xmlStorage } from "../../../utils/xmlStorage";
import { BlogPost } from "../../../types";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import { format } from "date-fns";

const { Title } = Typography;
const { Search: SearchInput } = Input;

export const PostList: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const allPosts = await xmlStorage.getAllPosts();
      setPosts(
        allPosts.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
      );
    } catch (error) {
      message.error("Failed to load posts");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await xmlStorage.deletePost(id);
      message.success("Post deleted successfully");
      loadPosts();
    } catch (error) {
      message.error("Failed to delete post");
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (title: string, record: BlogPost) => (
        <div>
          <Link
            to={`/admin/posts/edit/${record.id}`}
            className="text-gray-800 hover:text-blue-600 font-medium"
          >
            {title}
          </Link>
          <div className="text-sm text-gray-500 mt-1">/{record.url}</div>{" "}
          {/* Changed from slug to url */}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <Tag color={status === "published" ? "green" : "orange"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Categories",
      dataIndex: "categories",
      key: "categories",
      width: 200,
      render: (
        categories: string[] = [] // Added default value
      ) => (
        <div>
          {categories.map((category) => (
            <Tag key={category} color="blue" className="mb-1">
              {category}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: "Author",
      dataIndex: "author",
      key: "author",
      width: 150,
      render: (
        author: { firstName: string; lastName: string } // Updated author display
      ) => `${author.firstName} ${author.lastName}`,
    },
    {
      title: "Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 120,
      render: (date: string) => format(new Date(date), "MMM d, yyyy"),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_: any, record: BlogPost) => (
        <Space size="small">
          {record.status === "published" && (
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined size={14} />}
              onClick={() => window.open(`/post/${record.url}`, "_blank")} // Changed from slug to url
              title="View Post"
            />
          )}
          <Link to={`/admin/posts/edit/${record.id}`}>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined size={14} />}
              title="Edit Post"
            />
          </Link>
          <Popconfirm
            title="Are you sure you want to delete this post?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined size={14} />}
              title="Delete Post"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Title level={2} className="mb-0">
          Posts
        </Title>
        <Link to="/admin/posts/new">
          <Button type="primary" size="large" icon={<PlusOutlined size={16} />}>
            New Post
          </Button>
        </Link>
      </div>

      <Card className="shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <SearchInput
            placeholder="Search posts..."
            prefix={<SearchOutlined size={16} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
            size="large"
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            size="large"
            style={{ width: 150 }}
          >
            <Select.Option value="all">All Status</Select.Option>
            <Select.Option value="published">Published</Select.Option>
            <Select.Option value="draft">Draft</Select.Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={filteredPosts}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} posts`,
          }}
          className="overflow-x-auto"
        />
      </Card>
    </div>
  );
};
