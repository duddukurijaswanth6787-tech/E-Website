# Distributed Redis Payment Idempotency Locking System — Blueprint & Operations Manual

This guide outlines the runtime primitives, configuration properties, administrative metrics targets, and automated simulation verification instructions for the production-grade **Redis Payment Idempotency Locking System** integrated within the backend architecture.

---

## 1. Core Architectural Layout

The distributed lock layer guarantees **exactly-once execution behavior** across high-concurrency external triggers (e.g., duplicate Razorpay webhook retries, concurrent manual Administration updates, automatic background Reconciliation repair workers, and multi-instance distributed cluster horizontal scaling).

```
+-----------------------------------------------------------------------------------+
|                           INCOMING OPERATIONAL STREAM                             |
|    (Razorpay Webhooks / Reconciliation Task Loops / Admin Actions / Refunds)      |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                          PREFIXED NAMESPACE MAP GENERATION                        |
|   Formats: payment:webhook:{eventId}        | payment:order:{orderId}             |
|            payment:inventory:{orderId}      | payment:refund:{paymentId}          |
|            payment:reconciliation:{orderId}                                       |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                        ATOMIC REDIS ACQUISITION HANDSHAKE                         |
|   Executes: SET key workerId NX PX ttlMs via singleton client instances           |
|   Fallback Mode: Seamless local memory Sets simulation preventing downtime        |
+-----------------------------------------------------------------------------------+
                                         |
               +-------------------------+-------------------------+
               |                                                   |
        [Lock Acquired]                                     [Lock Busy]
               |                                                   |
               v                                                   v
+-----------------------------+                     +-----------------------------+
|    PROTECTED TRANSACTION    |                     |    DUPLICATE INTERCEPTION   |
| Executes operations safely  |                     | Returns HTTP 200 or skips   |
| Extends TTL if slow-running |                     | Updates contention telemetries|
+-----------------------------+                     +-----------------------------+
               |
               v
+-----------------------------------------------------------------------------------+
|                         ATOMIC LUA SCRIPTED UNHOOK SEQUENCE                       |
|   Validates exactly: if redis.call("get",KEYS[1]) == ARGV[1] then del else 0 end  |
|   Eliminates risks of slow-running threads clearing subsequent worker locks       |
+-----------------------------------------------------------------------------------+
```

---

## 2. Namespace Specifications & Safety Enforcements

### A. Webhook Flood Preemption (`payment:webhook:{eventId}`)
Intercepts duplicate HTTP stream posts arriving simultaneously from Gateway target clusters. Returns instant HTTP `200` acknowledgments to unhook external webhooks cleanly while avoiding identical background processes.

### B. Double Stock Subtraction Defense (`payment:inventory:{orderId}`)
Wraps inventory reduction array mutation calls (`variants.$.stock`) to guarantee stock quantities decrement precisely once per order lifecycle.

### C. Reconciliation Worker Overlap Interceptor (`payment:reconciliation:{orderId}`)
Guarantees isolated processing loops across multiple horizontal replicas executing simultaneous catalog verification sweep iterations.

### D. Double Distribution Shield (`payment:refund:{paymentId}`)
Blocks multi-click race conditions during administration management refund allocations.

---

## 3. Administration Dashboard APIs

Exposes monitoring primitives mapping live locking matrix analytics beneath base mapping: `/api/v1/admin/idempotency`

### A. Telemetry Metrics Inspection
- **Endpoint**: `GET /api/v1/admin/idempotency/metrics`
- **Headers**: `Authorization: Bearer <Admin_Access_Token>`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "metrics": {
        "duplicatePreventionCount": 482,
        "lockContentionCount": 12,
        "lockTimeoutCount": 0,
        "failedAcquisitionCount": 1
      },
      "redisCluster": {
        "status": "connected",
        "reconnectCount": 2,
        "lastPing": "2026-05-12T13:00:00.000Z",
        "fallbackActive": false
      },
      "timestamp": "2026-05-12T13:00:05.000Z"
    }
  }
  ```

### B. Forceful Stale Mutex Override Clearance
- **Endpoint**: `POST /api/v1/admin/idempotency/clear-lock`
- **Body**: `{ "key": "payment:reconciliation:60b9b3b4..." }`
- **Headers**: `Authorization: Bearer <Admin_Access_Token>`
- **Behavior**: Unhooks blocked synchronization bounds securely logging overriding operations immediately.

---

## 4. Operational Simulation & Concurrency Testing Protocols

### Simulation 1: Webhook Retry Flood Emulation
1. Configure Postman or load generator instances executing 5 concurrent parallel requests pushing identical Gateway event bodies (`event: 'payment.captured'`).
2. Examine operational log traces. Observe exactly the initial request acquiring the mutex string and proceeding down into core persistence engines.
3. Observe all subsequent 4 sibling requests returning early output markers confirming `[Redis Lock] Concurrent duplicate webhook handshake intercepted` while leaving tracking data undisturbed.

### Simulation 2: Distributed Node Reconnection / Local Fallback Survival
1. Terminate or simulate local network firewall isolation targeting running Redis container instances.
2. Push standard payment authorization actions via checkout components.
3. Observe application log outputs outputting `⚠️ [Idempotency Redis Drop] Distributed check failed... Shifting to safe fallback checking` while executing correctly using local in-memory Set lookup bypass layers preventing core back-office application downtime entirely.
