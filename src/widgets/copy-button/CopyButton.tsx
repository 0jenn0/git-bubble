'use client';

import { useState } from 'react';
import { analytics } from '@/shared/lib/analytics';
import { useLocale } from '@/shared/i18n';

interface CopyButtonProps {
  generateUrl: () => string;
  mode: string;
  disabled?: boolean;
  linkUrl?: string;
}

export function CopyButton({ generateUrl, mode, disabled, linkUrl }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const { t } = useLocale();

  const copyToClipboard = async () => {
    if (disabled) return;

    const relativeUrl = generateUrl();
    if (!relativeUrl) return;

    const absoluteUrl = `${window.location.origin}${relativeUrl}`;

    const htmlCode = mode === 'link' && linkUrl
      ? `<a href="${linkUrl}" target="_blank"><img src="${absoluteUrl}" /></a>`
      : `<img src="${absoluteUrl}" />`;

    try {
      await navigator.clipboard.writeText(htmlCode);
      setCopied(true);
      analytics.copyToClipboard(mode);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 backdrop-blur-xl bg-white/80">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-md lg:max-w-xs">
            <button
              onClick={copyToClipboard}
              disabled={disabled}
              className={`w-full px-6 py-4 rounded-[4px] text-sm md:text-base font-semibold transition-all ${
                disabled
                  ? 'bg-black/10 text-black/30 cursor-not-allowed'
                  : copied
                  ? 'bg-black/10 text-black/60'
                  : 'bg-black text-white hover:bg-black/90 active:scale-[0.98]'
              }`}
            >
              {copied ? t('copied') : t('copyToClipboard')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
