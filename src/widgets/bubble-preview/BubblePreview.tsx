'use client';

interface BubblePreviewProps {
  previewUrl: string;
  hasRequiredValues: boolean;
  missingField: string;
}

export function BubblePreview({
  previewUrl,
  hasRequiredValues,
  missingField,
}: BubblePreviewProps) {
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
              alt="Bubble Preview"
              className="max-w-full h-auto"
            />
          ) : (
            <div className="text-center px-6">
              <p className="text-sm text-black/60 mb-1">
                필수값 <span className="font-semibold">{missingField}</span>을
              </p>
              <p className="text-sm text-black/60">넣어주세요!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
