import { NextResponse } from 'next/server';
import { callAuthApi, isAuthData, setAuthCookies } from '@/lib/auth-api';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { response, result } = await callAuthApi('/verify-email', await request.json());
    const nextResponse = NextResponse.json(result, { status: response.status });
    if (response.ok && isAuthData(result.data)) setAuthCookies(nextResponse, result.data);
    return nextResponse;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: error instanceof Error ? error.message : 'Email verification failed',
      },
      { status: 500 },
    );
  }
}
