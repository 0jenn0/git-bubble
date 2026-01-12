import {
  Character,
  generateCharacterSVG,
  seededRandom,
  devQuotes,
  lifeQuotes,
  devQuotesEn,
  lifeQuotesEn,
  CharacterAction,
} from './village-characters';

export interface RepoData {
  name: string;
  recentCommits: number;
}

export interface VillageConfig {
  width: number;
  height: number;
  theme: 'light' | 'dark';
  repos: RepoData[];
  characters: Character[];
  username: string;
  totalCommits: number;
  lang?: 'ko' | 'en';
}

// 캐릭터 크기 (더 크게)
const PIXEL = 2;
const CHAR_SCALE = 3;
const CHAR_WIDTH = 16 * CHAR_SCALE;
const CHAR_HEIGHT = 16 * CHAR_SCALE;

// 흑백 팔레트
const PALETTE = {
  light: {
    bg: '#f5f5f5',
    ground: '#e8e8e8',
    groundDark: '#dcdcdc',
    border: '#333333',
    text: '#333333',
    textLight: '#ffffff',
  },
  dark: {
    bg: '#1a1a1a',
    ground: '#252525',
    groundDark: '#202020',
    border: '#555555',
    text: '#e0e0e0',
    textLight: '#ffffff',
  },
};

// 인덱스로 대사 가져오기
function getQuoteByIndex(index: number, lang: 'ko' | 'en' = 'ko'): string {
  const allQuotes =
    lang === 'en' ? [...devQuotesEn, ...lifeQuotesEn] : [...devQuotes, ...lifeQuotes];
  return allQuotes[index % allQuotes.length];
}

// 액션별 애니메이션 생성
function getActionAnimation(
  action: CharacterAction,
  cx: number,
  cy: number,
  width: number,
  height: number,
  random: () => number,
  index: number
): { animation: string; extraEffects: string } {
  const padding = 30;
  const maxX = width - padding - CHAR_WIDTH;
  const maxY = height - padding - CHAR_HEIGHT;

  switch (action) {
    case 'walk': {
      const moveRangeX = 60 + random() * 100;
      const moveRangeY = 20 + random() * 30;
      const dur = 8 + random() * 6;
      const targetX = Math.min(Math.max(cx + (random() > 0.5 ? moveRangeX : -moveRangeX), padding), maxX);
      const targetY = Math.min(Math.max(cy + (random() > 0.5 ? moveRangeY : -moveRangeY), padding), maxY);
      return {
        animation: `
          <animateTransform attributeName="transform" type="translate"
            values="${cx},${cy}; ${targetX},${targetY}; ${cx},${cy}"
            dur="${dur}s" repeatCount="indefinite"/>`,
        extraEffects: ''
      };
    }
    case 'sleep': {
      const bobDur = 3 + random() * 2;
      return {
        animation: `
          <animateTransform attributeName="transform" type="translate"
            values="${cx},${cy}; ${cx},${cy + 2}; ${cx},${cy}"
            dur="${bobDur}s" repeatCount="indefinite"/>`,
        extraEffects: `
          <g>
            <text x="${CHAR_WIDTH + 5}" y="-5" font-size="10" fill="#666" font-family="monospace">
              <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite"/>
              z
            </text>
            <text x="${CHAR_WIDTH + 12}" y="-12" font-size="12" fill="#666" font-family="monospace">
              <animate attributeName="opacity" values="0;1;0" dur="2s" begin="0.3s" repeatCount="indefinite"/>
              z
            </text>
            <text x="${CHAR_WIDTH + 20}" y="-20" font-size="14" fill="#666" font-family="monospace">
              <animate attributeName="opacity" values="0;1;0" dur="2s" begin="0.6s" repeatCount="indefinite"/>
              Z
            </text>
          </g>`
      };
    }
    case 'sit': {
      const swayDur = 4 + random() * 2;
      return {
        animation: `
          <animateTransform attributeName="transform" type="translate"
            values="${cx},${cy}; ${cx + 3},${cy}; ${cx},${cy}; ${cx - 3},${cy}; ${cx},${cy}"
            dur="${swayDur}s" repeatCount="indefinite"/>`,
        extraEffects: ''
      };
    }
    case 'jump': {
      const jumpDur = 1.5 + random() * 0.5;
      const jumpHeight = 15 + random() * 10;
      return {
        animation: `
          <animateTransform attributeName="transform" type="translate"
            values="${cx},${cy}; ${cx},${cy - jumpHeight}; ${cx},${cy}"
            dur="${jumpDur}s" repeatCount="indefinite" calcMode="spline"
            keySplines="0.5 0 0.5 1; 0.5 0 0.5 1"/>`,
        extraEffects: ''
      };
    }
    case 'idle':
    default: {
      const moveRange = 15 + random() * 25;
      const dur = 6 + random() * 4;
      const targetX = Math.min(Math.max(cx + (random() > 0.5 ? moveRange : -moveRange), padding), maxX);
      return {
        animation: `
          <animateTransform attributeName="transform" type="translate"
            values="${cx},${cy}; ${targetX},${cy}; ${cx},${cy}"
            dur="${dur}s" repeatCount="indefinite"/>`,
        extraEffects: ''
      };
    }
  }
}

// 캐릭터들 자유롭게 배치
function generateFreeRoamingCharacters(
  characters: Character[],
  width: number,
  height: number,
  theme: 'light' | 'dark',
  username: string,
  lang: 'ko' | 'en' = 'ko'
): string {
  const random = seededRandom(username + '_chars');
  const palette = PALETTE[theme];
  const actions: CharacterAction[] = ['idle', 'walk', 'sleep', 'sit', 'jump'];

  let characterElements = '';

  characters.forEach((char, index) => {
    const padding = 30;
    const cx = padding + random() * (width - padding * 2 - CHAR_WIDTH);
    const cy = padding + random() * (height - padding * 2 - CHAR_HEIGHT);

    const actionIndex = Math.floor(random() * actions.length);
    const action = actions[actionIndex];
    const direction = random() > 0.5 ? 'right' : 'left';

    const quoteIndex = Math.floor(random() * (devQuotes.length + lifeQuotes.length));
    const catchphrase = lang === 'en' ? char.catchphraseEn : char.catchphrase;
    const quote = getQuoteByIndex(quoteIndex, lang) + catchphrase;

    const { animation, extraEffects } = getActionAnimation(action, cx, cy, width, height, random, index);

    const speechDelay = random() * 10;
    const speechCycle = 15 + random() * 8;

    const maxChars = 18;
    const displayQuote = quote.length > maxChars ? quote.slice(0, maxChars - 1) + '…' : quote;
    const bubbleWidth = Math.min(displayQuote.length * 6 + 16, 130);
    const bubbleHeight = 18;
    const bubbleX = CHAR_WIDTH / 2 - bubbleWidth / 2;
    const bubbleY = -bubbleHeight - 8;

    characterElements += `
      <g id="char-${index}">
        ${animation}
        <g transform="${direction === 'left' ? `scale(-1,1) translate(${-CHAR_WIDTH},0)` : ''}">
          ${generateCharacterSVG(char, CHAR_SCALE, action)}
        </g>
        ${extraEffects}
        <g opacity="0">
          <animate
            attributeName="opacity"
            values="0;0;1;1;0;0"
            keyTimes="0;${speechDelay / speechCycle};${(speechDelay + 0.2) / speechCycle};${(speechDelay + 3) / speechCycle};${(speechDelay + 3.2) / speechCycle};1"
            dur="${speechCycle}s"
            repeatCount="indefinite"
          />
          <rect x="${bubbleX}" y="${bubbleY}" width="${bubbleWidth}" height="${bubbleHeight}" rx="4" fill="${palette.textLight}" stroke="${palette.border}" stroke-width="1"/>
          <polygon points="${CHAR_WIDTH / 2 - 4},${bubbleY + bubbleHeight} ${CHAR_WIDTH / 2},${bubbleY + bubbleHeight + 5} ${CHAR_WIDTH / 2 + 4},${bubbleY + bubbleHeight}" fill="${palette.textLight}" stroke="${palette.border}" stroke-width="1"/>
          <rect x="${CHAR_WIDTH / 2 - 3}" y="${bubbleY + bubbleHeight - 1}" width="6" height="2" fill="${palette.textLight}"/>
          <text x="${bubbleX + bubbleWidth / 2}" y="${bubbleY + bubbleHeight / 2 + 4}" text-anchor="middle" fill="${palette.text}" font-size="8" font-family="monospace">${displayQuote}</text>
        </g>
      </g>
    `;
  });

  return characterElements;
}

// 흑백 배경 생성 (집 없음)
function generateMonochromeBackground(width: number, height: number, theme: 'light' | 'dark', random: () => number): string {
  const palette = PALETTE[theme];
  let bg = '';

  // 기본 배경
  bg += `<rect x="0" y="0" width="${width}" height="${height}" fill="${palette.bg}"/>`;

  // 체커보드 패턴
  const tileSize = PIXEL * 6;
  for (let ty = 0; ty < height; ty += tileSize) {
    for (let tx = 0; tx < width; tx += tileSize) {
      if (((tx / tileSize) + (ty / tileSize)) % 2 === 0) {
        bg += `<rect x="${tx}" y="${ty}" width="${tileSize}" height="${tileSize}" fill="${palette.groundDark}" opacity="0.15"/>`;
      }
    }
  }

  return bg;
}

// SVG 생성
export function generateVillageSVG(config: VillageConfig): string {
  const { width, height, theme, characters, username, totalCommits, lang = 'ko' } = config;
  const random = seededRandom(username + '_village');
  const palette = PALETTE[theme];

  // 배경
  const background = generateMonochromeBackground(width, height, theme, random);

  // 캐릭터들 (자유롭게)
  const characterElements = generateFreeRoamingCharacters(
    characters,
    width,
    height,
    theme,
    username,
    lang
  );

  // 타이틀
  const titleWidth = username.length * 7 + 70;
  const title = `
    <g>
      <rect x="4" y="4" width="${titleWidth}" height="16" fill="${palette.textLight}" stroke="${palette.border}" stroke-width="1"/>
      <text x="10" y="15" fill="${palette.text}" font-size="9" font-family="monospace" font-weight="bold">${username}'s Village</text>
    </g>
  `;

  // 통계
  const stats = `
    <g>
      <rect x="${width - 80}" y="4" width="76" height="16" fill="${palette.textLight}" stroke="${palette.border}" stroke-width="1"/>
      <text x="${width - 74}" y="14" fill="${palette.text}" font-size="8" font-family="monospace">${totalCommits} commits</text>
    </g>
  `;

  return `<svg
  xmlns="http://www.w3.org/2000/svg"
  width="${width}"
  height="${height}"
  viewBox="0 0 ${width} ${height}"
  style="image-rendering: pixelated; image-rendering: crisp-edges;"
>
  ${background}
  ${characterElements}
  ${title}
  ${stats}
</svg>`;
}
