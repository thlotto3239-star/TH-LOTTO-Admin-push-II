# คู่มือการติดตั้งและขึ้นระบบ (Deployment & Integration Guide)

> **คู่มือการ Deploy สู่ Vercel / Cloud และการตั้งค่าสิทธิ์ Google OAuth**

---

## 1. การขึ้นระบบบน Vercel (Deploying to Vercel)

1. เข้าสู่หน้า [Vercel Dashboard](https://vercel.com/)
2. กดปุ่ม **"Add New..." ➔ "Project"**
3. นำเข้าคลังโค้ด `https://github.com/thlotto3239-star/TH-LOTTO-Admin-push`
4. ตั้งค่า Framework Preset: **Next.js** (Vercel จะตรวจพบอัตโนมัติ)
5. ระบุตัวแปรสภาพแวดล้อม (Environment Variables):
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://[YOUR-PROJECT-REF].supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `[YOUR-ANON-KEY]`
   - `SUPABASE_SERVICE_ROLE_KEY`: `[YOUR-SERVICE-ROLE-KEY]`
   - `SUPABASE_PROJECT_REF`: `[YOUR-PROJECT-REF]`
6. กด **"Deploy"** ระบบจะทำการคอมไพล์และเปิดให้บริการทันที

---

## 2. การตั้งค่าสิทธิ์ล็อกอินผ่าน Gmail / Google OAuth (Domain Authorization)

เมื่อต้องการเปิดใช้งานการล็อกอินผ่านบัญชี Google/Gmail สำหรับทีมงานแอดมิน **ต้องระบุโดเมนที่มีสิทธิ์ทั้ง 2 ฝั่งให้ตรงกันอย่างเคร่งครัด**:

### 2.1 ฝั่ง Google Cloud Console
1. เข้าไปที่ [Google Cloud Console ➔ APIs & Services ➔ Credentials](https://console.cloud.google.com/)
2. เปิด Client ID ชนิด **Web application (OAuth 2.0 Client IDs)**
3. ในส่วน **Authorized JavaScript origins:**
   - ระบุโดเมนหน้าเว็บแอดมิน:
     - `https://your-admin-domain.vercel.app` (หรือโดเมนจริง เช่น `https://admin.thlotto.com`)
     - `http://localhost:3000` (สำหรับทดสอบในเครื่อง)
4. ในส่วน **Authorized redirect URIs:**
   - ต้องระบุ Callback URL ของ Supabase:
     - `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
5. กด **Save**

### 2.2 ฝั่ง Supabase Dashboard
1. เข้าสู่หน้า [Supabase Dashboard ➔ Authentication ➔ URL Configuration](https://supabase.com/dashboard)
2. **Site URL:** ระบุโดเมนหลักของแอดมิน เช่น `https://admin.thlotto.com`
3. **Redirect URLs (Allow list):** เพิ่มรายการโดเมนที่อนุญาต:
   - `https://admin.thlotto.com/**`
   - `https://your-admin-domain.vercel.app/**`
   - `http://localhost:3000/**`
4. กด **Save**

### 2.3 การควบคุมสิทธิ์เข้าถึง (Admin Guard)
- เมื่อแอดมินล็อกอินผ่าน Gmail สำเร็จ ระบบจะตรวจสอบสถานะ `is_admin: true` หรือ `role = 'admin'` ในตาราง `public.profiles`
- หากเป็นอีเมลบุคคลทั่วไปที่ไม่มีสิทธิ์แอดมิน ระบบจะไม่อนุญาตให้เข้าใช้งานและดีดกลับไปหน้าล็อกอินโดยอัตโนมัติ
