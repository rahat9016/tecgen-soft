export function isValidUrl(url?: string) {
  try {
    if (!url) return false;
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
