import { NextRequest, NextResponse } from 'next/server';
import { uploadSanityImageAsset, getSanityConnectionStatus } from '@/src/lib/sanity.server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    // Check if multipart/form-data
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json(
          { success: false, error: 'لم يتم استلام أي ملف' },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = file.name || `image-${Date.now()}.jpg`;
      const mimeType = file.type || 'image/jpeg';

      const uploaded = await uploadSanityImageAsset(buffer, filename, mimeType);

      if (uploaded) {
        return NextResponse.json({
          success: true,
          url: uploaded.url,
          assetId: uploaded.assetId,
          ref: uploaded.ref,
          filename,
        });
      }

      // If Sanity write token is missing or network failure, return data URL as resilient fallback
      const base64 = `data:${mimeType};base64,${buffer.toString('base64')}`;
      return NextResponse.json({
        success: true,
        url: base64,
        assetId: `local-${Date.now()}`,
        ref: `local-${Date.now()}`,
        filename,
        fallback: true,
      });
    }

    // JSON payload (base64 or remote url)
    const body = await req.json();
    const { image, filename = `image-${Date.now()}.jpg`, mimeType } = body;

    if (!image) {
      return NextResponse.json(
        { success: false, error: 'بيانات الصورة مفقودة' },
        { status: 400 }
      );
    }

    const uploaded = await uploadSanityImageAsset(image, filename, mimeType);
    if (uploaded) {
      return NextResponse.json({
        success: true,
        url: uploaded.url,
        assetId: uploaded.assetId,
        ref: uploaded.ref,
        filename,
      });
    }

    return NextResponse.json({
      success: true,
      url: image,
      assetId: `local-${Date.now()}`,
      ref: `local-${Date.now()}`,
      filename,
      fallback: true,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'خطأ في معالجة رفع الصورة';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
