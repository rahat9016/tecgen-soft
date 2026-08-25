import { cn } from "@/src/lib/utils";
import { ToolbarButtonProps } from "./types/editor";

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onClick,
  isActive,
  children,
  title,
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      type="button"
      title={title}
      disabled={disabled}
      className={cn(
        "p-2 rounded-md transition-colors cursor-pointer",
        isActive && "bg-white border border-light-silver"
      )}
    >
      {children}
    </button>
  );
};

export default ToolbarButton;
