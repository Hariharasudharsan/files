import { Logger } from "@/lib/infrastructure/logger";
import { EventEmitter } from 'events';
import { DomainEvent } from '../../core/domain/events/DomainEvent';

import { PrismaClient, Prisma } from '@prisma/client';
import { prisma } from "@/lib/infrastructure/database/prisma";

export class EventBus {
  private static instance: EventBus;
  private emitter: EventEmitter;

  private constructor() {
    this.emitter = new EventEmitter();
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public subscribe(eventType: string, handler: (event: DomainEvent) => Promise<void>): void {
    this.emitter.on(eventType, async (event: DomainEvent) => {
      try {
        await handler(event);
      } catch (err) {
        Logger.error(`Error handling event ${eventType}:`, err);
      }
    });
  }

  /**
   * Used strictly inside a database transaction to ensure atomicity.
   */
  public async publishWithinTransaction(tx: any, event: DomainEvent): Promise<void> {
    await tx.outboxEvent.create({
      data: {
        aggregateId: event.aggregateId,
        aggregateType: event.aggregateType,
        eventType: event.eventType,
        payload: event.payload as any,
        published: false
      }
    });
  }

  /**
   * For direct emit in scenarios where outbox might not be needed or handled by the outbox worker.
   */
  public async publish(event: DomainEvent): Promise<void> {
    // 1. Write to outbox FIRST for guaranteed delivery if we are not in a transaction
    // WARNING: This is dangerous because it's not atomic. Prefer publishWithinTransaction.
    await prisma.outboxEvent.create({
      data: {
        aggregateId: event.aggregateId,
        aggregateType: event.aggregateType,
        eventType: event.eventType,
        payload: event.payload as any,
        published: false
      }
    });

    // 2. Emit internally for synchronous/immediate handlers (if any)
    this.dispatch(event);
  }

  /**
   * Dispatch the event to in-memory subscribers. Used by OutboxWorker.
   */
  public async dispatch(event: DomainEvent): Promise<void> {
    this.emitter.emit(event.eventType, event);
  }
}

export const eventBus = EventBus.getInstance();
