# ARM AI Engineering Standard (ARM-AES) Workspace Rule

This project strictly follows the **ARM AI Engineering Standard (ARM-AES) v1.0**.

The full specification is defined in [ARM-AI-ENGINEERING-STANDARD.md](file:///c:/Users/armyn/Downloads/THLOTTO-II/ARM-AI-ENGINEERING-STANDARD.md).

## Non-Negotiable Core Principles & Ironclad Rules
1. **Never jump directly to code generation:** Always follow `UNDERSTAND ──> CLARIFY ──> PLAN ──> SPECIFY ──> BREAK INTO TASKS ──> IMPLEMENT ──> TEST ──> REVIEW ──> VERIFY ──> COMPLETE`.
2. **Explicit Working Modes:** Respect DISCOVERY, PLANNING, SPECIFICATION, EXECUTION, VERIFICATION, REVIEW, and DEBUGGING modes.
3. **Security by Design:** Validate at boundary, enforce server-side authorization, never commit or expose secrets.
4. **Root-Cause Debugging (RCD):** Observe ➔ Reproduce ➔ Isolate ➔ Root Cause ➔ Fix ➔ Test ➔ Verify. Never blindly patch symptoms.
5. **Definition of Done (DoD):** Verify code with static analysis, linters, tests, and diff review before marking complete.
6. **Stop & Ask Conditions:** Immediately pause and confirm with the user for contradictory requirements, missing permission boundaries, risk of data loss, destructive migrations, or safety gate changes.
7. **Documentation Discipline:** Maintain `docs/requirements.md`, `docs/architecture.md`, `docs/technical-spec.md`, and `docs/tasks/` when working on substantive features.
8. **Prior Summary & Explicit Permission Required:** NEVER modify code, execute mutating scripts, or alter core application logic without first inspecting active code, presenting findings transparently to the user, and receiving explicit permission to proceed.
9. **Zero Assumption on Schema / State:** Ground truth must always be verified against active database rows and existing git history before making assumptions about table columns, relational mappings, or system settings.
