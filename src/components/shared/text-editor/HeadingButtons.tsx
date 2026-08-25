import { type Editor } from "@tiptap/core";
import ToolbarButton from "./Toolbar";

const headingLevels: (1 | 2 | 3)[] = [1, 2, 3];

export default function HeadingButtons({
  editor,
  applyHeadingToSelection,
}: {
  editor: Editor;
  applyHeadingToSelection: (level: 1 | 2 | 3) => void;
}) {
  return (
    <>
      {headingLevels.map((level) => (
        <ToolbarButton
          key={level}
          onClick={() => applyHeadingToSelection(level)}
          isActive={editor.isActive("heading", { level: level })}
          title="Heading 1"
        >
          H{level}
        </ToolbarButton>
      ))}
    </>
  );
}
