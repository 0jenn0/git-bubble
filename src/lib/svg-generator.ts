import { BubbleParams } from '../type/bubble';
import { themes } from './theme';
import { calculateTagWidth, calculateTagLayout } from './util';

// 이미지를 base64로 변환하는 함수
export async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ImageProxy/1.0)',
      },
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch image from ${url}: ${response.status}`);
      return null;
    }
    
    // Content-Type 확인 - HTML이 반환되면 이미지가 아님
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html') || contentType.includes('application/xhtml')) {
      console.error(`URL returned HTML instead of image: ${url}`);
      return null;
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // 실제 Content-Type 확인 및 기본값 설정
    let finalContentType = contentType;
    if (!finalContentType || !finalContentType.startsWith('image/')) {
      // URL 확장자로부터 추론
      const urlLower = url.toLowerCase();
      if (urlLower.includes('.png')) {
        finalContentType = 'image/png';
      } else if (urlLower.includes('.gif')) {
        finalContentType = 'image/gif';
      } else if (urlLower.includes('.svg')) {
        finalContentType = 'image/svg+xml';
      } else if (urlLower.includes('.webp')) {
        finalContentType = 'image/webp';
      } else if (urlLower.includes('.ico')) {
        finalContentType = 'image/x-icon';
      } else {
        // Content-Type이 없고 확장자도 없으면 null 반환 (HTML일 가능성)
        console.error(`Cannot determine image type for: ${url}`);
        return null;
      }
    }
    
    // 파일 크기 확인 (너무 작으면 HTML일 가능성)
    if (buffer.length < 100) {
      console.error(`Image too small, might be HTML: ${url} (${buffer.length} bytes)`);
      return null;
    }
    
    // 이미지 매직 넘버 확인 (HTML이 아닌지 검증)
    const firstBytes = buffer.subarray(0, 4);
    const isHTML = firstBytes[0] === 0x3C && firstBytes[1] === 0x21; // '<!' (HTML 시작)
    const isHTML2 = firstBytes[0] === 0x3C && firstBytes[1] === 0x68; // '<h' (html 시작)
    const isHTML3 = firstBytes[0] === 0x3C && firstBytes[1] === 0x48; // '<H' (HTML 시작)
    
    if (isHTML || isHTML2 || isHTML3) {
      console.error(`URL returned HTML instead of image: ${url}`);
      return null;
    }
    
    const base64 = buffer.toString('base64');
    return `data:${finalContentType};base64,${base64}`;
  } catch (error) {
    console.error(`Error fetching image from ${url}:`, error);
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

    // 95% 이상 차면 줄바꿈
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

export async function generateBubbleSVG(params: BubbleParams): Promise<string> {
  const {
    title,
    tags: tagsString,
    theme = 'light',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    style = 'modern',
    width = 400,
    fontSize = 12,
    animation = 'none',
    profileUrl,
    isOwn = false,
    direction,
    mode = 'tags'
  } = params;
  
  // direction 파라미터 처리: 명시적으로 'right'이면 오른쪽, 'left'이면 왼쪽, 없으면 isOwn 사용
  let isRight: boolean;
  if (direction === 'right') {
    isRight = true;
  } else if (direction === 'left') {
    isRight = false;
  } else {
    isRight = isOwn;
  }

  // 모드 처리: 명시적으로 'text'이면 텍스트 모드, 아니면 태그 모드
  const isTextMode = mode === 'text';

  // 디버깅: 파라미터 처리 결과 확인
  console.log('[svg-generator] 🟣 파라미터 처리:', {
    direction,
    mode,
    isRight,
    isTextMode,
    isOwn,
    theme
  });
  
  let tags: string[] = [];
  let textContent = '';
  let bubbleHeight = 0;

  if (isTextMode) {
    // 일반 텍스트 모드: 쉼표로 분리하지 않고 그대로 사용
    textContent = decodeURIComponent(tagsString || '').trim();
    if (!textContent) {
      throw new Error('Text content is required');
    }
  } else {
    // 태그 모드: 쉼표로 분리
    tags = decodeURIComponent(tagsString || '')
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    if (tags.length === 0) {
      throw new Error('Tags parameter is required');
    }
  }

  // 테마 색상 가져오기
  const themeColors = themes[theme] || themes.light;
  
  // 프로필 사진 크기 및 간격 (1.5배 증가)
  const profileSize = 60; // 40 * 1.5
  const profilePadding = 20; // 간격 더 넓게
  const bubbleMarginFromProfile = profileUrl ? profileSize + profilePadding : 20;
  
  // 오른쪽 방향일 때 프로필 이미지와 겹치지 않도록 여백 계산
  const rightMargin = isRight && profileUrl ? profileSize + profilePadding : 20;

  // 텍스트 영역 너비 계산
  const maxTextWidth = isRight 
    ? width - rightMargin - 40
    : width - bubbleMarginFromProfile - 40;

  if (isTextMode) {
    // 일반 텍스트 모드: 줄바꿈 처리
    const textLines = wrapText(textContent, maxTextWidth - 30, fontSize);
    const lineHeight = fontSize * 1.5;
    const padding = 20;
    const titleHeight = title ? 35 : 0;
    bubbleHeight = padding * 2 + titleHeight + (textLines.length * lineHeight);
  } else {
    // 태그 모드: 기존 로직 사용
    const { totalHeight } = calculateTagLayout(tags, maxTextWidth, fontSize);
    bubbleHeight = totalHeight;
  }
  
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
    
    const x = isRight ? width - profileSize - 10 : 10;
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
    const bubbleX = isRight ? 20 : bubbleMarginFromProfile;
    const bubbleY = (totalHeight - bubbleHeight) / 2 + 10;
    const bubbleWidth = isRight ? width - bubbleX - rightMargin : width - bubbleX - 20;
    const bubbleActualHeight = bubbleHeight - 20;
    const radius = 20;
    const tailSize = 8;
    const tailY = bubbleY + bubbleActualHeight / 2;

    console.log('[generateBubbleBackground] 🔵 배경 생성:', { isRight, bubbleX, bubbleWidth });

    // 메신저 스타일 말풍선 (왼쪽 또는 오른쪽)
    let bubblePath;

    if (isRight) {
      // 오른쪽 메시지 (꼬리 오른쪽)
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

    // 테마에 따라 색상 결정 (오른쪽/왼쪽 모두 동일)
    const fillColor = theme === 'dark' ? themeColors.primary : '#ffffff';
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

    const bubbleX = isRight ? 20 : bubbleMarginFromProfile;
    // 테마에 따라 텍스트 색상 결정 (오른쪽/왼쪽 모두 동일)
    const textColor = theme === 'dark' ? '#ffffff' : '#333333';

    // 항상 왼쪽 정렬
    const textX = bubbleX + 15;
    const textAnchor = 'start';

    return `
      <text x="${textX}" y="${(totalHeight - bubbleHeight) / 2 + 30}"
            text-anchor="${textAnchor}"
            fill="${textColor}" font-family="-apple-system, BlinkMacSystemFont, sans-serif"
            font-size="12" font-weight="800" opacity="0.8">${decodeURIComponent(title)}</text>`;
  };

  // 태그들 생성 (메신저 스타일)
  const generateTags = () => {
    const bubbleX = isRight ? 20 : bubbleMarginFromProfile;
    const bubbleY = (totalHeight - bubbleHeight) / 2 + 10;
    const bubbleWidth = isRight ? width - bubbleX - rightMargin : width - bubbleX - 20;
    const startY = title ? bubbleY + 45 : bubbleY + 25;
    // 테마에 따라 텍스트 색상 결정 (오른쪽/왼쪽 모두 동일)
    const textColor = theme === 'dark' ? '#ffffff' : '#333333';

    console.log('[generateTags] 🟢 태그/텍스트 생성:', { isTextMode, textContent: textContent.substring(0, 20), tagsCount: tags.length });

    if (isTextMode) {
      // 일반 텍스트 모드: 줄바꿈된 텍스트 렌더링 (태그 배경 없이 텍스트만)
      // 말풍선 내부 실제 사용 가능한 너비 (좌우 여백 15px씩 제외)
      const textLines = wrapText(textContent, bubbleWidth - 30, fontSize);
      const lineHeight = fontSize * 1.5;

      // 항상 왼쪽 정렬
      const textX = bubbleX + 15;
      const textAnchor = 'start';

      return textLines.map((line, index) => `
        <text x="${textX}" y="${startY + index * lineHeight}"
              text-anchor="${textAnchor}"
              fill="${textColor}"
              font-family="-apple-system, BlinkMacSystemFont, sans-serif"
              font-size="${fontSize}"
              font-weight="400">${line}</text>
      `).join('');
    } else {
      // 태그 모드: 기존 태그 렌더링
      let tagElements = '';
      const { rows } = calculateTagLayout(tags, maxTextWidth, fontSize);

      // 항상 왼쪽 정렬
      rows.forEach((row, rowIndex) => {
        const currentY = startY + (rowIndex * 28);

        // 항상 왼쪽에서 시작
        let currentX = bubbleX + 15;

        row.forEach(tag => {
          const tagWidth = calculateTagWidth(tag, fontSize);
          const textX = currentX + tagWidth / 2;
          const textY = currentY + 14;

          // 메신저 스타일 태그 (더 모던하고 심플)
          // 테마에 따라 태그 배경 결정 (오른쪽/왼쪽 모두 동일)
          const tagBg = theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.05)';
          
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
    }
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
