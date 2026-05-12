# Production Payment Reconciliation Worker System — Setup & Integration Manual

This guide describes the configuration, execution boundaries, and troubleshooting sequences for the **Payment Reconciliation Worker System** integrated natively into the back-office ERP platform.

---

## 1. System Architecture Summary

The reconciliation system runs as an independent, non-blocking polling engine designed to auto-repair anomalous transaction tracking states caused by transient network interruptions, dropped Gateway webhooks, or asynchronous race conditions.

```
+-------------------------------------------------------------------------+
|                      BACKGROUND POLLING ENGINE                          |
|  Loop Cadence: RECONCILIATION_INTERVAL_MS (Default: 5 mins)            |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                       DATABASE CATALOG SCANNER                          |
|  Scans Orders: paymentStatus in ['pending', 'failed']                   |
|  Filters: Lookback window bounds + max retries verification checks      |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                    ATOMIC LOCK ACQUISITION LAYER                        |
|  Sets: reconciliationLocked = true, locks against overlapping workers   |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                     EXTERNAL SDK HANDSHAKE ENGINE                       |
|  Invokes: getRazorpayInstance().orders.fetchPayments(gatewayOrderId)    |
+-------------------------------------------------------------------------+
                                    |
        +---------------------------+---------------------------+
        |                           |                           |
        v                           v                           v
+---------------+           +---------------+           +---------------+
|   SUCCESS     |           |    FAILED     |           |   REFUNDED    |
| Auto-Repairs: |           | Syncs reasons |           | Updates state |
| status = paid |           | updates audit |           | records amount|
+---------------+           +---------------+           +---------------+
        |
        v
+-------------------------------------------------------------------------+
|                 EXACTLY-ONCE INVENTORY SYNCHRONIZER                     |
|  Verifies: reconciliationInventoryReduced !== true                      |
|  Executes: Array-filtered atomic SKU updates ($inc) cleanly            |
+-------------------------------------------------------------------------+
```

---

## 2. Environment Configuration Matrix

Append the following configuration directives inside your backend root `.env` mapping setup:

```env
# Enable/disable standalone background auto-repair scheduling loops
RECONCILIATION_ENABLED=true

# Execution interval spacing cadence between subsequent worker loops (in milliseconds)
RECONCILIATION_INTERVAL_MS=300000

# Maximum auto-repair validation handshake iterations allowed before moving to Dead-Letter state
RECONCILIATION_MAX_RETRIES=5

# Retrospective lookup time window scanning candidate anomalous orders (in minutes)
RECONCILIATION_LOOKBACK_MINUTES=60

# Max document block processing volume per iteration pass targeting controlled query limits
RECONCILIATION_BATCH_SIZE=25
```

---

## 3. Administration Visibility Inspection API Targets

The Administration Dashboard interfaces directly with the worker thread infrastructure using the following mapped REST resources under base route target: `/api/v1/admin/reconciliation`

### A. Dashboard Metrics Aggregator
- **Endpoint**: `GET /api/v1/admin/reconciliation/analytics`
- **Headers**: `Authorization: Bearer <Admin_Access_Token>`
- **Response Format**:
  ```json
  {
    "success": true,
    "data": {
      "totalRepaired": 142,
      "totalFailed": 3,
      "deadLetterCount": 1,
      "activePendingOrphans": 4,
      "timestamp": "2026-05-12T13:00:00.000Z"
    }
  }
  ```

### B. Paginated Historical Ledger Queries
- **Endpoint**: `GET /api/v1/admin/reconciliation/logs?page=1&limit=10&success=true`
- **Headers**: `Authorization: Bearer <Admin_Access_Token>`
- **Response Format**: Returns structured log arrays including reference mappings to specific order parameters alongside complete underlying Gateway JSON returns.

### C. Manual On-Demand Order Repair Handshake Trigger
- **Endpoint**: `POST /api/v1/admin/reconciliation/:orderId/retry`
- **Headers**: `Authorization: Bearer <Admin_Access_Token>`
- **Behavior**: Overrides standard time-window restrictions, forcefully locks target documents, interrogates live external SDK endpoints, mutates parameters correctly, and clears catalog inventory arrays instantly.

---

## 4. Simulated Verification Protocols

### Verification 1: Safe Double-Reduction Protection Check
1. Manually set an existing Order parameter mapping to `paymentStatus: 'pending'` while maintaining `reconciliationInventoryReduced: true`.
2. Trigger the automated reconciliation pass using the manual inspection POST API endpoint.
3. Observe real-time server output logs confirming successful status mutations while skipping catalog stock reductions entirely to prevent anomalous sub-zero stock conditions.

### Verification 2: Dead-Letter Handshake Handling
1. Modify a target document setting its retry tracker entries above `5`.
2. Let the background task scheduler sweep the sequence.
3. Observe localized database logs categorizing the handshakes cleanly as `dead_letter_drop` to prevent continuous infinite background thread loops.
