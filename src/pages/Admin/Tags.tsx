import React, { useState } from "react";
import { Table, Button, Input, Modal, Form, Space } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import useTaxonomy from "../../hooks/useTaxonomy";

const TagsPage: React.FC = () => {
  const {
    categories: tags,
    loading,
    addCategory: addTag,
    updateCategory: updateTag,
    deleteCategory: deleteTag,
    refreshCategories: refreshTags,
  } = useTaxonomy();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<string | null>(null);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            danger
            size="small"
          />
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    form.resetFields();
    setEditingTag(null);
    setIsModalVisible(true);
  };

  const handleEdit = (tag: any) => {
    form.setFieldsValue({ name: tag.name });
    setEditingTag(tag.id);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: "Delete Tag",
      content: "Are you sure you want to delete this tag?",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        await deleteTag(id);
        refreshTags();
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingTag) {
        await updateTag(editingTag, values.name);
      } else {
        await addTag(values.name);
      }
      setIsModalVisible(false);
      refreshTags();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tags</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Tag
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={tags}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      <Modal
        title={editingTag ? "Edit Tag" : "Add Tag"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tag Name"
            rules={[
              { required: true, message: "Please enter a tag name" },
              {
                max: 50,
                message: "Tag name cannot exceed 50 characters",
              },
            ]}
          >
            <Input placeholder="Enter tag name" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TagsPage;
