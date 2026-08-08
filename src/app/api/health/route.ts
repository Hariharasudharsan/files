import { NextResponse } from 'next/server';
import { prisma } from "@/lib/infrastructure/database/prisma";
import { redisClient } from "@/lib/infrastructure/cache/cache-service";

export async function GET() {
  const health = {
    status: 'UP',
    timestamp: new Date().toISOString(),
    services: {
      database: 'DOWN',
      redis: 'DOWN',
    }
  };

  try {
    // Check Database
    await prisma.$queryRaw`SELECT 1`;
    health.services.database = 'UP';
  } catch (error) {
    health.status = 'DOWN';
  }

  try {
    // Check Redis
    await redisClient.ping();
    health.services.redis = 'UP';
  } catch (error) {
    health.status = 'DOWN';
  }

  const statusCode = health.status === 'UP' ? 200 : 503;
  return NextResponse.json(health, { status: statusCode });
}
