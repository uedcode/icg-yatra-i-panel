# Role Queue Refactor Plan (Creator + Approver)

## Goal
- Legacy parity: ADV and CLM queue screens remain behaviorally separate.
- No duplicated shell/sidebar markup.
- Route, menu, and API context must always carry module context (`ADV` / `CLM`).

## Phase 1 (Completed)
- Creator queue routes split (`/creator/*` and `/creator/claim/*`) with `queueModule` route data.
- Creator sidebar CLM links moved to `claim/*`.
- Creator queue APIs now pass `formId` by module context.
- Approver queue routes split similarly with `queueModule` route data.
- Approver sidebar queue links made runtime-module aware.
- Approver queue APIs now pass module-aware `formId`.

## Phase 2 (Next)
- Create dedicated ADV/CLM wrapper components where legacy had separate JSP pages:
  - Creator: `inbox`, `outbox`, `draft`, `approved`, `not-approved/rejected`, `passed`, `not-passed`, `archive`
  - Approver: `inbox`, `outbox`, `approved`, `not-approved/rejected`, `passed`, `not-passed`, `archive`
- Shared base logic extraction:
  - Keep one reusable queue base/service utility for common table/filter/history logic.
  - Keep page-specific components thin and module-context explicit.

## Phase 3
- Menu active-state parity validation for ADV vs CLM entries.
- Alias policy lock:
  - Keep only intentional backward-compatible aliases.
  - Remove shadow/duplicate routes after stakeholder sign-off.

## Phase 4
- Full route audit report finalization:
  - duplicate/unreachable/layout bypass/prefix mismatch tables
  - role-wise canonical URL map
  - QA matrix with manual runtime checks

## Verification Gate Per Phase
- `npm run build:adv`
- `npm run build:claim`
- quick URL smoke (creator + approver queue family)
