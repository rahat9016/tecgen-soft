import StarterKit from "@tiptap/starter-kit";

const CustomBlockquote = StarterKit.configure({
  blockquote: {
    HTMLAttributes: {
      style:
        "border-left: 3px solid #3b82f6; margin: 1.5em 0; padding: 0.5em 1em; background: #f8fafc; border-radius: 0 4px 4px 0; font-style: italic; color: #475569;",
    },
  },
});

export default CustomBlockquote;
