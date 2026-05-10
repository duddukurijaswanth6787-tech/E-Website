# Realtime ERP Engine — Testing Strategy

This document covers how to validate the Phase 3.1 Socket.IO realtime
engine end-to-end. It pairs with the runnable integration test at
`backend/src/realtime/__tests__/realtime.integration.ts`.

Run automated checks:

```bash
cd backend
npm run test:realtime
```

The script boots an isolated Socket.IO server (no DB required), stubs the
auth middleware so principals can be injected, and asserts:

1. **RBAC namespace gating** — a tailor cannot connect to `/manager`.
2. **Branch-scoped fan-out** — `workflow_updated` reaches branch-A
   managers and is _not_ delivered to branch-B managers.
3. **Tailor personal room** — `workflow_assigned` is delivered only to
   the matching tailor's room.
4. **Soft locks** — acquire fires `workflow_lock_changed` to the branch
   and the lock auto-expires within TTL.
5. **Resync** — `RESYNC_REQUEST` from the client triggers a server
   `SYNC_REQUIRED` event for that socket.

## Manual / browser test plan

The cases below should be exercised in the actual UI before sign-off.

### Multi-user / multi-tab

- Open the manager Kanban in two tabs, both authenticated as different
  managers in the same branch. Drag a card in tab 1 → tab 2 must update
  within ~200ms with no manual refresh.
- Open the same Kanban as a manager in branch B. Confirm changes from
  branch A do _not_ appear.

### Concurrent manager edits (revision conflict)

- In tab 1: drag card from "Cutting" → "Stitching".
- In tab 2 (before realtime patch lands): drag the same card to
  "Embroidery". Backend should respond with HTTP 409 and the UI must
  show "Another user updated this card — refreshing." and pull the
  latest state.

### Optimistic rollback

- Drag a card to an _invalid_ next status (e.g. "Assigned" → "QC"). The
  frontend pre-validates and rejects with a toast _before_ HTTP. If
  bypassed, server returns 400 and the UI must rollback.

### Reconnect / offline

- Connect a manager session.
- Disable the network adapter (or `kill -STOP` the backend) for ~10s.
- Re-enable; the live indicator should go `connected → reconnecting →
  connected`. After reconnect, the client emits `RESYNC_REQUEST` and
  receives `SYNC_REQUIRED`, which invalidates the workflow caches and
  triggers a refetch.

### Tailor reassignment broadcast

- As manager: reassign a workflow from tailor A to tailor B.
- Tailor A's dashboard should remove the task; tailor B's dashboard
  should show it (with a toast).

### QC rejection

- As QC manager: transition a task QC → Rework.
- Confirm `workflow_qc_rejected` reaches the assigned tailor and shows
  an error toast.

## Performance / load (smoke)

For a quick check of broadcast scaling locally:

1. Spin up the server with `npm run dev`.
2. Use [Artillery](https://artillery.io/) or a small Node script to
   open N socket clients with stub manager principals (point them at a
   short-lived JWT issued by the `/manager-auth/login` route).
3. Trigger `workflow_updated` via HTTP and observe broadcast latency
   and CPU. Branch rooms should keep traffic O(branch size), not O(N).

For real load testing across instances, switch the Socket.IO transport
to the Redis adapter (`@socket.io/redis-adapter`) and run multiple
backend processes behind a sticky load balancer.

## Test extensions to consider

- Unit-test `lockManager` for TTL/expiry edge cases.
- Add a test for `WORKFLOW_LOCK_REQUEST` rejected on branch mismatch.
- Add a test that admin tokens with no `branchId` can still receive
  branch broadcasts when they explicitly subscribe to a workflow.
