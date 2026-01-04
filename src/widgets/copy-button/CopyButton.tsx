'use client';

import { useState } from 'react';

interface CopyButtonProps {
  generateUrl: () => string;
}

export function CopyButton({ generateUrl }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    const relativeUrl = generateUrl();
    const absoluteUrl = `${window.location.origin}${relativeUrl}`;
    const htmlCode = `<img src="${absoluteUrl}" />`;

    try {
      await navigator.clipboard.writeText(htmlCode);
      setCopied(true);
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
              className={`w-full px-6 py-4 rounded-[4px] text-sm md:text-base font-semibold transition-all ${
                copied
                  ? 'bg-black/10 text-black/60'
                  : 'bg-black text-white hover:bg-black/90 active:scale-[0.98]'
              }`}
            >
              {copied ? '✓ 복사됨' : '클립보드에 복사'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
