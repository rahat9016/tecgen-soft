import { useLayoutEffect, useRef } from "react";

/** Grows a textarea with its content, from one line up to `max` px, then scrolls. */
export const useAutoGrow = (value: string, max = 112) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    // scrollHeight leaves out the border, which border-box sizing counts.
    const full = el.scrollHeight + el.offsetHeight - el.clientHeight;
    el.style.height = `${Math.min(full, max)}px`;
    // No scrollbar until the text is taller than `max` — rounding alone can otherwise show one.
    el.style.overflowY = full > max ? "auto" : "hidden";
  }, [value, max]);
  return ref;
};
