/**
 * 估算文字寬度。SVG 排版前拿不到字型的真實量測，所以用字元類別的平均寬度估算，
 * 只用來決定標籤底色膠囊的大小，不求精確。
 */
export function textWidth(text: string, fontSize: number, bold = false): number {
  let units = 0;
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    if (code >= 0x2e80) units += 1;
    else if (ch === ' ') units += 0.3;
    else if (ch >= '0' && ch <= '9') units += 0.58;
    else if (ch >= 'A' && ch <= 'Z') units += 0.68;
    else units += 0.55;
  }
  return units * fontSize * (bold ? 1.06 : 1);
}
