// client-geo.ts - Silent, High-Accuracy Client-Side IP & Province Resolver
export interface ClientGeoResult {
  ip?: string;
  city?: string;
  region?: string;
  country?: string;
  lat?: number;
  lon?: number;
  isp?: string;
}

const THAI_PROVINCES: Record<string, string> = {
  "bangkok": "กรุงเทพมหานคร",
  "krung thep maha nakhon": "กรุงเทพมหานคร",
  "nonthaburi": "นนทบุรี",
  "pathum thani": "ปทุมธานี",
  "samut prakan": "สมุทรปราการ",
  "samut sakhon": "สมุทรสาคร",
  "samut songkhram": "สมุทรสงคราม",
  "nakhon pathom": "นครปฐม",
  "phra nakhon si ayutthaya": "พระนครศรีอยุธยา",
  "ayutthaya": "พระนครศรีอยุธยา",
  "saraburi": "สระบุรี",
  "lop buri": "ลพบุรี",
  "lopburi": "ลพบุรี",
  "chon buri": "ชลบุรี",
  "chonburi": "ชลบุรี",
  "pattaya": "ชลบุรี (พัทยา)",
  "rayong": "ระยอง",
  "chanthaburi": "จันทบุรี",
  "trat": "ตราด",
  "chachoengsao": "ฉะเชิงเทรา",
  "prachin buri": "ปราจีนบุรี",
  "prachinburi": "ปราจีนบุรี",
  "sa kaeo": "สระแก้ว",
  "sakaeo": "สระแก้ว",
  "nakhon nayok": "นครนายก",
  "chiang mai": "เชียงใหม่",
  "chiangmai": "เชียงใหม่",
  "chiang rai": "เชียงราย",
  "chiangrai": "เชียงราย",
  "lampang": "ลำปาง",
  "lamphun": "ลำพูน",
  "mae hong son": "แม่ฮ่องสอน",
  "nan": "น่าน",
  "phayao": "พะเยา",
  "phrae": "แพร่",
  "uttaradit": "อุตรดิตถ์",
  "tak": "ตาก",
  "sukhothai": "สุโขทัย",
  "phitsanulok": "พิษณุโลก",
  "phichit": "พิจิตร",
  "kamphaeng phet": "กำแพงเพชร",
  "nakhon sawan": "นครสวรรค์",
  "uthaithani": "อุทัยธานี",
  "uthai thani": "อุทัยธานี",
  "chai nat": "ชัยนาท",
  "chainat": "ชัยนาท",
  "sing buri": "สิงห์บุรี",
  "singburi": "สิงห์บุรี",
  "ang thong": "อ่างทอง",
  "angthong": "อ่างทอง",
  "suphan buri": "สุพรรณบุรี",
  "suphanburi": "สุพรรณบุรี",
  "nakhon ratchasima": "นครราชสีมา",
  "korat": "นครราชสีมา (โคราช)",
  "khon kaen": "ขอนแก่น",
  "khonkaen": "ขอนแก่น",
  "udon thani": "อุดรธานี",
  "udonthani": "อุดรธานี",
  "ubon ratchathani": "อุบลราชธานี",
  "ubon": "อุบลราชธานี",
  "nong khai": "หนองคาย",
  "nong bua lam phu": "หนองบัวลำภู",
  "loei": "เลย",
  "sakon nakhon": "สกลนคร",
  "nakhon phanom": "นครพนม",
  "mukdahan": "มุกดาหาร",
  "roi et": "ร้อยเอ็ด",
  "kalasin": "กาฬสินธุ์",
  "maha sarakham": "มหาสารคาม",
  "yasothon": "ยโสธร",
  "amnat charoen": "อำนาจเจริญ",
  "si sa ket": "ศรีสะเกษ",
  "sisaket": "ศรีสะเกษ",
  "surin": "สุรินทร์",
  "buri ram": "บุรีรัมย์",
  "buriram": "บุรีรัมย์",
  "chaiyaphum": "ชัยภูมิ",
  "bueng kan": "บึงกาฬ",
  "phetchabun": "เพชรบูรณ์",
  "kanchanaburi": "กาญจนบุรี",
  "ratchaburi": "ราชบุรี",
  "phetchaburi": "เพชรบุรี",
  "prachuap khiri khan": "ประจวบคีรีขันธ์",
  "hua hin": "ประจวบคีรีขันธ์ (หัวหิน)",
  "chumphon": "ชุมพร",
  "ranong": "ระนอง",
  "surat thani": "สุราษฎร์ธานี",
  "ko samui": "สุราษฎร์ธานี (เกาะสมุย)",
  "phang nga": "พังงา",
  "phangnga": "พังงา",
  "phuket": "ภูเก็ต",
  "krabi": "กระบี่",
  "nakhon si thammarat": "นครศรีธรรมราช",
  "trang": "ตรัง",
  "phatthalung": "พัทลุง",
  "satun": "สตูล",
  "songkhla": "สงขลา",
  "hat yai": "สงขลา (หาดใหญ่)",
  "pattani": "ปัตตานี",
  "yala": "ยะลา",
  "narathiwat": "นราธิวาส",
};

function formatThaiLocation(city?: string, region?: string): string {
  const normCity = (city || "").toLowerCase().trim().replace(/^changwat\s+/, "");
  const normRegion = (region || "").toLowerCase().trim().replace(/^changwat\s+/, "");

  if (THAI_PROVINCES[normCity]) return THAI_PROVINCES[normCity];
  if (THAI_PROVINCES[normRegion]) return THAI_PROVINCES[normRegion];

  for (const [k, v] of Object.entries(THAI_PROVINCES)) {
    if (normCity.includes(k) || normRegion.includes(k)) {
      return v;
    }
  }

  if (city && city !== "Unknown") return city;
  if (region && region !== "Unknown") return region;
  return "กรุงเทพมหานคร";
}

let _cachedAdminGeo: ClientGeoResult | null = null;
let _isResolving = false;

export async function prewarmAdminGeo(): Promise<void> {
  if (_cachedAdminGeo || _isResolving) return;
  _isResolving = true;
  try {
    _cachedAdminGeo = await getAdminClientGeo();
  } catch (_) {}
  _isResolving = false;
}

export async function getAdminClientGeo(): Promise<ClientGeoResult | null> {
  if (_cachedAdminGeo) return _cachedAdminGeo;
  if (typeof window === "undefined") return null;

  // 1. Silent Fast IP Geo Lookup (Directly from client device without browser permission popups)
  let ipInfo: ClientGeoResult | null = null;

  // Provider 1: ipwho.is (HTTPS, Highly accurate for Thai residential & cellular ISPs)
  try {
    const res = await fetch("https://ipwho.is/", { signal: AbortSignal.timeout(2500) });
    const data = await res.json();
    if (data && data.success !== false && data.ip) {
      const cityTh = formatThaiLocation(data.city, data.region);
      const rawIsp = data.connection?.isp || data.connection?.org || "";
      const shortIsp = rawIsp.includes("AIS") || rawIsp.includes("Advanced Info") ? "AIS" :
                       rawIsp.includes("True") || rawIsp.includes("TRUE") ? "TRUE" :
                       rawIsp.includes("Triple T") || rawIsp.includes("3BB") ? "3BB" :
                       rawIsp.includes("National Telecom") || rawIsp.includes("TOT") || rawIsp.includes("CAT") ? "NT" :
                       rawIsp.includes("DTAC") || rawIsp.includes("Total Access") ? "DTAC" : "";
      
      const finalCity = shortIsp ? `${cityTh} (${shortIsp})` : cityTh;

      ipInfo = {
        ip: data.ip,
        city: finalCity,
        region: data.region || cityTh,
        country: data.country_code || data.country || "TH",
        lat: Number(data.latitude) || 13.7563,
        lon: Number(data.longitude) || 100.5018,
        isp: rawIsp || "ISP ประเทศไทย",
      };
    }
  } catch (_) {}

  // Provider 2: ipapi.co fallback
  if (!ipInfo) {
    try {
      const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(2500) });
      const data = await res.json();
      if (data && !data.error && data.ip) {
        const cityTh = formatThaiLocation(data.city, data.region);
        ipInfo = {
          ip: data.ip,
          city: cityTh,
          region: data.region || cityTh,
          country: data.country_code || data.country_name || "TH",
          lat: Number(data.latitude) || 13.7563,
          lon: Number(data.longitude) || 100.5018,
          isp: data.org || "ISP ประเทศไทย",
        };
      }
    } catch (_) {}
  }

  // Provider 3: ipify + fallback
  if (!ipInfo) {
    try {
      const res = await fetch("https://api.ipify.org?format=json", { signal: AbortSignal.timeout(2000) });
      const data = await res.json();
      if (data && data.ip) {
        ipInfo = {
          ip: data.ip,
          city: "ประเทศไทย (เครือข่ายมือถือ/บรอดแบนด์)",
          region: "Thailand",
          country: "TH",
          lat: 13.7563,
          lon: 100.5018,
          isp: "Thailand Public IP",
        };
      }
    } catch (_) {}
  }

  if (ipInfo) {
    _cachedAdminGeo = ipInfo;
    return ipInfo;
  }

  return null;
}
