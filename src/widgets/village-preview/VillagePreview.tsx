'use client';

import { useLocale } from '@/shared/i18n';

interface VillagePreviewProps {
  previewUrl: string;
  hasRequiredValues: boolean;
}

export function VillagePreview({ previewUrl, hasRequiredValues }: VillagePreviewProps) {
  const { t } = useLocale();

  return (
    <div className="lg:order-2">
      <h2 className="text-xs font-semibold text-black/40 mb-8 uppercase tracking-widest">
        Preview
      </h2>

      <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl p-8 min-h-[300px] flex items-center justify-center">
        {hasRequiredValues ? (
          <div className="w-full overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Village preview"
              className="w-full"
            />
          </div>
        ) : (
          <div className="text-center text-black/30">
            <svg
              className="w-16 h-16 mx-auto mb-4 opacity-30"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <p className="text-sm">{t('enterUsername')}</p>
          </div>
        )}
      </div>

      <p className="text-xs text-black/30 mt-4 text-center">
        {t('villageDescription')}
      </p>
    </div>
  );
}
