import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, access } from 'fs/promises';
import path from 'path';

// POST /api/admin/upload - Upload media file
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    console.log('[Upload] Received request, file:', file?.name, 'size:', file?.size, 'type:', file?.type);
    
    if (!file) {
      console.log('[Upload] Error: No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      console.log('[Upload] Error: Invalid file type:', file.type);
      return NextResponse.json({ 
        error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF',
        receivedType: file.type
      }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      console.log('[Upload] Error: File too large:', file.size);
      return NextResponse.json({ 
        error: 'File too large. Max size: 10MB',
        receivedSize: file.size
      }, { status: 400 });
    }

    // Use /var/www/uploads for production (nginx-served)
    // or public/uploads for development
    const isProduction = process.env.NODE_ENV === 'production';
    const uploadsDir = isProduction 
      ? '/var/www/uploads/blog'
      : path.join(process.cwd(), 'public', 'uploads', 'blog');
    
    console.log('[Upload] Uploads directory:', uploadsDir, '(production:', isProduction, ')');
    
    try {
      await access(uploadsDir);
      console.log('[Upload] Directory exists');
    } catch {
      console.log('[Upload] Creating directory...');
      await mkdir(uploadsDir, { recursive: true });
      console.log('[Upload] Directory created');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = `blog-${timestamp}-${randomStr}.${ext}`;
    
    // Write file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filepath = path.join(uploadsDir, filename);
    
    console.log('[Upload] Writing file to:', filepath);
    await writeFile(filepath, buffer);
    console.log('[Upload] File written successfully');

    // Return public URL
    const url = `/uploads/blog/${filename}`;

    return NextResponse.json({ 
      success: true,
      url,
      filename,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('[Upload] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to upload file',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
