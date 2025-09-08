// 텍스트 길이에 따른 태그 너비 계산
export function calculateTagWidth(text: string, fontSize: number): number {
    // 한글은 영문보다 넓게 계산
    const koreanChars = text.match(/[가-힣]/g) || [];
    const otherChars = text.length - koreanChars.length;
    const width = (koreanChars.length * fontSize * 0.9) + (otherChars * fontSize * 0.6) + 24;
    return Math.max(width, 40);
   }
   // 태그들을 여러 줄로 배치할 때 최적 배치 계산
   export function calculateTagLayout(
    tags: string[],
    maxWidth: number,
    fontSize: number
   ): { rows: string[][]; totalHeight: number } {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentRowWidth = 0;
    for (const tag of tags) {
    const tagWidth = calculateTagWidth(tag, fontSize);
    if (currentRowWidth + tagWidth + 8 > maxWidth && currentRow.length > 0) {
    rows.push(currentRow);
    currentRow = [tag];
    currentRowWidth = tagWidth;
    } else {
    currentRow.push(tag);
    currentRowWidth += tagWidth + 8;
    }
    }
    if (currentRow.length > 0) {
    rows.push(currentRow);
    }
    const titleHeight = 35; // 소제목이 있을 때
    const tagRowHeight = 25;
    const padding = 30;
    const totalHeight = titleHeight + (rows.length * tagRowHeight) + padding;
    return { rows, totalHeight };
   }
   // URL 파라미터 파싱 및 검증
   export function parseParams(searchParams: URLSearchParams) {
    const title = searchParams.get('title') || undefined;
    const tags = searchParams.get('tags') || '';
    const theme = (searchParams.get('theme') as any) || 'gradient';
    const style = (searchParams.get('style') as any) || 'modern';
    const width = parseInt(searchParams.get('width') || '400');
    const fontSize = parseInt(searchParams.get('fontSize') || '12');
    const animation = (searchParams.get('animation') as any) || 'none';
    return { title, tags, theme, style, width, fontSize, animation };
   }