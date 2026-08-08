import { env } from "@/lib/core/config/env";

/**
 * Enterprise Structured Logging Interface
 * 
 * Centralized logging utility. Future-proofed to easily swap console.log 
 * with Winston, Pino, or Datadog integrations.
 */

type LogLevel = "TRACE" | "DEBUG" | "INFO" | "WARN" | "ERROR";

export class Logger {
  private static format(level: LogLevel, message: string, meta?: any) {
    const payload = {
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      level,
      message,
      ...(meta && { meta })
    };
    
    // In production, you would stream this JSON to a service like Datadog
    return env.NODE_ENV === "production" ? JSON.stringify(payload) : `[${level}] ${message} ${meta ? JSON.stringify(meta) : ''}`;
  }

  static trace(message: string, meta?: any) {
    if (env.NODE_ENV !== "production") console.trace(this.format("TRACE", message, meta));
  }

  static debug(message: string, meta?: any) {
    if (env.NODE_ENV !== "production") console.debug(this.format("DEBUG", message, meta));
  }

  static info(message: string, meta?: any) {
    console.info(this.format("INFO", message, meta));
  }

  static warn(message: string, meta?: any) {
    console.warn(this.format("WARN", message, meta));
  }

  static error(message: string, error?: any) {
    console.error(this.format("ERROR", message, { 
      error: error instanceof Error ? { message: error.message, stack: error.stack } : error 
    }));
  }
}
