import { logger } from "@/lib/utils/logger";

export interface RetryOptions {
  attempts: number;
  delayMs: number;
  factor?: number;
  operationName: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  { attempts, delayMs, factor = 2, operationName }: RetryOptions
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (err) {
      lastError = err;
      logger.warn("Retryable operation failed", {
        operationName,
        attempt,
        attempts,
        error: err instanceof Error ? err.message : String(err),
      });

      if (attempt < attempts) {
        await sleep(delayMs * Math.pow(factor, attempt - 1));
      }
    }
  }

  throw lastError;
}
