import { NextResponse } from 'next/server';
import { callAuthApi, setAuthCookies } from '@/lib/auth-api';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { response, result } = await callAuthApi('/login', await request.json());
    const nextResponse = NextResponse.json(result, { status: response.status });
    if (response.ok && result.data) setAuthCookies(nextResponse, result.data);
    return nextResponse;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: error instanceof Error ? error.message : 'Login failed',
      },
      { status: 500 },
    );
  }
}
