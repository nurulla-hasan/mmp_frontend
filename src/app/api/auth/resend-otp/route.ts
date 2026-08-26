import { NextResponse } from 'next/server';
import { callAuthApi } from '@/lib/auth-api';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { response, result } = await callAuthApi('/resend-otp', await request.json());
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: error instanceof Error ? error.message : 'Could not resend OTP',
      },
      { status: 500 },
    );
  }
}
