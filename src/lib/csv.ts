function escapeCsvCell(value: unknown) {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export function buildCsv(columns: { key: string; label: string }[], rows: Record<string, unknown>[]) {
  const header = columns.map((c) => escapeCsvCell(c.label)).join(",");
  const lines = rows.map((row) => columns.map((c) => escapeCsvCell(row[c.key])).join(","));
  return [header, ...lines].join("\r\n");
}
