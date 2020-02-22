export default function stripHeredoc(str: string): string {
  str = str.trim();
  const margins = (str.match(/^ +/gm) ?? []).map(s => s.length);
  const margin = Math.min(...margins);

  return str.replace(new RegExp(`^ {${margin}}`, "gm"), "");
}
