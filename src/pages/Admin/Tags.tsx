import React, { useState } from "react";
import { Table, Button, Input, Modal, Form, Space } from "antd";
import useTaxonomy from "../../hooks/useTaxonomy";
import {
  IoAddOutline,
  IoBrushOutline,
  IoCheckmarkOutline,
  IoCloseOutline,
  IoTrashOutline,
} from "react-icons/io5";

interface TagItem {
  key: string;
  name: string;
}

const TagsPage: React.FC = () => {
  const { tags, loading, addTag, updateTag, deleteTag, refreshTags } =
    useTaxonomy();
  const [form] = Form.useForm();
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Convert tags string array to TagItem array
  const tagItems: TagItem[] = tags.map((tag) => ({ key: tag, name: tag }));

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: TagItem) => {
        if (editingKey === record.key) {
          return (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              autoFocus
            />
          );
        }
        return text;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: TagItem) => {
        if (editingKey === record.key) {
          return (
            <Space size="middle">
              <Button
                icon={<IoCheckmarkOutline size={16} className="mt-1" />}
                onClick={() => handleSave(record)}
                type="primary"
              />
              <Button
                icon={<IoCloseOutline size={16} className="mt-1" />}
                onClick={() => setEditingKey(null)}
                type="default"
              />
            </Space>
          );
        }
        return (
          <Space size="middle">
            <Button
              icon={<IoBrushOutline size={16} className="mt-1" />}
              onClick={() => handleEdit(record)}
              type="text"
            />
            <Button
              icon={<IoTrashOutline size={16} className="mt-1" />}
              onClick={() => handleDelete(record)}
              danger
              type="text"
            />
          </Space>
        );
      },
    },
  ];

  const handleAdd = () => {
    setIsAddModalVisible(true);
  };

  const handleEdit = (record: TagItem) => {
    setEditingKey(record.key);
    setEditValue(record.name);
  };

  const handleSave = async (record: TagItem) => {
    if (!editValue.trim()) return;

    try {
      await updateTag(record.name, editValue);
      setEditingKey(null);
      refreshTags();
    } catch (error) {
      console.error("Failed to update tag:", error);
    }
  };

  const handleDelete = async (record: TagItem) => {
    Modal.confirm({
      title: "Delete Tag",
      content: "Are you sure you want to delete this tag?",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        await deleteTag(record.name);
        refreshTags();
      },
    });
  };

  const handleAddSubmit = async () => {
    try {
      const values = await form.validateFields();
      await addTag(values.name);
      setIsAddModalVisible(false);
      form.resetFields();
      refreshTags();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tags</h1>
        <Button
          type="primary"
          icon={<IoAddOutline size={16} className="mt-1" />}
          onClick={handleAdd}
        >
          Add Tag
        </Button>
      </div>

      <Table<TagItem>
        columns={columns}
        dataSource={tagItems}
        rowKey="key"
        loading={loading}
        pagination={false}
      />

      <Modal
        title="Add Tag"
        open={isAddModalVisible}
        onOk={handleAddSubmit}
        onCancel={() => setIsAddModalVisible(false)}
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
