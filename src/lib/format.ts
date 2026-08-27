export function formatINR(amount: number | string) {
  const value = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: Date | string, opts?: Intl.DateTimeFormatOptions) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...opts,
  }).format(d);
}

export function formatDateShort(date: Date | string) {
  return formatDate(date, { year: undefined });
}

export const modeLabels: Record<string, string> = {
  ONLINE: "Online",
  CLASSROOM: "Classroom",
  WEEKEND: "Weekend",
  CORPORATE: "Corporate",
  INTERNSHIP: "Internship",
  WORKSHOP: "Workshop",
};

export const batchStatusLabels: Record<string, string> = {
  UPCOMING: "Upcoming",
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
};

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
