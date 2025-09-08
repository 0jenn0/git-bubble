import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    
    if (!imageUrl || !imageUrl.startsWith('http')) {
      return new NextResponse('Invalid image URL', { status: 400 });
    }

    // 외부 이미지 fetch
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ImageProxy/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Content-Type 헤더에서 이미지 타입 추출
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // base64로 인코딩
    const base64 = buffer.toString('base64');
    const dataUri = `data:${contentType};base64,${base64}`;

    return new NextResponse(dataUri, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Image proxy error:', error);
    return new NextResponse('Failed to load image', { status: 500 });
  }
}