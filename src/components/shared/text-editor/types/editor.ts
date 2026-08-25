export interface TextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}
export interface ImageAttributes {
  src: string;
  width?: number;
  height?: number;
  alt?: string;
  title?: string;
}

export interface ToolbarButtonProps {
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
  title?: string;
  disabled?: boolean;
}

export interface ImageUploadResponse {
  url: string;
  width?: number;
  height?: number;
}

export type ResizableImageAttributes = Omit<
  ImageAttributes,
  "width" | "height"
> & {
  width?: string;
  height?: string;
  wrap?: "inline" | "wrap" | "break";
  align?: string;
};
