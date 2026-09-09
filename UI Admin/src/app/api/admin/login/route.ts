import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = new URL("/api/admin/data", req.url);
    const forwardHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      "user-agent": req.headers.get("user-agent") || "",
    };

    const cfIp = req.headers.get("cf-connecting-ip");
    if (cfIp) forwardHeaders["cf-connecting-ip"] = cfIp;

    const trueIp = req.headers.get("true-client-ip");
    if (trueIp) forwardHeaders["true-client-ip"] = trueIp;

    const xClientIp = req.headers.get("x-client-ip");
    if (xClientIp) forwardHeaders["x-client-ip"] = xClientIp;

    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) forwardHeaders["x-forwarded-for"] = forwarded;

    const realIp = req.headers.get("x-real-ip");
    if (realIp) forwardHeaders["x-real-ip"] = realIp;

    const forwardRes = await fetch(url.toString(), {
      method: "POST",
      headers: forwardHeaders,
      body: JSON.stringify({
        action: "admin_login",
        payload: body,
      }),
    });

    const data = await forwardRes.json();
    return NextResponse.json(data, { status: forwardRes.status });
  } catch (err: any) {
    console.error("Login API error:", err);
    return NextResponse.json({ success: false, error: err.message || "Internal server error" }, { status: 500 });
  }
}
