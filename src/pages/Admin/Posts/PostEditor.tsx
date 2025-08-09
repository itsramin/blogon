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
import { xmlStorage, generateId, createSlug } from "../../../utils/xmlStorage";
import { BlogPost, Category, Tag } from "../../../types";
import { RichTextEditor } from "../../../components/Editor/RichTextEditor";
import {
  ArrowLeftOutlined,
  EyeOutlined,
  SaveOutlined,
} from "@ant-design/icons";

const { Title } = Typography;
const { TextArea } = Input;

export const PostEditor: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);

    try {
      // Load categories and tags
      const [allCategories, allTags] = await Promise.all([
        xmlStorage.getAllCategories(),
        xmlStorage.getAllTags(),
      ]);

      setCategories(allCategories);
      setTags(allTags);

      // Load post if editing
      if (id && id !== "new") {
        const post = await xmlStorage.getPostById(id);
        if (post) {
          setIsEditing(true);
          setContent(post.content);
          form.setFieldsValue({
            title: post.title,
            slug: post.slug,
            author: post.author,
            categories: post.categories,
            tags: post.tags,
            excerpt: post.excerpt,
            metaTitle: post.metaTitle,
            metaDescription: post.metaDescription,
            status: post.status,
          });
        }
      } else {
        // Set defaults for new post
        form.setFieldsValue({
          author: "Admin",
          status: "draft",
        });
      }
    } catch (error) {
      message.error("Failed to load data");
    }

    setLoading(false);
  };

  const generateSlugFromTitle = (title: string) => {
    if (title) {
      form.setFieldValue("slug", createSlug(title));
    }
  };

  const handleSave = async (values: any, publish = false) => {
    setLoading(true);

    try {
      const postData: BlogPost = {
        id: id === "new" ? generateId() : id!,
        title: values.title,
        content,
        author: values.author,
        slug: values.slug,
        categories: values.categories || [],
        tags: values.tags || [],
        excerpt: values.excerpt,
        metaTitle: values.metaTitle,
        metaDescription: values.metaDescription,
        status: publish ? "published" : values.status,
        createdAt: isEditing
          ? (await xmlStorage.getPostById(id!))?.createdAt ||
            new Date().toISOString()
          : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: publish ? new Date().toISOString() : undefined,
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
    if (values.slug) {
      window.open(`/post/${values.slug}`, "_blank");
    } else {
      message.warning("Please save the post first to preview it");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            icon={<ArrowLeftOutlined size={16} />}
            onClick={() => navigate("/admin/posts")}
          >
            Back to Posts
          </Button>
          <Title level={2} className="mb-0">
            {isEditing ? "Edit Post" : "New Post"}
          </Title>
        </div>

        <Space>
          <Button icon={<EyeOutlined size={16} />} onClick={handlePreview}>
            Preview
          </Button>
          <Button
            type="default"
            icon={<SaveOutlined size={16} />}
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
                  onBlur={(e) => generateSlugFromTitle(e.target.value)}
                />
              </Form.Item>

              <Form.Item
                name="slug"
                label="Slug"
                rules={[{ required: true, message: "Please enter a slug" }]}
              >
                <Input
                  size="large"
                  placeholder="post-url-slug"
                  addonBefore="/"
                />
              </Form.Item>

              <Form.Item label="Content" required>
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Start writing your post content..."
                />
              </Form.Item>

              <Form.Item name="excerpt" label="Excerpt">
                <TextArea
                  rows={3}
                  placeholder="Brief description of the post (optional)"
                />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Post Settings" className="shadow-sm mb-6">
              <Form.Item
                name="author"
                label="Author"
                rules={[
                  { required: true, message: "Please enter author name" },
                ]}
              >
                <Input placeholder="Author name" />
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
                  options={tags.map((tag) => ({
                    value: tag.name,
                    label: tag.name,
                  }))}
                />
              </Form.Item>
            </Card>

            <Card title="SEO Settings" className="shadow-sm">
              <Form.Item name="metaTitle" label="Meta Title">
                <Input placeholder="SEO title (optional)" />
              </Form.Item>

              <Form.Item name="metaDescription" label="Meta Description">
                <TextArea rows={3} placeholder="SEO description (optional)" />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};
