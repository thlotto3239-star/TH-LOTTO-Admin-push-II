import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { parseUserAgent, resolveIpGeo } from "@/lib/geo-device";

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
          { data: allApprovedWithdrawals },
          { data: allBets },
          { data: topBettorBets },
          { data: recentBets },
          { data: recentDeposits },
        ] = await Promise.all([
          supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }).eq("is_admin", false),
          supabaseAdmin.from("bets").select("*", { count: "exact", head: true }),
          supabaseAdmin.from("deposit_requests").select("*", { count: "exact", head: true }).eq("status", "PENDING"),
          supabaseAdmin.from("withdraw_requests").select("*", { count: "exact", head: true }).eq("status", "PENDING"),
          supabaseAdmin.from("deposit_requests").select("amount, created_at").eq("status", "APPROVED"),
          supabaseAdmin.from("withdraw_requests").select("amount, created_at").eq("status", "APPROVED"),
          supabaseAdmin.from("bets").select("amount, payout_amount, status, created_at"),
          supabaseAdmin.from("bets").select("amount, user_id, created_at, profiles!bets_profile_fkey (id, full_name, member_id, avatar_url)"),
          supabaseAdmin.from("bets").select(`
            *,
            profiles!bets_profile_fkey (full_name, member_id, avatar_url),
            lottery_markets!bets_market_id_fkey (name, code, category, logo_url)
          `).order("created_at", { ascending: false }).limit(30),
          supabaseAdmin.from("deposit_requests").select(`
            *,
            profiles!deposit_requests_profile_fkey (full_name, member_id, avatar_url, bank_name, bank_account_number, bank_account_name)
          `).order("created_at", { ascending: false }).limit(30),
        ]);

        const totalDeposit = (allApprovedDeposits || []).reduce((sum, d) => sum + Number(d.amount || 0), 0);
        const totalWithdraw = (allApprovedWithdrawals || []).reduce((sum, w) => sum + Number(w.amount || 0), 0);
        const totalBet = (allBets || []).reduce((sum, b) => sum + Number(b.amount || 0), 0);
        const totalPayout = (allBets || []).filter((b) => b.status === "WON").reduce((sum, b) => sum + Number(b.payout_amount || 0), 0);

        const now = new Date();
        const todayYmd = now.toISOString().slice(0, 10);
        const todayDeposit = (allApprovedDeposits || []).filter((d) => (d.created_at || "").startsWith(todayYmd)).reduce((s, d) => s + Number(d.amount || 0), 0);
        const todayWithdraw = (allApprovedWithdrawals || []).filter((w) => (w.created_at || "").startsWith(todayYmd)).reduce((s, w) => s + Number(w.amount || 0), 0);
        const todayBet = (allBets || []).filter((b) => (b.created_at || "").startsWith(todayYmd)).reduce((s, b) => s + Number(b.amount || 0), 0);
        const todayPayout = (allBets || []).filter((b) => b.status === "WON" && (b.created_at || "").startsWith(todayYmd)).reduce((s, b) => s + Number(b.payout_amount || 0), 0);

        // Calculate real Top 10 Bettors from Supabase bets & profiles by time period
        function buildTopBettors(records: any[]) {
          const userMap = new Map<string, { user_id: string; name: string; member_id: string; avatar_url: string | null; total_bet: number; bet_count: number }>();
          records.forEach((b: any) => {
            const uid = b.user_id || "unknown";
            const current = userMap.get(uid) || {
              user_id: uid,
              name: b.profiles?.full_name || `สมาชิก #${uid.slice(0, 6)}`,
              member_id: b.profiles?.member_id || uid.slice(0, 8).toUpperCase(),
              avatar_url: b.profiles?.avatar_url || null,
              total_bet: 0,
              bet_count: 0,
            };
            current.total_bet += Number(b.amount || 0);
            current.bet_count += 1;
            userMap.set(uid, current);
          });
          return Array.from(userMap.values())
            .sort((a, b) => b.total_bet - a.total_bet)
            .slice(0, 10)
            .map((t, index) => ({ rank: index + 1, ...t }));
        }

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        const sevenDaysIso = sevenDaysAgo.toISOString();

        const topBettorsAll = buildTopBettors(topBettorBets || []);
        const topBettors7d = buildTopBettors((topBettorBets || []).filter((b: any) => (b.created_at || "") >= sevenDaysIso));
        const topBettorsToday = buildTopBettors((topBettorBets || []).filter((b: any) => (b.created_at || "").startsWith(todayYmd)));
        const topBettors = topBettorsAll;

        // Calculate real 7-Day Chart
        const daysMap = new Map<string, { date: string; DEPOSIT: number; WITHDRAW: number; BET: number }>();
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(now.getDate() - i);
          const ymd = d.toISOString().slice(0, 10);
          const displayDate = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
          daysMap.set(ymd, { date: displayDate, DEPOSIT: 0, WITHDRAW: 0, BET: 0 });
        }

        (allApprovedDeposits || []).forEach((d: any) => {
          const ymd = (d.created_at || "").slice(0, 10);
          const entry = daysMap.get(ymd);
          if (entry) entry.DEPOSIT += Number(d.amount || 0);
        });

        (allApprovedWithdrawals || []).forEach((w: any) => {
          const ymd = (w.created_at || "").slice(0, 10);
          const entry = daysMap.get(ymd);
          if (entry) entry.WITHDRAW += Number(w.amount || 0);
        });

        (allBets || []).forEach((b: any) => {
          const ymd = (b.created_at || "").slice(0, 10);
          const entry = daysMap.get(ymd);
          if (entry) entry.BET += Number(b.amount || 0);
        });

        const weeklyChart = Array.from(daysMap.values());

        return NextResponse.json({
          success: true,
          data: {
            memberCount: memberCount || 0,
            betCount: betCount || 0,
            depositPendingCount: depositPendingCount || 0,
            withdrawPendingCount: withdrawPendingCount || 0,
            totalDeposit,
            totalWithdraw,
            totalBet,
            totalPayout,
            todayDeposit,
            todayWithdraw,
            todayBet,
            topBettors,
            topBettorsGrouped: {
              today: topBettorsToday,
              week: topBettors7d,
              all: topBettorsAll,
            },
            weeklyChart,
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

      case "instant-stats": {
        const [
          { data: statsData },
          { count: totalDrawsToday },
          { data: betsToday },
        ] = await Promise.all([
          supabaseAdmin.rpc("admin_get_instant_stats"),
          supabaseAdmin.from("instant_draws").select("*", { count: "exact", head: true }),
          supabaseAdmin.from("instant_bets").select("amount, payout_amount, status, created_at"),
        ]);

        const rpcStats = (statsData && statsData[0]) || {};
        const todayBets = betsToday || [];
        const totalBetToday = todayBets.reduce((sum, b) => sum + Number(b.amount || 0), 0);
        const totalPayoutToday = todayBets.filter((b) => b.status === "WON").reduce((sum, b) => sum + Number(b.payout_amount || 0), 0);

        // Hourly chart (last 8 hours)
        const now = new Date();
        const hourlyMap = new Map<string, { hour: string; BET: number; PAYOUT: number }>();
        for (let i = 7; i >= 0; i--) {
          const h = new Date(now.getTime() - i * 3600 * 1000);
          const hourLabel = `${String(h.getHours()).padStart(2, "0")}:00`;
          hourlyMap.set(hourLabel, { hour: hourLabel, BET: 0, PAYOUT: 0 });
        }
        todayBets.forEach((b: any) => {
          const d = new Date(b.created_at);
          const hLabel = `${String(d.getHours()).padStart(2, "0")}:00`;
          const entry = hourlyMap.get(hLabel);
          if (entry) {
            entry.BET += Number(b.amount || 0);
            if (b.status === "WON") entry.PAYOUT += Number(b.payout_amount || 0);
          }
        });

        return NextResponse.json({
          success: true,
          data: {
            total_draws_today: totalDrawsToday || Number(rpcStats.total_draws || 0),
            total_bets_today: todayBets.length || Number(rpcStats.total_bets || 0),
            total_bet_amount_today: totalBetToday || Number(rpcStats.total_wagers || 0),
            total_payout_today: totalPayoutToday || Number(rpcStats.total_payouts || 0),
            active_players_today: Number(rpcStats.active_bet_types || 9),
            hourly: Array.from(hourlyMap.values()),
            stats: rpcStats,
          },
        });
      }

      case "instant-draws": {
        const limit = parseInt(searchParams.get("limit") || "50", 10);
        const { data: rpcDraws, error: rpcErr } = await supabaseAdmin.rpc("admin_get_instant_draws", { p_limit: limit });
        if (!rpcErr && rpcDraws && rpcDraws.length > 0) {
          return NextResponse.json({ success: true, data: rpcDraws });
        }
        const { data, error } = await supabaseAdmin
          .from("instant_draws")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(limit);
        if (error) throw error;
        return NextResponse.json({ success: true, data });
      }

      case "instant-bets": {
        const limit = parseInt(searchParams.get("limit") || "50", 10);
        const { data, error } = await supabaseAdmin
          .from("instant_bets")
          .select(`
            *,
            profiles (id, full_name, username, phone, member_id, avatar_url)
          `)
          .order("created_at", { ascending: false })
          .limit(limit);
        if (error) {
          const { data: rpcBets } = await supabaseAdmin.rpc("admin_get_instant_bets", { p_draw_id: null, p_limit: limit, p_offset: 0 });
          return NextResponse.json({ success: true, data: rpcBets || [] });
        }
        return NextResponse.json({ success: true, data: data || [] });
      }

      case "restricted-numbers": {
        const { data, error } = await supabaseAdmin
          .from("restricted_numbers")
          .select(`
            *,
            lottery_markets!restricted_numbers_market_id_fkey (id, name, code, category, logo_url, image_url)
          `)
          .order("created_at", { ascending: false });
        if (error) throw error;
        return NextResponse.json({ success: true, data });
      }

      case "counts": {
        const [
          { count: pendingDeposits },
          { count: pendingWithdrawals },
          { count: pendingKyc },
          { count: pendingResults },
          { count: unreadNotifs },
          { data: rawNotifs },
        ] = await Promise.all([
          supabaseAdmin.from("deposit_requests").select("*", { count: "exact", head: true }).eq("status", "PENDING"),
          supabaseAdmin.from("withdraw_requests").select("*", { count: "exact", head: true }).eq("status", "PENDING"),
          supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }).eq("status", "PENDING"),
          supabaseAdmin.from("draw_schedules").select("*", { count: "exact", head: true }).eq("status", "UPCOMING"),
          supabaseAdmin.from("admin_notifications").select("*", { count: "exact", head: true }).eq("is_read", false),
          supabaseAdmin.from("admin_notifications").select("*").order("created_at", { ascending: false }).limit(20),
        ]);

        const notifications = (rawNotifs || []).map((n) => {
          let title = "การแจ้งเตือนระบบ";
          let type: "info" | "warning" | "success" = "info";
          let target_page: string | undefined = undefined;

          if (n.type === "DEPOSIT") {
            title = "รายการฝากเงิน";
            type = "warning";
            target_page = "deposits";
          } else if (n.type === "WITHDRAW") {
            title = "รายการถอนเงิน";
            type = "warning";
            target_page = "withdrawals";
          } else if (n.type === "TURNOVER_COMPLETE") {
            title = "สมาชิกทำเทิร์นครบ";
            type = "success";
            target_page = "members";
          } else if (n.type === "LOTTERY_RESULT") {
            title = "ผลรางวัลออกแล้ว";
            type = "success";
            target_page = "results";
          }

          if (n.link_url) {
            target_page = n.link_url.replace(/^\//, "");
          }

          const dateObj = new Date(n.created_at);
          const timeStr = dateObj.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });

          return {
            id: n.id,
            title,
            message: n.message || "",
            type,
            date: timeStr,
            read: Boolean(n.is_read),
            target_page,
          };
        });

        return NextResponse.json({
          success: true,
          data: {
            dep: pendingDeposits || 0,
            wth: pendingWithdrawals || 0,
            kyc: pendingKyc || 0,
            res: pendingResults || 0,
            unread_notifications: unreadNotifs || 0,
            notifications,
          },
        });
      }

      case "results": {
        const { data, error } = await supabaseAdmin
          .from("lottery_results")
          .select(`
            *,
            lottery_markets!lottery_results_market_id_fkey (*)
          `)
          .order("announced_at", { ascending: false, nullsFirst: false })
          .order("created_at", { ascending: false })
          .limit(100);
        if (error) throw error;
        return NextResponse.json({ success: true, data });
      }

      case "schedules": {
        const { data, error } = await supabaseAdmin
          .from("draw_schedules")
          .select(`
            *,
            lottery_markets!draw_schedules_market_id_fkey (*)
          `)
          .order("draw_date", { ascending: false })
          .limit(50);
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
              avatar_url,
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
              avatar_url,
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
        const [{ data, error }, { data: betsData }] = await Promise.all([
          supabaseAdmin
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
              avatar_url,
              is_admin,
              admin_role,
              status,
              created_at,
              last_seen_at,
              last_login_at,
              last_login_ip,
              last_login_device,
              last_login_city,
              wallets (
                balance,
                commission_balance
              )
            `)
            .eq("is_admin", false)
            .order("created_at", { ascending: false }),
          supabaseAdmin.from("bets").select("user_id, amount, status, payout_amount"),
        ]);
        if (error) throw error;

        const betAgg = new Map<string, { total_bets: number; total_won: number }>();
        (betsData || []).forEach((b: any) => {
          if (!b.user_id) return;
          const curr = betAgg.get(b.user_id) || { total_bets: 0, total_won: 0 };
          curr.total_bets += Number(b.amount || 0);
          if (b.status === "WON") {
            curr.total_won += Number(b.payout_amount || 0);
          }
          betAgg.set(b.user_id, curr);
        });

        const enriched = (data || []).map((p: any) => {
          const stats = betAgg.get(p.id) || { total_bets: 0, total_won: 0 };
          return {
            ...p,
            total_bets: stats.total_bets,
            total_won: stats.total_won,
          };
        });

        return NextResponse.json({ success: true, data: enriched });
      }

      case "content": {
        const [
          { data: sliders },
          { data: promotions },
          { data: articles },
          { data: announcements },
          { data: banks },
          { data: wheelPrizes },
          { data: wheelSpins },
          { data: settings },
        ] = await Promise.all([
          supabaseAdmin.from("sliders").select("*").order("display_order", { ascending: true }),
          supabaseAdmin.from("promotions").select("*").order("id", { ascending: true }),
          supabaseAdmin.from("articles").select("*").order("display_order", { ascending: true }),
          supabaseAdmin.from("announcements").select("*").order("display_order", { ascending: true }),
          supabaseAdmin.from("banks").select("*").order("id", { ascending: true }),
          supabaseAdmin.from("lucky_wheel_prizes").select("*").order("slot_index", { ascending: true }),
          supabaseAdmin.from("lucky_wheel_spins").select("cost, prize_amount, spun_at"),
          supabaseAdmin.from("settings").select("*"),
        ]);

        const spinsCount = (wheelSpins || []).length;
        const spinsCost = (wheelSpins || []).reduce((sum, s) => sum + Number(s.cost || 0), 0);
        const spinsPrizes = (wheelSpins || []).reduce((sum, s) => sum + Number(s.prize_amount || 0), 0);

        return NextResponse.json({
          success: true,
          data: {
            sliders: sliders || [],
            promotions: promotions || [],
            articles: articles || [],
            announcements: announcements || [],
            banks: banks || [],
            wheelPrizes: wheelPrizes || [],
            wheelSpinsStats: {
              spins: spinsCount,
              cost_collected: spinsCost,
              prizes_paid: spinsPrizes,
            },
            settings: settings || [],
          },
        });
      }

      case "bets": {
        const limit = Number(searchParams.get("limit") || 100);
        const status = searchParams.get("status");
        const marketId = searchParams.get("market_id");

        let query = supabaseAdmin
          .from("bets")
          .select(`
            *,
            profiles!bets_profile_fkey (id, full_name, member_id, avatar_url, phone, username),
            lottery_markets!bets_market_id_fkey (id, name, code, category, logo_url)
          `)
          .order("created_at", { ascending: false })
          .limit(limit);

        if (status && status !== "ALL") {
          query = query.eq("status", status);
        }
        if (marketId && marketId !== "ALL") {
          query = query.eq("market_id", marketId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return NextResponse.json({ success: true, data: data || [] });
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

      case "affiliate": {
        const [
          { data: profiles, error: pErr },
          { data: bets, error: bErr },
          { data: settingsRows, error: sErr },
        ] = await Promise.all([
          supabaseAdmin
            .from("profiles")
            .select(`
              id,
              member_id,
              full_name,
              phone,
              avatar_url,
              referrer_id,
              status,
              created_at,
              wallets (
                balance,
                commission_balance
              )
            `)
            .eq("is_admin", false)
            .order("created_at", { ascending: false }),
          supabaseAdmin.from("bets").select("user_id, amount, status, created_at"),
          supabaseAdmin.from("settings").select("*"),
        ]);

        if (pErr) throw pErr;

        const settingsDict: Record<string, string> = {};
        for (const r of settingsRows || []) {
          if (r.key) settingsDict[r.key] = r.value ?? "";
        }

        const profileMap = new Map<string, any>();
        (profiles || []).forEach((p: any) => profileMap.set(p.id, p));

        const betsByUser = new Map<string, number>();
        (bets || []).forEach((b: any) => {
          if (!b.user_id) return;
          betsByUser.set(b.user_id, (betsByUser.get(b.user_id) || 0) + Number(b.amount || 0));
        });

        // Group downlines by referrer_id
        const downlinesByReferrer = new Map<string, any[]>();
        const referredMembersList: any[] = [];
        let totalCommissionBalance = 0;

        (profiles || []).forEach((p: any) => {
          const w = Array.isArray(p.wallets) ? p.wallets[0] : p.wallets;
          const commBal = Number(w?.commission_balance || 0);
          totalCommissionBalance += commBal;

          if (p.referrer_id) {
            const referrer = profileMap.get(p.referrer_id);
            const userTurnover = betsByUser.get(p.id) || 0;
            const item = {
              id: p.id,
              member_id: p.member_id,
              full_name: p.full_name,
              phone: p.phone,
              avatar_url: p.avatar_url,
              created_at: p.created_at,
              status: p.status,
              referrer_id: p.referrer_id,
              referrer_name: referrer?.full_name || referrer?.member_id || "ไม่ระบุ",
              referrer_phone: referrer?.phone || "-",
              turnover: userTurnover,
            };
            referredMembersList.push(item);

            const arr = downlinesByReferrer.get(p.referrer_id) || [];
            arr.push(item);
            downlinesByReferrer.set(p.referrer_id, arr);
          }
        });

        // Calculate top referrers
        const topReferrersList: any[] = [];
        downlinesByReferrer.forEach((downlines, refId) => {
          const refUser = profileMap.get(refId);
          if (!refUser) return;
          const totalTurnover = downlines.reduce((sum, d) => sum + d.turnover, 0);
          const w = Array.isArray(refUser.wallets) ? refUser.wallets[0] : refUser.wallets;
          const commBal = Number(w?.commission_balance || 0);
          topReferrersList.push({
            id: refUser.id,
            member_id: refUser.member_id,
            full_name: refUser.full_name,
            phone: refUser.phone,
            avatar_url: refUser.avatar_url,
            downline_count: downlines.length,
            total_turnover: totalTurnover,
            commission_balance: commBal,
          });
        });

        topReferrersList.sort((a, b) => b.downline_count - a.downline_count || b.total_turnover - a.total_turnover);

        return NextResponse.json({
          success: true,
          data: {
            stats: {
              total_members: (profiles || []).length,
              total_referred: referredMembersList.length,
              total_referrers: downlinesByReferrer.size,
              total_commission_balance: totalCommissionBalance,
            },
            top_referrers: topReferrersList.slice(0, 20),
            referred_members: referredMembersList,
            settings: {
              enabled: settingsDict.referral_enabled !== "false" && settingsDict.referral_enabled !== "FALSE",
              commission_rate: Number(settingsDict.referral_commission_rate || "8.0"),
              calculation_basis: settingsDict.referral_calculation_basis || "turnover",
              min_transfer: Number(settingsDict.referral_min_transfer || "100"),
              cookie_days: Number(settingsDict.referral_cookie_days || "30"),
            },
          },
        });
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
              lottery_markets!bets_market_id_fkey (name, code, category, logo_url)
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
          supabaseAdmin
            .from("login_attempts")
            .select("*")
            .or(`user_id.eq.${id}${profile.phone ? `,phone.eq.${profile.phone}` : ""}`)
            .order("attempted_at", { ascending: false })
            .limit(30),
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

      case "settings": {
        const { data, error } = await supabaseAdmin.from("settings").select("key, value");
        if (error) throw error;
        const dict: Record<string, string> = {};
        (data || []).forEach((row: any) => {
          if (row.key) dict[row.key] = row.value ?? "";
        });
        return NextResponse.json({ success: true, data: dict });
      }

      case "export": {
        const table = searchParams.get("table") || "profiles";
        const allowed = ["profiles", "bets", "transactions", "lottery_results", "settings", "promotions", "deposit_requests", "withdraw_requests", "banks", "announcements"];
        if (!allowed.includes(table)) {
          return NextResponse.json({ success: false, error: "Table not allowed for export" }, { status: 400 });
        }
        const { data, error } = await supabaseAdmin.from(table).select("*").limit(5000);
        if (error) throw error;
        return NextResponse.json({ success: true, data });
      }

      case "broadcast-history": {
        const { data, error } = await supabaseAdmin
          .from("notifications")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);
        if (error) throw error;
        return NextResponse.json({ success: true, data: data || [] });
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
        const {
          id,
          code,
          name,
          close_minutes_before,
          stream_url,
          logo_url,
          draw_days,
          draw_day_of_month,
          draw_time,
          show_in_popular,
          show_in_trending,
          is_open,
          is_active,
          rates,
          limits,
          min_bet,
          max_bet,
          max_per_number,
        } = payload;

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (close_minutes_before !== undefined) updateData.close_minutes_before = close_minutes_before;
        if (stream_url !== undefined) updateData.stream_url = stream_url;
        if (logo_url !== undefined) updateData.logo_url = logo_url;
        if (draw_days !== undefined) updateData.draw_days = draw_days;
        if (draw_day_of_month !== undefined) updateData.draw_day_of_month = draw_day_of_month;
        if (draw_time !== undefined) updateData.draw_time = draw_time;
        if (show_in_popular !== undefined) updateData.show_in_popular = show_in_popular;
        if (show_in_trending !== undefined) updateData.show_in_trending = show_in_trending;
        if (is_open !== undefined) updateData.is_open = is_open;
        if (is_active !== undefined) updateData.is_active = is_active;
        if (min_bet !== undefined) updateData.min_bet = Number(min_bet);
        else if (limits?.min_bet !== undefined) updateData.min_bet = Number(limits.min_bet);
        if (max_bet !== undefined) updateData.max_bet = Number(max_bet);
        else if (limits?.max_bet !== undefined) updateData.max_bet = Number(limits.max_bet);
        if (max_per_number !== undefined) updateData.max_per_number = Number(max_per_number);
        else if (limits?.max_per_number !== undefined) updateData.max_per_number = Number(limits.max_per_number);

        const { data, error } = await supabaseAdmin
          .from("lottery_markets")
          .update(updateData)
          .eq("id", id)
          .select();
        if (error) throw error;

        // If payout rates provided, update payout_rates table
        if (rates && typeof rates === "object") {
          const mktCode = code || (data && data[0] ? data[0].code : null);
          if (mktCode) {
            const upsertRows = Object.entries(rates).map(([bt, rateVal]) => ({
              market: mktCode,
              bet_type: bt,
              rate: Number(rateVal),
            }));

            for (const r of upsertRows) {
              await supabaseAdmin
                .from("payout_rates")
                .upsert([r], { onConflict: "market,bet_type" })
                .select();
            }
          }
        }

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
        const validMarketId = market_id && market_id !== "ALL" && market_id !== "none" ? market_id : null;
        const { data, error } = await supabaseAdmin
          .from("restricted_numbers")
          .insert([{
            market_id: validMarketId,
            bet_type: bet_type || "2TOP",
            number: String(number || ""),
            max_amount: Number(max_amount ?? 0),
            payout_rate: Number(payout_rate ?? 0),
            draw_date: draw_date || null,
            note: note || null,
          }])
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

      case "record_login_attempt": {
        const { phone, user_id, success } = payload;
        const forwarded = req.headers.get("x-forwarded-for");
        const realIp = req.headers.get("x-real-ip");
        const rawIp = forwarded ? forwarded.split(",")[0].trim() : (realIp || "127.0.0.1");
        const ua = req.headers.get("user-agent") || "";
        const dev = parseUserAgent(ua);
        const geo = await resolveIpGeo(rawIp);

        const { data, error } = await supabaseAdmin.rpc("record_login_session", {
          p_phone: phone || null,
          p_user_id: user_id || null,
          p_success: success ?? true,
          p_ip: geo.ip,
          p_user_agent: ua,
          p_city: geo.city,
          p_region: geo.region,
          p_country: geo.country,
          p_lat: geo.lat,
          p_lon: geo.lon,
          p_isp: geo.isp,
          p_device_type: dev.deviceType,
          p_device_model: dev.deviceModel,
          p_os: dev.os,
          p_browser: dev.browser,
        });
        if (error) throw error;
        return NextResponse.json({ success: true, data, geo, dev });
      }

      case "heartbeat": {
        const { user_id } = payload;
        if (user_id) {
          await supabaseAdmin
            .from("profiles")
            .update({ last_seen_at: new Date().toISOString() })
            .eq("id", user_id);
        }
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
            try {
              await supabaseAdmin.from("transactions").insert([{
                user_id: dep.user_id,
                type: "DEPOSIT",
                amount: Number(dep.amount),
                status: "COMPLETED",
                reference_id: id,
                note: admin_note || "ฝากเงินสำเร็จ (อนุมัติผ่านแผงควบคุม)",
                balance_after: newBal,
              }]);
            } catch (txErr) {
              console.error("Failed to log deposit transaction:", txErr);
            }
          }
        }
        return NextResponse.json({ success: true, data });
      }

      case "update_member": {
        const { id, full_name, phone, bank_name, bank_account_number, bank_account_name, status, vip_level } = payload;
        const updateData: any = { updated_at: new Date().toISOString() };
        if (full_name !== undefined) updateData.full_name = full_name;
        if (phone !== undefined) updateData.phone = phone;
        if (bank_name !== undefined) updateData.bank_name = bank_name;
        if (bank_account_number !== undefined) updateData.bank_account_number = bank_account_number;
        if (bank_account_name !== undefined) updateData.bank_account_name = bank_account_name;
        if (status !== undefined) updateData.status = status;
        if (vip_level !== undefined) updateData.vip_level = String(vip_level);

        const { data, error } = await supabaseAdmin
          .from("profiles")
          .update(updateData)
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
        try {
          await supabaseAdmin.from("transactions").insert([{
            user_id,
            type: delta > 0 ? "ADMIN_ADJUST_ADD" : "ADMIN_ADJUST_SUB",
            amount: Math.abs(delta),
            status: "COMPLETED",
            note: note || (delta > 0 ? "เพิ่มยอดกระเป๋าโดยแอดมิน" : "ลดยอดกระเป๋าโดยแอดมิน"),
            balance_after: newBal,
          }]);
        } catch (txErr) {
          console.error("Failed to log wallet adjustment transaction:", txErr);
        }
        return NextResponse.json({ success: true, data, balance: newBal });
      }

      case "record_result": {
        const { market_id, draw_date, result_main, result_3top, result_2top, result_2bottom, result_3front, result_3bottom } = payload;
        const { data: rpcData, error: rpcErr } = await supabaseAdmin.rpc("admin_set_result_and_settle", {
          p_market_id: market_id,
          p_draw_date: draw_date,
          p_result_main: result_main || "",
          p_3top: result_3top || "",
          p_3bottom: result_3bottom || "",
          p_3front: result_3front || "",
          p_2top: result_2top || "",
          p_2bottom: result_2bottom || "",
        });

        if (rpcErr) throw rpcErr;

        const { data: row } = await supabaseAdmin
          .from("lottery_results")
          .select("*")
          .eq("market_id", market_id)
          .eq("draw_date", draw_date)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        return NextResponse.json({ success: true, data: row || rpcData });
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
            try {
              await supabaseAdmin.from("transactions").insert([{
                user_id: wReq.user_id,
                type: "REFUND_WITHDRAW",
                amount: Number(wReq.amount),
                status: "COMPLETED",
                reference_id: id,
                note: admin_note || "คืนเงินจากการปฏิเสธคำขอถอน",
                balance_after: newBal,
              }]);
            } catch (txErr) {
              console.error("Failed to log refund transaction:", txErr);
            }
          }
        }
        return NextResponse.json({ success: true, data });
      }

      case "cancel_bet": {
        const { id, reason } = payload;
        const { data: bet, error: bErr } = await supabaseAdmin
          .from("bets")
          .select("id, user_id, amount, status")
          .eq("id", id)
          .single();
        if (bErr) throw bErr;

        if (bet.status === "CANCELLED") {
          return NextResponse.json({ success: false, error: "โพยนี้ถูกยกเลิกไปแล้ว" }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
          .from("bets")
          .update({
            status: "CANCELLED",
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select();
        if (error) throw error;

        // Refund bet amount to user's wallet
        if (bet.user_id && Number(bet.amount) > 0) {
          const { data: w } = await supabaseAdmin.from("wallets").select("balance").eq("user_id", bet.user_id).single();
          if (w) {
            const newBal = Number(w.balance) + Number(bet.amount);
            await supabaseAdmin.from("wallets").update({ balance: newBal, updated_at: new Date().toISOString() }).eq("user_id", bet.user_id);
            try {
              await supabaseAdmin.from("transactions").insert([{
                user_id: bet.user_id,
                type: "REFUND_BET",
                amount: Number(bet.amount),
                status: "COMPLETED",
                reference_id: id,
                note: reason || "คืนเงินจากการยกเลิกโพยโดยผู้ดูแลระบบ",
                balance_after: newBal,
              }]);
            } catch (txErr) {
              console.error("Failed to log bet refund transaction:", txErr);
            }
          }
        }
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

      case "update_appearance": {
        const p = payload || {};
        const pairs: { key: string; value: string; updated_at: string }[] = [];
        const nowIso = new Date().toISOString();

        const add = (k: string, v: any) => {
          if (v !== undefined && v !== null) {
            pairs.push({ key: k, value: String(v), updated_at: nowIso });
          }
        };

        add("site_name", p.site_name);
        add("site_tagline", p.site_tagline);
        add("site_badge", p.site_badge);
        add("login_hero_heading", p.login_hero_heading);
        add("login_feature_1", p.login_feature_1);
        add("login_feature_2", p.login_feature_2);
        add("login_feature_3", p.login_feature_3);
        add("login_stat_1_val", p.login_stat_1_val);
        add("login_stat_1_label", p.login_stat_1_label);
        add("login_stat_2_val", p.login_stat_2_val);
        add("login_stat_2_label", p.login_stat_2_label);
        add("login_stat_3_val", p.login_stat_3_val);
        add("login_stat_3_label", p.login_stat_3_label);
        add("login_form_title", p.login_form_title);
        add("login_form_subtitle", p.login_form_subtitle);
        add("login_badge_1_title", p.login_badge_1_title);
        add("login_badge_1_sub", p.login_badge_1_sub);
        add("login_badge_2_title", p.login_badge_2_title);
        add("login_badge_2_sub", p.login_badge_2_sub);
        add("login_badge_3_title", p.login_badge_3_title);
        add("login_badge_3_sub", p.login_badge_3_sub);
        add("site_copyright", p.site_copyright);
        add("site_logo_url", p.logo_url);
        add("site_favicon_url", p.favicon_url);
        add("login_bg_url", p.login_bg_url);
        add("site_primary_color", p.primary_color);
        add("theme_primary_color", p.primary_color);
        add("theme_font", p.font || p.font_family);
        add("theme_dark_mode", p.dark_mode ? "true" : "false");

        if (pairs.length > 0) {
          const { error } = await supabaseAdmin.from("settings").upsert(pairs, { onConflict: "key" });
          if (error) throw error;
        }
        return NextResponse.json({ success: true, count: pairs.length });
      }

      case "mark_notification_read": {
        const { id } = payload;
        const { data, error } = await supabaseAdmin
          .from("admin_notifications")
          .update({ is_read: true })
          .eq("id", id)
          .select();
        if (error) throw error;
        return NextResponse.json({ success: true, data });
      }

      case "mark_all_notifications_read": {
        const { error } = await supabaseAdmin
          .from("admin_notifications")
          .update({ is_read: true })
          .eq("is_read", false);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      case "upsert_slider": {
        const { id, title, image_url, link_url, display_order, is_active } = payload;
        const rowData: any = {
          title: title || "",
          image_url: image_url || "",
          link_url: link_url || "",
          link: link_url || "",
          display_order: Number(display_order || 1),
          is_active: Boolean(is_active),
          updated_at: new Date().toISOString(),
        };
        let res;
        if (id && !String(id).startsWith("sl-")) {
          res = await supabaseAdmin.from("sliders").update(rowData).eq("id", id).select();
        } else {
          res = await supabaseAdmin.from("sliders").insert([rowData]).select();
        }
        if (res.error) throw res.error;
        return NextResponse.json({ success: true, data: res.data });
      }

      case "delete_slider": {
        const { id } = payload;
        const { error } = await supabaseAdmin.from("sliders").delete().eq("id", id);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      case "reorder_sliders": {
        const { items } = payload; // Array of { id, display_order }
        if (Array.isArray(items)) {
          for (const it of items) {
            if (it.id && !String(it.id).startsWith("sl-")) {
              await supabaseAdmin.from("sliders").update({ display_order: it.display_order }).eq("id", it.id);
            }
          }
        }
        return NextResponse.json({ success: true });
      }

      case "upsert_promotion": {
        const parseDateOrNull = (val: any) => {
          if (!val || typeof val !== "string" || !val.trim()) return null;
          const d = new Date(val);
          return isNaN(d.getTime()) ? null : d.toISOString();
        };

        const {
          id, title, description, image_url, bonus_rate, bonus_amount, min_deposit, max_withdrawal,
          turnover_multiplier, promo_code, type, allowed_game, is_active, badge_text, background_color,
          default_amount, target_view, line1, line2, max_uses_per_user, max_uses_total, max_uses_per_day,
          starts_at, expires_at
        } = payload;
        const rowData: any = {
          title: title || "",
          description: description || "",
          image_url: image_url || "",
          bonus_rate: Number(bonus_rate || 0),
          bonus_amount: Number(bonus_amount || 0),
          min_deposit: Number(min_deposit || 0),
          max_withdrawal: Number(max_withdrawal || 0),
          turnover_multiplier: Number(turnover_multiplier || 1),
          promo_code: promo_code && String(promo_code).trim() ? String(promo_code).trim().toUpperCase() : null,
          type: type || "percent",
          allowed_game: allowed_game || "all",
          is_active: Boolean(is_active),
          badge_text: badge_text || "โปรโมชั่น",
          background_color: background_color || "#10b981",
          default_amount: Number(default_amount || 100),
          target_view: target_view || "deposit",
          line1: line1 || title || "",
          line2: line2 || "",
          max_uses_per_user: Number(max_uses_per_user || 1),
          max_uses_total: Number(max_uses_total || 1000),
          max_uses_per_day: Number(max_uses_per_day || 100),
          starts_at: parseDateOrNull(starts_at),
          expires_at: parseDateOrNull(expires_at),
        };
        let res;
        if (id && !String(id).startsWith("pm-")) {
          res = await supabaseAdmin.from("promotions").update(rowData).eq("id", id).select();
        } else {
          res = await supabaseAdmin.from("promotions").insert([rowData]).select();
        }
        if (res.error) throw res.error;
        return NextResponse.json({ success: true, data: res.data });
      }

      case "delete_promotion": {
        const { id } = payload;
        const { error } = await supabaseAdmin.from("promotions").delete().eq("id", id);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      case "upsert_article": {
        const { id, title, content, sub_content, category, image_url, is_published, display_order } = payload;
        const rowData: any = {
          title: title || "",
          content: content || "",
          sub_content: sub_content || "",
          category: category || "general",
          image_url: image_url || "",
          is_published: Boolean(is_published),
          display_order: Number(display_order || 1),
          updated_at: new Date().toISOString(),
        };
        let res;
        if (id && !String(id).startsWith("ar-")) {
          res = await supabaseAdmin.from("articles").update(rowData).eq("id", id).select();
        } else {
          res = await supabaseAdmin.from("articles").insert([rowData]).select();
        }
        if (res.error) throw res.error;
        return NextResponse.json({ success: true, data: res.data });
      }

      case "delete_article": {
        const { id } = payload;
        const { error } = await supabaseAdmin.from("articles").delete().eq("id", id);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      case "upsert_announcement": {
        const { id, title, content, is_active, display_order } = payload;
        const rowData: any = {
          title: title || "ประกาศจากระบบ",
          content: content || "",
          is_active: Boolean(is_active),
          display_order: Number(display_order || 1),
        };
        let res;
        if (id && !String(id).startsWith("feed-")) {
          res = await supabaseAdmin.from("announcements").update(rowData).eq("id", id).select();
        } else {
          res = await supabaseAdmin.from("announcements").insert([rowData]).select();
        }
        if (res.error) throw res.error;
        return NextResponse.json({ success: true, data: res.data });
      }

      case "delete_announcement": {
        const { id } = payload;
        const { error } = await supabaseAdmin.from("announcements").delete().eq("id", id);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      case "upsert_bank": {
        const { id, name, code, image_url, is_active } = payload;
        const rowData: any = {
          name: name || "",
          code: (code || "").toUpperCase(),
          image_url: image_url || "",
          is_active: is_active !== undefined ? Boolean(is_active) : true,
        };
        let res;
        if (id && !String(id).startsWith("bk-")) {
          res = await supabaseAdmin.from("banks").update(rowData).eq("id", id).select();
        } else {
          res = await supabaseAdmin.from("banks").insert([rowData]).select();
        }
        if (res.error) throw res.error;
        return NextResponse.json({ success: true, data: res.data });
      }

      case "delete_bank": {
        const { id } = payload;
        const { error } = await supabaseAdmin.from("banks").delete().eq("id", id);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      case "update_wheel_prize": {
        const { id, name, amount, probability, color, hi_color, is_active } = payload;
        const { data, error } = await supabaseAdmin
          .from("lucky_wheel_prizes")
          .update({
            name,
            amount: Number(amount || 0),
            probability: Number(probability || 0),
            color,
            hi_color,
            is_active: Boolean(is_active),
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select();
        if (error) throw error;
        return NextResponse.json({ success: true, data });
      }

      case "update_wheel_config": {
        const { cost, daily_limit, banner_url } = payload;
        const updates = [
          { key: "lucky_wheel_cost", value: String(cost || 0), updated_at: new Date().toISOString() },
          { key: "lucky_wheel_daily_limit", value: String(daily_limit || 1), updated_at: new Date().toISOString() },
          { key: "lucky_wheel_banner_url", value: String(banner_url || ""), updated_at: new Date().toISOString() },
        ];
        const { error } = await supabaseAdmin.from("settings").upsert(updates, { onConflict: "key" });
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      case "send_broadcast": {
        const { title, body, type, audience, user_id } = payload;
        if (audience === "individual" && user_id) {
          const { data, error } = await supabaseAdmin.from("notifications").insert([{
            user_id,
            type: type || "info",
            title: title || "ประกาศจากระบบ",
            body: body || "",
            is_read: false,
          }]).select();
          if (error) throw error;
          return NextResponse.json({ success: true, data, count: 1 });
        } else {
          // Audience: all members
          const { data: members, error: mErr } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("is_admin", false);
          if (mErr) throw mErr;

          const rows = (members || []).map((m) => ({
            user_id: m.id,
            type: type || "info",
            title: title || "ประกาศจากระบบ",
            body: body || "",
            is_read: false,
          }));

          if (rows.length > 0) {
            const { error: insErr } = await supabaseAdmin.from("notifications").insert(rows);
            if (insErr) throw insErr;
          }
          return NextResponse.json({ success: true, count: rows.length });
        }
      }

      case "batch_update_settings": {
        const { settings: settingsObj } = payload || {};
        if (!settingsObj || typeof settingsObj !== "object") {
          return NextResponse.json({ success: false, error: "Invalid settings payload" }, { status: 400 });
        }
        const now = new Date().toISOString();
        const updates: { key: string; value: string; updated_at: string }[] = [];
        for (const [k, v] of Object.entries(settingsObj)) {
          if (k) {
            updates.push({ key: k, value: String(v ?? ""), updated_at: now });
            if (k === "theme_primary_color") {
              updates.push({ key: "site_primary_color", value: String(v ?? ""), updated_at: now });
            } else if (k === "site_primary_color") {
              updates.push({ key: "theme_primary_color", value: String(v ?? ""), updated_at: now });
            }
          }
        }
        if (updates.length > 0) {
          const { error } = await supabaseAdmin.from("settings").upsert(updates, { onConflict: "key" });
          if (error) throw error;
        }
        return NextResponse.json({ success: true, count: updates.length });
      }

      case "update_appearance": {
        const {
          site_name,
          site_tagline,
          site_short_name,
          primary_color,
          secondary_color,
          font,
          ui_radius,
          dark_mode,
          logo_url,
          logo_dark_url,
          favicon_url,
          app_icon_url,
          footer_copyright,
          line_id,
          line_url,
          facebook_url,
          telegram_url,
          phone,
          livechat_enabled,
          seo_meta_title,
          seo_meta_description,
          seo_meta_keywords,
          seo_og_image_url,
          login_bg_url,
          login_hero_heading,
          login_feature_1,
          login_feature_2,
          login_feature_3,
          login_stat_1_val,
          login_stat_1_label,
          login_stat_2_val,
          login_stat_2_label,
          login_stat_3_val,
          login_stat_3_label,
        } = payload || {};

        const now = new Date().toISOString();
        const updates: { key: string; value: string; updated_at: string }[] = [];

        // Brand Identity & Login Content
        if (site_name !== undefined) updates.push({ key: "site_name", value: String(site_name), updated_at: now });
        if (site_tagline !== undefined) updates.push({ key: "site_tagline", value: String(site_tagline), updated_at: now });
        if (site_short_name !== undefined) updates.push({ key: "site_short_name", value: String(site_short_name), updated_at: now });
        if (logo_url !== undefined) updates.push({ key: "site_logo_url", value: String(logo_url), updated_at: now });
        if (logo_dark_url !== undefined) updates.push({ key: "site_logo_dark_url", value: String(logo_dark_url), updated_at: now });
        if (favicon_url !== undefined) updates.push({ key: "site_favicon_url", value: String(favicon_url), updated_at: now });
        if (app_icon_url !== undefined) updates.push({ key: "site_app_icon_url", value: String(app_icon_url), updated_at: now });
        if (login_bg_url !== undefined) updates.push({ key: "login_bg_url", value: String(login_bg_url), updated_at: now });
        if (footer_copyright !== undefined) updates.push({ key: "footer_copyright", value: String(footer_copyright), updated_at: now });

        // Login Page Texts & Stats
        if (login_hero_heading !== undefined) updates.push({ key: "login_hero_heading", value: String(login_hero_heading), updated_at: now });
        if (login_feature_1 !== undefined) updates.push({ key: "login_feature_1", value: String(login_feature_1), updated_at: now });
        if (login_feature_2 !== undefined) updates.push({ key: "login_feature_2", value: String(login_feature_2), updated_at: now });
        if (login_feature_3 !== undefined) updates.push({ key: "login_feature_3", value: String(login_feature_3), updated_at: now });
        if (login_stat_1_val !== undefined) updates.push({ key: "login_stat_1_val", value: String(login_stat_1_val), updated_at: now });
        if (login_stat_1_label !== undefined) updates.push({ key: "login_stat_1_label", value: String(login_stat_1_label), updated_at: now });
        if (login_stat_2_val !== undefined) updates.push({ key: "login_stat_2_val", value: String(login_stat_2_val), updated_at: now });
        if (login_stat_2_label !== undefined) updates.push({ key: "login_stat_2_label", value: String(login_stat_2_label), updated_at: now });
        if (login_stat_3_val !== undefined) updates.push({ key: "login_stat_3_val", value: String(login_stat_3_val), updated_at: now });
        if (login_stat_3_label !== undefined) updates.push({ key: "login_stat_3_label", value: String(login_stat_3_label), updated_at: now });

        // Design & Theming
        if (primary_color !== undefined) {
          updates.push({ key: "theme_primary_color", value: String(primary_color), updated_at: now });
          updates.push({ key: "site_primary_color", value: String(primary_color), updated_at: now });
        }
        if (secondary_color !== undefined) updates.push({ key: "theme_secondary_color", value: String(secondary_color), updated_at: now });
        if (font !== undefined) updates.push({ key: "theme_font", value: String(font), updated_at: now });
        if (ui_radius !== undefined) updates.push({ key: "theme_ui_radius", value: String(ui_radius), updated_at: now });
        if (dark_mode !== undefined) updates.push({ key: "theme_dark_mode", value: String(dark_mode), updated_at: now });

        // Social & Channels
        if (line_id !== undefined) updates.push({ key: "contact_line_id", value: String(line_id), updated_at: now });
        if (line_url !== undefined) updates.push({ key: "contact_line_url", value: String(line_url), updated_at: now });
        if (facebook_url !== undefined) updates.push({ key: "contact_facebook_url", value: String(facebook_url), updated_at: now });
        if (telegram_url !== undefined) updates.push({ key: "contact_telegram_url", value: String(telegram_url), updated_at: now });
        if (phone !== undefined) updates.push({ key: "contact_phone", value: String(phone), updated_at: now });
        if (livechat_enabled !== undefined) updates.push({ key: "contact_livechat_enabled", value: String(livechat_enabled), updated_at: now });

        // SEO & Metadata
        if (seo_meta_title !== undefined) updates.push({ key: "seo_meta_title", value: String(seo_meta_title), updated_at: now });
        if (seo_meta_description !== undefined) updates.push({ key: "seo_meta_description", value: String(seo_meta_description), updated_at: now });
        if (seo_meta_keywords !== undefined) updates.push({ key: "seo_meta_keywords", value: String(seo_meta_keywords), updated_at: now });
        if (seo_og_image_url !== undefined) updates.push({ key: "seo_og_image_url", value: String(seo_og_image_url), updated_at: now });

        if (updates.length > 0) {
          const { error } = await supabaseAdmin.from("settings").upsert(updates, { onConflict: "key" });
          if (error) throw error;
        }
        return NextResponse.json({ success: true, count: updates.length });
      }

      case "create_admin_user": {
        const { full_name, phone, password, admin_role, permissions } = payload;
        if (!phone) {
          return NextResponse.json({ success: false, error: "กรุณาระบุเบอร์โทรศัพท์" }, { status: 400 });
        }

        const cleanPhone = String(phone).replace(/\D/g, "");
        const email = `${cleanPhone}@thlotto.app`;
        const role = admin_role === "super_admin" ? "super_admin" : "admin";
        const perms = role === "super_admin" ? ["*"] : (Array.isArray(permissions) ? permissions : []);

        // 1. Check if user already exists in profiles
        const { data: existingProfile } = await supabaseAdmin
          .from("profiles")
          .select("id, phone, is_admin, full_name")
          .or(`phone.eq.${cleanPhone},phone.eq.${phone}`)
          .maybeSingle();

        let userId = existingProfile?.id;

        if (!userId) {
          const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
          const foundAuth = userList?.users?.find((u: any) => u.email === email || u.phone === cleanPhone);
          if (foundAuth) {
            userId = foundAuth.id;
          }
        }

        if (userId) {
          // Promote existing user to admin
          const { data: updated, error: uErr } = await supabaseAdmin
            .from("profiles")
            .update({
              is_admin: true,
              admin_role: role,
              admin_permissions: perms,
              full_name: full_name || existingProfile?.full_name || "แอดมิน",
              phone: cleanPhone,
              status: "active",
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId)
            .select();
          if (uErr) throw uErr;

          if (password && password.length >= 6) {
            await supabaseAdmin.auth.admin.updateUserById(userId, {
              password: password,
            });
          }

          return NextResponse.json({ success: true, data: updated });
        } else {
          // 2. Create new Auth user (handle_new_user trigger automatically provisions profiles & wallets)
          const adminPassword = password && password.length >= 6 ? password : "Password123!";
          const { data: authUser, error: aErr } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: adminPassword,
            email_confirm: true,
            user_metadata: {
              full_name: full_name || "แอดมิน",
              phone: cleanPhone,
              username: full_name || `admin_${cleanPhone.slice(-4)}`,
            },
          });

          if (aErr) throw aErr;
          userId = authUser.user.id;

          // 3. Update the newly created profile with admin role and permissions
          const { data: newProfile, error: pErr } = await supabaseAdmin
            .from("profiles")
            .update({
              is_admin: true,
              admin_role: role,
              admin_permissions: perms,
              full_name: full_name || "แอดมิน",
              phone: cleanPhone,
              status: "active",
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId)
            .select();

          if (pErr) throw pErr;

          return NextResponse.json({ success: true, data: newProfile });
        }
      }

      case "update_admin_user": {
        const { id, full_name, phone, admin_role, permissions, status, password } = payload;
        if (!id) {
          return NextResponse.json({ success: false, error: "กรุณาระบุ ID แอดมิน" }, { status: 400 });
        }

        const updateData: any = { updated_at: new Date().toISOString() };
        if (full_name !== undefined) updateData.full_name = full_name;
        if (phone !== undefined) updateData.phone = phone;
        if (status !== undefined) updateData.status = status;
        if (admin_role !== undefined) {
          updateData.admin_role = admin_role === "super_admin" ? "super_admin" : "admin";
          if (admin_role === "super_admin") {
            updateData.admin_permissions = ["*"];
          }
        }
        if (permissions !== undefined && admin_role !== "super_admin") {
          updateData.admin_permissions = Array.isArray(permissions) ? permissions : [];
        }

        const { data, error } = await supabaseAdmin
          .from("profiles")
          .update(updateData)
          .eq("id", id)
          .select();
        if (error) throw error;

        if (password && password.length >= 6) {
          await supabaseAdmin.auth.admin.updateUserById(id, { password });
        }

        return NextResponse.json({ success: true, data });
      }

      case "delete_admin_user": {
        const { id } = payload;
        if (!id) {
          return NextResponse.json({ success: false, error: "กรุณาระบุ ID แอดมิน" }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
          .from("profiles")
          .update({
            is_admin: false,
            admin_role: null,
            admin_permissions: [],
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select();
        if (error) throw error;

        return NextResponse.json({ success: true, data });
      }

      default:
        return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
    }
  } catch (err: any) {
    console.error("[API POST ERROR]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
