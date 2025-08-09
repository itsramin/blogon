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
  Spin,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { xmlStorage, generateId, createSlug } from "../../../utils/xmlStorage";
import { BlogPost, Category, Tag } from "../../../types";
import { RichTextEditor } from "../../../components/Editor/RichTextEditor";
import {
  ArrowLeftOutlined,
  EyeOutlined,
  SaveOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

export const PostEditor: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        await xmlStorage.initialize();
        setInitializing(false);
        loadData();
      } catch (error) {
        message.error("Failed to initialize storage");
        setInitializing(false);
      }
    };
    initialize();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      await xmlStorage.initialize();
      const [allCategories, allTags] = await Promise.all([
        xmlStorage.getAllCategories(),
        xmlStorage.getAllTags(),
      ]);

      setCategories(allCategories);
      setTags(allTags);

      if (id && id !== "new") {
        const post = await xmlStorage.getPostById(id);
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
      } else {
        form.setFieldsValue({
          author: {
            firstName: "Admin",
            lastName: "",
          },
          status: "draft",
        });
      }
    } catch (error) {
      message.error("Failed to load data");
    }
    setLoading(false);
  };

  const generateUrlFromTitle = (title: string) => {
    if (title) {
      form.setFieldValue("url", createSlug(title));
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
          userName: createSlug(
            `${authorValue.firstName} ${authorValue.lastName}`
          ),
          firstName: authorValue.firstName || "",
          lastName: authorValue.lastName || "",
        },
        url: values.url,
        link: `/post/${values.url}`,
        number: isEditing
          ? (await xmlStorage.getPostById(id!))?.number || Date.now()
          : Date.now(),
        categories: values.categories || [],
        tags: values.tags || [],
        status: publish ? "published" : values.status,
        createdAt: isEditing
          ? (await xmlStorage.getPostById(id!))?.createdAt ||
            new Date().toISOString()
          : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await xmlStorage.savePost(postData);
      message.success(`Post ${publish ? "published" : "saved"} successfully`);

      if (!isEditing) {
        navigate(`/admin/posts/edit/${postData.id}`);
      }
      setIsEditing(true);
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

  if (initializing) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/admin/posts")}
          >
            Back to Posts
          </Button>
          <Title level={2} className="mb-0">
            {isEditing ? "Edit Post" : "New Post"}
          </Title>
        </div>

        <Space>
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
            <Card title="Content" className="shadow-sm mb-6">
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

              <Form.Item label="Content" required>
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Start writing your post content..."
                />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Post Settings" className="shadow-sm mb-6">
              <Form.Item
                name={["author", "firstName"]}
                label="Author First Name"
                rules={[
                  { required: true, message: "Please enter author first name" },
                ]}
              >
                <Input placeholder="First name" />
              </Form.Item>

              <Form.Item name={["author", "lastName"]} label="Author Last Name">
                <Input placeholder="Last name" />
              </Form.Item>

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
                    value: cat.name,
                    label: cat.name,
                  }))}
                />
              </Form.Item>

              <Form.Item name="tags" label="Tags">
                <Select
                  mode="tags"
                  placeholder="Enter or select tags"
                  loading={loading}
                  options={tags.map((tag) => ({
                    value: tag.name,
                    label: tag.name,
                  }))}
                />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};
