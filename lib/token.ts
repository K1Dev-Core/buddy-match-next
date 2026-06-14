const KEY = "CodeLineageV1";

function xorHex(input: string): string {
  let out = "";
  for (let i = 0; i < input.length; i++) {
    const x = input.charCodeAt(i) ^ KEY.charCodeAt(i % KEY.length);
    out += x.toString(16).padStart(2, "0");
  }
  return out;
}

function xorUnhex(hex: string): string {
  let out = "";
  for (let i = 0; i < hex.length; i += 2) {
    const x = parseInt(hex.slice(i, i + 2), 16) ^ KEY.charCodeAt((i / 2) % KEY.length);
    out += String.fromCharCode(x);
  }
  return out;
}

export function encodeToken(code: string, juniorId: string): string {
  return xorHex(code + juniorId);
}

export function decodeToken(token: string): { code: string; juniorId: string } | null {
  try {
    const raw = xorUnhex(token);
    const code = raw.slice(0, 4);
    const juniorId = raw.slice(4);
    if (!/^\d{4}$/.test(code) || !juniorId) return null;
    return { code, juniorId };
  } catch {
    return null;
  }
}

export function encodeCode(code: string): string {
  return xorHex(code);
}

export function decodeCode(token: string): string | null {
  try {
    const code = xorUnhex(token);
    if (!/^\d{4}$/.test(code)) return null;
    return code;
  } catch {
    return null;
  }
}
