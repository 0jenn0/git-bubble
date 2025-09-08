export interface BubbleParams {
 title?: string;
 tags: string;
 theme?: Theme;
 style?: BubbleStyle;
 width?: number;
 fontSize?: number;
 animation?: Animation;
}

export type Theme = 'gradient' | 'purple' | 'orange' | 'mint' | 'neon' | 'pastel';

export type BubbleStyle = 'modern' | 'minimal' | 'glass' | 'retro' | 'neon';

export type Animation = 'float' | 'pulse' | 'none';

export interface ThemeColors {
 primary: string;
 secondary: string;
 accent?: string;
}