import { type CommandProps } from "@tiptap/core";
import { TextStyle } from "@tiptap/extension-text-style";

const FontSize = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: (element) => element.style.fontSize?.replace(/['"]+/g, ""),
        renderHTML: (attributes) => {
          if (!attributes.fontSize) {
            return {};
          }
          return {
            style: `font-size: ${attributes.fontSize}`,
          };
        },
      },
    };
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ commands }: CommandProps) => {
          return commands.setMark(this.name, { fontSize });
        },
      unsetFontSize:
        () =>
        ({ commands }: CommandProps) => {
          return commands.setMark(this.name, { fontSize: null });
        },
    };
  },
});

export default FontSize;
