export function mapToSelectOptions<T>(
  data: T[] | undefined,
  labelKey: keyof T | ((item: T) => string),
  valueKey: keyof T
) {
  if (!Array.isArray(data)) return [];

  return data.map((item) => ({
    label:
      typeof labelKey === "function" ? labelKey(item) : String(item[labelKey]),
    value: String(item[valueKey]),
  }));
}
