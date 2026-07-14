/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

function getDriveClient() {
  const credentials = {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  if (!credentials.client_email || !credentials.private_key) {
    throw new Error('Google Drive credentials are not configured.');
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  });

  return google.drive({ version: 'v3', auth });
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fileId = searchParams.get('id');

  if (!fileId) {
    return new NextResponse('Missing file id', { status: 400 });
  }

  try {
    const drive = getDriveClient();

    // Get the file stream from Google Drive
    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    const headers = new Headers();
    if (response.headers['content-type']) {
      headers.set('Content-Type', response.headers['content-type']);
    }
    
    // Convert Node stream to Web ReadableStream for Next.js App Router
    const stream = response.data as any;
    
    const readableStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk: Buffer) => {
          controller.enqueue(new Uint8Array(chunk));
        });
        stream.on('end', () => {
          controller.close();
        });
        stream.on('error', (err: any) => {
          controller.error(err);
        });
      },
    });

    return new NextResponse(readableStream, { headers });
  } catch (error: any) {
    console.error('Drive Proxy Error:', error);
    return new NextResponse('Error fetching from Drive', { status: 500 });
  }
}
