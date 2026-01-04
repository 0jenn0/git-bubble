'use client';

import { useLocale } from '@/shared/i18n';

type DividerStyle = 'dots' | 'dashes' | 'stars' | 'hearts' | 'sparkles';
type Theme = 'light' | 'dark';

interface DividerSettingsProps {
  style: DividerStyle;
  color: string;
  animation: boolean;
  width: number;
  theme: Theme;
  size: number;
  setStyle: (style: DividerStyle) => void;
  setColor: (color: string) => void;
  setAnimation: (animation: boolean) => void;
  setWidth: (width: number) => void;
  setTheme: (theme: Theme) => void;
  setSize: (size: number) => void;
}

const styleOptions: { value: DividerStyle; labelKey: 'dots' | 'dashes' | 'stars' | 'hearts' | 'sparkles'; icon: string }[] = [
  { value: 'dots', labelKey: 'dots', icon: '●●●' },
  { value: 'dashes', labelKey: 'dashes', icon: '———' },
  { value: 'stars', labelKey: 'stars', icon: '★★★' },
  { value: 'hearts', labelKey: 'hearts', icon: '♥♥♥' },
  { value: 'sparkles', labelKey: 'sparkles', icon: '✦✦✦' },
];

export function DividerSettings({
  style,
  color,
  animation,
  width,
  theme,
  size,
  setStyle,
  setColor,
  setAnimation,
  setWidth,
  setTheme,
  setSize,
}: DividerSettingsProps) {
  const { t } = useLocale();

  return (
    <div className="lg:order-1 lg:pr-6">
      <h2 className="text-xs font-semibold text-black/40 mb-8 uppercase tracking-widest">
        Divider Settings
      </h2>

      {/* Style */}
      <div className="mb-8">
        <label className="flex items-center gap-2 text-xs font-medium text-black/40 mb-3 uppercase tracking-widest">
          Style
        </label>
        <div className="grid grid-cols-5 gap-2">
          {styleOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setStyle(option.value)}
              className={`px-2 py-3 rounded-[4px] text-center transition-all ${
                style === option.value
                  ? 'bg-black text-white'
                  : 'bg-black/5 text-black/60 hover:bg-black/10'
              }`}
            >
              <div className="text-lg mb-1">{option.icon}</div>
              <div className="text-[10px]">{t(option.labelKey)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div className="mb-8">
        <label className="flex items-center gap-2 text-xs font-medium text-black/40 mb-3 uppercase tracking-widest">
          Color
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
          />
          <div className="flex gap-2">
            {['#000000', '#FFFFFF', '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#DDA0DD', '#87CEEB'].map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${
                  color === c ? 'ring-2 ring-offset-2 ring-black/30' : ''
                } ${c === '#FFFFFF' ? 'border border-black/20' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Animation Toggle */}
      <div className="mb-8">
        <label className="flex items-center gap-2 text-xs font-medium text-black/40 mb-3 uppercase tracking-widest">
          Animation
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAnimation(!animation)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              animation ? 'bg-black' : 'bg-black/20'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                animation ? 'left-6' : 'left-1'
              }`}
            />
          </button>
          <span className="text-sm text-black/60">
            {animation ? t('animationOn') : t('animationOff')}
          </span>
        </div>
        <p className="text-xs text-black/30 mt-2">
          {t('animationDescription')}
        </p>
      </div>

      {/* Theme */}
      <div className="mb-8">
        <label className="flex items-center gap-2 text-xs font-medium text-black/40 mb-3 uppercase tracking-widest">
          Theme
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setTheme('light')}
            className={`flex-1 px-4 py-2.5 rounded-[4px] text-sm font-medium transition-all ${
              theme === 'light'
                ? 'bg-black text-white'
                : 'bg-black/5 text-black/60 hover:bg-black/10'
            }`}
          >
            Light
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`flex-1 px-4 py-2.5 rounded-[4px] text-sm font-medium transition-all ${
              theme === 'dark'
                ? 'bg-black text-white'
                : 'bg-black/5 text-black/60 hover:bg-black/10'
            }`}
          >
            Dark
          </button>
        </div>
      </div>

      {/* Size */}
      <div className="mb-8">
        <label className="flex items-center gap-2 text-xs font-medium text-black/40 mb-3 uppercase tracking-widest">
          Size: {(size * 100).toFixed(0)}%
        </label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          className="w-full accent-black [&::-webkit-slider-runnable-track]:bg-black/10 [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:mt-[-6px]"
        />
        <p className="text-xs text-black/30 mt-2">
          {t('sizeLabel')}
        </p>
      </div>

      {/* Width */}
      <div className="mb-8">
        <label className="flex items-center gap-2 text-xs font-medium text-black/40 mb-3 uppercase tracking-widest">
          Width: {width}px
        </label>
        <input
          type="range"
          min="200"
          max="600"
          step="20"
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
          className="w-full accent-black [&::-webkit-slider-runnable-track]:bg-black/10 [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:mt-[-6px]"
        />
      </div>
    </div>
  );
}
