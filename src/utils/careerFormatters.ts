export const formatEmploymentType = (jobType?: string) => {
  if (!jobType) return "N/A";

  return jobType
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const formatExperience = (experience: string | number) => {
  const value = Number(experience);

  if (Number.isNaN(value) || value <= 0) {
    return "N/A";
  }

  return `${value} years`;
};

export const formatSalary = (salary: string | number, currency: string) => {
  const value = Number(salary);

  if (Number.isNaN(value) || value <= 0) {
    return "Negotiable";
  }

  return `${value.toLocaleString()} ${currency}`;
};
