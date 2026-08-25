export function normalizeImageSrc(value?: string | null) {
  if (!value) return "";

  const trimmed = value.trim();
  if (!trimmed) return "";

  const lower = trimmed.toLowerCase();
  if (lower === "null" || lower === "undefined") return "";

  const protocolIndex = Math.max(
    trimmed.lastIndexOf("http://"),
    trimmed.lastIndexOf("https://")
  );

  if (protocolIndex > 0) {
    return trimmed.slice(protocolIndex);
  }

  return trimmed;
}
