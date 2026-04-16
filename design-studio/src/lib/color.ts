const HEX_SHORT = /^#([\da-f]{3,4})$/i;
const HEX_LONG = /^#([\da-f]{6})([\da-f]{2})?$/i;
const RGB = /^rgba?\(([^)]+)\)$/i;

interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface Hsla {
  h: number;
  s: number;
  l: number;
  a: number;
}

function clamp(value: number, min = 0, max = 255) {
  return Math.min(max, Math.max(min, value));
}

function clampUnit(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function parseColor(input: string): Rgba | null {
  const value = input.trim();
  const short = value.match(HEX_SHORT);
  if (short) {
    const raw = short[1];
    const hex = raw
      .split("")
      .map((char) => char + char)
      .join("");
    const alpha = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
      a: alpha
    };
  }

  const long = value.match(HEX_LONG);
  if (long) {
    return {
      r: parseInt(long[1].slice(0, 2), 16),
      g: parseInt(long[1].slice(2, 4), 16),
      b: parseInt(long[1].slice(4, 6), 16),
      a: long[2] ? parseInt(long[2], 16) / 255 : 1
    };
  }

  const rgb = value.match(RGB);
  if (rgb) {
    const parts = rgb[1].split(",").map((part) => part.trim());
    if (parts.length < 3) return null;
    return {
      r: clamp(Number.parseFloat(parts[0])),
      g: clamp(Number.parseFloat(parts[1])),
      b: clamp(Number.parseFloat(parts[2])),
      a: parts[3] ? Math.min(1, Math.max(0, Number.parseFloat(parts[3]))) : 1
    };
  }

  return null;
}

export function toHex(input: string) {
  const color = parseColor(input);
  if (!color) return input;
  const channel = (value: number) => clamp(Math.round(value)).toString(16).padStart(2, "0");
  return `#${channel(color.r)}${channel(color.g)}${channel(color.b)}`;
}

export function withAlpha(input: string, alpha: number) {
  const color = parseColor(input);
  if (!color) return input;
  return `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, ${alpha})`;
}

export function mix(colorA: string, colorB: string, ratio: number) {
  const a = parseColor(colorA);
  const b = parseColor(colorB);
  if (!a || !b) return colorA;
  const weight = Math.min(1, Math.max(0, ratio));
  return toHex(
    `rgb(${a.r * (1 - weight) + b.r * weight}, ${a.g * (1 - weight) + b.g * weight}, ${a.b * (1 - weight) + b.b * weight})`
  );
}

export function luminance(input: string) {
  const color = parseColor(input);
  if (!color) return 0;
  const channels = [color.r, color.g, color.b].map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

export function contrastText(input: string, dark = "#10151d", light = "#f8fbff") {
  return luminance(input) > 0.45 ? dark : light;
}

export function darken(input: string, amount: number) {
  return mix(input, "#06080d", amount);
}

export function lighten(input: string, amount: number) {
  return mix(input, "#ffffff", amount);
}

export function saturation(input: string) {
  const color = parseColor(input);
  if (!color) return 0;
  const red = color.r / 255;
  const green = color.g / 255;
  const blue = color.b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  if (max === min) return 0;
  const lightness = (max + min) / 2;
  return lightness > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
}

export function toHsl(input: string): Hsla | null {
  const color = parseColor(input);
  if (!color) return null;

  const red = color.r / 255;
  const green = color.g / 255;
  const blue = color.b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const lightness = (max + min) / 2;

  if (delta === 0) {
    return {
      h: 0,
      s: 0,
      l: lightness,
      a: color.a
    };
  }

  const saturationValue =
    lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);

  let hue = 0;
  if (max === red) hue = ((green - blue) / delta) % 6;
  else if (max === green) hue = (blue - red) / delta + 2;
  else hue = (red - green) / delta + 4;

  return {
    h: ((hue * 60) + 360) % 360,
    s: saturationValue,
    l: lightness,
    a: color.a
  };
}

function hueToChannel(pivotA: number, pivotB: number, hue: number) {
  let channel = hue;
  if (channel < 0) channel += 1;
  if (channel > 1) channel -= 1;
  if (channel < 1 / 6) return pivotA + (pivotB - pivotA) * 6 * channel;
  if (channel < 1 / 2) return pivotB;
  if (channel < 2 / 3) return pivotA + (pivotB - pivotA) * (2 / 3 - channel) * 6;
  return pivotA;
}

export function hslToHex(hue: number, saturationValue: number, lightness: number) {
  const normalizedHue = (((hue % 360) + 360) % 360) / 360;
  const saturation = clampUnit(saturationValue);
  const light = clampUnit(lightness);

  if (saturation === 0) {
    const channel = Math.round(light * 255);
    return toHex(`rgb(${channel}, ${channel}, ${channel})`);
  }

  const pivotB =
    light < 0.5 ? light * (1 + saturation) : light + saturation - light * saturation;
  const pivotA = 2 * light - pivotB;
  const red = hueToChannel(pivotA, pivotB, normalizedHue + 1 / 3);
  const green = hueToChannel(pivotA, pivotB, normalizedHue);
  const blue = hueToChannel(pivotA, pivotB, normalizedHue - 1 / 3);

  return toHex(`rgb(${red * 255}, ${green * 255}, ${blue * 255})`);
}

export function grayFromPercent(percent: number) {
  const ratio = clampUnit(percent / 100);
  const channel = Math.round(ratio * 255);
  return toHex(`rgb(${channel}, ${channel}, ${channel})`);
}
