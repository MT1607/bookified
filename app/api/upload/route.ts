import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { MAX_FILE_SIZE } from '@/lib/contants';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      token: process.env.BLOB_READ_WRITE_TOKEN,
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Authenticate the user before generating the upload token
        const { userId } = await auth();

        if (!userId) {
          throw new Error('Unauthorized');
        }

        return {
          allowedContentTypes: [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/jpg',
          ],
          addRandomSuffix: true,
          maximumSizeInBytes: MAX_FILE_SIZE,
          tokenPayload: JSON.stringify({ userId }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // You can handle additional logic after the upload is successfully finished
        console.log('File upload to blob completed', blob.url);

        const payload = tokenPayload ? JSON.parse(tokenPayload) : null;
        console.log('Payload', payload);
        const userId = payload?.userId;
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const status = message.includes('Unauthorired') ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
