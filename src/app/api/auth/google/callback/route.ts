import { NextResponse } from 'next/server';
import { callAuthApi, setAuthCookies } from '@/lib/auth-api';

const roleHome = {
  USER: '/dashboard',
  SURVEYOR: '/surveyor/dashboard',
  ADMIN: '/admin/dashboard',
} as const;

export async function GET(request: Request): Promise<NextResponse> {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  if (!code) return NextResponse.redirect(new URL('/login?error=google_auth_failed', request.url));

  try {
    const { response, result } = await callAuthApi('/google/exchange', { code });
    if (!response.ok || !result.data) {
      return NextResponse.redirect(new URL('/login?error=google_auth_failed', request.url));
    }
    const destination = roleHome[result.data.user.role] ?? '/dashboard';
    const nextResponse = NextResponse.redirect(new URL(destination, request.url));
    setAuthCookies(nextResponse, result.data);
    return nextResponse;
  } catch {
    return NextResponse.redirect(new URL('/login?error=google_auth_failed', request.url));
  }
}
