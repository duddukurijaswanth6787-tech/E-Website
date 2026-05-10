# Horizontal Scaling & Distributed Realtime Infrastructure

This document outlines the architecture and deployment requirements for scaling the Vasanthi Creations ERP backend to multiple instances.

## 1. Socket.IO Redis Adapter

We use the `@socket.io/redis-adapter` to synchronize Socket.IO events across multiple Node.js instances.

### How it works:
- When a server instance emits an event (e.g., `io.to('branch:1').emit('workflow_updated')`), the adapter publishes the event to Redis Pub/Sub.
- All other server instances receive the event from Redis and emit it to any connected clients in that room.
- This ensures that a client on Instance A receives updates even if the mutation occurred on Instance B.

### Redis Requirements:
- A standalone Redis instance (v6+) is required for Phase 3.2.
- The backend configuration requires a `REDIS_URL` environment variable.
- Dedicated Pub/Sub clients are created to avoid blocking the main application Redis client.

## 2. Load Balancer & Sticky Sessions

**IMPORTANT**: Sticky sessions (Session Affinity) are REQUIRED for Socket.IO when using HTTP long-polling as a fallback.

### Why?
- The Socket.IO handshake consists of multiple HTTP requests.
- If the load balancer sends these requests to different server instances, the handshake will fail.
- Once the WebSocket is established, it is a persistent connection, but the initial upgrade process depends on session stickiness.

### Nginx Configuration Example:
```nginx
upstream erp_backend {
    ip_hash; # Enables sticky sessions
    server 10.0.0.1:5000;
    server 10.0.0.2:5000;
}

server {
    listen 80;
    location /socket.io/ {
        proxy_pass http://erp_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

## 3. Distributed Soft Locks

Soft locks (advisory locks) for Kanban editing are Redis-backed.
- Key Namespace: `vc:realtime:locks:{workflowId}`
- Expiry: 15 seconds (automatically released if the client stops heartbeating).
- Graceful Fallback: If Redis is unavailable, the system degrades to in-memory locking per instance.

## 4. Presence Tracking

The presence system tracks active managers and tailors across the cluster.
- Key Namespace: `vc:realtime:presence:user:{userId}`
- Branch Visibility: `vc:realtime:presence:branch:{branchId}` (Redis Set)

## 5. Monitoring

Realtime health can be monitored via `GET /api/health/realtime`.
- `status`: "healthy" or "degraded" (Redis status).
- `transport.adapter`: "redis" or "in-memory".
- `transport.totalConnections`: Aggregated count (local instance).

## 6. Future Scalability

- **Redis Cluster**: For massive horizontal scaling, the adapter can be configured to use a Redis Cluster.
- **Microservices**: The Domain Event Bus (local) can be bridged to a distributed message broker (Kafka/RabbitMQ) for inter-service communication.
- **Binary Payloads**: For high-throughput scenarios, consider MsgPack or Protobuf for Socket.IO payloads.
