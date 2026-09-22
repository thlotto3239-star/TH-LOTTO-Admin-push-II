# THLOTTO-II Version Specification

**Current Version:** `3.1.3`  
**Release Name:** Synchronized Notification Badges & Promotion Flow Refinement  
**Release Date:** 2026-09-23  
**Standard:** ARM AI Engineering Standard (ARM-AES v1.0) & Web Development Standards  

---

## Component Versions

| Component | Framework / Tool | Version | Deployment / Host |
|---|---|---|---|
| **Core Architecture** | ARM-AES Standard | `v1.0` | GitHub Master SSOT |
| **System Blueprint** | Markdown Canonical Spec | `v3.1.0` | `docs/SYSTEM_BLUEPRINT.md` |
| **Customer Web Application** | Vite + React + Tailwind CSS | `v1.6.0` (React 19, Vite 8) | Vercel (`origin`) |
| **Admin Control Portal** | Next.js App Router + React + Lucide | `v0.2.1` (Next.js 16.3.4, Turbopack) | Vercel (`admin-deploy`) |
| **Backend Database (BaaS)** | Supabase PostgreSQL | `PostgreSQL 15` (`ygopnjbvccenryejqmlw`) | Supabase Cloud |
| **Atomic Stored Procedures** | PL/pgSQL RPCs | `186 Functions` | Supabase Cloud |
| **Database Schema** | Live PostgreSQL Schema | `41 Tables & Views` | Supabase Cloud |

---

## Verification & Build Status

- **UI Customer (`Vite build`):** Exit Code 0 (Production bundle built in 5.8s)
- **UI Admin (`Next.js Turbopack build`):** Exit Code 0 (Production bundle built in 14.9s)
- **Automated Tests (`Vitest`):** 37/37 Tests Passed (100% Pass Rate)
- **Database Alignment:** 100% Verified against `ygopnjbvccenryejqmlw` (Zero Guesswork)
