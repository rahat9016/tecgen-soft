export const extractTimeFormat = (time: string | null | undefined): string => {
  if (!time) return "";
  // If already HH:MM format, return as-is
  if (/^\d{2}:\d{2}$/.test(time)) return time;
  // If ISO datetime, extract HH:MM
  const date = new Date(time);
  if (!Number.isNaN(date.getTime())) {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }
  return "";
};
