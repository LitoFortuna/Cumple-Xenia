# Órbita-X Firestore Security Specification (Phase 0)

## 1. Data Invariants
1. **Strict Guest Confidentiality (Write-Only Dropbox)**: Guests may ONLY create new `characterSubmissions` or `rumorSubmissions` documents with `syncedToSheets == false` and server-verified `createdAt == request.time`. Guests can NEVER `get`, `list`, `update`, or `delete` any submission document, preventing them from reading other guests' PII (emails), characters, or rumors.
2. **Private Google Sheet Isolation**: The organizer's Google Spreadsheet ID and title in `/organizerConfig/{configId}` are strictly restricted to the verified organizer (`raulfdz3@gmail.com` with `email_verified == true` or registered admin UID). Guests cannot read, list, create, update, or delete any config document.
3. **Immutable Audit Fields**: `createdAt` is always set to `request.time` on creation and can never be modified on update.
4. **Strict Schema Enforcement**: Every document creation validates `hasAll` + `hasOnly` keys (blocking ghost/shadow fields), strict types, string length caps, regex formats, and `isValidId()` path validation.
5. **Verified Admin Gate**: Organizer access strictly checks `request.auth.token.email == 'raulfdz3@gmail.com' && request.auth.token.email_verified == true`. Unverified emails and any other Google accounts are rejected.

## 2. The "Dirty Dozen" Adversarial Payloads (Must Return PERMISSION_DENIED)
1. **Guest Read Character PII**: Unauthenticated or non-admin user calls `get('/characterSubmissions/sub_001')`.
2. **Guest List Rumors**: Unauthenticated or non-admin user calls `list('/rumorSubmissions')`.
3. **Guest Read Private Sheet Config**: Non-admin user calls `get('/organizerConfig/sheets')`.
4. **Ghost / Shadow Field Injection**: Create `characterSubmissions/sub_002` with extra key `isAdmin: true`.
5. **Sync State Forgery on Create**: Create `characterSubmissions/sub_003` with `syncedToSheets: true` or `syncedAt: request.time`.
6. **Timestamp Forgery on Create**: Create `rumorSubmissions/sub_004` with client-supplied past timestamp instead of `request.time`.
7. **ID Poisoning**: Create `characterSubmissions/` with a 200-character or special-character document ID.
8. **Resource Exhaustion (1MB String)**: Create `rumorSubmissions/sub_005` with `mania` longer than 800 characters.
9. **Invalid Email Format**: Create `characterSubmissions/sub_006` with `email: "not-an-email"`.
10. **Email Spoofing (Unverified Admin Email)**: Read `/organizerConfig/sheets` with `email == 'raulfdz3@gmail.com'` and `email_verified == false`.
11. **Non-Admin Update / Delete**: Non-admin tries to mark `rumorSubmissions/sub_001` as synced or delete it.
12. **Privilege Escalation**: Non-admin tries to create `/admins/{uid}` to grant themselves organizer rights.
