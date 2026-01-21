import { Appointment, Prescription, Repeat } from "@/lib/types";

const REPEATS: Repeat[] = ["none", "daily", "weekly", "monthly"];

const ensureRepeat = (value: Repeat) => {
  if (!REPEATS.includes(value)) return "none" as const;
  return value;
};

const addMonths = (date: Date, months: number) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  if (d.getDate() !== date.getDate()) {
    d.setDate(0);
  }
  return d;
};

const nextDate = (current: Date, repeat: Repeat) => {
  switch (repeat) {
    case "daily":
      return new Date(current.getTime() + 24 * 60 * 60 * 1000);
    case "weekly":
      return new Date(current.getTime() + 7 * 24 * 60 * 60 * 1000);
    case "monthly":
      return addMonths(current, 1);
    default:
      return current;
  }
};

export const formatDateTime = (value: string | Date) => {
  const dt = typeof value === "string" ? new Date(value) : value;
  return dt.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export const formatDate = (value: string | Date) => {
  const dt = typeof value === "string" ? new Date(value) : value;
  return dt.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const expandAppointments = (
  appointments: Appointment[],
  windowDays = 90,
) => {
  const now = new Date();
  const cutoff = new Date(now.getTime() + windowDays * 24 * 60 * 60 * 1000);

  const schedule = appointments.flatMap((appt) => {
    const occurrences: { when: Date; appointment: Appointment }[] = [];
    let current = new Date(appt.datetime);
    const repeat = ensureRepeat(appt.repeat);
    while (current <= cutoff) {
      if (appt.repeat_until && current > new Date(appt.repeat_until)) break;
      if (current >= now) {
        occurrences.push({ when: new Date(current), appointment: appt });
      }
      if (repeat === "none") break;
      current = nextDate(current, repeat);
    }
    return occurrences;
  });

  return schedule.sort((a, b) => a.when.getTime() - b.when.getTime());
};

export const expandRefills = (prescriptions: Prescription[], windowDays = 90) => {
  const now = new Date();
  const cutoff = new Date(now.getTime() + windowDays * 24 * 60 * 60 * 1000);

  const events = prescriptions.flatMap((rx) => {
    const occurrences: { when: Date; prescription: Prescription }[] = [];
    let current = new Date(rx.refill_on);
    const repeat = ensureRepeat(rx.refill_schedule);

    while (current <= cutoff) {
      if (current >= now) {
        occurrences.push({ when: new Date(current), prescription: rx });
      }
      if (repeat === "none") break;
      current = nextDate(current, repeat);
    }
    return occurrences;
  });

  return events.sort((a, b) => a.when.getTime() - b.when.getTime());
};
