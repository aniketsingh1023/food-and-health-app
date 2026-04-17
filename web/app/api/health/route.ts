/**
 * GET /api/health
 * Lightweight health check endpoint for Cloud Run liveness/readiness probes.
 *
 * Cloud Run by default probes the root path ("/") which triggers a full
 * Next.js page render. This endpoint returns quickly with no rendering overhead
 * and no external dependencies — the correct pattern for health checks.
 *
 * Configure in Cloud Run:
 *   --health-check-path=/api/health
 */

import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';

interface HealthPayload {
  status: 'ok';
  timestamp: string;
}

export function GET(): NextResponse<ApiResponse<HealthPayload>> {
  return NextResponse.json({
    data: { status: 'ok', timestamp: new Date().toISOString() },
    error: null,
  });
}
