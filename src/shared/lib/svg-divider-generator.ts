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

  // 스타일별 패턴 생성
  const patterns: Record<string, { element: string; spacing: number; size: number }> = {
    dots: {
      element: `<circle cx="0" cy="0" r="3" fill="${color}"/>`,
      spacing: 16,
      size: 6
    },
    dashes: {
      element: `<rect x="-6" y="-2" width="12" height="4" rx="2" fill="${color}"/>`,
      spacing: 24,
      size: 12
    },
    stars: {
      element: `<path d="M0,-5 L1.5,-1.5 L5.5,-1.5 L2.5,1 L3.5,5 L0,2.5 L-3.5,5 L-2.5,1 L-5.5,-1.5 L-1.5,-1.5 Z" fill="${color}"/>`,
      spacing: 28,
      size: 11
    },
    hearts: {
      element: `<path d="M0,3 C-5,-2 -5,-5 -2.5,-5 C0,-5 0,-2 0,-2 C0,-2 0,-5 2.5,-5 C5,-5 5,-2 0,3 Z" fill="${color}"/>`,
      spacing: 24,
      size: 10
    },
    sparkles: {
      element: `<path d="M0,-6 L1,0 L0,6 L-1,0 Z M-4,-4 L0,1 L4,-4 L0,-1 Z" fill="${color}"/>`,
      spacing: 28,
      size: 12
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
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${bgColor}"/>
  ${items}
</svg>`.trim();
}
