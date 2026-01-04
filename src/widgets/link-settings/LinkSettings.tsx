'use client';

import { useRef, useState } from 'react';
import { useImageUpload } from '@/features/image-upload';
import { analytics } from '@/shared/lib/analytics';
import { useLocale } from '@/shared/i18n';

type Theme = 'light' | 'dark';

interface LinkSettingsProps {
  url: string;
  theme: Theme;
  width: number;
  customThumbnail: string;
  badgeEnabled: boolean;
  badgeText: string;
  badgeImage: string;
  badgeColor: string;
  setUrl: (url: string) => void;
  setTheme: (theme: Theme) => void;
  setWidth: (width: number) => void;
  setCustomThumbnail: (thumbnail: string) => void;
  setBadgeEnabled: (enabled: boolean) => void;
  setBadgeText: (text: string) => void;
  setBadgeImage: (image: string) => void;
  setBadgeColor: (color: string) => void;
}

export function LinkSettings({
  url,
  theme,
  width,
  customThumbnail,
  badgeEnabled,
  badgeText,
  badgeImage,
  badgeColor,
  setUrl,
  setTheme,
  setWidth,
  setCustomThumbnail,
  setBadgeEnabled,
  setBadgeText,
  setBadgeImage,
  setBadgeColor,
}: LinkSettingsProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isBadgeDragging, setIsBadgeDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const badgeFileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useImageUpload();
  const badgeUploadMutation = useImageUpload();
  const { t } = useLocale();

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

  const handleBadgeFileSelect = async (file: File) => {
    try {
      const result = await badgeUploadMutation.mutateAsync(file);
      if (result.publicUrl) {
        setBadgeImage(result.publicUrl);
        analytics.uploadImage(true);
      }
    } catch {
      analytics.uploadImage(false);
    }
  };

  const handleBadgeDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsBadgeDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleBadgeFileSelect(file);
    }
  };

  const handleBadgeFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleBadgeFileSelect(file);
    }
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
            {t('required')}
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
          {t('enterUrlHint')}
        </p>
      </div>

      {/* Theme */}
      <div className="mb-8">
        <label className="flex items-center gap-2 text-xs font-medium text-black/40 mb-3 uppercase tracking-widest">
          Theme
          <span className="text-[10px] font-normal normal-case bg-black/10 text-black/40 px-1.5 py-0.5 rounded-[4px]">
            {t('optional')}
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
            {t('optional')}
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
            {t('optional')}
          </span>
        </label>

        <div className="bg-black/5 rounded-lg p-4 mb-4">
          <p className="text-xs text-black/60 leading-relaxed">
            {t('thumbnailHint')}
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
              <p className="text-sm text-black/60">{t('uploading')}</p>
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
                <p className="text-xs text-black/40">{t('clickToChange')}</p>
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
                {t('customThumbnailUpload')}
              </p>
              <p className="text-xs text-black/30">JPG, PNG, GIF, WebP</p>
            </div>
          )}
        </div>

        {uploadMutation.isError && (
          <p className="text-xs text-red-500 mb-2">
            {t('uploadFailed')}: {uploadMutation.error?.message}
          </p>
        )}

        {customThumbnail && (
          <button
            onClick={() => setCustomThumbnail('')}
            className="text-xs text-black/40 hover:text-black/60 transition-colors"
          >
            {t('removeThumbnail')}
          </button>
        )}
      </div>

      {/* Badge Settings */}
      <div className="mb-8">
        <label className="flex items-center gap-2 text-xs font-medium text-black/40 mb-3 uppercase tracking-widest">
          Badge
          <span className="text-[10px] font-normal normal-case bg-black/10 text-black/40 px-1.5 py-0.5 rounded-[4px]">
            {t('optional')}
          </span>
        </label>

        {/* Badge Toggle */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setBadgeEnabled(!badgeEnabled)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              badgeEnabled ? 'bg-black' : 'bg-black/20'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                badgeEnabled ? 'left-6' : 'left-1'
              }`}
            />
          </button>
          <span className="text-sm text-black/60">
            {badgeEnabled ? t('badgeEnabled') : t('badgeDisabled')}
          </span>
        </div>

        {badgeEnabled && (
          <div className="space-y-4 pl-4 border-l-2 border-black/10">
            {/* Badge Text */}
            <div>
              <label className="block text-xs text-black/40 mb-2">{t('badgeText')}</label>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                placeholder="NEW"
                maxLength={10}
                className="w-full px-3 py-2 bg-black/5 rounded-[4px] text-sm focus:outline-none focus:ring-1 focus:ring-black/20"
              />
              <p className="text-xs text-black/30 mt-1">
                {t('badgeTextHint')}
              </p>
            </div>

            {/* Badge Color */}
            <div>
              <label className="block text-xs text-black/40 mb-2">{t('badgeColor')}</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={badgeColor}
                  onChange={(e) => setBadgeColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                />
                <div className="flex gap-2">
                  {['#FF0000', '#FF6B00', '#FFD600', '#00C853', '#2979FF', '#7C4DFF', '#E91E63', '#000000'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setBadgeColor(color)}
                      className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${
                        badgeColor === color ? 'ring-2 ring-offset-2 ring-black/30' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Badge Image */}
            <div>
              <label className="block text-xs text-black/40 mb-2">{t('badgeImage')}</label>
              <div
                onDrop={handleBadgeDrop}
                onDragOver={(e) => { e.preventDefault(); setIsBadgeDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsBadgeDragging(false); }}
                onClick={() => badgeFileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
                  isBadgeDragging ? 'border-black bg-black/5' : 'border-black/20 hover:border-black/40'
                }`}
              >
                <input
                  ref={badgeFileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleBadgeFileInputChange}
                  className="hidden"
                />

                {badgeUploadMutation.isPending ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    <p className="text-sm text-black/60">{t('uploading')}</p>
                  </div>
                ) : badgeImage ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={badgeImage}
                      alt="Badge"
                      className="w-8 h-8 rounded object-cover"
                    />
                    <div className="flex-1 text-left">
                      <p className="text-xs text-black/80 truncate">
                        {badgeImage.split('/').pop()}
                      </p>
                      <p className="text-xs text-black/40">{t('clickToChange')}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-black/40">
                    {t('badgeImageUpload')}
                  </p>
                )}
              </div>

              {badgeImage && (
                <button
                  onClick={() => setBadgeImage('')}
                  className="text-xs text-black/40 hover:text-black/60 transition-colors mt-2"
                >
                  {t('removeImage')}
                </button>
              )}
            </div>

            <div className="bg-black/5 rounded-lg p-3">
              <p className="text-xs text-black/60 leading-relaxed">
                {t('badgeDescription')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
