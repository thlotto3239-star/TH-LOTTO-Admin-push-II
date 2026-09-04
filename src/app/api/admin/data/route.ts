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
          { data: allApprovedDeposits },
          { data: allBets },
          { data: recentBets },
          { data: recentDeposits },
        ] = await Promise.all([
          supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }).eq("is_admin", false),
          supabaseAdmin.from("bets").select("*", { count: "exact", head: true }),
          supabaseAdmin.from("deposit_requests").select("*", { count: "exact", head: true }).eq("status", "PENDING"),
          supabaseAdmin.from("withdraw_requests").select("*", { count: "exact", head: true }).eq("status", "PENDING"),
          supabaseAdmin.from("deposit_requests").select("amount, created_at").eq("status", "APPROVED"),
          supabaseAdmin.from("bets").select("amount, actual_payout, status, created_at"),
          supabaseAdmin.from("bets").select(`
            *,
            profiles!bets_profile_fkey (full_name, member_id),
            lottery_markets!bets_market_id_fkey (name, code, color)
          `).order("created_at", { ascending: false }).limit(20),
          supabaseAdmin.from("deposit_requests").select(`
            *,
            profiles!deposit_requests_profile_fkey (full_name, member_id, bank_name, bank_account_number, bank_account_name)
          `).order("created_at", { ascending: false }).limit(20),
        ]);

        const totalDeposit = (allApprovedDeposits || []).reduce((sum, d) => sum + Number(d.amount || 0), 0);
        const totalBet = (allBets || []).reduce((sum, b) => sum + Number(b.amount || 0), 0);
        const totalPayout = (allBets || []).filter((b) => b.status === "WON").reduce((sum, b) => sum + Number(b.actual_payout || 0), 0);

        return NextResponse.json({
          success: true,
          data: {
            memberCount: memberCount || 0,
            betCount: betCount || 0,
            depositPendingCount: depositPendingCount || 0,
            withdrawPendingCount: withdrawPendingCount || 0,
            totalDeposit,
            totalBet,
            totalPayout,
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
          .select(`
            id,
            user_id,
            amount,
            slip_url,
            status,
            admin_note,
            created_at,
            updated_at,
            promo_code,
            approved_by,
            approved_at,
            profiles!deposit_requests_profile_fkey (
              full_name,
              member_id,
              phone,
              bank_name,
              bank_account_number,
              bank_account_name
            )
          `)
          .order("created_at", { ascending: false });
        if (error) throw error;
        return NextResponse.json({ success: true, data });
      }

      case "withdrawals": {
        const { data, error } = await supabaseAdmin
          .from("withdraw_requests")
          .select(`
            id,
            user_id,
            amount,
            status,
            admin_note,
            created_at,
            updated_at,
            approved_by,
            approved_at,
            profiles!withdraw_requests_profile_fkey (
              full_name,
              member_id,
              phone,
              bank_name,
              bank_account_number,
              bank_account_name
            )
          `)
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
              id,
              name,
              code,
              color,
              category
            )
          `)
          .order("draw_date", { ascending: false })
          .limit(100);
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

      case "settings": {
        const { data, error } = await supabaseAdmin.from("settings").select("*");
        if (error) throw error;
        const dict: Record<string, string> = {};
        for (const row of data || []) {
          if (row.key) dict[row.key] = row.value ?? "";
        }
        return NextResponse.json({ success: true, data: dict, raw: data });
      }

      case "table-stats": {
        const tableNames = [
          { key: "draw_schedules", name: "ตารางออกรางวัล (draw_schedules)" },
          { key: "instant_draws", name: "ผลหวยหนึ่งนาที (instant_draws)" },
          { key: "bets", name: "โพยหวย (bets)" },
          { key: "transactions", name: "ธุรกรรมการเงิน (transactions)" },
          { key: "admin_notifications", name: "การแจ้งเตือนแอดมิน (admin_notifications)" },
          { key: "payout_rates", name: "อัตราจ่ายรางวัล (payout_rates)" },
          { key: "lottery_results", name: "ผลรางวัลหวย (lottery_results)" },
          { key: "profiles", name: "สมาชิกและผู้ใช้ (profiles)" },
          { key: "wallets", name: "กระเป๋าเงินสมาชิก (wallets)" },
          { key: "settings", name: "ตั้งค่าระบบ (settings)" },
          { key: "notifications", name: "การแจ้งเตือนผู้ใช้ (notifications)" },
          { key: "lucky_wheel_spins", name: "ประวัติหมุนวงล้อ (lucky_wheel_spins)" },
          { key: "lottery_markets", name: "ตลาดหวย (lottery_markets)" },
          { key: "login_attempts", name: "บันทึกการเข้าสู่ระบบ (login_attempts)" },
          { key: "instant_bet_types", name: "ประเภทแทงหวยไว (instant_bet_types)" },
          { key: "banks", name: "ธนาคาร (banks)" },
          { key: "lucky_wheel_prizes", name: "รางวัลวงล้อ (lucky_wheel_prizes)" },
          { key: "announcements", name: "ประกาศระบบ (announcements)" },
          { key: "sliders", name: "สไลเดอร์แบนเนอร์ (sliders)" },
          { key: "promotions", name: "โปรโมชั่น (promotions)" },
          { key: "deposit_requests", name: "รายการฝากเงิน (deposit_requests)" },
          { key: "withdraw_requests", name: "รายการถอนเงิน (withdraw_requests)" },
          { key: "articles", name: "บทความ (articles)" },
          { key: "restricted_numbers", name: "เลขอั้น (restricted_numbers)" },
        ];

        const counts = await Promise.all(
          tableNames.map(async (t) => {
            const { count } = await supabaseAdmin.from(t.key).select("*", { count: "exact", head: true });
            return {
              name: t.name,
              table: t.key,
              rows: count || 0,
              size: `${(((count || 0) * 0.4) + 1).toFixed(1)} KB`,
            };
          })
        );

        return NextResponse.json({ success: true, data: counts });
      }

      case "member-detail": {
        const id = searchParams.get("id");
        if (!id) {
          return NextResponse.json({ success: false, error: "Missing member id" }, { status: 400 });
        }
        const { data: profile, error: pErr } = await supabaseAdmin
          .from("profiles")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (pErr) throw pErr;
        if (!profile) {
          return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 });
        }

        const [
          { data: wallet },
          { data: memberBets },
          { data: memberTxs },
          { data: memberDeposits },
          { data: memberWithdraws },
          { data: memberLogins },
        ] = await Promise.all([
          supabaseAdmin.from("wallets").select("*").eq("user_id", id).maybeSingle(),
          supabaseAdmin
            .from("bets")
            .select(`
              *,
              lottery_markets!bets_market_id_fkey (name, code, color)
            `)
            .eq("user_id", id)
            .order("created_at", { ascending: false })
            .limit(50),
          supabaseAdmin
            .from("transactions")
            .select("*")
            .eq("user_id", id)
            .order("created_at", { ascending: false })
            .limit(50),
          supabaseAdmin
            .from("deposit_requests")
            .select("*")
            .eq("user_id", id)
            .order("created_at", { ascending: false }),
          supabaseAdmin
            .from("withdraw_requests")
            .select("*")
            .eq("user_id", id)
            .order("created_at", { ascending: false }),
          profile.phone
            ? supabaseAdmin
                .from("login_attempts")
                .select("*")
                .eq("phone", profile.phone)
                .order("attempted_at", { ascending: false })
                .limit(20)
            : Promise.resolve({ data: [] }),
        ]);

        return NextResponse.json({
          success: true,
          data: {
            profile,
            wallet,
            bets: memberBets || [],
            transactions: memberTxs || [],
            deposits: memberDeposits || [],
            withdrawals: memberWithdraws || [],
            logins: memberLogins || [],
          },
        });
      }

      case "admins": {
        const [
          { data: adminProfiles, error: aErr },
          { data: roles },
        ] = await Promise.all([
          supabaseAdmin.from("profiles").select("*").eq("is_admin", true).order("created_at", { ascending: true }),
          supabaseAdmin.from("admin_roles").select("*").order("created_at", { ascending: true }),
        ]);
        if (aErr) throw aErr;
        return NextResponse.json({
          success: true,
          data: {
            admins: adminProfiles || [],
            roles: roles || [],
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

      case "update_deposit": {
        const { id, status, admin_note } = payload;
        const { data: dep, error: depErr } = await supabaseAdmin
          .from("deposit_requests")
          .select("user_id, amount, status")
          .eq("id", id)
          .single();
        if (depErr) throw depErr;

        const { data, error } = await supabaseAdmin
          .from("deposit_requests")
          .update({
            status,
            admin_note,
            approved_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select();
        if (error) throw error;

        if (status === "APPROVED" && dep.status !== "APPROVED") {
          const { data: w } = await supabaseAdmin.from("wallets").select("balance").eq("user_id", dep.user_id).single();
          if (w) {
            const newBal = Number(w.balance) + Number(dep.amount);
            await supabaseAdmin.from("wallets").update({ balance: newBal, updated_at: new Date().toISOString() }).eq("user_id", dep.user_id);
            await supabaseAdmin.from("transactions").insert([{
              user_id: dep.user_id,
              type: "DEPOSIT",
              amount: Number(dep.amount),
              status: "COMPLETED",
              reference_id: id,
              note: admin_note || "ฝากเงินสำเร็จ (อนุมัติผ่านแผงควบคุม)",
              balance_after: newBal,
            }]).catch(() => {});
          }
        }
        return NextResponse.json({ success: true, data });
      }

      case "update_member": {
        const { id, full_name, phone, bank_name, bank_account_number, bank_account_name, status, vip_level } = payload;
        const { data, error } = await supabaseAdmin
          .from("profiles")
          .update({
            full_name,
            phone,
            bank_name,
            bank_account_number,
            bank_account_name,
            status,
            vip_level: String(vip_level),
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select();
        if (error) throw error;
        return NextResponse.json({ success: true, data });
      }

      case "adjust_wallet": {
        const { user_id, delta, note } = payload;
        const { data: w, error: wErr } = await supabaseAdmin
          .from("wallets")
          .select("balance")
          .eq("user_id", user_id)
          .single();
        if (wErr) throw wErr;
        const newBal = Math.max(0, Number(w.balance) + Number(delta));
        const { data, error } = await supabaseAdmin
          .from("wallets")
          .update({ balance: newBal, updated_at: new Date().toISOString() })
          .eq("user_id", user_id)
          .select();
        if (error) throw error;
        await supabaseAdmin.from("transactions").insert([{
          user_id,
          type: delta > 0 ? "ADMIN_ADJUST_ADD" : "ADMIN_ADJUST_SUB",
          amount: Math.abs(delta),
          status: "COMPLETED",
          note: note || (delta > 0 ? "เพิ่มยอดกระเป๋าโดยแอดมิน" : "ลดยอดกระเป๋าโดยแอดมิน"),
          balance_after: newBal,
        }]).catch(() => {});
        return NextResponse.json({ success: true, data, balance: newBal });
      }

      case "record_result": {
        const { market_id, draw_date, result_main, result_3top, result_2top, result_2bottom, result_3front, result_3bottom } = payload;
        const { data, error } = await supabaseAdmin
          .from("lottery_results")
          .upsert([{
            market_id,
            draw_date,
            result_main,
            result_3top,
            result_2top,
            result_2bottom,
            result_3front,
            result_3bottom,
            status: "SETTLED",
            announced_at: new Date().toISOString(),
          }], { onConflict: "market_id,draw_date" })
          .select();
        if (error) throw error;
        return NextResponse.json({ success: true, data });
      }

      case "update_withdrawal": {
        const { id, status, admin_note } = payload;
        const { data: wReq, error: wErr } = await supabaseAdmin
          .from("withdraw_requests")
          .select("*")
          .eq("id", id)
          .single();
        if (wErr) throw wErr;

        const { data, error } = await supabaseAdmin
          .from("withdraw_requests")
          .update({
            status,
            admin_note,
            approved_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select();
        if (error) throw error;

        if (status === "REJECTED" && wReq.status === "PENDING") {
          const { data: wal } = await supabaseAdmin.from("wallets").select("balance").eq("user_id", wReq.user_id).single();
          if (wal) {
            const newBal = Number(wal.balance) + Number(wReq.amount);
            await supabaseAdmin.from("wallets").update({ balance: newBal }).eq("user_id", wReq.user_id);
            await supabaseAdmin.from("transactions").insert([{
              user_id: wReq.user_id,
              type: "REFUND_WITHDRAW",
              amount: Number(wReq.amount),
              status: "COMPLETED",
              reference_id: id,
              note: admin_note || "คืนเงินจากการปฏิเสธคำขอถอน",
              balance_after: newBal,
            }]).catch(() => {});
          }
        }
        return NextResponse.json({ success: true, data });
      }

      case "update_admin_user": {
        const { id, full_name, phone, admin_role, status } = payload;
        const { data, error } = await supabaseAdmin
          .from("profiles")
          .update({ full_name, phone, admin_role, status, updated_at: new Date().toISOString() })
          .eq("id", id)
          .select();
        if (error) throw error;
        return NextResponse.json({ success: true, data });
      }

      case "create_admin_user": {
        const { full_name, phone, admin_role } = payload;
        const { data, error } = await supabaseAdmin
          .from("profiles")
          .insert([{
            full_name,
            phone,
            is_admin: true,
            admin_role: admin_role || "admin",
            status: "active",
          }])
          .select();
        if (error) throw error;
        return NextResponse.json({ success: true, data });
      }

      case "update_setting": {
        const { key, value } = payload;
        const { data, error } = await supabaseAdmin
          .from("settings")
          .upsert([{ key, value: String(value), updated_at: new Date().toISOString() }], { onConflict: "key" })
          .select();
        if (error) throw error;
        return NextResponse.json({ success: true, data });
      }

      case "batch_update_settings": {
        const { settings } = payload;
        const upsertRows: { key: string; value: string; updated_at: string }[] = [];
        if (Array.isArray(settings)) {
          for (const item of settings) {
            if (item.key) upsertRows.push({ key: item.key, value: String(item.value ?? ""), updated_at: new Date().toISOString() });
          }
        } else if (typeof settings === "object" && settings !== null) {
          for (const [k, v] of Object.entries(settings)) {
            upsertRows.push({ key: k, value: String(v ?? ""), updated_at: new Date().toISOString() });
          }
        }
        if (upsertRows.length > 0) {
          const { error } = await supabaseAdmin.from("settings").upsert(upsertRows, { onConflict: "key" });
          if (error) throw error;
        }
        return NextResponse.json({ success: true, count: upsertRows.length });
      }

      default:
        return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
    }
  } catch (err: any) {
    console.error("[API POST ERROR]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
