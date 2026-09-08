import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bucket = (formData.get("bucket") as string) || "appearance";

    if (!file) {
      return NextResponse.json({ success: false, error: "กรุณาเลือกไฟล์ภาพ" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate size (max 10MB)
    if (buffer.length > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "ขนาดไฟล์ต้องไม่เกิน 10MB" }, { status: 400 });
    }

    // Generate safe unique filename
    const originalName = file.name || "image.png";
    const extMatch = originalName.match(/\.([a-zA-Z0-9]+)$/);
    const ext = extMatch ? extMatch[1].toLowerCase() : "png";
    const filename = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const contentType = file.type || `image/${ext}`;

    // Try Supabase Storage upload
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .upload(filename, buffer, {
          contentType,
          upsert: true,
        });

      if (!error && data) {
        const { data: urlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(filename);
        return NextResponse.json({
          success: true,
          url: urlData.publicUrl,
          filename,
        });
      }
    } catch (storageErr) {
      console.warn("Supabase storage upload error, falling back to base64 data URL:", storageErr);
    }

    // Fallback: If storage bucket upload fails, use data URL so user workflow is never blocked
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${contentType};base64,${base64}`;

    return NextResponse.json({
      success: true,
      url: dataUrl,
      filename,
      note: "fallback_data_url",
    });
  } catch (err: any) {
    console.error("Upload handler error:", err);
    return NextResponse.json({ success: false, error: err.message || "อัปโหลดไฟล์ล้มเหลว" }, { status: 500 });
  }
}
