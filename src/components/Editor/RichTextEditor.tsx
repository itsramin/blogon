import React, { useEffect, useRef, useState } from "react";
import { Button, Divider, Segmented } from "antd";
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  BorderOuterOutlined,
} from "@ant-design/icons";

type Props = {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
};

export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Start writing...",
}: Props) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [isRTL, setIsRTL] = useState(false);
  const [currentAlign, setCurrentAlign] = useState<
    "left" | "center" | "right" | "justify"
  >("left");
  const [activeStates, setActiveStates] = useState({
    bold: false,
    italic: false,
    underline: false,
  });

  // keep internal HTML in sync if parent changes value
  useEffect(() => {
    if (!editorRef.current) return;
    if (value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  useEffect(() => {
    // when direction toggles, set dir attribute
    if (editorRef.current) {
      editorRef.current.setAttribute("dir", isRTL ? "rtl" : "ltr");
    }
  }, [isRTL]);

  // call onChange whenever editor content changes
  const emitChange = () => {
    const html = editorRef.current?.innerHTML || "";
    onChange && onChange(html);
    // update active states
    setActiveStates({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
    });
  };

  const exec = (command: string, value?: string) => {
    document.execCommand(command, false, value || "");
    emitChange();
    editorRef.current?.focus();
  };

  const handleAlign = (align: string) => {
    // Use justify commands for cross-browser alignment
    switch (align) {
      case "left":
        exec("justifyLeft");
        break;
      case "center":
        exec("justifyCenter");
        break;
      case "right":
        exec("justifyRight");
        break;
      case "justify":
        exec("justifyFull");
        break;
    }
    setCurrentAlign(align as any);
  };

  // paste handler - paste plain text to avoid external styles
  const handlePaste: React.ClipboardEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    // preserve line breaks by inserting <br>
    const html = text
      .split(/\r?\n/)
      .map((line) => (line.trim() === "" ? "<br>" : escapeHtml(line)))
      .join("<br>");
    // insert html at cursor
    document.execCommand("insertHTML", false, html);
    emitChange();
  };

  const escapeHtml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  return (
    <div className="border border-[#d9d9d9] rounded-lg">
      <div className=" py-2 px-2 border-b border-b-[#d9d9d9] flex flex-row items-center flex-wrap  gap-2">
        <Button
          type={activeStates.bold ? "primary" : "text"}
          icon={<BoldOutlined />}
          onClick={() => exec("bold")}
        />

        <Button
          type={activeStates.italic ? "primary" : "text"}
          icon={<ItalicOutlined />}
          onClick={() => exec("italic")}
        />

        <Button
          type={activeStates.underline ? "primary" : "text"}
          icon={<UnderlineOutlined />}
          onClick={() => exec("underline")}
        />

        <Divider type="vertical" />

        <Button
          type={currentAlign === "left" ? "primary" : "text"}
          icon={<AlignLeftOutlined />}
          onClick={() => handleAlign("left")}
        />

        <Button
          type={currentAlign === "center" ? "primary" : "text"}
          icon={<AlignCenterOutlined />}
          onClick={() => handleAlign("center")}
        />

        <Button
          type={currentAlign === "right" ? "primary" : "text"}
          icon={<AlignRightOutlined />}
          onClick={() => handleAlign("right")}
        />

        <Button
          type={currentAlign === "justify" ? "primary" : "text"}
          icon={<BorderOuterOutlined />}
          onClick={() => handleAlign("justify")}
        />

        <Divider type="vertical" />
        <Segmented
          value={isRTL ? "rtl" : "ltr"}
          onChange={(val) => setIsRTL(val === "rtl")}
          options={[
            { value: "ltr", label: "LTR" },
            { value: "rtl", label: "RTL" },
          ]}
        />
      </div>

      <div
        ref={editorRef}
        contentEditable={true}
        suppressContentEditableWarning
        onInput={emitChange}
        onBlur={emitChange}
        onPaste={handlePaste}
        role="textbox"
        aria-multiline="true"
        className={`min-h-[200px] p-4  focus:outline-none  overflow-auto bg-white" ${
          isRTL ? "text-right" : "text-left"
        }
        `}
        data-placeholder={placeholder}
        style={{ direction: isRTL ? "rtl" : "ltr" }}
      ></div>
    </div>
  );
}
