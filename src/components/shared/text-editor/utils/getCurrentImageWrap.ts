import { type Editor } from "@tiptap/core";
import { NodeSelection } from "prosemirror-state";

const getCurrentImageWrap = (editor: Editor): "inline" | "wrap" | "break" => {
  const { selection } = editor.state;

  if (selection instanceof NodeSelection && selection.node) {
    const wrap = selection.node.attrs?.wrap;
    if (wrap === "inline" || wrap === "wrap" || wrap === "break") {
      return wrap;
    }
  }

  return "inline";
};

export default getCurrentImageWrap;
