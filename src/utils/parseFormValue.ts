export const parseSalaryValue = (salary: unknown): number => {
  if (typeof salary === "number") return salary;
  if (typeof salary === "string") {
    const salaryMatch = salary.match(/\d+/);
    return salaryMatch ? Number(salaryMatch[0]) : 0;
  }
  return 0;
};

export const parseBooleanValue = (value: unknown, fallback = true): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalizedValue = value.toLowerCase().trim();
    if (["true", "1", "active", "yes"].includes(normalizedValue)) {
      return true;
    }
    if (["false", "0", "inactive", "no"].includes(normalizedValue)) {
      return false;
    }
  }
  return fallback;
};
