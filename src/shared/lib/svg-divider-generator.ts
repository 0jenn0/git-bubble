export interface DividerParams {
  width?: number;
  style?: 'dots' | 'dashes' | 'stars' | 'hearts' | 'sparkles';
  color?: string;
  animation?: boolean;
  theme?: 'light' | 'dark';
  size?: number; // 0.5 ~ 2.0 scale factor
}

export function generateDividerSVG(params: DividerParams): string {
  const {
    width = 400,
    style = 'dots',
    color = '#000000',
    animation = true,
    theme = 'light',
    size = 1.0
  } = params;

  const scale = Math.max(0.5, Math.min(2.0, size));
  const height = Math.max(40, 40 * scale);
  const bgColor = theme === 'dark' ? '#1A1A1A' : 'transparent';
  const strokeColor = theme === 'dark' ? '#888888' : '#222222';

  // 굵은 도트 스타일 패턴 생성 (픽셀 아트 느낌)
  const patterns: Record<string, { element: string; spacing: number; size: number }> = {
    dots: {
      element: `<rect x="-4" y="-4" width="8" height="8" fill="${color}" stroke="${strokeColor}" stroke-width="2"/>`,
      spacing: 20,
      size: 8
    },
    dashes: {
      element: `<rect x="-8" y="-3" width="16" height="6" fill="${color}" stroke="${strokeColor}" stroke-width="2"/>`,
      spacing: 28,
      size: 16
    },
    stars: {
      element: `<path d="M0,-6 L2,-2 L6,-2 L3,1 L4,6 L0,3 L-4,6 L-3,1 L-6,-2 L-2,-2 Z" fill="${color}" stroke="${strokeColor}" stroke-width="2" stroke-linejoin="miter"/>`,
      spacing: 32,
      size: 12
    },
    hearts: {
      element: `<path d="M0,4 L-5,-1 L-5,-4 L-3,-6 L0,-3 L3,-6 L5,-4 L5,-1 Z" fill="${color}" stroke="${strokeColor}" stroke-width="2" stroke-linejoin="miter"/>`,
      spacing: 28,
      size: 12
    },
    sparkles: {
      element: `<path d="M0,-7 L1.5,-1.5 L7,0 L1.5,1.5 L0,7 L-1.5,1.5 L-7,0 L-1.5,-1.5 Z" fill="${color}" stroke="${strokeColor}" stroke-width="2" stroke-linejoin="miter"/>`,
      spacing: 32,
      size: 14
    }
  };

  const pattern = patterns[style] || patterns.dots;
  const scaledSpacing = pattern.spacing * scale;
  const itemCount = Math.floor((width - 40) / scaledSpacing);
  const startX = (width - (itemCount - 1) * scaledSpacing) / 2;

  // 각 아이템 생성 (SVG 네이티브 애니메이션 사용)
  const baseY = height / 2;
  const animationDistance = 4 * scale;
  const items = Array.from({ length: itemCount }, (_, i) => {
    const x = startX + i * scaledSpacing;
    const delay = (i * 0.1).toFixed(2);

    if (animation) {
      return `
      <g transform="translate(${x}, ${baseY})">
        <g transform="scale(${scale})">
          ${pattern.element}
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 0,${-animationDistance / scale}; 0,0"
            dur="1.2s"
            begin="${delay}s"
            repeatCount="indefinite"
            additive="sum"
          />
        </g>
      </g>`;
    }
    return `
      <g transform="translate(${x}, ${baseY}) scale(${scale})">
        ${pattern.element}
      </g>`;
  }).join('');

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="image-rendering: pixelated; image-rendering: crisp-edges;">
  <rect width="${width}" height="${height}" fill="${bgColor}"/>
  ${items}
</svg>`.trim();
}
