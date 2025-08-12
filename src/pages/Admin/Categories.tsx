import React, { useState } from "react";
import { Table, Button, Input, Modal, Form, Space } from "antd";
import {
  IoAddOutline,
  IoBrushOutline,
  IoCheckmarkOutline,
  IoCloseOutline,
  IoTrashOutline,
} from "react-icons/io5";
import useTaxonomy from "../../hooks/useTaxonomy";

interface CatItem {
  key: string;
  name: string;
}

const CategoriesPage: React.FC = () => {
  const {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    refreshCategories,
  } = useTaxonomy();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const catItems: CatItem[] = categories.map((cat) => ({
    key: cat,
    name: cat,
  }));

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: CatItem) => {
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
      render: (_: any, record: CatItem) => {
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
    setIsModalVisible(true);
  };

  const handleEdit = (record: CatItem) => {
    setEditingKey(record.key);
    setEditValue(record.name);
  };

  const handleSave = async (record: CatItem) => {
    if (!editValue.trim()) return;

    try {
      await updateCategory(record.name, editValue);
      setEditingKey(null);
      refreshCategories();
    } catch (error) {
      console.error("Failed to update category:", error);
    }
  };

  const handleDelete = async (record: CatItem) => {
    Modal.confirm({
      title: "Delete Category",
      content: "Are you sure you want to delete this category?",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        await deleteCategory(record.name);
        refreshCategories();
      },
    });
  };

  const handleAddSubmit = async () => {
    try {
      const values = await form.validateFields();
      await addCategory(values.name);
      setIsModalVisible(false);
      form.resetFields();
      refreshCategories();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button
          type="primary"
          icon={<IoAddOutline size={16} className="mt-1" />}
          onClick={handleAdd}
        >
          Add Category
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={catItems}
        rowKey="key"
        loading={loading}
        pagination={false}
      />

      <Modal
        title={"Add Category"}
        open={isModalVisible}
        onOk={handleAddSubmit}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Category Name"
            rules={[
              { required: true, message: "Please enter a category name" },
              {
                max: 50,
                message: "Category name cannot exceed 50 characters",
              },
            ]}
          >
            <Input placeholder="Enter category name" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoriesPage;
