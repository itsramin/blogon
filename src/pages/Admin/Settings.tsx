import { Form, Input, Button, Card, Space, Divider } from "antd";
import { useBlog } from "../../hooks/useBlog";
import { BlogInfo } from "../../types";
import { useEffect } from "react";

const { TextArea } = Input;

const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const { blogInfo, loading, updateBlogInfo } = useBlog();

  useEffect(() => {
    if (blogInfo) {
      form.setFieldsValue(blogInfo);
    }
  }, [blogInfo, form]);

  const onFinish = async (values: Partial<BlogInfo>) => {
    await updateBlogInfo(values);
  };

  return (
    <Card title="Blog Settings" variant="borderless">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={blogInfo || {}}
      >
        <Divider orientation="left">Basic Information</Divider>

        <Form.Item
          name="title"
          label="Blog Title"
          rules={[{ required: true, message: "Please input your blog title!" }]}
        >
          <Input placeholder="My Awesome Blog" />
        </Form.Item>

        <Form.Item
          name="shortDescription"
          label="Short Description"
          rules={[
            { required: true, message: "Please input a short description!" },
          ]}
        >
          <Input.TextArea
            rows={2}
            placeholder="A brief description of your blog"
          />
        </Form.Item>

        <Form.Item
          name="fullDescription"
          label="Full Description"
          rules={[
            { required: true, message: "Please input a full description!" },
          ]}
        >
          <TextArea
            rows={4}
            placeholder="Detailed description of your blog's content and purpose"
          />
        </Form.Item>

        <Divider orientation="left">Owner Information</Divider>

        {/* <Form.Item
          name={["owner", "userName"]}
          label="Username"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input placeholder="admin" />
        </Form.Item> */}

        <Form.Item
          name={["owner", "firstName"]}
          label="First Name"
          rules={[{ required: true, message: "Please input your first name!" }]}
        >
          <Input placeholder="John" />
        </Form.Item>

        <Form.Item
          name={["owner", "lastName"]}
          label="Last Name"
          rules={[{ required: true, message: "Please input your last name!" }]}
        >
          <Input placeholder="Doe" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              Save Settings
            </Button>
            <Button onClick={() => form.resetFields()} disabled={loading}>
              Reset
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default Settings;
