'use client';

import { useRef, useState } from 'react';
import { useImageUpload } from '@/features/image-upload';
import { analytics } from '@/shared/lib/analytics';

type Theme = 'light' | 'dark';

interface LinkSettingsProps {
  url: string;
  theme: Theme;
  width: number;
  customThumbnail: string;
  setUrl: (url: string) => void;
  setTheme: (theme: Theme) => void;
  setWidth: (width: number) => void;
  setCustomThumbnail: (thumbnail: string) => void;
}

export function LinkSettings({
  url,
  theme,
  width,
  customThumbnail,
  setUrl,
  setTheme,
  setWidth,
  setCustomThumbnail,
}: LinkSettingsProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useImageUpload();

  const handleFileSelect = async (file: File) => {
    try {
      const result = await uploadMutation.mutateAsync(file);
      if (result.publicUrl) {
        setCustomThumbnail(result.publicUrl);
        analytics.uploadImage(true);
      }
    } catch {
      analytics.uploadImage(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    analytics.changeTheme(newTheme);
  };

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
  };

  const handleWidthChangeEnd = () => {
    analytics.changeWidth(width);
  };

  return (
    <div className="lg:order-1 lg:pr-6">
      <h2 className="text-xs font-semibold text-black/40 mb-8 uppercase tracking-widest">
        Link Settings
      </h2>

      {/* URL Input */}
      <div className="mb-8">
        <label className="flex items-center gap-2 text-xs font-medium text-black/40 mb-3 uppercase tracking-widest">
          URL
          <span className="text-[10px] font-normal normal-case bg-black text-white px-1.5 py-0.5 rounded-[4px]">
            필수
          </span>
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="w-full px-0 py-3 bg-transparent border-b border-black/10 focus:outline-none focus:border-black text-sm transition-all"
        />
        <p className="text-xs text-black/30 mt-2">
          미리보기할 웹사이트 URL을 입력하세요
        </p>
      </div>

      {/* Theme */}
      <div className="mb-8">
        <label className="flex items-center gap-2 text-xs font-medium text-black/40 mb-3 uppercase tracking-widest">
          Theme
          <span className="text-[10px] font-normal normal-case bg-black/10 text-black/40 px-1.5 py-0.5 rounded-[4px]">
            선택
          </span>
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => handleThemeChange('light')}
            className={`flex-1 px-4 py-2.5 rounded-[4px] text-sm font-medium transition-all ${
              theme === 'light'
                ? 'bg-black text-white'
                : 'bg-black/5 text-black/60 hover:bg-black/10'
            }`}
          >
            Light
          </button>
          <button
            onClick={() => handleThemeChange('dark')}
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
          Width: {width}px
          <span className="text-[10px] font-normal normal-case bg-black/10 text-black/40 px-1.5 py-0.5 rounded-[4px]">
            선택
          </span>
        </label>
        <input
          type="range"
          min="280"
          max="500"
          step="20"
          value={width}
          onChange={(e) => handleWidthChange(Number(e.target.value))}
          onMouseUp={handleWidthChangeEnd}
          onTouchEnd={handleWidthChangeEnd}
          className="w-full accent-black [&::-webkit-slider-runnable-track]:bg-black/10 [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:mt-[-6px] [&::-moz-range-track]:bg-black/10 [&::-moz-range-track]:h-1 [&::-moz-range-track]:rounded-full [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-black [&::-moz-range-thumb]:border-0"
        />
      </div>

      {/* Custom Thumbnail */}
      <div className="mb-8">
        <label className="flex items-center gap-2 text-xs font-medium text-black/40 mb-3 uppercase tracking-widest">
          Custom Thumbnail
          <span className="text-[10px] font-normal normal-case bg-black/10 text-black/40 px-1.5 py-0.5 rounded-[4px]">
            선택
          </span>
        </label>

        <div className="bg-black/5 rounded-lg p-4 mb-4">
          <p className="text-xs text-black/60 leading-relaxed">
            <span className="font-semibold">썸네일이 없는 경우:</span> 웹사이트에 OG 이미지가 없으면 썸네일 영역이 비어있게 됩니다.
            원하는 이미지를 직접 업로드하여 사용할 수 있습니다.
          </p>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all mb-3 ${
            isDragging ? 'border-black bg-black/5' : 'border-black/20 hover:border-black/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {uploadMutation.isPending ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              <p className="text-sm text-black/60">업로드 중...</p>
            </div>
          ) : customThumbnail ? (
            <div className="flex items-center gap-3">
              <img
                src={customThumbnail}
                alt="Custom thumbnail"
                className="w-16 h-12 rounded object-cover"
              />
              <div className="flex-1 text-left">
                <p className="text-sm text-black/80 truncate">
                  {customThumbnail.split('/').pop()}
                </p>
                <p className="text-xs text-black/40">클릭하여 변경</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
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
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm text-black/60">
                커스텀 썸네일 업로드 (선택)
              </p>
              <p className="text-xs text-black/30">JPG, PNG, GIF, WebP</p>
            </div>
          )}
        </div>

        {uploadMutation.isError && (
          <p className="text-xs text-red-500 mb-2">
            업로드 실패: {uploadMutation.error?.message}
          </p>
        )}

        {customThumbnail && (
          <button
            onClick={() => setCustomThumbnail('')}
            className="text-xs text-black/40 hover:text-black/60 transition-colors"
          >
            썸네일 제거
          </button>
        )}
      </div>
    </div>
  );
}
