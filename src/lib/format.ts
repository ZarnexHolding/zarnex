const ARABIC_INDIC = "٠١٢٣٤٥٦٧٨٩";

/**
 * 10 -> ١٠. Used alongside the Latin numeral on sector markers — a small,
 * quiet signal that this is a Saudi group, not a translated one.
 */
export function toArabicIndic(n: number | string): string {
  return String(n).replace(/\d/g, (d) => ARABIC_INDIC[Number(d)]);
}

/** 1 -> "01" */
export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}
