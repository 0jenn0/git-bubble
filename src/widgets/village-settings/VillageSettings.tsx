'use client';

import { useLocale } from '@/shared/i18n';
import { characters, generateCharacterSVG, type Character } from '@/shared/lib/village-characters';

type Theme = 'light' | 'dark';

// 캐릭터 미리보기 컴포넌트
function CharacterPreview({ character }: { character: Character }) {
  const svgContent = generateCharacterSVG(character, 2);
  const size = 32;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className="flex-shrink-0"
    >
      <g dangerouslySetInnerHTML={{ __html: svgContent }} />
    </svg>
  );
}

interface VillageSettingsProps {
  username: string;
  width: number;
  height: number;
  theme: Theme;
  setUsername: (username: string) => void;
  setWidth: (width: number) => void;
  setHeight: (height: number) => void;
  setTheme: (theme: Theme) => void;
}

export function VillageSettings({
  username,
  width,
  height,
  theme,
  setUsername,
  setWidth,
  setHeight,
  setTheme,
}: VillageSettingsProps) {
  const { t } = useLocale();

  return (
    <div className="lg:order-1 lg:pr-6">
      <h2 className="text-xs font-semibold text-black/40 mb-8 uppercase tracking-widest">
        {t('villageSettings')}
      </h2>

      {/* GitHub Username */}
      <div className="mb-8">
        <label className="flex items-center gap-2 text-xs font-medium text-black/40 mb-3 uppercase tracking-widest">
          {t('githubUsername')}
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. octocat"
          className="w-full px-4 py-3 rounded-[4px] bg-black/5 border-none text-sm placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-black/20"
        />
        <p className="text-xs text-black/30 mt-2">
          {t('villageUsernameDescription')}
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

      {/* Width */}
      <div className="mb-8">
        <label className="flex items-center gap-2 text-xs font-medium text-black/40 mb-3 uppercase tracking-widest">
          {t('width')}: {width}px
        </label>
        <input
          type="range"
          min="300"
          max="1200"
          step="50"
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
          className="w-full accent-black [&::-webkit-slider-runnable-track]:bg-black/10 [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:mt-[-6px]"
        />
      </div>

      {/* Height */}
      <div className="mb-8">
        <label className="flex items-center gap-2 text-xs font-medium text-black/40 mb-3 uppercase tracking-widest">
          {t('height')}: {height}px
        </label>
        <input
          type="range"
          min="100"
          max="400"
          step="25"
          value={height}
          onChange={(e) => setHeight(Number(e.target.value))}
          className="w-full accent-black [&::-webkit-slider-runnable-track]:bg-black/10 [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:mt-[-6px]"
        />
      </div>

      {/* Info */}
      <div className="p-4 bg-black/5 rounded-lg">
        <h3 className="text-xs font-semibold text-black/60 mb-2">{t('villageInfo')}</h3>
        <ul className="text-xs text-black/40 space-y-1">
          <li>{t('villageInfoCommits')}</li>
          <li>{t('villageInfoPersist')}</li>
          <li>{t('villageInfoSpeech')}</li>
        </ul>
      </div>

      {/* Character Guide */}
      <div className="mt-8">
        <h2 className="text-xs font-semibold text-black/40 mb-3 uppercase tracking-widest">
          {t('characterGuide')}
        </h2>
        <p className="text-xs text-black/40 mb-4">
          {t('characterGuideDescription')}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {characters.map((character) => (
            <div
              key={character.id}
              className="flex items-center gap-3 p-3 bg-black/5 rounded-lg hover:bg-black/10 transition-colors"
            >
              <div className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm">
                <CharacterPreview character={character} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-black/80 truncate">
                  {character.nameKo}
                </div>
                <div className="text-xs text-black/40 truncate">
                  {character.catchphrase}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
