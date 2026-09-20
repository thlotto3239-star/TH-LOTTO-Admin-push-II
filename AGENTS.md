# Project Adapter: THLOTTO-II (`AGENTS.md`)

> ⚡ **PRIORITY 1 MANDATE:**
> ทุกการทำงานในโปรเจกต์นี้ **ต้องยึดถือและปฏิบัติตาม [.agents/rules/00-web-development-standards.md](file:///c:/Users/armyn/Downloads/THLOTTO-II/.agents/rules/00-web-development-standards.md) เป็นอันดับแรกสุดเสมอ** (มาตรฐาน Git, การ Commit พร้อมรายละเอียด What/Why/Which files, การแบ่ง Branch, ความปลอดภัย, SOLID/DRY/KISS และ Quality Assurance)

This repository is governed by the **ARM AI Engineering Standard (ARM-AES v1.0)**.
Refer to [ARM-AI-ENGINEERING-STANDARD.md](file:///c:/Users/armyn/Downloads/THLOTTO-II/ARM-AI-ENGINEERING-STANDARD.md) for full universal standards and lifecycle rules.

---

## 1. 🏛️ Canonical Single Source of Truth (SSOT)
All architectural decisions, table schemas, page specifications, security boundaries, and QA test vectors MUST reference:
👉 **[docs/SYSTEM_BLUEPRINT.md](file:///c:/Users/armyn/Downloads/THLOTTO-II/docs/SYSTEM_BLUEPRINT.md)**

> ⛔ **STRICT DIRECTIVE FOR ALL AI AGENTS:**
> - Never read or reference obsolete documents in `docs/legacy/`.
> - Never invent or assume database columns, page routes, or RPC signatures.
> - Always refer to `docs/SYSTEM_BLUEPRINT.md` as the absolute grounded blueprint of this project.

---

## 2. Project Overview & Tech Stack
- **Project Name:** THLOTTO-II
- **Customer UI (`UI Customer/`):** React 19, Vite 6, Tailwind CSS 3.4 (Remote: `origin` / `thlotto3239-star/THLOTTO-II.git`)
- **Admin UI (`UI Admin/`):** Next.js 16 (App Router), React 19, Tailwind CSS (Remote: `admin-deploy` / `thlotto3239-star/TH-LOTTO-Admin-push-II.git`)
- **Database & BaaS:** Supabase PostgreSQL 15 (`ygopnjbvccenryejqmlw`), GoTrue Auth, Realtime WebSockets, Atomic RPC Stored Procedures.
- **Documentation Directory:** `docs/` (`docs/SYSTEM_BLUEPRINT.md`, `docs/requirements.md`, `docs/architecture.md`, `docs/technical-spec.md`, `docs/tasks/`)

---

## 3. Command Mappings & Workflow
- `/grill-with-docs` ➔ Phase 1: Requirement Discovery & Analysis (`docs/requirements.md`)
- `/plan` ➔ Phase 2: Technical Architecture & Planning (`docs/architecture.md`, `docs/SYSTEM_BLUEPRINT.md`)
- `/to-spec` ➔ Phase 3: Technical Specifications & Contracts (`docs/technical-spec.md`)
- `/to-tickets` ➔ Phase 4: Task Breakdown (`docs/tasks/` / `tasks/`)
- `/implement [Task ID]` ➔ Phase 5: Implementation, Tests & Verification

---

## 4. Mandatory Engineering Rules
- Always apply **Security-by-Design**, **Root-Cause Debugging (RCD)**, and the **Definition of Done (DoD)**.
- Enforce **Atomic Stored Procedures** with `FOR UPDATE` row locks for all ledger/financial operations.
- Ensure all tests and static analysis (`npm run build`) pass before marking tasks complete.
