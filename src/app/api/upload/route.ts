import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
 
export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');
 
  if (!filename || !request.body) {
    return NextResponse.json(
        { message: 'Missing filename or file data in request.' }, 
        { status: 400 }
    );
  }
 
  // The body is a ReadableStream, which can be passed directly to `put`.
  const blob = await put(filename, request.body, {
    access: 'public',
  });
 
  return NextResponse.json(blob);
}
