import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface ThaiLottoResultItem {
  category?: string;
  key: string;
  label?: string;
  icon?: string;
  drawDate?: string;
  drawDateDisplay?: string;
  status: string;
  statusMessage?: string | null;
  result?: string;
  top3?: string;
  top2?: string;
  bottom3?: string;
  bottom2?: string;
  dataresult?: any;
}

export async function POST(req: NextRequest) {
  return handleSync(req);
}

export async function GET(req: NextRequest) {
  return handleSync(req);
}

async function handleSync(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetDate = searchParams.get("date"); // YYYY-MM-DD optional

    // 1. Fetch from ThaiLottoAPI
    const apiUrl = targetDate
      ? `https://thailottoapi.com/api/results?date=${targetDate}`
      : "https://thailottoapi.com/api/results";

    const apiRes = await fetch(apiUrl, {
      headers: {
        "User-Agent": "THLOTTO-System/2.0",
        Accept: "application/json",
      },
      next: { revalidate: 0 },
    });

    if (!apiRes.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to fetch from ThaiLottoAPI: ${apiRes.statusText}`,
        },
        { status: 502 }
      );
    }

    const payload = await apiRes.json();
    const categories = payload.categories || {};

    // 2. Fetch our lottery markets
    const { data: markets, error: mErr } = await supabaseAdmin
      .from("lottery_markets")
      .select("id, code, name, category, api_key, is_active, is_open");

    if (mErr) {
      return NextResponse.json({ success: false, error: mErr.message }, { status: 500 });
    }

    // Map api_key -> market & code -> market
    const marketByApiKey = new Map<string, any>();
    let speedMarket: any = null;

    markets?.forEach((m) => {
      if (m.api_key) marketByApiKey.set(m.api_key.toLowerCase(), m);
      if (m.code === "THLOTTO_15M" || m.category === "SPEED") {
        speedMarket = m;
      }
    });

    // Flatten all category items
    const allItems: ThaiLottoResultItem[] = [];
    Object.keys(categories).forEach((catKey) => {
      const items = categories[catKey]?.items || [];
      if (Array.isArray(items)) {
        items.forEach((it) => {
          allItems.push({ ...it, category: it.category || catKey });
        });
      }
    });

    const syncedResults: any[] = [];
    const skippedResults: any[] = [];

    for (const item of allItems) {
      let matchedMarket: any = null;
      let roundKey = "";

      // Check if speed lotto (liw#HHMM)
      if (item.category === "liw" || item.key.startsWith("liw#")) {
        matchedMarket = speedMarket || marketByApiKey.get("liw");
        roundKey = item.key;
      } else {
        matchedMarket = marketByApiKey.get(item.key.toLowerCase());
        roundKey = "";
      }

      // Check if market exists and is active
      if (!matchedMarket || !matchedMarket.is_active) {
        skippedResults.push({
          key: item.key,
          reason: !matchedMarket ? "market_not_found" : "market_inactive",
        });
        continue;
      }

      // Only process successful results
      if (item.status !== "success") {
        skippedResults.push({
          key: item.key,
          market: matchedMarket.name,
          reason: `status_is_${item.status}`,
        });
        continue;
      }

      // Extract draw date (YYYY-MM-DD)
      let drawDateStr = "";
      if (item.drawDate) {
        drawDateStr = item.drawDate.slice(0, 10);
      } else {
        drawDateStr = new Date().toISOString().slice(0, 10);
      }

      // Format digits
      const resultMain = (item.result || "").trim();
      let top3 = (item.top3 || "").trim();
      let top2 = (item.top2 || "").trim();
      const bottom2 = (item.bottom2 || "").trim();

      if (!top3 && resultMain.length >= 3) {
        top3 = resultMain.slice(-3);
      }
      if (!top2 && top3.length >= 2) {
        top2 = top3.slice(-2);
      }

      // 3 Front & 3 Bottom for Thai Gov lotto
      let result3Front = "";
      let result3Bottom = "";
      if (matchedMarket.code === "TH_GOV" && item.bottom3) {
        // e.g. "257, 346, 136, 740" -> front: 257, 346 | bottom: 136, 740
        const parts = item.bottom3.split(",").map((s) => s.trim());
        if (parts.length >= 4) {
          result3Front = `${parts[0]},${parts[1]}`;
          result3Bottom = `${parts[2]},${parts[3]}`;
        } else {
          result3Bottom = item.bottom3;
        }
      }

      // Upsert into lottery_results
      const resultPayload: any = {
        market_id: matchedMarket.id,
        draw_date: drawDateStr,
        round_key: roundKey,
        result_main: resultMain,
        result_top3: top3,
        result_3top: top3,
        result_2top: top2,
        result_bottom2: bottom2,
        result_2bottom: bottom2,
        result_3front: result3Front || null,
        result_3bottom: result3Bottom || null,
        result_raw: item.dataresult || item,
        status: "ANNOUNCED",
        announced_at: new Date().toISOString(),
      };

      // Check if already announced/settled with identical numbers
      const { data: existing } = await supabaseAdmin
        .from("lottery_results")
        .select("id, status, result_top3, result_bottom2")
        .eq("market_id", matchedMarket.id)
        .eq("draw_date", drawDateStr)
        .eq("round_key", roundKey)
        .maybeSingle();

      if (existing && (existing.status === "SETTLED" || existing.status === "ANNOUNCED")) {
        // Already recorded
        syncedResults.push({
          market: matchedMarket.name,
          key: item.key,
          drawDate: drawDateStr,
          status: "already_settled",
        });
        continue;
      }

      const { data: savedResult, error: saveErr } = await supabaseAdmin
        .from("lottery_results")
        .upsert(resultPayload, {
          onConflict: "market_id,draw_date,round_key",
        })
        .select("id, status")
        .single();

      if (saveErr) {
        console.error("Failed to save result:", saveErr, item.key);
        continue;
      }

      // Close the schedule if open
      await supabaseAdmin
        .from("draw_schedules")
        .update({ status: "done" })
        .eq("market_id", matchedMarket.id)
        .eq("draw_date", drawDateStr)
        .eq("round_key", roundKey);

      syncedResults.push({
        market: matchedMarket.name,
        key: item.key,
        drawDate: drawDateStr,
        roundKey,
        top3,
        top2,
        bottom2,
        resultId: savedResult?.id,
        status: "announced_and_settling",
      });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      total_api_items: allItems.length,
      synced_count: syncedResults.length,
      skipped_count: skippedResults.length,
      synced: syncedResults,
    });
  } catch (err: any) {
    console.error("Sync API Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
