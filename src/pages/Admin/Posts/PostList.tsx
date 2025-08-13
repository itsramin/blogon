import React, { useState } from "react";
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
  Breakpoint,
  Upload,
} from "antd";
import { Link } from "react-router-dom";
import { BlogPost } from "../../../types";
import { format } from "date-fns";
import usePosts from "../../../hooks/usePosts";
import useTaxonomy from "../../../hooks/useTaxonomy";
import {
  IoAddOutline,
  IoBrushOutline,
  IoCloudUploadOutline,
  IoEyeOutline,
  IoTrashOutline,
} from "react-icons/io5";

const { Title } = Typography;
const { Search: SearchInput } = Input;

const PostList: React.FC = () => {
  const {
    posts,
    loading,
    searchTerm,
    setSearchTerm,
    refreshPosts,
    deletePost,
    addPostsFromXML,
    deletePosts,
  } = usePosts();
  const { tags, categories } = useTaxonomy();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const filteredPosts = posts.filter((post) => {
    const matchesStatus =
      statusFilter === "all" || post.status === statusFilter;
    const matchesCategory =
      selectedCat === "all" ||
      (post.categories && post.categories.includes(selectedCat));
    const matchesTags =
      selectedTags.length === 0 ||
      (post.tags && selectedTags.some((tag) => post.tags.includes(tag)));

    return matchesStatus && matchesCategory && matchesTags;
  });

  const handleDelete = async (id: string) => {
    try {
      await deletePost(id);
      refreshPosts();
    } catch (error) {
      message.error("Failed to delete post");
    }
  };
  // Replace handleBulkDelete with:
  const handleBulkDelete = async () => {
    try {
      await deletePosts(selectedRowKeys as string[]);
      setSelectedRowKeys([]);
      refreshPosts();
      message.success(`Successfully deleted ${selectedRowKeys.length} posts`);
    } catch (error) {
      message.error("Failed to delete selected posts");
    }
  };

  const handleImport = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        await addPostsFromXML(content);
      } catch (error) {
        console.error(error);
      }
    };
    reader.readAsText(file);
    return false;
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  const hasSelected = selectedRowKeys.length > 0;

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (title: string, record: BlogPost) => (
        <Link
          to={`/admin/posts/edit/${record.id}`}
          className="text-gray-800 hover:text-blue-600 font-medium"
        >
          {title}
        </Link>
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
      responsive: ["md" as Breakpoint],
      render: (categories: string[] = []) => (
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
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      width: 150,
      responsive: ["lg" as Breakpoint],
      render: (tags: string[] = []) => (
        <div>
          {tags.map((tag) => (
            <Tag key={tag} color="blue" className="mb-1">
              {tag}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: "Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 120,
      responsive: ["lg" as Breakpoint],
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
              icon={<IoEyeOutline size={16} />}
              onClick={() => window.open(`/post/${record.url}`, "_blank")}
              title="View Post"
            />
          )}
          <Link to={`/admin/posts/edit/${record.id}`}>
            <Button
              type="text"
              icon={<IoBrushOutline size={16} />}
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
              danger
              icon={<IoTrashOutline size={16} />}
              title="Delete Post"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const content = (
    <>
      <div className="flex flex-col sm:flex-row gap-4 mb-6 px-2">
        <SearchInput
          placeholder="Search posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
          size="large"
        />
        <Select
          value={selectedCat}
          onChange={setSelectedCat}
          size="large"
          className="w-full sm:w-auto sm:min-w-[150px]"
        >
          <Select.Option value="all">All Categories</Select.Option>
          {categories.map((category) => (
            <Select.Option key={category} value={category}>
              {category}
            </Select.Option>
          ))}
        </Select>
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          size="large"
          className="w-full sm:w-auto sm:min-w-[150px]"
        >
          <Select.Option value="all">All Status</Select.Option>
          <Select.Option value="published">Published</Select.Option>
          <Select.Option value="draft">Draft</Select.Option>
        </Select>
        <Select
          mode="multiple"
          placeholder="Filter by tags"
          value={selectedTags}
          onChange={setSelectedTags}
          size="large"
          className="w-full sm:w-auto sm:min-w-[200px]"
          allowClear
        >
          {tags.map((tag) => (
            <Select.Option key={tag} value={tag}>
              {tag}
            </Select.Option>
          ))}
        </Select>
      </div>

      <div className="mb-4">
        {hasSelected && (
          <Popconfirm
            title={`Are you sure you want to delete ${selectedRowKeys.length} selected posts?`}
            onConfirm={handleBulkDelete}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              icon={<IoTrashOutline size={16} />}
              disabled={!hasSelected}
            >
              Delete Selected ({selectedRowKeys.length})
            </Button>
          </Popconfirm>
        )}
      </div>

      <Table
        rowSelection={rowSelection}
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
    </>
  );
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <Title level={2} className="mb-0">
          Posts
        </Title>
        <div className="flex flex-wrap items-center gap-2">
          <Upload
            accept=".xml"
            beforeUpload={handleImport}
            showUploadList={false}
          >
            <Button icon={<IoCloudUploadOutline size={16} className="mt-1" />}>
              Import XML
            </Button>
          </Upload>
          <Link to="/admin/posts/new">
            <Button
              type="primary"
              size="large"
              icon={<IoAddOutline size={16} className="mt-1" />}
            >
              New Post
            </Button>
          </Link>
        </div>
      </div>

      {/* Desktop view - with Card */}
      <div className="hidden md:block">
        <Card className="shadow-sm">{content}</Card>
      </div>

      {/* Mobile view - without Card */}
      <div className="block md:hidden">{content}</div>
    </div>
  );
};

export default PostList;
