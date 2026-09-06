"use client";

import * as React from "react";
import {
  MapPin, Smartphone, Monitor, Globe, ShieldCheck, Wifi, Clock,
  CheckCircle2, AlertTriangle, ExternalLink, RefreshCw
} from "lucide-react";
import { Panel, Btn } from "./primitives";
import { cn } from "@/lib/utils";

export interface GeoSessionData {
  ip: string;
  city: string;
  province?: string;
  country: string;
  lat: number;
  lon: number;
  isp: string;
  deviceType: "mobile" | "desktop" | "tablet";
  deviceModel: string;
  os: string;
  browser: string;
  isOnline: boolean;
  lastActive: string;
  loginAt: string;
}

// Default fallback coordinate: Bangkok, Thailand
const THAILAND_CITIES: Record<string, { lat: number; lon: number; isp: string }> = {
  "กรุงเทพมหานคร": { lat: 13.7563, lon: 100.5018, isp: "AIS Fibre / True Online" },
  "เชียงใหม่": { lat: 18.7883, lon: 98.9853, isp: "3BB Broadband" },
  "ชลบุรี": { lat: 13.3611, lon: 100.9847, isp: "True 5G Mobile" },
  "นครราชสีมา": { lat: 14.9799, lon: 102.0978, isp: "AIS 5G Mobile" },
  "ภูเก็ต": { lat: 7.8804, lon: 98.3923, isp: "NT Broadband" },
  "ขอนแก่น": { lat: 16.4419, lon: 102.8360, isp: "DTAC / True" },
  "สงขลา (หาดใหญ่)": { lat: 7.0084, lon: 100.4767, isp: "AIS Fibre" },
};

export function parseDeviceFromUA(ua?: string, ip?: string): Partial<GeoSessionData> {
  const s = ua || "";
  let deviceType: "mobile" | "desktop" = "desktop";
  let deviceModel = "Windows PC";
  let os = "Windows 11";
  let browser = "Google Chrome";

  if (/iPhone/i.test(s)) {
    deviceType = "mobile";
    deviceModel = "Apple iPhone";
    os = "iOS 17.5";
    browser = /CriOS/i.test(s) ? "Chrome Mobile" : "Mobile Safari";
  } else if (/iPad/i.test(s)) {
    deviceType = "mobile";
    deviceModel = "Apple iPad";
    os = "iPadOS 17";
    browser = "Mobile Safari";
  } else if (/Android/i.test(s)) {
    deviceType = "mobile";
    deviceModel = /Samsung/i.test(s) ? "Samsung Galaxy" : "Android Smartphone";
    os = "Android 14";
    browser = "Chrome Mobile";
  } else if (/Macintosh|Mac OS/i.test(s)) {
    deviceType = "desktop";
    deviceModel = "MacBook Pro / Mac";
    os = "macOS Sonoma";
    browser = /Safari/i.test(s) && !/Chrome/i.test(s) ? "Apple Safari" : "Google Chrome";
  }

  // Derive mock city if IP provided or use Bangkok
  const cities = Object.keys(THAILAND_CITIES);
  const hash = (ip || "182.232.84.112")
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const cityName = cities[hash % cities.length];
  const cityGeo = THAILAND_CITIES[cityName];

  return {
    deviceType,
    deviceModel,
    os,
    browser,
    city: cityName,
    lat: cityGeo.lat,
    lon: cityGeo.lon,
    isp: cityGeo.isp,
  };
}

export function OpenStreetMapCard({
  data,
  className,
}: {
  data?: Partial<GeoSessionData>;
  className?: string;
}) {
  const [selectedCity, setSelectedCity] = React.useState<string>(data?.city || "กรุงเทพมหานคร");
  const cityInfo = THAILAND_CITIES[selectedCity] || THAILAND_CITIES["กรุงเทพมหานคร"];
  const lat = data?.lat || cityInfo.lat;
  const lon = data?.lon || cityInfo.lon;

  // OpenStreetMap embed URL with bbox bounding box around target coordinate
  const delta = 0.05;
  const bbox = `${lon - delta}%2C${lat - delta}%2C${lon + delta}%2C${lat + delta}`;
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;

  const isOnline = data?.isOnline ?? true;
  const deviceType = data?.deviceType || "mobile";
  const deviceModel = data?.deviceModel || "Apple iPhone (iOS 17.5)";
  const browser = data?.browser || "Mobile Safari";
  const ip = data?.ip || "182.232.84.112";
  const isp = data?.isp || cityInfo.isp;

  return (
    <Panel className={cn("overflow-hidden border border-neutral-200/80 bg-white shadow-sm", className)}>
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 bg-neutral-50/60 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
            <Globe className="size-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-neutral-900">พิกัดและข้อมูลอุปกรณ์เข้าใช้งาน (Live Geo & Device)</h4>
            <p className="text-[11px] text-neutral-400">Open-Source OpenStreetMap & ตรวจสอบความปลอดภัยเซสชัน</p>
          </div>
        </div>

        {/* Live presence indicator */}
        <div className="flex items-center gap-2">
          {isOnline ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              ออนไลน์ขณะนี้
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-500">
              <span className="size-2 rounded-full bg-neutral-400" />
              ออฟไลน์
            </span>
          )}
        </div>
      </div>

      {/* 2-Column Responsive Widescreen Layout */}
      <div className="grid gap-0 lg:grid-cols-12">
        {/* Left Side: Interactive OpenStreetMap (7 cols on PC) */}
        <div className="relative min-h-[300px] border-b border-neutral-100 bg-neutral-100 lg:col-span-7 lg:border-b-0 lg:border-r">
          <iframe
            title="OpenStreetMap Location"
            src={osmUrl}
            className="h-full min-h-[320px] w-full border-0"
            loading="lazy"
          />

          {/* Map Overlay Badge */}
          <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-xl bg-white/95 px-3 py-1.5 shadow-md backdrop-blur-xs">
            <MapPin className="size-4 text-rose-500" />
            <span className="text-xs font-bold text-neutral-800">{selectedCity}, ประเทศไทย</span>
            <span className="text-[10px] font-mono text-neutral-400">({lat.toFixed(4)}, {lon.toFixed(4)})</span>
          </div>

          {/* Attribution */}
          <div className="absolute bottom-2 right-2 rounded-md bg-white/90 px-2 py-0.5 text-[9px] text-neutral-500 shadow-2xs backdrop-blur-xs">
            © <a href="https://www.openstreetmap.org" target="_blank" rel="noreferrer" className="underline hover:text-neutral-900">OpenStreetMap</a> Contributors (Open Source)
          </div>
        </div>

        {/* Right Side: Forensics & Device Specs (5 cols on PC) */}
        <div className="flex flex-col justify-between p-5 lg:col-span-5 bg-linear-to-br from-white to-neutral-50/40">
          <div className="space-y-4">
            {/* Quick stats grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-2xl border border-neutral-100 bg-white p-3 shadow-2xs">
                <p className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-400">
                  {deviceType === "mobile" ? <Smartphone className="size-3.5 text-blue-500" /> : <Monitor className="size-3.5 text-blue-500" />}
                  อุปกรณ์ที่ใช้งาน
                </p>
                <p className="mt-1 font-bold text-neutral-900 text-xs truncate">{deviceModel}</p>
                <p className="text-[10px] text-neutral-400">{browser}</p>
              </div>

              <div className="rounded-2xl border border-neutral-100 bg-white p-3 shadow-2xs">
                <p className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-400">
                  <Wifi className="size-3.5 text-emerald-500" />
                  เครือข่าย & IP
                </p>
                <p className="mt-1 font-mono font-bold text-xs text-neutral-900 truncate">{ip}</p>
                <p className="text-[10px] truncate text-emerald-600 font-medium">{isp}</p>
              </div>
            </div>

            {/* Forensics Checklist */}
            <div className="rounded-2xl border border-neutral-100 bg-white p-3.5 space-y-2.5 shadow-2xs">
              <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">การประเมินความปลอดภัยของเซสชัน</p>

              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-neutral-600">
                  <ShieldCheck className="size-3.5 text-emerald-500" /> ระดับความเสี่ยง
                </span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                  ปลอดภัย (ปกติ)
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-neutral-600">
                  <Clock className="size-3.5 text-neutral-400" /> เวลาเข้าสู่ระบบล่าสุด
                </span>
                <span className="font-mono text-neutral-800 text-[11px]">
                  {data?.loginAt || "วันนี้ 02:15 น."}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-neutral-600">
                  <MapPin className="size-3.5 text-neutral-400" /> เมือง/จังหวัดที่ระบุ
                </span>
                <span className="font-medium text-neutral-800 text-[11px]">
                  {selectedCity}
                </span>
              </div>
            </div>

            {/* City Quick Switcher for Simulation */}
            <div>
              <p className="text-[11px] font-medium text-neutral-400 mb-1.5">จุดพิกัดในประเทศไทย (OpenStreetMap Pin):</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(THAILAND_CITIES).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedCity(c)}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors",
                      selectedCity === c
                        ? "bg-neutral-900 text-white shadow-2xs"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
            <span>ฐานข้อมูล OpenStreetMap (OSM)</span>
            <span className="text-emerald-600 font-medium">SSL Encrypted Session</span>
          </div>
        </div>
      </div>
    </Panel>
  );
}
