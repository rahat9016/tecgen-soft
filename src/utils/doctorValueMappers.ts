export const mapBookingTypeToForm = (
  value?: string
): "ONSITE" | "TELE_ONLINE" => {
  if (value === "TELE_ONLINE") return "TELE_ONLINE";
  return "ONSITE";
};

export const mapStatusToForm = (value?: string): "ACTIVE" | "ON_LEAVE" => {
  if (value === "ON_LEAVE" || value === "INACTIVE") return "ON_LEAVE";
  return "ACTIVE";
};

export const mapGenderToForm = (
  value?: string
): "MALE" | "FEMALE" | "OTHER" => {
  if (value === "FEMALE" || value === "Female") return "FEMALE";
  if (value === "OTHER" || value === "Other") return "OTHER";
  return "MALE";
};

export const mapBookingTypeToApi = (value: "ONSITE" | "TELE_ONLINE") => value;

export const mapStatusToApi = (value: "ACTIVE" | "ON_LEAVE") => value;

export const mapGenderToApi = (value: string) => value.toUpperCase();
