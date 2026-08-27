function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toAllDayDate(d: Date) {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
}

function nextDay(d: Date) {
  return new Date(d.getTime() + 24 * 60 * 60 * 1000);
}

export function googleCalendarUrl({
  title,
  description,
  location,
  date,
}: {
  title: string;
  description?: string;
  location?: string;
  date: Date;
}) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${toAllDayDate(date)}/${toAllDayDate(nextDay(date))}`,
  });
  if (description) params.set("details", description);
  if (location) params.set("location", location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function escapeIcsText(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export function buildIcsCalendar(events: { uid: string; title: string; description?: string; date: Date }[]) {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Talent Expert//Batch Schedule//EN"];
  for (const e of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.uid}@talentexpertedu.com`,
      `DTSTAMP:${toAllDayDate(e.date)}T000000Z`,
      `DTSTART;VALUE=DATE:${toAllDayDate(e.date)}`,
      `DTEND;VALUE=DATE:${toAllDayDate(nextDay(e.date))}`,
      `SUMMARY:${escapeIcsText(e.title)}`,
      ...(e.description ? [`DESCRIPTION:${escapeIcsText(e.description)}`] : []),
      "END:VEVENT"
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
