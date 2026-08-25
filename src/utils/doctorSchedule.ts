import { IDoctorSchedules } from "../components/admin/Doctors/types";

const normalizeDay = (value?: string) => (value || "").trim().toUpperCase();

const getWeekDayFromDateTime = (value?: string) => {
  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
};

const formatTime = (time?: string) => {
  if (!time) return "";

  const parsed = new Date(time);
  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getTodaySchedule = (schedules?: IDoctorSchedules[]) => {
  if (!schedules?.length) return undefined;

  const today = new Date()
    .toLocaleDateString("en-US", { weekday: "long" })
    .toUpperCase();

  return schedules.find(
    (schedule) =>
      normalizeDay(schedule.dayOfWeek) === today ||
      getWeekDayFromDateTime(schedule.startTime) === today
  );
};

export const formatScheduleRange = (schedule?: IDoctorSchedules) => {
  if (!schedule) return "No schedule today";

  const start = formatTime(schedule.startTime);
  const end = formatTime(schedule.endTime);

  if (!start || !end) return "No schedule today";
  return `${start} - ${end}`;
};
