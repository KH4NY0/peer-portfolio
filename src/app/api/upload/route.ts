import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

function toMediaTypeFromMime(mime?: string | null) {
  if (!mime) return 'OTHER';
  if (mime.startsWith('image/')) return 'IMAGE';
  if (mime.startsWith('video/')) return 'VIDEO';
  if (mime.startsWith('audio/')) return 'AUDIO';
  if (mime === 'application/pdf') return 'PDF';
  return 'OTHER';
}

function extFromMime(mime: string | undefined) {
  switch (mime) {
    case 'image/jpeg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/gif':
      return '.gif';
    case 'image/webp':
      return '.webp';
    case 'video/mp4':
      return '.mp4';
    case 'audio/mpeg':
      return '.mp3';
    case 'application/pdf':
      return '.pdf';
    default:
      return '';
  }
}

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll('file');
    if (!files.length) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const saved: any[] = [];

    for (const f of files) {
      if (!(f instanceof File)) continue;
      if (f.size > 25 * 1024 * 1024) {
        return NextResponse.json({ error: 'File too large (max 25MB)' }, { status: 413 });
      }
      const arrBuf = await f.arrayBuffer();
      const buffer = Buffer.from(arrBuf);

      const originalName = f.name || 'upload';
      const safeBase = originalName.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').slice(0, 80);
      const ext = path.extname(safeBase) || extFromMime(f.type) || '';
      const filename = `${crypto.randomUUID()}${ext}`;
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, buffer);

      saved.push({
        url: `/uploads/${filename}`,
        mimeType: f.type || null,
        type: toMediaTypeFromMime(f.type || undefined),
        sizeBytes: f.size,
      });
    }

    return NextResponse.json({ assets: saved }, { status: 201 });
  } catch (err) {
    console.error('Upload error', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
