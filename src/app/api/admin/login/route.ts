import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = new URL("/api/admin/data", req.url);
    const forwardRes = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": req.headers.get("x-forwarded-for") || "",
        "x-real-ip": req.headers.get("x-real-ip") || "",
        "user-agent": req.headers.get("user-agent") || "",
      },
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
