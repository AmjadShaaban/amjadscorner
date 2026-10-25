/**
 * Escapes one CSV cell. Values starting with = + - @ (or tab/CR) are prefixed with a
 * quote so spreadsheet apps don't execute them as formulas (CSV injection).
 */
export function csvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  let s = String(value);
  if (typeof value === "string" && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function csvRow(values: (string | number | null | undefined)[]): string {
  return values.map(csvCell).join(",");
}
