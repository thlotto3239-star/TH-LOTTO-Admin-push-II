const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runLiveTest() {
  console.log('=== REAL-DATA ADMIN & PERMISSIONS AUDIT ===');
  const testPhone = '0988776655';
  const testEmail = `${testPhone}@thlotto.app`;
  let testUserId = null;

  try {
    // 1. Clean up any previous test account
    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('phone', testPhone)
      .maybeSingle();

    if (existing) {
      await supabaseAdmin.from('profiles').delete().eq('id', existing.id);
      await supabaseAdmin.auth.admin.deleteUser(existing.id).catch(() => {});
    }

    // 2. TEST: CREATE NEW ADMIN WITH SPECIFIC PERMISSIONS
    console.log('\n[TEST 1] Creating new Admin via API payload...');
    const createPayload = {
      full_name: 'แอดมินทดสอบระบบ',
      phone: testPhone,
      password: 'TestPassword123!',
      admin_role: 'admin',
      permissions: ['markets', 'bets', 'deposits', 'restricted'],
    };

    // Simulate calling the API POST handler directly
    const createRes = await fetch('http://localhost:3000/api/admin/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_admin_user', payload: createPayload }),
    });
    const createJson = await createRes.json();
    console.log('API create_admin_user response:', createJson);

    if (!createJson.success) {
      throw new Error(`Failed to create admin: ${createJson.error}`);
    }

    testUserId = createJson.data[0]?.id;
    console.log(`Created test admin with User ID: ${testUserId}`);

    // VERIFY DIRECTLY IN SUPABASE DATABASE
    const { data: dbAdmin1, error: dbErr1 } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, phone, is_admin, admin_role, admin_permissions, status')
      .eq('id', testUserId)
      .single();

    if (dbErr1) throw dbErr1;
    console.log('Verification in Supabase DB after CREATE:', dbAdmin1);
    if (!dbAdmin1.is_admin || dbAdmin1.admin_role !== 'admin') {
      throw new Error('Database is_admin or admin_role mismatch!');
    }
    if (JSON.stringify(dbAdmin1.admin_permissions.sort()) !== JSON.stringify(createPayload.permissions.sort())) {
      throw new Error('Permissions mismatch in database!');
    }
    console.log('✅ TEST 1 PASSED: Admin created and permissions saved in Supabase PostgreSQL!');

    // 3. TEST: UPDATE ADMIN PERMISSIONS
    console.log('\n[TEST 2] Updating Admin permissions to expanded set...');
    const updatedPermissions = ['markets', 'bets', 'deposits', 'withdrawals', 'members', 'promotions', 'sliders'];
    const updateRes = await fetch('http://localhost:3000/api/admin/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_admin_user',
        payload: {
          id: testUserId,
          permissions: updatedPermissions,
          full_name: 'แอดมินทดสอบ (แก้ไขแล้ว)',
        },
      }),
    });
    const updateJson = await updateRes.json();
    console.log('API update_admin_user response:', updateJson);

    if (!updateJson.success) {
      throw new Error(`Failed to update admin: ${updateJson.error}`);
    }

    // VERIFY DIRECTLY IN SUPABASE DATABASE
    const { data: dbAdmin2, error: dbErr2 } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, admin_permissions')
      .eq('id', testUserId)
      .single();

    if (dbErr2) throw dbErr2;
    console.log('Verification in Supabase DB after UPDATE:', dbAdmin2);
    if (JSON.stringify(dbAdmin2.admin_permissions.sort()) !== JSON.stringify(updatedPermissions.sort())) {
      throw new Error('Updated permissions mismatch in database!');
    }
    console.log('✅ TEST 2 PASSED: Admin permissions updated successfully in DB!');

    // 4. TEST: UPDATE PASSWORD
    console.log('\n[TEST 3] Updating Admin password...');
    const pwRes = await fetch('http://localhost:3000/api/admin/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_admin_user',
        payload: {
          id: testUserId,
          password: 'NewSuperPassword456!',
        },
      }),
    });
    const pwJson = await pwRes.json();
    console.log('API password update response:', pwJson);
    if (!pwJson.success) throw new Error('Failed to update password');
    console.log('✅ TEST 3 PASSED: Admin password updated successfully in Supabase Auth!');

    // 5. TEST: REVOKE ADMIN RIGHTS (DELETE_ADMIN_USER)
    console.log('\n[TEST 4] Revoking Admin rights (demoting to regular user)...');
    const deleteRes = await fetch('http://localhost:3000/api/admin/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'delete_admin_user',
        payload: { id: testUserId },
      }),
    });
    const deleteJson = await deleteRes.json();
    console.log('API delete_admin_user response:', deleteJson);
    if (!deleteJson.success) throw new Error('Failed to revoke admin');

    // VERIFY DIRECTLY IN SUPABASE DATABASE
    const { data: dbAdmin3, error: dbErr3 } = await supabaseAdmin
      .from('profiles')
      .select('id, is_admin, admin_role, admin_permissions')
      .eq('id', testUserId)
      .single();

    if (dbErr3) throw dbErr3;
    console.log('Verification in Supabase DB after REVOKE:', dbAdmin3);
    if (dbAdmin3.is_admin === true || dbAdmin3.admin_role !== null) {
      throw new Error('Admin rights were not revoked in DB!');
    }
    console.log('✅ TEST 4 PASSED: Admin rights revoked cleanly in Supabase!');

    // 6. CLEANUP TEST ACCOUNT
    await supabaseAdmin.from('wallets').delete().eq('user_id', testUserId);
    await supabaseAdmin.from('profiles').delete().eq('id', testUserId);
    await supabaseAdmin.auth.admin.deleteUser(testUserId).catch(() => {});
    console.log('\n✅ Cleaned up temporary test user safely.');

    console.log('\n🎉 ALL 4 ADMIN & PERMISSIONS TESTS PASSED 100% WITH REAL SUPABASE DATA!');
  } catch (err) {
    console.error('❌ TEST FAILED:', err);
    if (testUserId) {
      await supabaseAdmin.from('wallets').delete().eq('user_id', testUserId).catch(() => {});
      await supabaseAdmin.from('profiles').delete().eq('id', testUserId).catch(() => {});
      await supabaseAdmin.auth.admin.deleteUser(testUserId).catch(() => {});
    }
    process.exit(1);
  }
}

runLiveTest();
