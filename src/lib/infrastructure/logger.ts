import pino from "pino";
import { env } from "@/lib/core/config/env";

const isProduction = env.NODE_ENV === "production";

const pinoLogger = pino({
  level: isProduction ? "info" : "debug",
  transport: isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          ignore: "pid,hostname",
        },
      },
});

export class Logger {
  private static redact(obj: any): any {
    if (!obj) return obj;
    if (typeof obj !== 'object') return obj;

    const redacted = { ...obj };
    const sensitiveKeys = ['password', 'token', 'secret', 'card', 'cvv', 'signature', 'creditCard'];

    for (const key of Object.keys(redacted)) {
      if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
        redacted[key] = '***REDACTED***';
      } else if (typeof redacted[key] === 'object') {
        redacted[key] = this.redact(redacted[key]);
      }
    }
    return redacted;
  }

  static trace(message: string, context?: any) {
    if (context) pinoLogger.trace({ context: this.redact(context) }, message);
    else pinoLogger.trace(message);
  }

  static debug(message: string, context?: any) {
    if (context) pinoLogger.debug({ context: this.redact(context) }, message);
    else pinoLogger.debug(message);
  }

  static info(message: string, context?: any) {
    if (context) pinoLogger.info({ context: this.redact(context) }, message);
    else pinoLogger.info(message);
  }

  static warn(message: string, context?: any) {
    if (context) pinoLogger.warn({ context: this.redact(context) }, message);
    else pinoLogger.warn(message);
  }

  static error(message: string, context?: any) {
    if (context) {
      if (context instanceof Error) {
        pinoLogger.error({ err: { message: context.message, stack: context.stack } }, message);
      } else {
        pinoLogger.error({ context: this.redact(context) }, message);
      }
    } else {
      pinoLogger.error(message);
    }
  }
}
