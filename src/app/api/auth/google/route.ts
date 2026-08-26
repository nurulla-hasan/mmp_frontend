import { NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/auth-api';

export function GET(): NextResponse {
  return NextResponse.redirect(`${getApiUrl()}/api/v1/auth/google`);
}
