import { hash } from 'crypto';
import { BubbleParams } from '../type/bubble';
import { themes } from './theme';
import { calculateTagWidth, calculateTagLayout } from './util';

// 이미지를 base64로 변환하는 함수
async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ImageProxy/1.0)',
      },
    });
    
    if (!response.ok) {
      console.error('Failed to fetch image:', response.status);
      return null;
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const base64 = buffer.toString('base64');
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
}

export async function generateBubbleSVG(params: BubbleParams): Promise<string> {
  const {
    title,
    tags: tagsString,
    theme = 'light',
    style = 'modern',
    width = 400,
    fontSize = 12,
    animation = 'none',
    profileUrl,
    isOwn = false
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
  const themeColors = themes[theme] || themes.light;
  
  // 프로필 사진 크기 및 간격
  const profileSize = 40;
  const profilePadding = 12;
  const bubbleMarginFromProfile = profileUrl ? profileSize + profilePadding : 20;

  // 태그 레이아웃 계산 (프로필 사진 고려)
  const maxTagWidth = width - bubbleMarginFromProfile - 40;
  const { rows, totalHeight: bubbleHeight } = calculateTagLayout(tags, maxTagWidth, fontSize);
  
  // 전체 높이는 프로필 사진과 말풍선 중 더 큰 값
  const totalHeight = Math.max(bubbleHeight, profileUrl ? profileSize + 20 : bubbleHeight);

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

  // 프로필 사진 생성
  const generateProfilePicture = async () => {
    if (!profileUrl) return '';
    
    const x = isOwn ? width - profileSize - 10 : 10;
    const y = (totalHeight - profileSize) / 2;
    const centerX = x + profileSize/2;
    const centerY = y + profileSize/2;
    
    // 이미지 URL인지 확인
    if (profileUrl.startsWith('http')) {
      // 실제 이미지를 base64로 변환하여 직접 삽입
      const base64Image = await fetchImageAsBase64(profileUrl);
      
      if (base64Image) {
        return `
          <defs>
            <clipPath id="profileClip">
              <circle cx="${centerX}" cy="${centerY}" r="${profileSize/2}" />
            </clipPath>
          </defs>
          <image x="${x}" y="${y}" width="${profileSize}" height="${profileSize}" 
                 href="${base64Image}" clip-path="url(#profileClip)" 
                 preserveAspectRatio="xMidYMid slice" />`;
      }
    }
    
    // 이미지 로드 실패 시 또는 텍스트인 경우 이니셜 아바타
    const hash = profileUrl.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    const bgColor = colors[Math.abs(hash) % colors.length];
    
    let initial = 'A';
    if (profileUrl.includes('@')) {
      initial = profileUrl.split('@')[0].charAt(0).toUpperCase();
    } else {
      initial = profileUrl.charAt(0).toUpperCase();
    }
    
    return `
      <circle cx="${centerX}" cy="${centerY}" r="${profileSize/2}" 
              fill="${bgColor}" stroke="#ffffff" stroke-width="2" />
      <text x="${centerX}" y="${centerY + 6}" text-anchor="middle" 
            fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, sans-serif" 
            font-size="${Math.floor(profileSize/2.2)}" font-weight="600">${initial}</text>`;
  };

  // 메신저 스타일 말풍선 배경 생성
  const generateBubbleBackground = () => {
    const bubbleX = isOwn ? 20 : bubbleMarginFromProfile;
    const bubbleY = (totalHeight - bubbleHeight) / 2 + 10;
    const bubbleWidth = width - bubbleX - 20;
    const bubbleActualHeight = bubbleHeight - 20;
    const radius = 20;
    const tailSize = 8;
    const tailY = bubbleY + bubbleActualHeight / 2;
    
    // 메신저 스타일 말풍선 (왼쪽 또는 오른쪽)
    let bubblePath;
    
    if (isOwn) {
      // 내 메시지 (오른쪽, 꼬리 오른쪽)
      bubblePath = `
        M${bubbleX + radius},${bubbleY}
        L${bubbleX + bubbleWidth - radius},${bubbleY}
        Q${bubbleX + bubbleWidth},${bubbleY} ${bubbleX + bubbleWidth},${bubbleY + radius}
        L${bubbleX + bubbleWidth},${tailY - tailSize}
        L${bubbleX + bubbleWidth + tailSize},${tailY}
        L${bubbleX + bubbleWidth},${tailY + tailSize}
        L${bubbleX + bubbleWidth},${bubbleY + bubbleActualHeight - radius}
        Q${bubbleX + bubbleWidth},${bubbleY + bubbleActualHeight} ${bubbleX + bubbleWidth - radius},${bubbleY + bubbleActualHeight}
        L${bubbleX + radius},${bubbleY + bubbleActualHeight}
        Q${bubbleX},${bubbleY + bubbleActualHeight} ${bubbleX},${bubbleY + bubbleActualHeight - radius}
        L${bubbleX},${bubbleY + radius}
        Q${bubbleX},${bubbleY} ${bubbleX + radius},${bubbleY}
        Z`;
    } else {
      // 상대방 메시지 (왼쪽, 꼬리 왼쪽)
      bubblePath = `
        M${bubbleX + radius},${bubbleY}
        L${bubbleX + bubbleWidth - radius},${bubbleY}
        Q${bubbleX + bubbleWidth},${bubbleY} ${bubbleX + bubbleWidth},${bubbleY + radius}
        L${bubbleX + bubbleWidth},${bubbleY + bubbleActualHeight - radius}
        Q${bubbleX + bubbleWidth},${bubbleY + bubbleActualHeight} ${bubbleX + bubbleWidth - radius},${bubbleY + bubbleActualHeight}
        L${bubbleX + radius},${bubbleY + bubbleActualHeight}
        Q${bubbleX},${bubbleY + bubbleActualHeight} ${bubbleX},${bubbleY + bubbleActualHeight - radius}
        L${bubbleX},${tailY + tailSize}
        L${bubbleX - tailSize},${tailY}
        L${bubbleX},${tailY - tailSize}
        L${bubbleX},${bubbleY + radius}
        Q${bubbleX},${bubbleY} ${bubbleX + radius},${bubbleY}
        Z`;
    }

    const fillColor = theme === 'dark' || isOwn ? themeColors.primary : '#ffffff';
    const strokeColor = theme === 'dark' ? 'none' : '#e0e0e0';
    
    return `
      <path d="${bubblePath}" 
            fill="${fillColor}" 
            stroke="${strokeColor}" 
            stroke-width="1" 
            filter="url(#shadow)" />`;
  };

  // 소제목 생성 (메신저 스타일)
  const generateTitle = () => {
    if (!title) return '';
    
    const bubbleX = isOwn ? 20 : bubbleMarginFromProfile;
    const textColor = theme === 'dark' || isOwn ? '#ffffff' : '#333333';
    
    return `
      <text x="${bubbleX + 15}" y="${(totalHeight - bubbleHeight) / 2 + 30}" 
            fill="${textColor}" font-family="-apple-system, BlinkMacSystemFont, sans-serif" 
            font-size="11" font-weight="600" opacity="0.8">${decodeURIComponent(title)}</text>`;
  };

  // 태그들 생성 (메신저 스타일)
  const generateTags = () => {
    const bubbleX = isOwn ? 20 : bubbleMarginFromProfile;
    const bubbleY = (totalHeight - bubbleHeight) / 2 + 10;
    const startY = title ? bubbleY + 45 : bubbleY + 25;
    const textColor = theme === 'dark' || isOwn ? '#ffffff' : '#333333';
    
    let tagElements = '';

    rows.forEach((row, rowIndex) => {
      let currentX = bubbleX + 15;
      const currentY = startY + (rowIndex * 28);

      row.forEach(tag => {
        const tagWidth = calculateTagWidth(tag, fontSize);
        const textX = currentX + tagWidth / 2;
        const textY = currentY + 14;

        // 메신저 스타일 태그 (더 모던하고 심플)
        const tagBg = theme === 'dark' || isOwn ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.05)';
        
        tagElements += `
          <rect x="${currentX}" y="${currentY}" width="${tagWidth}" height="22" rx="11" 
                fill="${tagBg}" />
          <text x="${textX}" y="${textY}" text-anchor="middle" fill="${textColor}" 
                font-family="-apple-system, BlinkMacSystemFont, sans-serif" 
                font-size="${fontSize}" font-weight="500">${tag}</text>`;

        currentX += tagWidth + 6;
      });
    });

    return tagElements;
  };

  // 필터 효과 생성 (메신저 스타일)
  const generateFilters = () => {
    return `
      <filter id="shadow">
        <feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.1"/>
      </filter>`;
  };

  // 최종 SVG 생성
  const profilePicture = await generateProfilePicture();
  
  return `
<svg width="${width}" height="${totalHeight}" viewBox="0 0 ${width} ${totalHeight}" xmlns="http://www.w3.org/2000/svg">
  ${getAnimationCSS()}
  <defs>
    ${generateFilters()}
  </defs>
  
  ${profilePicture}
  
  <g class="bubble-container">
    ${generateBubbleBackground()}
    ${generateTitle()}
    ${generateTags()}
  </g>
</svg>`.trim();
}
