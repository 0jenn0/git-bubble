import { BubbleParams } from '../type/bubble';
import { themes } from './theme';
import { calculateTagWidth, calculateTagLayout } from './util';

export function generateBubbleSVG(params: BubbleParams): string {
  const {
    title,
    tags: tagsString,
    theme = 'gradient',
    style = 'modern',
    width = 400,
    fontSize = 12,
    animation = 'none'
  } = params;

  // 태그 파싱 및 디코딩
  const tags = decodeURIComponent(tagsString)
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);

  if (tags.length === 0) {
    throw new Error('Tags parameter is required');
  }

  // 테마 색상 가져오기
  const themeColors = themes[theme] || themes.gradient;

  // 태그 레이아웃 계산
  const maxTagWidth = width - 80; // 패딩 고려
  const { rows, totalHeight } = calculateTagLayout(tags, maxTagWidth, fontSize);

  // 애니메이션 정의
  const getAnimationCSS = () => {
    switch (animation) {
      case 'float':
        return `
          <style>
            .bubble-container { animation: float 3s ease-in-out infinite; }
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-8px); }
            }
          </style>`;
      case 'pulse':
        return `
          <style>
            .bubble-container { animation: pulse 2s ease-in-out infinite; }
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
          </style>`;
      default:
        return '';
    }
  };

  // 스타일별 그라데이션 생성
  const generateGradient = (id: string) => {
    if (style === 'neon' || theme === 'neon') {
      return `
        <linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${themeColors.secondary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${themeColors.primary};stop-opacity:1" />
        </linearGradient>`;
    }
    return `
      <linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${themeColors.primary};stop-opacity:0.9" />
        <stop offset="50%" style="stop-color:${themeColors.secondary};stop-opacity:0.9" />
        <stop offset="100%" style="stop-color:${themeColors.accent || themeColors.primary};stop-opacity:0.9" />
      </linearGradient>`;
  };

  // 말풍선 배경 생성
  const generateBubbleBackground = () => {
    const tailY = totalHeight / 2;
    const cornerRadius = 30;
    
    // 말풍선 모양 (꼭지점 둥글게)
    const tailRadius = 3;
    const tailLength = 20; // 꼬리 길이를 더 길게
    const bubblePath = `
      M${cornerRadius + 30},10 
      L${width - cornerRadius - 10},10 
      C${width - 10},10 ${width - 10},10 ${width - 10},${cornerRadius + 10}
      L${width - 10},${totalHeight - cornerRadius - 20}
      C${width - 10},${totalHeight - 20} ${width - 10},${totalHeight - 20} ${width - cornerRadius - 10},${totalHeight - 20}
      L${cornerRadius + 30},${totalHeight - 20}
      C30,${totalHeight - 20} 30,${totalHeight - 20} 30,${totalHeight - cornerRadius - 20}
      L30,${tailY + 12}
      L${30 - tailLength + tailRadius},${tailY + tailRadius}
      Q${30 - tailLength},${tailY} ${30 - tailLength + tailRadius},${tailY - tailRadius}
      L30,${tailY - 12}
      L30,${cornerRadius + 10}
      C30,10 30,10 ${cornerRadius + 30},10
      Z`;

    if (style === 'glass') {
      return `
        <path d="${bubblePath}" 
              fill="url(#bubbleGrad)" 
              filter="url(#shadow)" class="bubble" />`;
    }

    if (style === 'neon' || theme === 'neon') {
      return `
        <path d="${bubblePath}" 
              fill="url(#bubbleGrad)" 
              filter="url(#neonGlow)" class="bubble" />`;
    }

    return `
      <path d="${bubblePath}" 
            fill="url(#bubbleGrad)" filter="url(#shadow)" class="bubble" />`;
  };

  // 소제목 생성
  const generateTitle = () => {
    if (!title) return '';
    return `
      <text x="45" y="35" fill="white" font-family="Arial, sans-serif" 
            font-size="12" font-weight="bold" opacity="0.9">${decodeURIComponent(title)}</text>
      <line x1="45" y1="42" x2="${width-45}" y2="42" stroke="rgba(255,255,255,0.2)" stroke-width="1" />`;
  };

  // 태그들 생성
  const generateTags = () => {
    const startY = title ? 55 : 35;
    let tagElements = '';

    rows.forEach((row, rowIndex) => {
      let currentX = 45;
      const currentY = startY + (rowIndex * 30);

      row.forEach(tag => {
        const tagWidth = calculateTagWidth(tag, fontSize);
        const textX = currentX + tagWidth / 2;
        const textY = currentY + 14;

        // 스타일별 태그 배경
        let tagFill = 'rgba(255,255,255,0.3)';
        let tagStroke = 'rgba(255,255,255,0.1)';
        
        if (style === 'neon' || theme === 'neon') {
          tagFill = 'rgba(0,212,255,0.2)';
          tagStroke = themeColors.primary;
        } else if (style === 'glass') {
          tagFill = 'rgba(255,255,255,0.15)';
          tagStroke = 'rgba(255,255,255,0.3)';
        }

        tagElements += `
          <rect x="${currentX}" y="${currentY}" width="${tagWidth}" height="20" rx="10" 
                fill="${tagFill}" stroke="${tagStroke}" stroke-width="1" />
          <text x="${textX}" y="${textY}" text-anchor="middle" fill="white" 
                font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold">${tag}</text>`;

        currentX += tagWidth + 8;
      });
    });

    return tagElements;
  };

  // 필터 효과 생성
  const generateFilters = () => {
    let filters = `
      <filter id="shadow">
        <feDropShadow dx="2" dy="4" stdDeviation="3" flood-opacity="0.3"/>
      </filter>`;

    if (style === 'neon' || theme === 'neon') {
      filters += `
        <filter id="neonGlow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>`;
    }

    return filters;
  };

  // 최종 SVG 생성
  return `
<svg width="${width}" height="${totalHeight}" viewBox="0 0 ${width} ${totalHeight}" xmlns="http://www.w3.org/2000/svg">
  ${getAnimationCSS()}
  <defs>
    ${generateGradient('bubbleGrad')}
    ${generateFilters()}
  </defs>
  
  <g class="bubble-container">
    ${generateBubbleBackground()}
    ${generateTitle()}
    ${generateTags()}
  </g>
</svg>`.trim();
}
