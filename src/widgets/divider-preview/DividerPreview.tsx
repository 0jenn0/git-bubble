'use client';

import { useLocale } from '@/shared/i18n';

interface DividerPreviewProps {
  previewUrl: string;
}

export function DividerPreview({ previewUrl }: DividerPreviewProps) {
  const { t } = useLocale();

  return (
    <div className="lg:order-2">
      <h2 className="text-xs font-semibold text-black/40 mb-8 uppercase tracking-widest">
        Preview
      </h2>

      <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl p-8 min-h-[200px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 w-full">
          {/* Context text (above) */}
          <div className="text-center text-black/40 text-sm">
            <p>Section 1</p>
          </div>

          {/* Divider preview */}
          <div className="flex justify-center w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Divider preview"
              className="max-w-full"
            />
          </div>

          {/* Context text (below) */}
          <div className="text-center text-black/40 text-sm">
            <p>Section 2</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-black/30 mt-4 text-center">
        {t('dividerDescription')}
      </p>
    </div>
  );
}
