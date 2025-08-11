// src/utils/dateFormatter.ts
export const formatIranianDate = (date: Date | string) => {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  // Iran is UTC+3:30 (IRST) or UTC+4:30 (IRDT during daylight saving)
  // We'll use UTC+3:30 as the standard offset
  const offset = 3.5 * 60 * 60 * 1000; // 3.5 hours in milliseconds
  const iranTime = new Date(dateObj.getTime() + offset);

  // Format in Persian locale (fa-IR)
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(iranTime);
};
