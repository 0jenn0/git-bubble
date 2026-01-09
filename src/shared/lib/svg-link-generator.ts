import { fetchImageAsBase64 } from './svg-generator';

export interface LinkPreviewParams {
  url: string;
  width?: number;
  theme?: 'light' | 'dark';
  style?: 'modern' | 'minimal' | 'card';
  thumbnail?: string;
  badge?: boolean;
  badgeText?: string;
  badgeImage?: string;
  badgeColor?: string;
}

export interface LinkMetadata {
  title: string;
  description: string;
  image: string;
  domain: string;
  favicon: string;
}

// 웹사이트 메타데이터 추출 함수
async function fetchLinkMetadata(url: string): Promise<LinkMetadata | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkPreview/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const html = await response.text();
    
    // 메타 태그 파싱을 위한 정규식
    const getMetaContent = (property: string) => {
      const patterns = [
        new RegExp(`<meta\\s+property="${property}"\\s+content="([^"]*)"`, 'i'),
        new RegExp(`<meta\\s+name="${property}"\\s+content="([^"]*)"`, 'i'),
        new RegExp(`<meta\\s+content="([^"]*)"\\s+property="${property}"`, 'i'),
        new RegExp(`<meta\\s+content="([^"]*)"\\s+name="${property}"`, 'i'),
      ];
      
      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match) return match[1];
      }
      return '';
    };

    const getTitleContent = () => {
      const ogTitle = getMetaContent('og:title');
      if (ogTitle) return ogTitle;
      
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      return titleMatch ? titleMatch[1] : '';
    };

    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace(/^www\./, '');
    const baseUrl = `${urlObj.protocol}//${urlObj.host}`;

    // 파비콘 추출 함수
    const getFavicon = () => {
      // 1. HTML에서 직접 파비콘 링크 찾기 (여러 패턴 시도)
      const faviconPatterns = [
        /<link[^>]+rel=["'](?:icon|shortcut\s+icon|apple-touch-icon)["'][^>]+href=["']([^"']+)["']/i,
        /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:icon|shortcut\s+icon|apple-touch-icon)["']/i,
      ];
      
      for (const pattern of faviconPatterns) {
        const matches = html.matchAll(new RegExp(pattern.source, 'gi'));
        for (const match of matches) {
          if (match[1]) {
            let faviconUrl = match[1].trim();
            // 상대 경로를 절대 경로로 변환
            if (faviconUrl.startsWith('//')) {
              faviconUrl = `${urlObj.protocol}${faviconUrl}`;
            } else if (faviconUrl.startsWith('/')) {
              faviconUrl = `${baseUrl}${faviconUrl}`;
            } else if (!faviconUrl.startsWith('http')) {
              faviconUrl = `${baseUrl}/${faviconUrl}`;
            }
            return faviconUrl;
          }
        }
      }
      
      // 2. Google 파비콘 API (최종 폴백)
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    };

    return {
      title: getTitleContent() || domain,
      description: getMetaContent('og:description') || getMetaContent('description') || '',
      image: getMetaContent('og:image') || '',
      domain,
      favicon: getFavicon()
    };

  } catch (error) {
    console.error('Error fetching link metadata:', error);
    return null;
  }
}

// 텍스트를 여러 줄로 나누는 함수
function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  if (!text) return [];
  
  // 더 보수적인 폭 계산 (한글, 이모지 고려)
  const getCharWidth = (char: string) => {
    // 이모지나 특수 문자 (유니코드 범위)
    if (/[\u{1F300}-\u{1F9FF}]/u.test(char) || /[\u{2600}-\u{26FF}]/u.test(char) || /[\u{1F600}-\u{1F64F}]/u.test(char)) {
      return fontSize * 1.3; // 이모지는 더 넓음
    }
    // 한글, 한자, 일본어
    if (/[가-힣一-龯あ-んア-ン]/.test(char)) {
      return fontSize * 1.15; // 한글은 더 넓음
    }
    // 영문, 숫자, 기호
    return fontSize * 0.7;
  };
  
  const getTextWidth = (str: string) => {
    let width = 0;
    for (let i = 0; i < str.length; i++) {
      width += getCharWidth(str[i]);
    }
    return width;
  };
  
  // 공백으로 단어 분리
  const words = text.split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return [text];
  
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = getTextWidth(testLine);
    
    // 95% 이상 차면 줄바꿈 (더 넓게 사용)
    if (testWidth <= maxWidth * 0.95) {
      currentLine = testLine;
    } else {
      // 현재 줄이 있으면 저장하고 새 줄 시작
      if (currentLine.trim()) {
        lines.push(currentLine.trim());
        currentLine = word;
      } else {
        // 단어 자체가 너무 긴 경우 문자 단위로 자르기
        let truncated = '';
        for (let i = 0; i < word.length; i++) {
          const char = word[i];
          if (getTextWidth(truncated + char) <= maxWidth * 0.95) {
            truncated += char;
          } else {
            break;
          }
        }
        if (truncated) {
          lines.push(truncated);
          currentLine = word.substring(truncated.length) || '';
        } else {
          // 한 글자도 안 들어가면 강제로 첫 글자
          lines.push(word[0] || '');
          currentLine = word.substring(1) || '';
        }
      }
    }
  }
  
  // 마지막 줄 추가
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines.length > 0 ? lines : [text];
}

export async function generateLinkPreviewSVG(params: LinkPreviewParams): Promise<string> {
  const {
    url,
    width = 280,
    theme = 'light',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    style = 'modern',
    thumbnail,
    badge = false,
    badgeText = 'NEW',
    badgeImage,
    badgeColor = '#FF0000'
  } = params;

  // 링크 메타데이터 가져오기
  const metadata = await fetchLinkMetadata(url);
  if (!metadata) {
    return generateFallbackLinkSVG(url, width, theme, badge, badgeText, badgeImage, badgeColor);
  }

  // 힙한 모노톤 기하학 스타일
  const colors = {
    light: {
      bg: '#FFFFFF',
      black: '#000000',
      darkGray: '#2C2C2C',
      gray: '#666666',
      lightGray: '#E5E5E5',
      accent: '#FF0000'
    },
    dark: {
      bg: '#1A1A1A',
      black: '#FFFFFF',
      darkGray: '#E0E0E0',
      gray: '#BBBBBB',
      lightGray: '#404040',
      accent: '#FF6B6B'
    }
  };

  const c = colors[theme];
  const padding = 16; // 패딩 증가
  const thumbnailSize = 100;
  const thumbnailX = padding;
  const thumbnailY = padding;
  const lineHeight = 20;

  // 썸네일 이미지 처리 (커스텀 썸네일 우선)
  let thumbnailImage = '';
  const imageUrl = thumbnail || metadata.image;
  if (imageUrl) {
    try {
      const base64Thumbnail = await fetchImageAsBase64(imageUrl);
      if (base64Thumbnail) {
        thumbnailImage = base64Thumbnail;
      }
    } catch {
      // 썸네일 로드 실패 시 무시
    }
  }
  
  // 썸네일이 있으면 오른쪽에 배치, 없으면 왼쪽에서 시작
  const hasThumbnail = !!thumbnailImage;
  const contentX = hasThumbnail ? thumbnailX + thumbnailSize + 20 : padding;
  const contentWidth = width - contentX - padding;
  
  // 텍스트가 잘리지 않도록 여유 공간 확보
  // 썸네일이 있을 때는 더 넓게 사용 가능하도록 조정
  const safeTitleWidth = hasThumbnail 
    ? Math.max(contentWidth - 5, 380)  // 썸네일 있을 때 더 넓게
    : Math.max(contentWidth - 10, 450); // 썸네일 없을 때
  const safeDescWidth = hasThumbnail
    ? Math.max(contentWidth - 5, 160)  // 썸네일 있을 때 더 넓게
    : Math.max(contentWidth - 10, 130); // 썸네일 없을 때
  
  // 텍스트 처리 - 여러 줄로 나누기 (안전한 폭 사용)
  const titleLines = wrapText(metadata.title || '', safeTitleWidth, 16);
  const descriptionLines = wrapText(metadata.description || '', safeDescWidth, 11);
  
  // 최대 줄 수 (썸네일 유무에 따라 다르게)
  const maxTitleLines = hasThumbnail ? 2 : 3;
  const maxDescLines = hasThumbnail ? 2 : 4;
  const displayTitleLines = titleLines.slice(0, maxTitleLines);
  const displayDescLines = descriptionLines.slice(0, maxDescLines);

  // 높이 계산 (내용 기반 동적 계산)
  const domainHeight = 22; // 도메인 + 파비콘 영역
  const titleHeight = displayTitleLines.length * lineHeight;
  const descHeight = displayDescLines.length * (lineHeight - 4);
  const contentTotalHeight = domainHeight + titleHeight + descHeight + 16; // 16은 요소 간 간격

  // 썸네일이 있으면 썸네일 높이와 컨텐츠 높이 중 큰 값, 없으면 컨텐츠 높이만
  const innerHeight = hasThumbnail
    ? Math.max(thumbnailSize, contentTotalHeight)
    : contentTotalHeight;

  // 뱃지가 있을 때 추가 여백 (뱃지가 잘리지 않도록)
  const badgePadding = badge ? 28 : 0;
  const height = padding * 2 + innerHeight;
  
  // 파비콘 처리 - fetchImageAsBase64를 사용하여 base64로 변환
  let faviconImage = '';
  
  if (metadata.favicon) {
    // 여러 파비콘 소스를 시도 (Google 파비콘 API를 먼저 시도 - 가장 안정적)
    const faviconUrls = [
      `https://www.google.com/s2/favicons?domain=${metadata.domain}&sz=32`,
      metadata.favicon,
      `https://${metadata.domain}/favicon.ico`,
      `https://${metadata.domain}/favicon.png`,
    ];
    
    for (const faviconUrl of faviconUrls) {
      try {
        const base64Favicon = await fetchImageAsBase64(faviconUrl);
        if (base64Favicon) {
          faviconImage = base64Favicon;
          break; // 성공하면 루프 종료
        }
      } catch {
        // 다음 URL 시도
        continue;
      }
    }
  }

  // 뱃지 이미지 처리
  let badgeImageBase64 = '';
  if (badge && badgeImage) {
    try {
      const base64Badge = await fetchImageAsBase64(badgeImage);
      if (base64Badge) {
        badgeImageBase64 = base64Badge;
      }
    } catch {
      // 뱃지 이미지 로드 실패 시 무시
    }
  }

  // 굵은 도트 스타일 디자인
  const borderRadius = 0;

  return `
<svg width="${width + badgePadding}" height="${height + badgePadding}" viewBox="${-badgePadding} ${-badgePadding} ${width + badgePadding} ${height + badgePadding}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="image-rendering: pixelated; image-rendering: crisp-edges;">
  <defs>
    <!-- 썸네일 클리핑 경로 (굵은 도트 스타일) -->
    <clipPath id="thumbnailClip">
      <rect x="${thumbnailX}" y="${thumbnailY}" width="${thumbnailSize}" height="${thumbnailSize}" rx="${borderRadius}" ry="${borderRadius}"/>
    </clipPath>

    <!-- 뱃지 클리핑 경로 -->
    <clipPath id="badgeClip">
      <circle cx="0" cy="0" r="22"/>
    </clipPath>
  </defs>

  <!-- 굵은 도트 스타일 그림자 -->
  <rect x="${padding / 2 + 4}" y="${padding / 2 + 4}" width="${width - padding}" height="${height - padding}"
        rx="${borderRadius}" ry="${borderRadius}"
        fill="${theme === 'dark' ? '#000000' : '#888888'}" opacity="0.5"/>

  <!-- 굵은 도트 스타일 배경 -->
  <rect x="${padding / 2}" y="${padding / 2}" width="${width - padding}" height="${height - padding}"
        rx="${borderRadius}" ry="${borderRadius}"
        fill="${c.bg}"
        stroke="${theme === 'dark' ? '#888888' : '#222222'}"
        stroke-width="3"/>
  
  <!-- 썸네일 이미지 (왼쪽, 둥근 모서리) - 있을 때만 렌더링 -->
  ${hasThumbnail 
    ? `<image x="${thumbnailX}" y="${thumbnailY}" width="${thumbnailSize}" height="${thumbnailSize}" 
              href="${thumbnailImage.replace(/"/g, '&quot;')}" 
              clip-path="url(#thumbnailClip)"
              preserveAspectRatio="xMidYMid cover" />`
    : ''}
  
  <!-- 파비콘과 도메인 -->
  ${faviconImage 
    ? `<image x="${contentX}" y="${padding + 9.5}" width="14" height="14" 
              href="${faviconImage.replace(/"/g, '&quot;')}" 
              preserveAspectRatio="xMidYMid slice" />`
    : ''}
  <text x="${contentX + (faviconImage ? 20 : 0)}" y="${padding + 22}" 
        fill="${c.gray}" 
        font-family="monospace" 
        font-size="11" font-weight="500">${metadata.domain}</text>
  
  <!-- 제목 (여러 줄) -->
  ${displayTitleLines.map((line, index) => {
    const displayLine = line.length > 0 ? line : ' ';
    const showEllipsis = index === maxTitleLines - 1 && titleLines.length > maxTitleLines;
    return `
  <text x="${contentX}" y="${padding + 44 + index * lineHeight}" 
        fill="${c.black}" 
        font-family="monospace" 
        font-size="16" 
        font-weight="600">${displayLine}${showEllipsis ? '...' : ''}</text>`;
  }).join('')}
  
  <!-- 설명 (여러 줄) -->
  ${displayDescLines.map((line, index) => {
    const displayLine = line.length > 0 ? line : ' ';
    const showEllipsis = index === maxDescLines - 1 && descriptionLines.length > maxDescLines;
    return `
  <text x="${contentX}" y="${padding + 44 + titleHeight + 8 + index * (lineHeight - 4)}"
        fill="${c.gray}"
        font-family="monospace"
        font-size="11">${displayLine}${showEllipsis ? '...' : ''}</text>`;
  }).join('')}

  <!-- 뱃지 (왼쪽 상단, pulse 애니메이션) -->
  ${badge ? `
  <g transform="translate(${padding / 2}, ${padding / 2})">
    <circle cx="0" cy="0" r="22" fill="${badgeColor}">
      <animate attributeName="r" values="22;24;22" dur="1.5s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"/>
      <animate attributeName="opacity" values="1;0.8;1" dur="1.5s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"/>
    </circle>
    ${badgeImageBase64
      ? `<clipPath id="badgeImgClip"><circle cx="0" cy="0" r="20"/></clipPath>
         <image x="-20" y="-20" width="40" height="40" href="${badgeImageBase64.replace(/"/g, '&quot;')}" clip-path="url(#badgeImgClip)" preserveAspectRatio="xMidYMid slice"/>`
      : `<text x="0" y="5" fill="#FFFFFF" font-family="monospace" font-size="11" font-weight="700" text-anchor="middle">${badgeText}</text>`
    }
  </g>` : ''}

  <!-- 호버 효과 -->
  <rect x="0" y="0" width="${width}" height="${height}"
        fill="transparent" style="cursor: pointer;">
    <title>${metadata.title} - ${metadata.domain}</title>
  </rect>
</svg>`.trim();
}

// 메타데이터 로드 실패 시 폴백 SVG (기하학적 모노톤 스타일)
function generateFallbackLinkSVG(
  url: string,
  width: number,
  theme: 'light' | 'dark',
  badge: boolean = false,
  badgeText: string = 'NEW',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _badgeImage?: string,
  badgeColor: string = '#FF0000'
): string {
  const colors = {
    light: {
      bg: '#FFFFFF',
      black: '#000000',
      darkGray: '#2C2C2C',
      gray: '#666666',
      lightGray: '#E5E5E5',
      accent: '#FF0000'
    },
    dark: {
      bg: '#1A1A1A',
      black: '#FFFFFF',
      darkGray: '#E0E0E0',
      gray: '#BBBBBB',
      lightGray: '#404040',
      accent: '#FF6B6B'
    }
  };

  const c = colors[theme];
  const urlObj = new URL(url);
  const domain = urlObj.hostname.replace(/^www\./, '');

  // 레이아웃 설정 (굵은 도트 스타일)
  const padding = 20;
  const thumbnailSize = 100;
  const thumbnailX = 20;
  const contentX = thumbnailX + thumbnailSize + 20;
  const borderRadius = 0;

  // 높이 계산 (콘텐츠 기반 동적 계산)
  const domainHeight = 22;
  const titleHeight = 24;
  const descHeight = 16;
  const contentSpacing = 16;
  const contentTotalHeight = domainHeight + titleHeight + descHeight + contentSpacing;
  const innerHeight = Math.max(thumbnailSize, contentTotalHeight);

  // 뱃지가 있을 때 추가 여백 (뱃지가 잘리지 않도록)
  const badgePadding = badge ? 14 : 0;
  const height = padding * 2 + innerHeight;
  const thumbnailY = padding;

  return `
<svg width="${width + badgePadding}" height="${height + badgePadding}" viewBox="${-badgePadding} ${-badgePadding} ${width + badgePadding} ${height + badgePadding}" xmlns="http://www.w3.org/2000/svg" style="image-rendering: pixelated; image-rendering: crisp-edges;">
  <defs>
    <!-- 썸네일 클리핑 경로 (굵은 도트 스타일) -->
    <clipPath id="fallbackThumbnailClip">
      <rect x="${thumbnailX}" y="${thumbnailY}" width="${thumbnailSize}" height="${thumbnailSize}" rx="${borderRadius}" ry="${borderRadius}"/>
    </clipPath>
  </defs>

  <!-- 굵은 도트 스타일 그림자 -->
  <rect x="14" y="14" width="${width - 20}" height="${height - 20}"
        rx="${borderRadius}" ry="${borderRadius}"
        fill="${theme === 'dark' ? '#000000' : '#888888'}" opacity="0.5"/>

  <!-- 굵은 도트 스타일 배경 -->
  <rect x="10" y="10" width="${width - 20}" height="${height - 20}"
        rx="${borderRadius}" ry="${borderRadius}"
        fill="${c.bg}"
        stroke="${theme === 'dark' ? '#888888' : '#222222'}"
        stroke-width="3"/>

  <!-- 썸네일 플레이스홀더 (굵은 도트 스타일) -->
  <rect x="${thumbnailX}" y="${thumbnailY}" width="${thumbnailSize}" height="${thumbnailSize}"
        rx="${borderRadius}" ry="${borderRadius}"
        fill="${c.lightGray}" stroke="${theme === 'dark' ? '#888888' : '#222222'}" stroke-width="2"/>
  
  <!-- 도메인 -->
  <text x="${contentX}" y="35" 
        fill="${c.gray}" 
        font-family="monospace" 
        font-size="11" font-weight="500">${domain}</text>
  
  <!-- 제목 -->
  <text x="${contentX}" y="58" 
        fill="${c.black}" 
        font-family="monospace" 
        font-size="16" font-weight="600">링크 미리보기</text>
  
  <!-- 설명 -->
  <text x="${contentX}" y="80"
        fill="${c.gray}"
        font-family="monospace"
        font-size="11">메타데이터를 불러올 수 없습니다</text>

  <!-- 뱃지 (왼쪽 상단, pulse 애니메이션) -->
  ${badge ? `
  <g transform="translate(${padding / 2}, ${padding / 2})">
    <circle cx="0" cy="0" r="22" fill="${badgeColor}">
      <animate attributeName="r" values="22;24;22" dur="1.5s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"/>
      <animate attributeName="opacity" values="1;0.8;1" dur="1.5s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"/>
    </circle>
    <text x="0" y="5" fill="#FFFFFF" font-family="monospace" font-size="11" font-weight="700" text-anchor="middle">${badgeText}</text>
  </g>` : ''}

  <!-- 호버 효과 -->
  <rect x="0" y="0" width="${width}" height="${height}"
        fill="transparent" style="cursor: pointer;">
    <title>링크 미리보기 - ${domain}</title>
  </rect>
</svg>`.trim();
}