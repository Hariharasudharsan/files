import type { AllDomainEvents } from "@/lib/domain/events";
import { Logger } from "@/lib/infrastructure/logger";

type EventHandler<T extends AllDomainEvents> = (event: T) => Promise<void> | void;

class EventBus {
  private listeners: Map<string, EventHandler<any>[]> = new Map();

  subscribe<T extends AllDomainEvents>(eventName: T["eventName"], handler: EventHandler<T>): void {
    const handlers = this.listeners.get(eventName) || [];
    handlers.push(handler);
    this.listeners.set(eventName, handlers);
  }

  async publish(event: AllDomainEvents): Promise<void> {
    const handlers = this.listeners.get(event.eventName);
    if (!handlers || handlers.length === 0) {
      Logger.warn(`[EventBus] No listeners found for event: ${event.eventName}`);
      return;
    }

    Logger.info(`[EventBus] Publishing event: ${event.eventName}`);

    // Fire and forget (or await, depending on desired strictness).
    // Usually we don't await so we don't block the publisher.
    handlers.forEach(handler => {
      Promise.resolve(handler(event)).catch((err) => {
        Logger.error(`[EventBus] Error in listener for ${event.eventName}:`, err);
      });
    });
  }
}

export const DomainEventBus = new EventBus();

// Initialize subscribers
import { initializeCacheInvalidators } from "./subscribers/cache-invalidator";
initializeCacheInvalidators();
