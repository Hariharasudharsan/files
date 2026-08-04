import { DomainEventBus } from "../event-bus";
import { CacheService } from "../../cache/cache-service";
import { CacheNamespaces } from "../../cache/cache-policies";
import { getStorefrontProducts } from "@/lib/services/catalog-service";
import { Logger } from "../../logger";

/**
 * Initializes the Cache Invalidator Event Subscribers.
 * This decoupled architecture ensures that the caching subsystem automatically 
 * invalidates records when business events (like ERP syncs) occur, without tightly
 * coupling the caching logic to the repository.
 */
import type { ProductUpdatedEvent } from "@/lib/domain/events";

export function initializeCacheInvalidators() {
  DomainEventBus.subscribe("ProductUpdated", async (e) => {
    const event = e as ProductUpdatedEvent;
    Logger.info("[CacheInvalidator] Invalidating catalog cache for ProductUpdated event", { slug: event.payload.slug });
    
    // Invalidate the namespaced keys
    await CacheService.invalidatePattern(`${CacheNamespaces.CATALOG}*`);
    await CacheService.invalidatePattern(`${CacheNamespaces.SEARCH}*`);

    // Cache Warming! 
    // We execute a background fetch so the next customer doesn't pay the cache miss penalty.
    Logger.info("[CacheInvalidator] Warming cache in background...");
    getStorefrontProducts().then(() => {
      Logger.info("[CacheInvalidator] Cache warming complete.");
    }).catch((err) => {
      Logger.error("[CacheInvalidator] Cache warming failed", { error: err });
    });
  });
}
