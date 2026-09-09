// client-geo.ts - Browser-side GPS & Public IP resolver for Admin UI
export interface ClientGeoResult {
  ip?: string;
  city?: string;
  region?: string;
  country?: string;
  lat?: number;
  lon?: number;
  isp?: string;
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

  // 1. Try silent fast GPS (1.5s)
  let gpsCoords: { lat: number; lon: number } | null = null;
  if (navigator.geolocation) {
    gpsCoords = await new Promise((resolve) => {
      const timer = setTimeout(() => resolve(null), 1500);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(timer);
          resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        },
        () => {
          clearTimeout(timer);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 1500, maximumAge: 600000 }
      );
    });
  }

  // 2. Fetch public IP via ipwho.is or fallback
  let ipInfo: ClientGeoResult | null = null;
  try {
    const res = await fetch("https://ipwho.is/", { signal: AbortSignal.timeout(2000) });
    const data = await res.json();
    if (data && data.success !== false) {
      ipInfo = {
        ip: data.ip,
        city: data.city,
        region: data.region,
        country: data.country_code || "TH",
        lat: data.latitude,
        lon: data.longitude,
        isp: data.connection?.isp || data.connection?.org,
      };
    }
  } catch (_) {}

  if (!ipInfo) {
    try {
      const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(2000) });
      const data = await res.json();
      if (data && !data.error) {
        ipInfo = {
          ip: data.ip,
          city: data.city,
          region: data.region,
          country: data.country_code || "TH",
          lat: data.latitude,
          lon: data.longitude,
          isp: data.org,
        };
      }
    } catch (_) {}
  }

  if (gpsCoords) {
    const result: ClientGeoResult = {
      ip: ipInfo?.ip || "127.0.0.1",
      city: ipInfo?.city ? `${ipInfo.city} [GPS]` : "พิกัดอุปกรณ์ [GPS]",
      region: ipInfo?.region || "",
      country: ipInfo?.country || "TH",
      lat: gpsCoords.lat,
      lon: gpsCoords.lon,
      isp: ipInfo?.isp || "GPS Device Location",
    };
    _cachedAdminGeo = result;
    return result;
  }

  if (ipInfo) {
    _cachedAdminGeo = ipInfo;
    return ipInfo;
  }

  return null;
}
