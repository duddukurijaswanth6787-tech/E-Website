import { EventEmitter } from 'events';
import type { ErpServerEvent } from '../events/erpEvents';
import type { RealtimeEvent } from '../events/types';

/**
 * In-process pub/sub bridge between the workflow service layer and the
 * Socket.IO transport layer.
 *
 * Why a bus and not direct `io.emit`?
 * - keeps controllers/services decoupled from socket internals
 * - lets us add more subscribers later (e.g. WhatsApp dispatcher,
 *   webhook fan-out, audit ledger) without touching domain code
 * - lets us swap the transport (Redis pub/sub, BullMQ) cleanly
 */
class DomainEventBus extends EventEmitter {
  constructor() {
    super();
    // Realtime fan-out can have many subscribers (transport, dispatcher,
    // analytics streams). Lift the default warning ceiling.
    this.setMaxListeners(50);
  }

  publish<TPayload>(event: RealtimeEvent<TPayload>): void {
    // Emit on both a wildcard channel and the typed channel so subscribers
    // can listen broadly (transport) or narrowly (notification dispatcher).
    this.emit('domain_event', event);
    this.emit(event.type, event);
  }

  onAny(listener: (event: RealtimeEvent<unknown>) => void): () => void {
    this.on('domain_event', listener);
    return () => this.off('domain_event', listener);
  }

  onType<TPayload>(
    type: ErpServerEvent,
    listener: (event: RealtimeEvent<TPayload>) => void,
  ): () => void {
    this.on(type, listener as (event: RealtimeEvent<unknown>) => void);
    return () =>
      this.off(type, listener as (event: RealtimeEvent<unknown>) => void);
  }
}

export const domainEventBus = new DomainEventBus();
