# Role-Wise Routing and Sidebar Audit Report

## Scope Covered
- Root routing: `app-routing.module.ts`
- Creator: `creator-routing.module.ts`, creator sidebar, creator queue/detail flows
- Approver/Verifier: `approver-routing.module.ts`, approver sidebar, queue/detail flows
- System Admin: `system-admin-routing.module.ts`, system-admin sidebar
- Unit Admin: `unit-admin-routing.module.ts`, unit-admin sidebar

## Canonical URL Pattern
- Creator (ADV): `/creator/...`
- Creator (CLM): `/creator/claim/...` and claim-specific pages under `/creator/...` where legacy used dedicated pages
- Approver/Verifier (ADV): `/approver/...`
- Approver/Verifier (CLM): `/approver/claim/...`
- System Admin: `/system-admin/...`
- Unit Admin: `/unit-admin/...`
- Executor: `/executor/...`

## Key Fixes Implemented
- Queue module context restored with route metadata (`queueModule: ADV|CLM`) in creator + approver queue routes.
- Claim queue redirect-collapse removed and replaced with real routes (creator + approver).
- Sidebar links corrected for module-aware navigation:
  - Creator CLM menu uses `claim/*` routes.
  - Approver sidebar queue links are runtime-module aware via shared helper.
- Queue APIs now receive explicit module context (`formId: ADV|CLM`) for creator + approver queue components.
- Legacy-style page parity restored using dedicated wrapper components (no duplicated business logic):
  - Creator claim queue wrappers
  - Creator claim form/preview wrappers
  - Approver claim queue wrappers
  - Approver claim detail/preview wrappers
  - Approver advance detail/preview wrappers

## Duplicate/Unreachable/Bypass Findings (Current State)
- Static duplicate-path scan across `creator/approver/system-admin/unit-admin` routing modules: **no duplicate route paths found**.
- No active `/claim/creator/...` double-prefix route declaration in Angular routing.
- No route-level shell bypass found in creator/approver/system-admin/unit-admin modules after refactor.
- Legacy alias routes intentionally retained where backward compatibility needed (example: `claim-archive` alias to `claim/archive` in approver).

## Sidebar Link Audit Summary
- Creator sidebar links: valid against creator routes, including CLM queue family.
- Approver sidebar links: valid against approver routes, queue links now resolve to ADV/CLM namespace correctly.
- System admin sidebar links: all mapped to existing system-admin routes.
- Unit admin sidebar links: mapped to existing unit-admin routes (`unit-admin`, `role`, `update-pmt-unit`, `report-ty-duty`, `manage-paylevel-transaction`).

## Build/Smoke Validation
- `npm run build:claim` passed after each major refactor batch.
- `npm run build:adv` passed after each major refactor batch.

## Remaining Manual QA Checklist
- Verify login landing + sidebar for each role.
- Verify creator queue family on both hosts:
  - `http://localhost:4205/adv/creator/*`
  - `http://localhost:4206/claim/creator/claim/*`
- Verify approver queue family on both ADV/CLM runtime contexts.
- Verify no duplicate shell rendering and no excessive content left-margin.
- Verify refresh and back/forward on deep routes (queue + preview + detail pages).

## Stakeholder Confirmation Items
- Final keep/remove list for legacy aliases beyond currently preserved compatibility routes.
- Whether unit-admin sidebar should also expose `dashboard/archive` explicitly (currently route-valid but not listed in sidebar).
