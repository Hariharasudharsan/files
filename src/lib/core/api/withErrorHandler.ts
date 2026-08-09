import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "../errors/ApiError";
import { Logger } from "@/lib/infrastructure/logger";

type Handler = (req: NextRequest, context?: any) => Promise<NextResponse>;

export function withErrorHandler(handler: Handler): Handler {
  return async (req: NextRequest, context?: any) => {
    try {
      return await handler(req, context);
    } catch (error) {
      if (error instanceof ApiError) {
        Logger.warn(`API Error [${error.code}]: ${error.message}`, error.details);
        return NextResponse.json(
          {
            error: {
              code: error.code,
              message: error.message,
              ...(error.details && { details: error.details }),
            },
          },
          { status: error.statusCode }
        );
      }

      Logger.error("Unhandled API exception", error);

      // In production, mask the actual error details from the client
      const isDev = process.env.NODE_ENV !== "production";
      return NextResponse.json(
        {
          error: {
            code: "INTERNAL_ERROR",
            message: "An unexpected error occurred.",
            ...(isDev && error instanceof Error && { details: error.message }),
          },
        },
        { status: 500 }
      );
    }
  };
}
