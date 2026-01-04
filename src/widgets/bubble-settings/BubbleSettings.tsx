'use client';

import { useRef, useState } from 'react';
import { useImageUpload } from '@/features/image-upload';
import { analytics } from '@/shared/lib/analytics';

type Mode = 'tags' | 'text';
type Theme = 'light' | 'dark';
type Direction = 'left' | 'right';
type Animation = 'none' | 'float' | 'pulse';

interface BubbleSettingsProps {
  mode: Mode;
  tags: string;
  text: string;
  title: string;
  theme: Theme;
  direction: Direction;
  profileUrl: string;
  animation: Animation;
  width: number;
  fontSize: number;
  setMode: (mode: Mode) => void;
  setTags: (tags: string) => void;
  setText: (text: string) => void;
  setTitle: (title: string) => void;
  setTheme: (theme: Theme) => void;
  setDirection: (direction: Direction) => void;
  setProfileUrl: (url: string) => void;
  setAnimation: (animation: Animation) => void;
  setWidth: (width: number) => void;
  setFontSize: (fontSize: number) => void;
}

export function BubbleSettings({
  mode,
  tags,
  text,
  title,
  theme,
  direction,
  profileUrl,
  animation,
  width,
  fontSize,
  setMode,
  setTags,
  setText,
  setTitle,
  setTheme,
  setDirection,
  setProfileUrl,
  setAnimation,
  setWidth,
  setFontSize,
}: BubbleSettingsProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useImageUpload();

  const handleFileSelect = async (file: File) => {
    try {
      const result = await uploadMutation.mutateAsync(file);
      if (result.publicUrl) {
        setProfileUrl(result.publicUrl);
        analytics.uploadImage(true);
      }
    } catch {
      analytics.uploadImage(false);
    }
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    analytics.changeMode(newMode);
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    analytics.changeTheme(newTheme);
  };

  const handleDirectionChange = (newDirection: Direction) => {
    setDirection(newDirection);
    analytics.changeDirection(newDirection);
  };

  const handleAnimationChange = (newAnimation: Animation) => {
    setAnimation(newAnimation);
    analytics.changeAnimation(newAnimation);
  };

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
  };

  const handleWidthChangeEnd = () => {
    analytics.changeWidth(width);
  };

  const handleFontSizeChange = (newFontSize: number) => {
    setFontSize(newFontSize);
  };

  const handleFontSizeChangeEnd = () => {
    analytics.changeFontSize(fontSize);
  };

  const handleProfileUrlBlur = () => {
    if (profileUrl) {
      analytics.setProfileUrl();
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

  return (
    <div className="lg:order-1 lg:pr-6">
      <h2 className="text-xs font-semibold text-black/40 mb-8 uppercase tracking-widest">
        Settings
      </h2>

      {/* Mode */}
      <div className="mb-8">
        <label className="flex items-center gap-2 text-xs font-medium text-black/40 mb-3 uppercase tracking-widest">
          Mode
          <span className="text-[10px] font-normal normal-case bg-black text-white px-1.5 py-0.5 rounded-[4px]">
            필수
          </span>
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => handleModeChange('tags')}
            className={`flex-1 px-4 py-2.5 rounded-[4px] text-sm font-medium transition-all ${
              mode === 'tags'
                ? 'bg-black text-white'
                : 'bg-black/5 text-black/60 hover:bg-black/10'
            }`}
          >
            태그
          </button>
          <button
            onClick={() => handleModeChange('text')}
            className={`flex-1 px-4 py-2.5 rounded-[4px] text-sm font-medium transition-all ${
              mode === 'text'
                ? 'bg-black text-white'
                : 'bg-black/5 text-black/60 hover:bg-black/10'
            }`}
          >
            텍스트
          </button>
        </div>
      </div>

      {/* Tags or Text */}
      {mode === 'tags' ? (
        <div className="mb-8">
          <label className="flex items-center gap-2 text-xs font-medium text-black/40 mb-3 uppercase tracking-widest">
            Tags
            <span className="text-[10px] font-normal normal-case bg-black text-white px-1.5 py-0.5 rounded-[4px]">
              필수
            </span>
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="태그1,태그2,태그3"
            className="w-full px-0 py-3 bg-transparent border-b border-black/10 focus:outline-none focus:border-black text-sm transition-all"
          />
          <p className="text-xs text-black/30 mt-2">쉼표로 구분</p>
        </div>
      ) : (
        <div className="mb-8">
          <label className="flex items-center gap-2 text-xs font-medium text-black/40 mb-3 uppercase tracking-widest">
            Text
            <span className="text-[10px] font-normal normal-case bg-black text-white px-1.5 py-0.5 rounded-[4px]">
              필수
            </span>
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="일반 텍스트를 입력하세요..."
            rows={4}
            className="w-full px-0 py-3 bg-transparent border-b border-black/10 focus:outline-none focus:border-black text-sm resize-none transition-all"
          />
          <p className="text-xs text-black/30 mt-2">자동으로 줄바꿈됩니다</p>
        </div>
      )}

      {/* Title */}
      <div className="mb-8">
        <label className="flex items-center gap-2 text-xs font-medium text-black/40 mb-3 uppercase tracking-widest">
          Title
          <span className="text-[10px] font-normal normal-case bg-black/10 text-black/40 px-1.5 py-0.5 rounded-[4px]">
            선택
          </span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목 (선택사항)"
          className="w-full px-0 py-3 bg-transparent border-b border-black/10 focus:outline-none focus:border-black text-sm transition-all"
        />
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

      {/* Direction */}
      <div className="mb-8">
        <label className="flex items-center gap-2 text-xs font-medium text-black/40 mb-3 uppercase tracking-widest">
          Direction
          <span className="text-[10px] font-normal normal-case bg-black/10 text-black/40 px-1.5 py-0.5 rounded-[4px]">
            선택
          </span>
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => handleDirectionChange('left')}
            className={`flex-1 px-4 py-2.5 rounded-[4px] text-sm font-medium transition-all ${
              direction === 'left'
                ? 'bg-black text-white'
                : 'bg-black/5 text-black/60 hover:bg-black/10'
            }`}
          >
            왼쪽
          </button>
          <button
            onClick={() => handleDirectionChange('right')}
            className={`flex-1 px-4 py-2.5 rounded-[4px] text-sm font-medium transition-all ${
              direction === 'right'
                ? 'bg-black text-white'
                : 'bg-black/5 text-black/60 hover:bg-black/10'
            }`}
          >
            오른쪽
          </button>
        </div>
      </div>

      {/* Profile Image */}
      <div className="mb-8">
        <label className="flex items-center gap-2 text-xs font-medium text-black/40 mb-3 uppercase tracking-widest">
          Profile Image
          <span className="text-[10px] font-normal normal-case bg-black/10 text-black/40 px-1.5 py-0.5 rounded-[4px]">
            선택
          </span>
        </label>

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
          ) : profileUrl ? (
            <div className="flex items-center gap-3">
              <img
                src={profileUrl}
                alt="Profile preview"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1 text-left">
                <p className="text-sm text-black/80 truncate">{profileUrl.split('/').pop()}</p>
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
              <p className="text-sm text-black/60">이미지를 드래그하거나 클릭하여 업로드</p>
              <p className="text-xs text-black/30">JPG, PNG, GIF, WebP (최대 5MB)</p>
            </div>
          )}
        </div>

        {uploadMutation.isError && (
          <p className="text-xs text-red-500 mb-2">
            업로드 실패: {uploadMutation.error?.message}
          </p>
        )}

        <div className="flex items-center gap-2 text-xs text-black/40 mb-2">
          <div className="flex-1 h-px bg-black/10" />
          <span>또는 URL 직접 입력</span>
          <div className="flex-1 h-px bg-black/10" />
        </div>
        <input
          type="text"
          value={profileUrl}
          onChange={(e) => setProfileUrl(e.target.value)}
          onBlur={handleProfileUrlBlur}
          placeholder="https://..."
          className="w-full px-0 py-3 bg-transparent border-b border-black/10 focus:outline-none focus:border-black text-sm transition-all"
        />

        {profileUrl && (
          <button
            onClick={() => setProfileUrl('')}
            className="mt-2 text-xs text-black/40 hover:text-black/60 transition-colors"
          >
            이미지 제거
          </button>
        )}
      </div>

      {/* Animation */}
      <div className="mb-8">
        <label className="flex items-center gap-2 text-xs font-medium text-black/40 mb-3 uppercase tracking-widest">
          Animation
          <span className="text-[10px] font-normal normal-case bg-black/10 text-black/40 px-1.5 py-0.5 rounded-[4px]">
            선택
          </span>
        </label>
        <select
          value={animation}
          onChange={(e) => handleAnimationChange(e.target.value as Animation)}
          className="w-full px-0 py-3 bg-transparent border-b border-black/10 focus:outline-none focus:border-black text-sm transition-all"
        >
          <option value="none">없음</option>
          <option value="float">Float</option>
          <option value="pulse">Pulse</option>
        </select>
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
          min="300"
          max="600"
          step="20"
          value={width}
          onChange={(e) => handleWidthChange(Number(e.target.value))}
          onMouseUp={handleWidthChangeEnd}
          onTouchEnd={handleWidthChangeEnd}
          className="w-full accent-black [&::-webkit-slider-runnable-track]:bg-black/10 [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:mt-[-6px] [&::-moz-range-track]:bg-black/10 [&::-moz-range-track]:h-1 [&::-moz-range-track]:rounded-full [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-black [&::-moz-range-thumb]:border-0"
        />
      </div>

      {/* Font Size */}
      <div className="mb-8">
        <label className="flex items-center gap-2 text-xs font-medium text-black/40 mb-3 uppercase tracking-widest">
          Font Size: {fontSize}px
          <span className="text-[10px] font-normal normal-case bg-black/10 text-black/40 px-1.5 py-0.5 rounded-[4px]">
            선택
          </span>
        </label>
        <input
          type="range"
          min="10"
          max="16"
          step="1"
          value={fontSize}
          onChange={(e) => handleFontSizeChange(Number(e.target.value))}
          onMouseUp={handleFontSizeChangeEnd}
          onTouchEnd={handleFontSizeChangeEnd}
          className="w-full accent-black [&::-webkit-slider-runnable-track]:bg-black/10 [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:mt-[-6px] [&::-moz-range-track]:bg-black/10 [&::-moz-range-track]:h-1 [&::-moz-range-track]:rounded-full [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-black [&::-moz-range-thumb]:border-0"
        />
      </div>
    </div>
  );
}
