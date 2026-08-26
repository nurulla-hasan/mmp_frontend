import { NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/auth-api';

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({
    success: true,
    statusCode: 200,
    message: 'Logout successful',
    data: null,
  });
  clearAuthCookies(response);
  return response;
}
