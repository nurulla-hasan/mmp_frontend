import 'server-only';

import type { NextResponse } from 'next/server';
export type AuthData = {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'USER' | 'SURVEYOR' | 'ADMIN';
    status: 'ACTIVE' | 'BLOCKED' | 'DELETED';
    imageUrl: string;
  };
  accessToken: string;
  refreshToken: string;
};

export type AuthApiResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data?: AuthData;
};

export const getApiUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL is not configured');
  return apiUrl;
};

export const callAuthApi = async (
  endpoint: string,
  body?: unknown,
): Promise<{ response: Response; result: AuthApiResponse }> => {
  const response = await fetch(`${getApiUrl()}/api/v1/auth${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    cache: 'no-store',
  });
  const result = (await response.json()) as AuthApiResponse;
  return { response, result };
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export const setAuthCookies = (response: NextResponse, data: AuthData): void => {
  response.cookies.set('accessToken', data.accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60,
  });
  response.cookies.set('refreshToken', data.refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60,
  });
};

export const clearAuthCookies = (response: NextResponse): void => {
  response.cookies.set('accessToken', '', { ...cookieOptions, maxAge: 0 });
  response.cookies.set('refreshToken', '', { ...cookieOptions, maxAge: 0 });
};
