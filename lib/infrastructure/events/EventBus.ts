import { EventEmitter } from 'events';
import { DomainEvent } from '../../core/domain/events/DomainEvent';

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
        console.error(`Error handling event ${eventType}:`, err);
      }
    });
  }

  public async publish(event: DomainEvent): Promise<void> {
    // 1. Write to outbox FIRST for guaranteed delivery
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
    this.emitter.emit(event.eventType, event);
  }
}

export const eventBus = EventBus.getInstance();
