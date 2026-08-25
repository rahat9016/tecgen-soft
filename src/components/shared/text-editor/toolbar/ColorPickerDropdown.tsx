"use client";
import { type Editor } from "@tiptap/core";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const predefinedColors = [
  "#0F0E40",
  "#5C5C5C",
  "#BDBDBD",
  "#FFD47F",
  "#FF55A9",
  "#3398FF",
  "#3FD88C",
  "#F44336",
  "#FF9800",
];

export default function ColorPickerDropdown({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const setColor = (color: string) => {
    editor
      .chain()
      .setMeta("skipEditorOnChange", true)
      .focus()
      .setColor(color)
      .run();
    setOpen(false);
  };

  return (
    <div className="relative py-2.5" ref={dropdownRef}>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => {
          e.preventDefault();
          setOpen((prev) => !prev);
        }}
        title="Text Color"
      >
        <Image src="/icons/color.svg" alt="color" width={20} height={20} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-9999 p-3 bg-white border border-[#d8d8d8] rounded shadow-md w-20">
          <div className="grid grid-cols-3 gap-1">
            {predefinedColors.map((color) => (
              <button
                key={color}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.preventDefault();
                  setColor(color);
                }}
                className="w-4 h-4 shadow-sm cursor-pointer hover:border  rounded-full"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
