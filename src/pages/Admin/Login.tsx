import React, { useState } from "react";
import { Card, Form, Input, Button, Alert, Typography } from "antd";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { BookOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export const AdminLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (values: {
    username: string;
    password: string;
  }) => {
    setLoading(true);
    setError("");

    const success = await login(values.username, values.password);

    if (success) {
      navigate("/admin");
    } else {
      setError("Invalid username or password");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <BookOutlined className="text-blue-600" size={48} />
          </div>
          <Title level={2} className="mt-6">
            Admin Login
          </Title>
          <Text className="text-gray-600">
            Sign in to your admin account to manage your weblog
          </Text>
        </div>

        <Card className="shadow-lg">
          <Form
            name="login"
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
          >
            {error && (
              <Alert message={error} type="error" showIcon className="mb-4" />
            )}

            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <Text strong className="text-blue-800">
                Demo Credentials:
              </Text>
              <br />
              <Text className="text-blue-700">Username: admin</Text>
              <br />
              <Text className="text-blue-700">Password: admin123</Text>
            </div>

            <Form.Item
              name="username"
              label="Username"
              rules={[
                { required: true, message: "Please input your username!" },
              ]}
            >
              <Input size="large" placeholder="Enter your username" />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password size="large" placeholder="Enter your password" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                className="w-full"
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};
