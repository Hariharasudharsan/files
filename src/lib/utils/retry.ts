import { logger } from "@/lib/utils/logger";

export interface RetryOptions {
  attempts: number;
  delayMs: number;
  factor?: number;
  operationName: string;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    attempts: number;
    delayMs: number;
    operationName: string;
  },
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= options.attempts; attempt++) {
    try {
      return await operation();
    } catch (err) {
      lastError = err;
      logger.warn(`Retry ${attempt}/${options.attempts} failed for ${options.operationName}`, {
        error: err,
      });
      if (attempt < options.attempts) {
        await new Promise((resolve) => setTimeout(resolve, options.delayMs));
      }
    }
  }

  logger.error(`All ${options.attempts} retries failed for ${options.operationName}`, {
    error: lastError,
  });
  throw lastError;
}
