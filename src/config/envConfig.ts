// export const baseURL = "http://72.62.231.103:8080/happy-hospital/api/v1";
export const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://192.168.0.202:8000/happy-hospital/api/v1";

export const getBaseUrl = (): string => {
  return baseURL;
};

// External apps (separate deployments)
export const appointmentURL =
  process.env.NEXT_PUBLIC_APPOINTMENT_URL || "http://192.168.0.21:4067/";

export const reportURL =
  process.env.NEXT_PUBLIC_REPORT_URL || "http://192.168.0.21:4068/";
