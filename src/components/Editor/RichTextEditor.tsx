import React, { useEffect, useRef, useState } from "react";
import { Button, Divider, Segmented, Modal, Input, Form } from "antd";
import {
  TbAlignCenter,
  TbAlignLeft,
  TbAlignRight,
  TbAlignJustified,
  TbTextDirectionLtr,
  TbTextDirectionRtl,
  TbBold,
  TbItalic,
  TbUnderline,
  TbLink,
  TbQuote,
  TbPhoto,
} from "react-icons/tb";

type alignment = "left" | "center" | "right" | "justify";

type Props = {
  value?: string;
  onChange?: (html: string) => void;
};

export default function RichTextEditor({ value = "", onChange }: Props) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const lastRangeRef = useRef<Range | null>(null);

  const [isRTL, setIsRTL] = useState(true);
  const [currentAlign, setCurrentAlign] = useState<alignment>("right");
  const [activeStates, setActiveStates] = useState({
    bold: false,
    italic: false,
    underline: false,
  });

  // Modal states
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const [linkForm] = Form.useForm();
  const [imageForm] = Form.useForm();

  // sync value from parent
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  // dir attribute
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.setAttribute("dir", isRTL ? "rtl" : "ltr");
    }
  }, [isRTL]);

  // selection helpers
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      lastRangeRef.current = sel.getRangeAt(0);
    }
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (!sel || !lastRangeRef.current) return;
    sel.removeAllRanges();
    sel.addRange(lastRangeRef.current);
  };

  // track selection change
  useEffect(() => {
    const onSelChange = () => {
      saveSelection();
      updateActiveStates();
    };
    document.addEventListener("selectionchange", onSelChange);
    return () => document.removeEventListener("selectionchange", onSelChange);
  }, []);

  const updateActiveStates = () => {
    setActiveStates({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
    });
  };

  const emitChange = () => {
    const html = editorRef.current?.innerHTML || "";
    onChange?.(html);
    updateActiveStates();
  };

  const exec = (command: string, value?: string) => {
    if (!editorRef.current) return;
    restoreSelection();
    editorRef.current.focus();
    document.execCommand(command, false, value ?? "");
    emitChange();
  };

  const handleAlign = (align: alignment) => {
    const map: Record<alignment, string> = {
      left: "justifyLeft",
      center: "justifyCenter",
      right: "justifyRight",
      justify: "justifyFull",
    };
    exec(map[align]);
    setCurrentAlign(align);
  };

  // paste as plain text
  const handlePaste: React.ClipboardEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    const html = text
      .split(/\r?\n/)
      .map((line) => (line.trim() === "" ? "<br>" : escapeHtml(line)))
      .join("<br>");
    exec("insertHTML", html);
  };

  const escapeHtml = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  // ---- Feature Actions ----
  const insertLink = () => {
    linkForm.resetFields();
    setLinkModalOpen(true);
  };

  const confirmInsertLink = async () => {
    try {
      const values = await linkForm.validateFields();
      restoreSelection();
      const text = values.text || values.url;
      const html = `<a href="${escapeHtml(
        values.url
      )}" target="_blank" rel="noopener noreferrer">${escapeHtml(text)}</a>`;
      exec("insertHTML", html);
      setLinkModalOpen(false);
    } catch {
      // validation failed
    }
  };

  const insertImage = () => {
    imageForm.resetFields();
    setImageModalOpen(true);
  };

  const confirmInsertImage = async () => {
    try {
      const values = await imageForm.validateFields();
      restoreSelection();
      const html = `<img src="${escapeHtml(
        values.url
      )}" alt="" style="max-width:100%;height:auto;" />`;
      exec("insertHTML", html);
      setImageModalOpen(false);
    } catch {
      // validation failed
    }
  };

  const insertQuote = () => {
    restoreSelection();
    exec(
      "insertHTML",
      `<blockquote style="border-left:3px solid #ccc;padding-left:8px;margin:8px 0;">${document.getSelection()}</blockquote>`
    );
  };

  return (
    <>
      <div className="border border-[#d9d9d9] rounded-lg">
        <div className="py-2 px-2 border-b border-b-[#d9d9d9] flex flex-wrap gap-2 items-center">
          <Button
            type={activeStates.bold ? "primary" : "text"}
            icon={<TbBold size={16} className="mt-[5px]" />}
            onClick={() => exec("bold")}
          />
          <Button
            type={activeStates.italic ? "primary" : "text"}
            icon={<TbItalic size={16} className="mt-[5px]" />}
            onClick={() => exec("italic")}
          />
          <Button
            type={activeStates.underline ? "primary" : "text"}
            icon={<TbUnderline size={16} className="mt-[5px]" />}
            onClick={() => exec("underline")}
          />

          <Divider type="vertical" />

          <Segmented
            value={currentAlign}
            onChange={(val: alignment) => handleAlign(val)}
            options={[
              {
                value: "left",
                icon: <TbAlignLeft size={16} className="mt-[5px]" />,
              },
              {
                value: "center",
                icon: <TbAlignCenter size={16} className="mt-[5px]" />,
              },
              {
                value: "right",
                icon: <TbAlignRight size={16} className="mt-[5px]" />,
              },
              {
                value: "justify",
                icon: <TbAlignJustified size={16} className="mt-[5px]" />,
              },
            ]}
          />

          <Divider type="vertical" />

          <Segmented
            value={isRTL ? "rtl" : "ltr"}
            onChange={(val) => setIsRTL(val === "rtl")}
            options={[
              {
                value: "ltr",
                icon: <TbTextDirectionLtr size={16} className="mt-[5px]" />,
              },
              {
                value: "rtl",
                icon: <TbTextDirectionRtl size={16} className="mt-[5px]" />,
              },
            ]}
          />

          <Divider type="vertical" />

          <Button
            type="text"
            icon={<TbPhoto size={16} className="mt-[5px]" />}
            onClick={insertImage}
          />
          <Button
            type="text"
            icon={<TbLink size={16} className="mt-[5px]" />}
            onClick={insertLink}
          />
          <Button
            type="text"
            icon={<TbQuote size={16} className="mt-[5px]" />}
            onClick={insertQuote}
          />
        </div>

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={emitChange}
          onBlur={emitChange}
          onPaste={handlePaste}
          onKeyUp={saveSelection}
          onMouseUp={saveSelection}
          role="textbox"
          aria-multiline="true"
          className={`min-h-[200px] p-4 focus:outline-none overflow-auto bg-white ${
            isRTL ? "text-right" : "text-left"
          }`}
          style={{ direction: isRTL ? "rtl" : "ltr" }}
        />
      </div>

      {/* Link Modal */}
      <Modal
        title="Insert Link"
        open={linkModalOpen}
        onOk={confirmInsertLink}
        onCancel={() => setLinkModalOpen(false)}
      >
        <Form form={linkForm} layout="vertical">
          <Form.Item
            label="Link URL"
            name="url"
            rules={[{ required: true, message: "Please enter the URL" }]}
          >
            <Input placeholder="https://example.com" />
          </Form.Item>
          <Form.Item label="Link Text" name="text">
            <Input placeholder="Optional link text" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Image Modal */}
      <Modal
        title="Insert Image"
        open={imageModalOpen}
        onOk={confirmInsertImage}
        onCancel={() => setImageModalOpen(false)}
      >
        <Form form={imageForm} layout="vertical">
          <Form.Item
            label="Image URL"
            name="url"
            rules={[{ required: true, message: "Please enter the image URL" }]}
          >
            <Input placeholder="https://example.com/image.jpg" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
