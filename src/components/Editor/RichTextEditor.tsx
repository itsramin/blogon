import React, { useEffect, useRef, useState } from "react";
import { Button, Divider, Segmented } from "antd";
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
} from "@ant-design/icons";

import {
  TbAlignCenter,
  TbAlignLeft,
  TbAlignRight,
  TbAlignJustified,
  TbTextDirectionLtr,
  TbTextDirectionRtl,
} from "react-icons/tb";

type alignment = "left" | "center" | "right" | "justify";

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
  const [isRTL, setIsRTL] = useState(true);
  const [currentAlign, setCurrentAlign] = useState<alignment>("left");
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

  useEffect(() => {
    handleAlign(currentAlign);
  }, [currentAlign]);

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
