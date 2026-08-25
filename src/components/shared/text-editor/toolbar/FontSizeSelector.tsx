"use client";

export default function FontSizeSelector({
  currentFontSize,
  setFontSize,
}: {
  currentFontSize: string;
  setFontSize: (fontSize: string) => void;
}) {
  const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32];

  return (
    <div className="py-2.5">
      <select
        value={currentFontSize}
        onChange={(e) => setFontSize(e.target.value)}
        className="text-secondary-foreground  outline-0 cursor-pointer"
        title="Font Size text-sm"
      >
        <option value="">Font Size</option>

        {fontSizes.map((size) => (
          <option key={size} value={size}>
            {size}px
          </option>
        ))}
      </select>
    </div>
  );
}
