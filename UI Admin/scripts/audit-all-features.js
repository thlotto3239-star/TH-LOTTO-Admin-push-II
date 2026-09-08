const fs = require('fs');

async function audit() {
  const resources = [
    'dashboard',
    'markets',
    'settings',
    'results',
    'schedules',
    'deposits',
    'withdrawals',
    'members',
    'bets',
    'table-stats',
    'instant-stats',
    'content',
    'admins',
    'broadcast-history',
    'member-detail'
  ];

  console.log('=== AUDITING ALL API RESOURCES (REAL SUPABASE POSTGRES) ===');
  const results = [];
  for (const r of resources) {
    const url = r === 'member-detail' 
      ? 'http://localhost:3000/api/admin/data?resource=' + r + '&id=ba5fdf99-abe2-4e59-a3b2-144ab2c707cd'
      : 'http://localhost:3000/api/admin/data?resource=' + r;
    const start = Date.now();
    try {
      const res = await fetch(url);
      const data = await res.json();
      const status = res.status;
      const count = Array.isArray(data.data) ? data.data.length : (data.data ? Object.keys(data.data).length : 0);
      const passed = status === 200 && data.success;
      results.push({ resource: r, passed, time: Date.now() - start, count, error: data.error });
      console.log(`[${passed ? 'PASS' : 'FAIL'}] resource=${r} (${Date.now() - start}ms) - Items/Keys: ${count} ${data.error ? 'ERROR: ' + data.error : ''}`);
    } catch (err) {
      results.push({ resource: r, passed: false, error: err.message });
      console.error(`[FAIL] resource=${r} Exception:`, err.message);
    }
  }

  // Now audit mutative actions
  console.log('\n=== AUDITING MUTATIVE ACTIONS (CRUD) ===');
  const actions = [
    {
      name: 'batch_update_settings',
      payload: { settings: { system_audit_check: 'passed_' + Date.now() } }
    },
    {
      name: 'update_market',
      payload: {
        id: 'b5b24fd5-9b79-4745-a978-80623ccb14ba', // TH_GOV
        is_active: true,
        is_open: true
      }
    },
    {
      name: 'update_member',
      payload: {
        id: 'ba5fdf99-abe2-4e59-a3b2-144ab2c707cd',
        status: 'active'
      }
    },
    {
      name: 'upsert_restricted_number',
      payload: {
        number: '12',
        bet_type: '2TOP',
        payout_rate: 45,
        note: 'เลขจ่ายครึ่ง Audit Test'
      }
    },
    {
      name: 'upsert_slider',
      payload: {
        title: 'Audit Banner Test',
        image_url: 'https://placehold.co/1200x400',
        link_url: '/lotto',
        display_order: 99,
        is_active: true
      }
    },
    {
      name: 'upsert_promotion',
      payload: {
        title: 'Audit Promo Test',
        description: 'โบนัสทดสอบระบบ',
        bonus_rate: 10,
        min_deposit: 100,
        is_active: true
      }
    },
    {
      name: 'upsert_article',
      payload: {
        title: 'Audit Article Test',
        content: 'บทความทดสอบระบบ',
        category: 'news',
        is_published: true
      }
    },
    {
      name: 'upsert_bank',
      payload: {
        name: 'ธนาคารทดสอบ',
        code: 'TEST_BK',
        is_active: true
      }
    },
    {
      name: 'upsert_announcement',
      payload: {
        title: 'ประกาศทดสอบระบบ',
        content: 'ทดสอบฟีดประกาศ',
        is_active: true,
        display_order: 99
      }
    },
    {
      name: 'update_wheel_config',
      payload: {
        cost: 10,
        daily_limit: 3
      }
    },
    {
      name: 'update_appearance',
      payload: {
        theme_primary_color: '#059669'
      }
    }
  ];

  for (const act of actions) {
    const start = Date.now();
    try {
      const res = await fetch('http://localhost:3000/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: act.name, payload: act.payload })
      });
      const data = await res.json();
      const passed = res.status === 200 && data.success;
      console.log(`[${passed ? 'PASS' : 'FAIL'}] action=${act.name} (${Date.now() - start}ms) ${data.error ? 'ERROR: ' + data.error : 'OK'}`);
      
      // Cleanup created test item if applicable
      if (act.name === 'upsert_restricted_number' && data.data?.[0]?.id) {
        await fetch('http://localhost:3000/api/admin/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete_restricted_number', payload: { id: data.data[0].id } })
        });
      }
      if (act.name === 'upsert_slider' && data.data?.[0]?.id) {
        await fetch('http://localhost:3000/api/admin/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete_slider', payload: { id: data.data[0].id } })
        });
      }
      if (act.name === 'upsert_promotion' && data.data?.[0]?.id) {
        await fetch('http://localhost:3000/api/admin/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete_promotion', payload: { id: data.data[0].id } })
        });
      }
      if (act.name === 'upsert_article' && data.data?.[0]?.id) {
        await fetch('http://localhost:3000/api/admin/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete_article', payload: { id: data.data[0].id } })
        });
      }
      if (act.name === 'upsert_bank' && data.data?.[0]?.id) {
        await fetch('http://localhost:3000/api/admin/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete_bank', payload: { id: data.data[0].id } })
        });
      }
      if (act.name === 'upsert_announcement' && data.data?.[0]?.id) {
        await fetch('http://localhost:3000/api/admin/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete_announcement', payload: { id: data.data[0].id } })
        });
      }
    } catch (err) {
      console.error(`[FAIL] action=${act.name} Exception:`, err.message);
    }
  }

  console.log('\n=== AUDIT COMPLETE ===');
}

audit();
