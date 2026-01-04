import { NextRequest, NextResponse } from 'next/server';
import { generateBubbleSVG } from '@/shared/lib/svg-generator';
import { parseParams } from '@/shared/lib/util';

export async function GET(request: NextRequest) {
 try {
 // URL 파라미터 파싱
 const { searchParams } = new URL(request.url);
 const params = parseParams(searchParams);
 
 // 디버깅: 파싱된 파라미터 확인
 console.log('[route.ts] Parsed params:', {
   mode: params.mode,
   direction: params.direction,
   theme: params.theme,
   width: params.width,
   fontSize: params.fontSize,
   tags: params.tags?.substring(0, 50)
 });
 
 // 필수 파라미터 검증 (mode에 따라 다르게)
 if (params.mode === 'text') {
   // 텍스트 모드: tags 파라미터에 텍스트 내용이 있어야 함
   if (!params.tags || params.tags.trim().length === 0) {
     return new NextResponse(
       'Missing required parameter: tags (text content)',
       { status: 400 }
     );
   }
 } else {
   // 태그 모드: tags 파라미터가 있어야 하고 쉼표로 구분된 태그가 있어야 함
   if (!params.tags || params.tags.trim().length === 0) {
     return new NextResponse(
       'Missing required parameter: tags',
       { status: 400 }
     );
   }
 }
 // SVG 생성 (async)
 const svg = await generateBubbleSVG(params);
 // 응답 헤더 설정
 return new NextResponse(svg, {
 headers: {
 'Content-Type': 'image/svg+xml',
 'Cache-Control': 'no-cache, no-store, must-revalidate', // 캐시 방지
 'Pragma': 'no-cache',
 'Expires': '0',
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