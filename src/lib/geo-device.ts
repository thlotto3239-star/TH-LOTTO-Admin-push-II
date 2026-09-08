// geo-device.ts - Real Forensics & GeoIP Resolver
export interface DeviceInfo {
  deviceType: "mobile" | "desktop" | "tablet";
  deviceModel: string;
  os: string;
  browser: string;
}

export interface GeoLocationInfo {
  ip: string;
  city: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  isp: string;
  isLocal: boolean;
}

export function parseUserAgent(ua?: string): DeviceInfo {
  const s = ua || "";
  let deviceType: "mobile" | "desktop" | "tablet" = "desktop";
  let deviceModel = "Windows PC";
  let os = "Windows";
  let browser = "Web Browser";

  // OS Detection
  if (/iPhone/i.test(s)) {
    deviceType = "mobile";
    deviceModel = "Apple iPhone";
    os = "iOS";
    const match = s.match(/OS (\d+[_\.]\d+)/);
    if (match) os = `iOS ${match[1].replace(/_/g, ".")}`;
  } else if (/iPad/i.test(s)) {
    deviceType = "tablet";
    deviceModel = "Apple iPad";
    os = "iPadOS";
    const match = s.match(/OS (\d+[_\.]\d+)/);
    if (match) os = `iPadOS ${match[1].replace(/_/g, ".")}`;
  } else if (/Android/i.test(s)) {
    deviceType = /Tablet|iPad/i.test(s) ? "tablet" : "mobile";
    os = "Android";
    const match = s.match(/Android (\d+(\.\d+)?)/);
    if (match) os = `Android ${match[1]}`;

    // Extract device model if present
    const modelMatch = s.match(/;\s*([^;]+?)\s*Build\//i);
    if (modelMatch && modelMatch[1]) {
      deviceModel = modelMatch[1].trim();
    } else {
      deviceModel = "Android Smartphone";
    }
  } else if (/Macintosh|Mac OS/i.test(s)) {
    deviceType = "desktop";
    deviceModel = "Apple Mac / MacBook";
    os = "macOS";
    const match = s.match(/Mac OS X (\d+[_\.]\d+)/);
    if (match) os = `macOS ${match[1].replace(/_/g, ".")}`;
  } else if (/Windows/i.test(s)) {
    deviceType = "desktop";
    deviceModel = "Windows PC";
    if (/Windows NT 10.0/i.test(s)) os = "Windows 10/11";
    else if (/Windows NT 6.3/i.test(s)) os = "Windows 8.1";
    else if (/Windows NT 6.1/i.test(s)) os = "Windows 7";
    else os = "Windows";
  } else if (/Linux/i.test(s)) {
    deviceType = "desktop";
    deviceModel = "Linux Workstation";
    os = "Linux";
  }

  // Browser Detection
  if (/Edg\//i.test(s)) {
    const match = s.match(/Edg\/(\d+[\.\d]*)/);
    browser = `Microsoft Edge ${match ? match[1].split(".")[0] : ""}`.trim();
  } else if (/Chrome\//i.test(s) && !/Chromium|Edg/i.test(s)) {
    const match = s.match(/Chrome\/(\d+[\.\d]*)/);
    browser = `Google Chrome ${match ? match[1].split(".")[0] : ""}`.trim();
  } else if (/Safari\//i.test(s) && !/Chrome/i.test(s)) {
    const match = s.match(/Version\/(\d+[\.\d]*)/);
    browser = `Apple Safari ${match ? match[1].split(".")[0] : ""}`.trim();
  } else if (/Firefox\//i.test(s)) {
    const match = s.match(/Firefox\/(\d+[\.\d]*)/);
    browser = `Mozilla Firefox ${match ? match[1].split(".")[0] : ""}`.trim();
  } else if (/Opera|OPR\//i.test(s)) {
    browser = "Opera";
  }

  return { deviceType, deviceModel, os, browser };
}

export function isLocalOrPrivateIp(ip: string): boolean {
  if (!ip) return true;
  const clean = ip.replace(/^::ffff:/, "").trim();
  if (clean === "127.0.0.1" || clean === "::1" || clean === "localhost" || clean.startsWith("0.")) {
    return true;
  }
  // Private subnets: 10.x.x.x, 192.168.x.x, 172.16-31.x.x
  if (clean.startsWith("10.") || clean.startsWith("192.168.")) return true;
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(clean)) return true;
  return false;
}

export async function resolveIpGeo(ip?: string): Promise<GeoLocationInfo> {
  const cleanIp = (ip || "127.0.0.1").replace(/^::ffff:/, "").trim();

  // If local / dev environment
  if (isLocalOrPrivateIp(cleanIp)) {
    return {
      ip: cleanIp,
      city: "กรุงเทพมหานคร (Local / Dev)",
      region: "Bangkok",
      country: "Thailand (TH)",
      lat: 13.7563,
      lon: 100.5018,
      isp: "Local Loopback / เครือข่ายพัฒนา",
      isLocal: true,
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`http://ip-api.com/json/${cleanIp}?fields=status,country,regionName,city,lat,lon,isp`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.status === "success") {
        return {
          ip: cleanIp,
          city: data.city || "ไม่ระบุเมือง",
          region: data.regionName || "",
          country: data.country || "TH",
          lat: Number(data.lat) || 13.7563,
          lon: Number(data.lon) || 100.5018,
          isp: data.isp || "ISP ไม่ระบุ",
          isLocal: false,
        };
      }
    }
  } catch (e) {
    console.warn("GeoIP lookup failed for IP:", cleanIp, e);
  }

  // Fallback if external service is unreachable
  return {
    ip: cleanIp,
    city: "ประเทศไทย (IP เครือข่ายจริง)",
    region: "",
    country: "TH",
    lat: 13.7563,
    lon: 100.5018,
    isp: "Thailand Internet Gateway",
    isLocal: false,
  };
}
