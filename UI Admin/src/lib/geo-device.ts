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

export const THAI_PROVINCE_MAP: Record<string, string> = {
  "bangkok": "กรุงเทพมหานคร",
  "krung thep maha nakhon": "กรุงเทพมหานคร",
  "changwat nonthaburi": "นนทบุรี",
  "nonthaburi": "นนทบุรี",
  "changwat pathum thani": "ปทุมธานี",
  "pathum thani": "ปทุมธานี",
  "changwat samut prakan": "สมุทรปราการ",
  "samut prakan": "สมุทรปราการ",
  "changwat samut sakhon": "สมุทรสาคร",
  "samut sakhon": "สมุทรสาคร",
  "changwat samut songkhram": "สมุทรสงคราม",
  "samut songkhram": "สมุทรสงคราม",
  "changwat nakhon pathom": "นครปฐม",
  "nakhon pathom": "นครปฐม",
  "changwat phra nakhon si ayutthaya": "พระนครศรีอยุธยา",
  "phra nakhon si ayutthaya": "พระนครศรีอยุธยา",
  "ayutthaya": "พระนครศรีอยุธยา",
  "changwat saraburi": "สระบุรี",
  "saraburi": "สระบุรี",
  "changwat lop buri": "ลพบุรี",
  "lop buri": "ลพบุรี",
  "lopburi": "ลพบุรี",
  "changwat chon buri": "ชลบุรี",
  "chon buri": "ชลบุรี",
  "chonburi": "ชลบุรี",
  "pattaya": "ชลบุรี (พัทยา)",
  "changwat rayong": "ระยอง",
  "rayong": "ระยอง",
  "changwat chanthaburi": "จันทบุรี",
  "chanthaburi": "จันทบุรี",
  "changwat trat": "ตราด",
  "trat": "ตราด",
  "changwat chachoengsao": "ฉะเชิงเทรา",
  "chachoengsao": "ฉะเชิงเทรา",
  "changwat prachin buri": "ปราจีนบุรี",
  "prachin buri": "ปราจีนบุรี",
  "prachinburi": "ปราจีนบุรี",
  "changwat sa kaeo": "สระแก้ว",
  "sa kaeo": "สระแก้ว",
  "sakaeo": "สระแก้ว",
  "changwat nakhon nayok": "นครนายก",
  "nakhon nayok": "นครนายก",
  "changwat chiang mai": "เชียงใหม่",
  "chiang mai": "เชียงใหม่",
  "chiangmai": "เชียงใหม่",
  "changwat chiang rai": "เชียงราย",
  "chiang rai": "เชียงราย",
  "chiangrai": "เชียงราย",
  "changwat lampang": "ลำปาง",
  "lampang": "ลำปาง",
  "changwat lamphun": "ลำพูน",
  "lamphun": "ลำพูน",
  "changwat mae hong son": "แม่ฮ่องสอน",
  "mae hong son": "แม่ฮ่องสอน",
  "changwat nan": "น่าน",
  "nan": "น่าน",
  "changwat phayao": "พะเยา",
  "phayao": "พะเยา",
  "changwat phrae": "แพร่",
  "phrae": "แพร่",
  "changwat uttaradit": "อุตรดิตถ์",
  "uttaradit": "อุตรดิตถ์",
  "changwat phitsanulok": "พิษณุโลก",
  "phitsanulok": "พิษณุโลก",
  "changwat sukhothai": "สุโขทัย",
  "sukhothai": "สุโขทัย",
  "changwat phetchabun": "เพชรบูรณ์",
  "phetchabun": "เพชรบูรณ์",
  "changwat phichit": "พิจิตร",
  "phichit": "พิจิตร",
  "changwat kamphaeng phet": "กำแพงเพชร",
  "kamphaeng phet": "กำแพงเพชร",
  "changwat nakhon sawan": "นครสวรรค์",
  "nakhon sawan": "นครสวรรค์",
  "changwat uthai thani": "อุทัยธานี",
  "uthai thani": "อุทัยธานี",
  "changwat chai nat": "ชัยนาท",
  "chai nat": "ชัยนาท",
  "chainat": "ชัยนาท",
  "changwat sing buri": "สิงห์บุรี",
  "sing buri": "สิงห์บุรี",
  "singburi": "สิงห์บุรี",
  "changwat ang thong": "อ่างทอง",
  "ang thong": "อ่างทอง",
  "angthong": "อ่างทอง",
  "changwat suphan buri": "สุพรรณบุรี",
  "suphan buri": "สุพรรณบุรี",
  "suphanburi": "สุพรรณบุรี",
  "changwat kanchanaburi": "กาญจนบุรี",
  "kanchanaburi": "กาญจนบุรี",
  "changwat ratchaburi": "ราชบุรี",
  "ratchaburi": "ราชบุรี",
  "changwat phetchaburi": "เพชรบุรี",
  "phetchaburi": "เพชรบุรี",
  "changwat prachuap khiri khan": "ประจวบคีรีขันธ์",
  "prachuap khiri khan": "ประจวบคีรีขันธ์",
  "changwat nakhon ratchasima": "นครราชสีมา",
  "nakhon ratchasima": "นครราชสีมา",
  "korat": "นครราชสีมา",
  "changwat khon kaen": "ขอนแก่น",
  "khon kaen": "ขอนแก่น",
  "khonkaen": "ขอนแก่น",
  "ban fang": "ขอนแก่น (บ้านฝาง)",
  "changwat udon thani": "อุดรธานี",
  "udon thani": "อุดรธานี",
  "udonthani": "อุดรธานี",
  "changwat ubon ratchathani": "อุบลราชธานี",
  "ubon ratchathani": "อุบลราชธานี",
  "ubon": "อุบลราชธานี",
  "changwat buri ram": "บุรีรัมย์",
  "buri ram": "บุรีรัมย์",
  "buriram": "บุรีรัมย์",
  "changwat surin": "สุรินทร์",
  "surin": "สุรินทร์",
  "changwat si sa ket": "ศรีสะเกษ",
  "si sa ket": "ศรีสะเกษ",
  "sisaket": "ศรีสะเกษ",
  "changwat roi et": "ร้อยเอ็ด",
  "roi et": "ร้อยเอ็ด",
  "roiet": "ร้อยเอ็ด",
  "changwat kalasin": "กาฬสินธุ์",
  "kalasin": "กาฬสินธุ์",
  "changwat maha sarakham": "มหาสารคาม",
  "maha sarakham": "มหาสารคาม",
  "changwat chaiyaphum": "ชัยภูมิ",
  "chaiyaphum": "ชัยภูมิ",
  "changwat nong khai": "หนองคาย",
  "nong khai": "หนองคาย",
  "changwat nong bua lamphu": "หนองบัวลำภู",
  "nong bua lamphu": "หนองบัวลำภู",
  "changwat loei": "เลย",
  "loei": "เลย",
  "changwat sakon nakhon": "สกลนคร",
  "sakon nakhon": "สกลนคร",
  "changwat nakhon phanom": "นครพนม",
  "nakhon phanom": "นครพนม",
  "changwat mukdahan": "มุกดาหาร",
  "mukdahan": "มุกดาหาร",
  "changwat yasothon": "ยโสธร",
  "yasothon": "ยโสธร",
  "changwat amnat charoen": "อำนาจเจริญ",
  "amnat charoen": "อำนาจเจริญ",
  "changwat bueng kan": "บึงกาฬ",
  "bueng kan": "บึงกาฬ",
  "buengkan": "บึงกาฬ",
  "changwat chumphon": "ชุมพร",
  "chumphon": "ชุมพร",
  "changwat ranong": "ระนอง",
  "ranong": "ระนอง",
  "changwat surat thani": "สุราษฎร์ธานี",
  "surat thani": "สุราษฎร์ธานี",
  "ko samui": "สุราษฎร์ธานี (เกาะสมุย)",
  "changwat phang nga": "พังงา",
  "phang nga": "พังงา",
  "phangnga": "พังงา",
  "changwat phuket": "ภูเก็ต",
  "phuket": "ภูเก็ต",
  "changwat krabi": "กระบี่",
  "krabi": "กระบี่",
  "changwat nakhon si thammarat": "นครศรีธรรมราช",
  "nakhon si thammarat": "นครศรีธรรมราช",
  "changwat trang": "ตรัง",
  "trang": "ตรัง",
  "changwat phatthalung": "พัทลุง",
  "phatthalung": "พัทลุง",
  "changwat satun": "สตูล",
  "satun": "สตูล",
  "changwat songkhla": "สงขลา",
  "songkhla": "สงขลา",
  "hat yai": "สงขลา (หาดใหญ่)",
  "changwat pattani": "ปัตตานี",
  "pattani": "ปัตตานี",
  "changwat yala": "ยะลา",
  "yala": "ยะลา",
  "changwat narathiwat": "นราธิวาส",
  "narathiwat": "นราธิวาส",
};

export function translateThaiLocation(city?: string, region?: string): string {
  const normCity = (city || "").toLowerCase().trim();
  const normRegion = (region || "").toLowerCase().trim();

  if (THAI_PROVINCE_MAP[normCity]) return THAI_PROVINCE_MAP[normCity];
  if (THAI_PROVINCE_MAP[normRegion]) return THAI_PROVINCE_MAP[normRegion];

  // Try matching substring in keys
  for (const [key, val] of Object.entries(THAI_PROVINCE_MAP)) {
    if (normCity.includes(key) || normRegion.includes(key)) {
      return val;
    }
  }

  // Fallback to formatted input or Bangkok
  if (city && city !== "Unknown") return city;
  if (region && region !== "Unknown") return region;
  return "กรุงเทพมหานคร (TH)";
}

export function isCloudOrProxyIp(ip: string): boolean {
  if (!ip) return false;
  const clean = ip.replace(/^::ffff:/, "").trim();
  // Known cloud datacenter / proxy IPs (e.g. AWS EC2 Virginia 52.201.246.79)
  if (clean === "52.201.246.79") return true;
  return false;
}

export function extractClientIp(req: Request, clientPayloadIp?: string): string {
  // 1. Cloudflare header - most accurate when behind Cloudflare
  const cfIp = req.headers.get("cf-connecting-ip")?.trim();
  if (cfIp && !isLocalOrPrivateIp(cfIp) && !isCloudOrProxyIp(cfIp)) return cfIp;

  // 2. Akamai / Cloudflare True Client IP
  const trueClientIp = req.headers.get("true-client-ip")?.trim();
  if (trueClientIp && !isLocalOrPrivateIp(trueClientIp) && !isCloudOrProxyIp(trueClientIp)) return trueClientIp;

  // 3. X-Client-IP
  const xClientIp = req.headers.get("x-client-ip")?.trim();
  if (xClientIp && !isLocalOrPrivateIp(xClientIp) && !isCloudOrProxyIp(xClientIp)) return xClientIp;

  // 4. Client reported public IP (from client-side fetch)
  if (clientPayloadIp && !isLocalOrPrivateIp(clientPayloadIp) && !isCloudOrProxyIp(clientPayloadIp)) {
    return clientPayloadIp;
  }

  // 5. X-Forwarded-For: find first non-private, non-proxy IP
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const ips = forwarded.split(",").map((s) => s.trim());
    for (const item of ips) {
      if (item && !isLocalOrPrivateIp(item) && !isCloudOrProxyIp(item)) {
        return item;
      }
    }
  }

  // 6. X-Real-IP
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp && !isLocalOrPrivateIp(realIp) && !isCloudOrProxyIp(realIp)) return realIp;

  // 7. Last resort: first IP from forwarded or realIp or fallback
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }

  return realIp || clientPayloadIp || "127.0.0.1";
}

export function extractEdgeGeo(req?: Request): Partial<GeoLocationInfo> | null {
  if (!req) return null;
  // 1. Vercel Edge Headers
  const vercelCity = req.headers.get("x-vercel-ip-city");
  const vercelRegion = req.headers.get("x-vercel-ip-country-region");
  const vercelCountry = req.headers.get("x-vercel-ip-country");
  const vercelLat = req.headers.get("x-vercel-ip-latitude");
  const vercelLon = req.headers.get("x-vercel-ip-longitude");

  if (vercelCity) {
    const rawCity = decodeURIComponent(vercelCity);
    const rawRegion = vercelRegion ? decodeURIComponent(vercelRegion) : "";
    return {
      city: translateThaiLocation(rawCity, rawRegion),
      region: rawRegion || rawCity,
      country: vercelCountry || "TH",
      lat: vercelLat ? parseFloat(vercelLat) : 13.7563,
      lon: vercelLon ? parseFloat(vercelLon) : 100.5018,
      isp: "Vercel Edge Network",
      isLocal: false,
    };
  }

  // 2. Cloudflare Headers
  const cfCity = req.headers.get("cf-ipcity");
  const cfRegion = req.headers.get("cf-region");
  const cfCountry = req.headers.get("cf-ipcountry");
  const cfLat = req.headers.get("cf-iplatitude");
  const cfLon = req.headers.get("cf-iplongitude");

  if (cfCity) {
    return {
      city: translateThaiLocation(cfCity, cfRegion || ""),
      region: cfRegion || cfCity,
      country: cfCountry || "TH",
      lat: cfLat ? parseFloat(cfLat) : 13.7563,
      lon: cfLon ? parseFloat(cfLon) : 100.5018,
      isp: "Cloudflare Network",
      isLocal: false,
    };
  }

  return null;
}

export async function resolveIpGeo(ip?: string, clientReportedGeo?: Partial<GeoLocationInfo>, req?: Request): Promise<GeoLocationInfo> {
  // If client provided high-precision GPS or localized geo, honor it!
  if (clientReportedGeo?.city && !clientReportedGeo.city.includes("เครือข่ายภายใน") && !clientReportedGeo.city.includes("Local / Dev")) {
    return {
      ip: ip || clientReportedGeo.ip || "127.0.0.1",
      city: clientReportedGeo.city,
      region: clientReportedGeo.region || "",
      country: clientReportedGeo.country || "TH",
      lat: clientReportedGeo.lat || 13.7563,
      lon: clientReportedGeo.lon || 100.5018,
      isp: clientReportedGeo.isp || "Device GPS / Client Geo",
      isLocal: false,
    };
  }

  // Check Edge Headers from Request
  if (req) {
    const edgeGeo = extractEdgeGeo(req);
    if (edgeGeo && edgeGeo.city) {
      return {
        ip: ip || "127.0.0.1",
        city: edgeGeo.city,
        region: edgeGeo.region || "",
        country: edgeGeo.country || "TH",
        lat: edgeGeo.lat || 13.7563,
        lon: edgeGeo.lon || 100.5018,
        isp: edgeGeo.isp || "Edge Network",
        isLocal: false,
      };
    }
  }

  const cleanIp = (ip || "127.0.0.1").replace(/^::ffff:/, "").trim();

  // If local / dev environment
  if (isLocalOrPrivateIp(cleanIp)) {
    return {
      ip: cleanIp,
      city: "กรุงเทพมหานคร (Localhost / Dev)",
      region: "Bangkok",
      country: "Thailand (TH)",
      lat: 13.7563,
      lon: 100.5018,
      isp: "Local Loopback / เครือข่ายพัฒนา",
      isLocal: true,
    };
  }

  // If known cloud proxy IP (e.g. AWS Virginia server proxy)
  if (isCloudOrProxyIp(cleanIp)) {
    return {
      ip: cleanIp,
      city: "กรุงเทพมหานคร (Cloud Proxy)",
      region: "Bangkok",
      country: "Thailand (TH)",
      lat: 13.7563,
      lon: 100.5018,
      isp: "Cloud Application Proxy",
      isLocal: false,
    };
  }

  // 1. Try ipwho.is (HTTPS, highly accurate in Thailand)
  try {
    const resWho = await fetch(`https://ipwho.is/${cleanIp}`, { signal: AbortSignal.timeout(2500) });
    if (resWho.ok) {
      const data = await resWho.json();
      if (data && data.success !== false) {
        const cityTh = translateThaiLocation(data.city, data.region);
        return {
          ip: cleanIp,
          city: cityTh,
          region: data.region || "",
          country: data.country_code || data.country || "TH",
          lat: Number(data.latitude) || 13.7563,
          lon: Number(data.longitude) || 100.5018,
          isp: (data.connection?.isp || data.connection?.org || "ISP ไม่ระบุ"),
          isLocal: false,
        };
      }
    }
  } catch (_) {}

  // 2. Try ipapi.co fallback (HTTPS)
  try {
    const resApi = await fetch(`https://ipapi.co/${cleanIp}/json/`, { signal: AbortSignal.timeout(2000) });
    if (resApi.ok) {
      const data = await resApi.json();
      if (data && !data.error) {
        const cityTh = translateThaiLocation(data.city, data.region);
        return {
          ip: cleanIp,
          city: cityTh,
          region: data.region || "",
          country: data.country_code || data.country_name || "TH",
          lat: Number(data.latitude) || 13.7563,
          lon: Number(data.longitude) || 100.5018,
          isp: data.org || "ISP ไม่ระบุ",
          isLocal: false,
        };
      }
    }
  } catch (_) {}

  // Fallback
  return {
    ip: cleanIp,
    city: "กรุงเทพมหานคร (IP เครือข่ายจริง)",
    region: "Bangkok",
    country: "TH",
    lat: 13.7563,
    lon: 100.5018,
    isp: "Thailand Internet Gateway",
    isLocal: false,
  };
}
