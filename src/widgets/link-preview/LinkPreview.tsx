'use client';

import { useLocale } from '@/shared/i18n';

interface LinkPreviewProps {
  previewUrl: string;
  hasRequiredValues: boolean;
}

export function LinkPreview({ previewUrl, hasRequiredValues }: LinkPreviewProps) {
  const { t } = useLocale();

  return (
    <div className="lg:order-2 lg:sticky lg:top-20 lg:h-[calc(100vh-8rem)] lg:overflow-y-auto">
      <div className="lg:h-full lg:flex lg:flex-col">
        <h2 className="text-xs font-semibold text-black/40 mb-6 uppercase tracking-widest">
          Preview
        </h2>
        <div className="flex justify-center items-center min-h-[200px] lg:flex-1 lg:overflow-auto">
          {hasRequiredValues ? (
            <img
              key={previewUrl}
              src={previewUrl}
              alt="Link Preview"
              className="max-w-full h-auto"
            />
          ) : (
            <div className="text-center px-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-black/5 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-black/30"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </div>
              <p className="text-sm text-black/60 mb-1">
                {t('enterUrlPrefix')} <span className="font-semibold">URL</span>
              </p>
              <p className="text-sm text-black/60">{t('enterUrlSuffix')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
