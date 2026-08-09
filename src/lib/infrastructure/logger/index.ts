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
  static trace(message: string, meta?: any) {
    if (meta) pinoLogger.trace(meta, message);
    else pinoLogger.trace(message);
  }

  static debug(message: string, meta?: any) {
    if (meta) pinoLogger.debug(meta, message);
    else pinoLogger.debug(message);
  }

  static info(message: string, meta?: any) {
    if (meta) pinoLogger.info(meta, message);
    else pinoLogger.info(message);
  }

  static warn(message: string, meta?: any) {
    if (meta) pinoLogger.warn(meta, message);
    else pinoLogger.warn(message);
  }

  static error(message: string, error?: any) {
    if (error) {
      if (error instanceof Error) {
        pinoLogger.error({ err: { message: error.message, stack: error.stack } }, message);
      } else {
        pinoLogger.error(error, message);
      }
    } else {
      pinoLogger.error(message);
    }
  }
}
