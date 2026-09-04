import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const resource = searchParams.get("resource") || "dashboard";

  try {
    switch (resource) {
      case "dashboard": {
        const [
          { count: memberCount },
          { count: betCount },
          { count: depositPendingCount },
          { count: withdrawPendingCount },
          { data: recentBets },
          { data: recentDeposits },
        ] = await Promise.all([
          supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }).eq("is_admin", false),
          supabaseAdmin.from("bets").select("*", { count: "exact", head: true }),
          supabaseAdmin.from("deposit_requests").select("*", { count: "exact", head: true }).eq("status", "PENDING"),
          supabaseAdmin.from("withdraw_requests").select("*", { count: "exact", head: true }).eq("status", "PENDING"),
          supabaseAdmin.from("bets").select("*").order("created_at", { ascending: false }).limit(5),
          supabaseAdmin.from("deposit_requests").select("*").order("created_at", { ascending: false }).limit(5),
        ]);

        return NextResponse.json({
          success: true,
          data: {
            memberCount: memberCount || 0,
            betCount: betCount || 0,
            depositPendingCount: depositPendingCount || 0,
            withdrawPendingCount: withdrawPendingCount || 0,
            recentBets: recentBets || [],
            recentDeposits: recentDeposits || [],
          },
        });
      }

      case "markets": {
        const { data, error } = await supabaseAdmin
          .from("lottery_markets")
          .select("*")
          .order("display_order", { ascending: true, nullsFirst: false });
        if (error) throw error;
        return NextResponse.json({ success: true, data });
      }

      case "instant-bet-types": {
        const { data, error } = await supabaseAdmin
          .from("instant_bet_types")
          .select("*")
          .order("display_order", { ascending: true });
        if (error) throw error;
        return NextResponse.json({ success: true, data });
      }

      case "restricted-numbers": {
        const { data, error } = await supabaseAdmin
          .from("restricted_numbers")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return NextResponse.json({ success: true, data });
      }

      case "bets": {
        const limit = parseInt(searchParams.get("limit") || "50", 10);
        const { data, error } = await supabaseAdmin
          .from("bets")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(limit);
        if (error) throw error;
        return NextResponse.json({ success: true, data });
      }

      case "deposits": {
        const { data, error } = await supabaseAdmin
          .from("deposit_requests")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return NextResponse.json({ success: true, data });
      }

      case "withdrawals": {
        const { data, error } = await supabaseAdmin
          .from("withdraw_requests")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return NextResponse.json({ success: true, data });
      }

      case "members": {
        const { data, error } = await supabaseAdmin
          .from("profiles")
          .select(`
            id,
            member_id,
            full_name,
            phone,
            vip_level,
            bank_name,
            bank_account_number,
            bank_account_name,
            is_admin,
            admin_role,
            status,
            created_at,
            wallets (
              balance,
              commission_balance
            )
          `)
          .order("created_at", { ascending: false });
        if (error) throw error;
        return NextResponse.json({ success: true, data });
      }

      case "results": {
        const { data, error } = await supabaseAdmin
          .from("lottery_results")
          .select(`
            id,
            market_id,
            draw_date,
            result_main,
            result_3top,
            result_2top,
            result_2bottom,
            result_3front,
            result_3bottom,
            status,
            announced_at,
            lottery_markets (
              name,
              code
            )
          `)
          .order("draw_date", { ascending: false })
          .limit(50);
        if (error) throw error;
        return NextResponse.json({ success: true, data });
      }

      case "content": {
        const [
          { data: sliders },
          { data: promotions },
          { data: articles },
          { data: announcements },
          { data: banks },
          { data: wheelPrizes },
          { data: settings },
        ] = await Promise.all([
          supabaseAdmin.from("sliders").select("*").order("display_order", { ascending: true }),
          supabaseAdmin.from("promotions").select("*").order("id", { ascending: true }),
          supabaseAdmin.from("articles").select("*").order("display_order", { ascending: true }),
          supabaseAdmin.from("announcements").select("*").order("display_order", { ascending: true }),
          supabaseAdmin.from("banks").select("*").order("id", { ascending: true }),
          supabaseAdmin.from("lucky_wheel_prizes").select("*").order("slot_index", { ascending: true }),
          supabaseAdmin.from("settings").select("*"),
        ]);

        return NextResponse.json({
          success: true,
          data: {
            sliders: sliders || [],
            promotions: promotions || [],
            articles: articles || [],
            announcements: announcements || [],
            banks: banks || [],
            wheelPrizes: wheelPrizes || [],
            settings: settings || [],
          },
        });
      }

      default:
        return NextResponse.json({ success: false, error: "Invalid resource" }, { status: 400 });
    }
  } catch (err: any) {
    console.error(`[API ERROR] resource=${resource}:`, err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    switch (action) {
      case "update_market": {
        const { id, close_minutes_before, stream_url, is_open, is_active } = payload;
        const { data, error } = await supabaseAdmin
          .from("lottery_markets")
          .update({ close_minutes_before, stream_url, is_open, is_active })
          .eq("id", id)
          .select();
        if (error) throw error;
        return NextResponse.json({ success: true, data });
      }

      case "update_instant_bet_type": {
        const { id, rate, is_active } = payload;
        const { data, error } = await supabaseAdmin
          .from("instant_bet_types")
          .update({ rate, is_active })
          .eq("id", id)
          .select();
        if (error) throw error;
        return NextResponse.json({ success: true, data });
      }

      case "upsert_restricted_number": {
        const { market_id, bet_type, number, max_amount, payout_rate, draw_date, note } = payload;
        const { data, error } = await supabaseAdmin
          .from("restricted_numbers")
          .insert([{ market_id, bet_type, number, max_amount, payout_rate, draw_date, note }])
          .select();
        if (error) throw error;
        return NextResponse.json({ success: true, data });
      }

      case "delete_restricted_number": {
        const { id } = payload;
        const { error } = await supabaseAdmin
          .from("restricted_numbers")
          .delete()
          .eq("id", id);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
    }
  } catch (err: any) {
    console.error("[API POST ERROR]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
