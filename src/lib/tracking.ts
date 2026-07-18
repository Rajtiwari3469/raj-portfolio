export interface DeviceInfo {
  browser: string;
  os: string;
  device: string;
  isBot: boolean;
}

export function parseUserAgent(ua: string | null): DeviceInfo {
  if (!ua) {
    return { browser: "Unknown", os: "Unknown", device: "Unknown", isBot: false };
  }

  const isBot = /bot|crawl|spider|slurp|mediapartners|facebookexternalhit|preview|headless/i.test(ua);

  let browser = "Other";
  if (/chrome|chromium|crios/i.test(ua) && !/edg|opr|opera/i.test(ua)) browser = "Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua) && !/chrome|chromium|crios/i.test(ua)) browser = "Safari";
  else if (/edg|edge/i.test(ua)) browser = "Edge";
  else if (/opr|opera/i.test(ua)) browser = "Opera";
  else if (/msie|trident/i.test(ua)) browser = "IE";
  else if (/whatsapp/i.test(ua)) browser = "WhatsApp";
  else if (/telegram/i.test(ua)) browser = "Telegram";
  else if (/facebook/i.test(ua)) browser = "Facebook";
  else if (/linkedin/i.test(ua)) browser = "LinkedIn";
  else if (/twitter/i.test(ua)) browser = "Twitter";
  else if (/instagram/i.test(ua)) browser = "Instagram";

  let os = "Other";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/macintosh|mac os/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua) && !/android/i.test(ua)) os = "Linux";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/cros/i.test(ua)) os = "Chrome OS";

  let device = "Desktop";
  if (/mobile|android|iphone|ipod/i.test(ua)) device = "Mobile";
  else if (/ipad|tablet|kindle|silk/i.test(ua)) device = "Tablet";

  return { browser, os, device, isBot };
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

export function getPageName(pathname: string): string {
  if (pathname === "/") return "Home";
  const clean = pathname.replace(/^\/|\/$/g, "");
  const parts = clean.split("/");
  const page = parts[parts.length - 1] || "Home";
  return page.charAt(0).toUpperCase() + page.slice(1).replace(/-/g, " ");
}
