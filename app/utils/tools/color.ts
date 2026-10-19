interface RGB { r: number; g: number; b: number }
interface HSL { h: number; s: number; l: number }

/* ── 转换函数 ── */
function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToRgb(hex: string): RGB | null {
  const m = hex.replace(/^#/, "").match(/^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/);
  if (!m) {
    const s = hex.replace(/^#/, "").match(/^([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/);
    if (!s) return null;
    return { r: parseInt(s[1]! + s[1]!, 16), g: parseInt(s[2]! + s[2]!, 16), b: parseInt(s[3]! + s[3]!, 16) };
  }
  return { r: parseInt(m[1]!, 16), g: parseInt(m[2]!, 16), b: parseInt(m[3]!, 16) };
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  const rr = r / 255, gg = g / 255, bb = b / 255;
  const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rr) h = ((gg - bb) / d + (gg < bb ? 6 : 0)) / 6;
  else if (max === gg) h = ((bb - rr) / d + 2) / 6;
  else h = ((rr - gg) / d + 4) / 6;
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb({ h, s, l }: HSL): RGB {
  const ss = s / 100, ll = l / 100;
  if (ss === 0) {
    const v = Math.round(ll * 255);
    return { r: v, g: v, b: v };
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss;
  const p = 2 * ll - q;
  const hh = h / 360;
  return {
    r: Math.round(hue2rgb(p, q, hh + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hh) * 255),
    b: Math.round(hue2rgb(p, q, hh - 1 / 3) * 255),
  };
}

/* ── 解析任意输入 ── */
export function parseColorInput(raw: string): RGB | null {
  const s = raw.trim();
  // HEX
  if (/^#?[0-9a-fA-F]{3,6}$/.test(s)) return hexToRgb(s);
  // rgb(r, g, b)
  const rgbMatch = s.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
  if (rgbMatch) {
    const [r, g, b] = rgbMatch.slice(1).map(Number) as [number, number, number];
    return [r, g, b].every(value => value >= 0 && value <= 255) ? { r, g, b } : null;
  }
  // hsl(h, s%, l%)
  const hslMatch = s.match(/^hsl\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%\s*,\s*(\d+(?:\.\d+)?)%\s*\)$/i);
  if (hslMatch) {
    const [h, saturation, lightness] = hslMatch.slice(1).map(Number) as [number, number, number];
    if (saturation > 100 || lightness > 100) return null;
    return hslToRgb({ h: ((h % 360) + 360) % 360, s: saturation, l: lightness });
  }
  return null;
}

export function formatRgb({ r, g, b }: RGB): string {
  return `rgb(${r}, ${g}, ${b})`;
}
export function formatHsl({ h, s, l }: HSL): string {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

