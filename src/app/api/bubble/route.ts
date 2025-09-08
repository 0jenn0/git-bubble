import { NextRequest, NextResponse } from 'next/server';
import { generateBubbleSVG } from '../../../lib/svg-generator';
import { parseParams } from '../../../lib/util';

export async function GET(request: NextRequest) {
 try {
 // URL 파라미터 파싱
 const { searchParams } = new URL(request.url);
 const params = parseParams(searchParams);
 // 필수 파라미터 검증
 if (!params.tags) {
 return new NextResponse(
 'Missing required parameter: tags',
 { status: 400 }
 );
 }
 // SVG 생성 (async)
 const svg = await generateBubbleSVG(params);
 // 응답 헤더 설정
 return new NextResponse(svg, {
 headers: {
 'Content-Type': 'image/svg+xml',
 'Cache-Control': 'public, max-age=3600, s-maxage=3600', // 1시간 캐시
 'Access-Control-Allow-Origin': '*',
 'Access-Control-Allow-Methods': 'GET',
 },
 });
 } catch (error) {
 console.error('Error generating bubble:', error);
 return new NextResponse(
 'Internal server error',
 { status: 500 }
 );
 }
}