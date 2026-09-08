export function csvEscape(value: string | null | undefined) {
  const text = value ?? "";
  const safeText = /^[\t\r ]*[=+\-@]/.test(text) ? `'${text}` : text;
  if (/[",\n]/.test(safeText)) return `"${safeText.replace(/"/g, '""')}"`;
  return safeText;
}
