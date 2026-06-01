# Manual QA Matrix - Routing / Sidebar / Layout Parity

## Legend
- Expected Shell: `Header + Role Sidebar + Router Content + Footer`
- Checkpoints per route:
  - Opens without route error
  - Correct role sidebar shown
  - Content inside shell (no duplicate shell)
  - Refresh works
  - Back/forward works
  - No route/layout console errors
- Status values: `PASS` / `FAIL` / `NA`

## Environment
- ADV host: `http://localhost:4205/adv`
- CLM host: `http://localhost:4206/claim`

## Creator (ADV + CLM)
| Role | URL | Expected Sidebar | Expected Context | Status |
|---|---|---|---|---|
| Creator | `/creator/inbox` | Creator | ADV queue | PENDING |
| Creator | `/creator/outbox` | Creator | ADV queue | PENDING |
| Creator | `/creator/draft` | Creator | ADV queue | PENDING |
| Creator | `/creator/approved` | Creator | ADV queue | PENDING |
| Creator | `/creator/rejected` | Creator | ADV queue | PENDING |
| Creator | `/creator/passed` | Creator | ADV queue | PENDING |
| Creator | `/creator/not-passed` | Creator | ADV queue | PENDING |
| Creator | `/creator/archive` | Creator | ADV queue | PENDING |
| Creator | `/creator/claim/inbox` | Creator | CLM queue | PENDING |
| Creator | `/creator/claim/outbox` | Creator | CLM queue | PENDING |
| Creator | `/creator/claim/draft` | Creator | CLM queue | PENDING |
| Creator | `/creator/claim/approved` | Creator | CLM queue | PENDING |
| Creator | `/creator/claim/not-approved` | Creator | CLM queue | PENDING |
| Creator | `/creator/claim/passed` | Creator | CLM queue | PENDING |
| Creator | `/creator/claim/not-passed` | Creator | CLM queue | PENDING |
| Creator | `/creator/claim/archive` | Creator | CLM queue | PENDING |
| Creator | `/creator/claim-new` | Creator | CLM claim creation | PENDING |
| Creator | `/creator/movement-update-claim` | Creator | CLM claim workflow | PENDING |
| Creator | `/creator/preview-voucher` | Creator | CLM claim preview | PENDING |

## Approver / Verifier (ADV + CLM)
| Role | URL | Expected Sidebar | Expected Context | Status |
|---|---|---|---|---|
| Approver/Verifier | `/approver/inbox` | Approver | ADV queue | PENDING |
| Approver/Verifier | `/approver/outbox` | Approver | ADV queue | PENDING |
| Approver/Verifier | `/approver/approved` | Approver | ADV queue | PENDING |
| Approver/Verifier | `/approver/not-approved` | Approver | ADV queue | PENDING |
| Verifier | `/approver/passed` | Approver | ADV queue | PENDING |
| Verifier | `/approver/not-passed` | Approver | ADV queue | PENDING |
| Verifier | `/approver/archive` | Approver | ADV queue archive | PENDING |
| Approver/Verifier | `/approver/claim/inbox` | Approver | CLM queue | PENDING |
| Approver/Verifier | `/approver/claim/outbox` | Approver | CLM queue | PENDING |
| Approver/Verifier | `/approver/claim/approved` | Approver | CLM queue | PENDING |
| Approver/Verifier | `/approver/claim/not-approved` | Approver | CLM queue | PENDING |
| Verifier | `/approver/claim/passed` | Approver | CLM queue | PENDING |
| Verifier | `/approver/claim/not-passed` | Approver | CLM queue | PENDING |
| Verifier | `/approver/claim/archive` | Approver | CLM queue archive | PENDING |
| Approver/Verifier | `/approver/preview-voucher` | Approver | CLM detail | PENDING |
| Approver/Verifier | `/approver/movement-update-claim` | Approver | CLM detail | PENDING |
| Approver/Verifier | `/approver/preview-pmt-duty-claim` | Approver | CLM detail | PENDING |
| Approver/Verifier | `/approver/preview-ty-duty-claim` | Approver | CLM detail | PENDING |
| Approver/Verifier | `/approver/preview-fte-claim` | Approver | CLM detail | PENDING |
| Approver/Verifier | `/approver/preview-ltc-claim` | Approver | CLM detail | PENDING |
| Approver/Verifier | `/approver/preview-resettlement-claim` | Approver | CLM detail | PENDING |
| Approver/Verifier | `/approver/form-pmt-duty` | Approver | ADV detail | PENDING |
| Approver/Verifier | `/approver/form-ty-duty` | Approver | ADV detail | PENDING |
| Approver/Verifier | `/approver/form-fte-advance` | Approver | ADV detail | PENDING |
| Approver/Verifier | `/approver/form-ltc-advance` | Approver | ADV detail | PENDING |

## System Admin
| Role | URL | Expected Sidebar | Expected Context | Status |
|---|---|---|---|---|
| System Admin | `/system-admin/dashboard` | System Admin | Dashboard | PENDING |
| System Admin | `/system-admin/statistics` | System Admin | Report | PENDING |
| System Admin | `/system-admin/esign-report` | System Admin | Report | PENDING |
| System Admin | `/system-admin/import` | System Admin | Import queue | PENDING |
| System Admin | `/system-admin/imported` | System Admin | Imported queue | PENDING |
| System Admin | `/system-admin/inbox` | System Admin | Export queue | PENDING |
| System Admin | `/system-admin/exported` | System Admin | Exported queue | PENDING |
| System Admin | `/system-admin/backup-Import` | System Admin | Archive import | PENDING |
| System Admin | `/system-admin/backup-Export` | System Admin | Archive export | PENDING |
| System Admin | `/system-admin/diary-import` | System Admin | Diary import | PENDING |
| System Admin | `/system-admin/diary-imported` | System Admin | Diary imported | PENDING |
| System Admin | `/system-admin/diary-imported-backup` | System Admin | Diary archived | PENDING |
| System Admin | `/system-admin/unit-admin` | System Admin | Manage unit-admin | PENDING |

## Unit Admin
| Role | URL | Expected Sidebar | Expected Context | Status |
|---|---|---|---|---|
| Unit Admin | `/unit-admin/dashboard` | Unit Admin | Dashboard | PENDING |
| Unit Admin | `/unit-admin/unit-admin` | Unit Admin | Manage Unit Admin | PENDING |
| Unit Admin | `/unit-admin/role` | Unit Admin | Manage Role | PENDING |
| Unit Admin | `/unit-admin/update-pmt-unit` | Unit Admin | Update PMT Unit | PENDING |
| Unit Admin | `/unit-admin/report-ty-duty` | Unit Admin | TY Duty report | PENDING |
| Unit Admin | `/unit-admin/manage-paylevel-transaction` | Unit Admin | Paylevel | PENDING |
| Unit Admin | `/unit-admin/archive` | Unit Admin | Archive | PENDING |

## Defect Log Template
| Route | Observed | Expected | Screenshot Ref | Severity | Owner |
|---|---|---|---|---|---|
| example | Sidebar missing | Creator sidebar present | QA-001.png | High | Frontend |

