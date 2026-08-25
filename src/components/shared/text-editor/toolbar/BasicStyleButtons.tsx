"use client";
import ToolbarButton from "../Toolbar";
import { type Editor } from "@tiptap/core";

export default function BasicStyleButtons({ editor }: { editor: Editor }) {
  return (
    <div className="toolbar-group">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        title="Bold"
      >
        <strong>B</strong>
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        title="Italic"
      >
        <em>I</em>
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
        title="Underline"
      >
        <u>U</u>
      </ToolbarButton>
    </div>
  );
}
