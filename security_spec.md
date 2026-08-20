# Security Spec for SmartCRM AI

## Data Invariants
1. Users can only read and write their own documents (where `userId == request.auth.uid` or document ID matches UID).
2. A lead cannot exist without a valid User ID that belongs to the user.
3. An activity cannot exist without a valid Lead ID.
4. Timestamps (`createdAt`, `updatedAt`, `date`) must be strictly enforced server timestamps.
5. `score` cannot be tampered with improperly, although it's an AI CRM, the user can modify it or the AI can modify it via the client. We assume AI updates are done locally for this client app, so `score` is updatable by the owner.
6. The size of arrays and strings must be constrained.

## The Dirty Dozen Payloads
1. Create Lead with someone else's userId.
2. Update Lead to change userId.
3. Create Activity for a lead that the user does not own.
4. Update Activity to change leadId.
5. Create Lead with `createdAt` not equal to server timestamp.
6. Update Lead with `updatedAt` not equal to server timestamp.
7. Shadow update Lead with extra fields (`isVerified: true`).
8. Create Lead with name > 128 chars.
9. Email spoofing (create user with email of another but not verified).
10. Blanket read of Leads (query without `userId == request.auth.uid`).
11. Update Lead status to invalid value.
12. Create Activity with missing `userId`.
