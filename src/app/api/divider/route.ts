import { NextRequest, NextResponse } from 'next/server';
import { generateDividerSVG } from '@/shared/lib/svg-divider-generator';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const style = (searchParams.get('style') as 'dots' | 'dashes' | 'stars' | 'hearts' | 'sparkles') || 'dots';
    const color = searchParams.get('color') || '#000000';
    const animation = searchParams.get('animation') !== 'false';
    const width = parseInt(searchParams.get('width') || '400');
    const theme = (searchParams.get('theme') as 'light' | 'dark') || 'light';

    const svg = generateDividerSVG({
      style,
      color,
      animation,
      width,
      theme,
    });

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
    });
  } catch (error) {
    console.error('Error generating divider:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
