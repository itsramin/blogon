import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Space,
  message,
  Typography,
  Row,
  Col,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useBlog } from "../../../hooks/useBlog";
import { BlogPost } from "../../../types";
import { RichTextEditor } from "../../../components/Editor/RichTextEditor";
import {
  ArrowLeftOutlined,
  EyeOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import usePosts from "../../../hooks/usePosts";
import useTaxonomy from "../../../hooks/useTaxonomy";

const { Title } = Typography;

const PostEditor: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const { blogInfo } = useBlog();
  const { refreshPosts, getPostById, savePost } = usePosts();
  const { categories } = useTaxonomy();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id && id !== "new") {
      loadPostData();
    } else {
      form.setFieldsValue({
        author: {
          firstName: blogInfo?.owner.firstName || "Admin",
          lastName: blogInfo?.owner.lastName || "",
        },
        status: "draft",
      });
    }
  }, [id, blogInfo]);

  const loadPostData = async () => {
    if (!id || id === "new") return;

    setLoading(true);
    try {
      const post = await getPostById(id);
      if (post) {
        setIsEditing(true);
        setContent(post.content);
        form.setFieldsValue({
          title: post.title,
          url: post.url,
          author: {
            firstName: post.author.firstName,
            lastName: post.author.lastName,
          },
          categories: post.categories,
          tags: post.tags,
          status: post.status,
        });
      }
    } catch (error) {
      message.error("Failed to load post data");
    }
    setLoading(false);
  };

  const generateUrlFromTitle = (title: string) => {
    if (title) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      form.setFieldValue("url", slug);
    }
  };

  const handleSave = async (values: any, publish = false) => {
    setLoading(true);
    try {
      const authorValue = values.author || {};
      const postData: BlogPost = {
        id: id === "new" ? generateId() : id!,
        title: values.title,
        content,
        author: {
          userName: `${authorValue.firstName} ${authorValue.lastName}`
            .toLowerCase()
            .replace(/\s+/g, "-"),
          firstName: authorValue.firstName || "",
          lastName: authorValue.lastName || "",
        },
        url: values.url,
        link: `/post/${values.url}`,
        number: Date.now(),
        categories: values.categories || [],
        tags: values.tags || [],
        status: publish ? "published" : values.status,
        createdAt: isEditing
          ? (await getPostById(id!))?.createdAt || new Date().toISOString()
          : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await savePost(postData);

      if (!isEditing) {
        navigate(`/admin/posts/edit/${postData.id}`);
      }
      setIsEditing(true);
      refreshPosts();
    } catch (error) {
      message.error(`Failed to ${publish ? "publish" : "save"} post`);
    }
    setLoading(false);
  };

  const handlePreview = () => {
    const values = form.getFieldsValue();
    if (values.url) {
      window.open(`/post/${values.url}`, "_blank");
    } else {
      message.warning("Please save the post first to preview it");
    }
  };

  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const formContent = (
    <>
      <Form.Item
        name="title"
        label="Title"
        rules={[{ required: true, message: "Please enter a title" }]}
      >
        <Input
          size="large"
          placeholder="Enter post title"
          onBlur={(e) => generateUrlFromTitle(e.target.value)}
        />
      </Form.Item>

      <Form.Item
        name="url"
        label="URL"
        rules={[{ required: true, message: "Please enter a URL" }]}
      >
        <Input size="large" placeholder="post-url" />
      </Form.Item>

      <Form.Item label="Content" required className="h-full">
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="Start writing your post content..."
        />
      </Form.Item>
    </>
  );

  const optionContent = (
    <>
      <Form.Item name="status" label="Status">
        <Select>
          <Select.Option value="draft">Draft</Select.Option>
          <Select.Option value="published">Published</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item name="categories" label="Categories">
        <Select
          mode="multiple"
          placeholder="Select categories"
          loading={loading}
          options={categories.map((cat) => ({
            value: cat,
            label: cat,
          }))}
        />
      </Form.Item>

      <Form.Item name="tags" label="Tags">
        <Select
          mode="tags"
          placeholder="Enter or select tags"
          loading={loading}
          tokenSeparators={[","]}
        />
      </Form.Item>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/admin/posts")}
          >
            Back
          </Button>
          <Title level={2} className="!mb-0 text-center sm:text-left">
            {isEditing ? "Edit Post" : "New Post"}
          </Title>
        </div>

        <Space className="flex-wrap justify-center">
          <Button icon={<EyeOutlined />} onClick={handlePreview}>
            Preview
          </Button>
          <Button
            type="default"
            icon={<SaveOutlined />}
            loading={loading}
            onClick={() => form.submit()}
          >
            Save Draft
          </Button>
          <Button
            type="primary"
            loading={loading}
            onClick={() => {
              form.validateFields().then((values) => {
                handleSave(values, true);
              });
            }}
          >
            Publish
          </Button>
        </Space>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => handleSave(values, false)}
      >
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            {/* Mobile view - simple div */}
            <div className="md:hidden space-y-4 mb-6">
              <Title level={4}>Post</Title>
              {formContent}
            </div>

            {/* Desktop view - Card */}

            <Card title="Post" className="shadow-sm mb-6 hidden md:block">
              {formContent}
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            {/* Mobile view - simple div */}
            <div className="md:hidden space-y-4 mb-6">
              <Title level={4}>Settings</Title>
              {optionContent}
            </div>

            {/* Desktop view - Card */}
            <Card title="Settings" className="shadow-sm mb-6 hidden md:block">
              {optionContent}
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default PostEditor;
