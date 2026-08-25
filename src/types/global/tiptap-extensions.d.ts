// tiptap-extensions.d.ts
import "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    resizableImage: {
      /**
       * Insert a new resizable image with custom attributes
       */
      setResizableImage: (options: {
        src: string;
        alt?: string;
        title?: string;
        width?: string;
        height?: string;
        wrap?: "inline" | "wrap" | "break";
        align?: string;
      }) => ReturnType;

      /**
       * Update resizable image attributes
       */
      updateResizableImage: (options: {
        width?: string;
        height?: string;
        wrap?: "inline" | "wrap" | "break";
        align?: string;
      }) => ReturnType;

      /**
       * Change resizable image dimensions
       */
      setResizableImageSize: (width: string, height?: string) => ReturnType;

      /**
       * Change resizable image wrapping mode
       */
      setResizableImageWrap: (wrap: "inline" | "wrap" | "break") => ReturnType;

      /**
       * Change resizable image alignment
       */
      setResizableImageAlign: (
        align: "left" | "center" | "right"
      ) => ReturnType;
    };
  }
}
