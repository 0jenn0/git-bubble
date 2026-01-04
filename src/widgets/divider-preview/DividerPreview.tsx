'use client';

interface DividerPreviewProps {
  previewUrl: string;
}

export function DividerPreview({ previewUrl }: DividerPreviewProps) {
  return (
    <div className="lg:order-2">
      <h2 className="text-xs font-semibold text-black/40 mb-8 uppercase tracking-widest">
        Preview
      </h2>

      <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl p-8 min-h-[200px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 w-full">
          {/* 컨텍스트 텍스트 (위) */}
          <div className="text-center text-black/40 text-sm">
            <p>Section 1</p>
          </div>

          {/* 디바이더 프리뷰 */}
          <div className="flex justify-center w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Divider preview"
              className="max-w-full"
            />
          </div>

          {/* 컨텍스트 텍스트 (아래) */}
          <div className="text-center text-black/40 text-sm">
            <p>Section 2</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-black/30 mt-4 text-center">
        GitHub README에서 섹션을 구분하는 귀여운 디바이더
      </p>
    </div>
  );
}
