'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useImageUpload } from '@/hooks/useImageUpload';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [visitorCount, setVisitorCount] = useState<number | null>(null);

  // 방문자 카운터
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        const { data, error } = await supabase.rpc('increment_visitor');
        if (!error && data) {
          setVisitorCount(data);
        }
      } catch (err) {
        console.error('Failed to track visitor:', err);
      }
    };
    trackVisitor();
  }, []);
  // URL 파라미터에서 초기값 읽기
  const getInitialValue = (key: string, defaultValue: string) => {
    if (typeof window === 'undefined') return defaultValue;
    const params = new URLSearchParams(window.location.search);
    return params.get(key) || defaultValue;
  };

  const [mode, setMode] = useState<'tags' | 'text'>(() => {
    const urlMode = getInitialValue('mode', 'tags');
    return (urlMode === 'text' ? 'text' : 'tags') as 'tags' | 'text';
  });

  // mode 변경 감지
  useEffect(() => {
    console.log('[State] 🔴 mode 변경됨:', mode);
  }, [mode]);
  const [tags, setTags] = useState(() => getInitialValue('tags', 'ENFP,풀스택개발자,React.js,커피중독자'));
  const [text, setText] = useState(() => getInitialValue('tags', '안녕하세요! 이것은 일반 텍스트 모드입니다. 여러 줄로 표시됩니다.'));
  const [title, setTitle] = useState(() => getInitialValue('title', 'About Me'));
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const urlTheme = getInitialValue('theme', 'light');
    return (urlTheme === 'dark' ? 'dark' : 'light') as 'light' | 'dark';
  });
  const [direction, setDirection] = useState<'left' | 'right'>(() => {
    const urlDirection = getInitialValue('direction', 'left');
    return (urlDirection === 'right' ? 'right' : 'left') as 'left' | 'right';
  });

  // direction 변경 감지
  useEffect(() => {
    console.log('[State] 🟡 direction 변경됨:', direction);
  }, [direction]);
  const [profileUrl, setProfileUrl] = useState(() => getInitialValue('profileUrl', ''));
  const [animation, setAnimation] = useState<'none' | 'float' | 'pulse'>(() => {
    const urlAnimation = getInitialValue('animation', 'none');
    return (['none', 'float', 'pulse'].includes(urlAnimation) ? urlAnimation : 'none') as 'none' | 'float' | 'pulse';
  });
  const [width, setWidth] = useState(() => {
    const urlWidth = getInitialValue('width', '400');
    return parseInt(urlWidth) || 400;
  });
  const [fontSize, setFontSize] = useState(() => {
    const urlFontSize = getInitialValue('fontSize', '12');
    return parseInt(urlFontSize) || 12;
  });
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useImageUpload();

  // URL 파라미터에서 mode에 따라 tags 또는 text 초기화
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const urlMode = params.get('mode') || 'tags';
    const urlTags = params.get('tags') || '';
    
    if (urlTags) {
      if (urlMode === 'text') {
        setText(urlTags);
      } else {
        setTags(urlTags);
      }
    }
  }, []);

  const generateUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.set('tags', mode === 'tags' ? tags : text);
    params.set('mode', mode);
    if (title) params.set('title', title);
    params.set('theme', theme);
    params.set('direction', direction);
    if (profileUrl) params.set('profileUrl', profileUrl);
    if (animation !== 'none') params.set('animation', animation);
    params.set('width', width.toString());
    params.set('fontSize', fontSize.toString());

    // 상대 경로 사용 (hydration 에러 방지)
    return `/api/bubble?${params.toString()}`;
  }, [mode, tags, text, title, theme, direction, profileUrl, animation, width, fontSize]);

  const copyToClipboard = async () => {
    const relativeUrl = generateUrl();
    // 클립보드 복사 시에는 절대 URL 사용
    const absoluteUrl = `${window.location.origin}${relativeUrl}`;
    const htmlCode = `<img src="${absoluteUrl}" />`;

    try {
      await navigator.clipboard.writeText(htmlCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // 이미지 업로드 핸들러
  const handleFileSelect = async (file: File) => {
    try {
      const result = await uploadMutation.mutateAsync(file);
      if (result.publicUrl) {
        setProfileUrl(result.publicUrl);
      }
    } catch (error) {
      console.error('Upload failed:', error);
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

  // 필수값 체크
  const hasRequiredValues = mode === 'tags' ? tags.trim().length > 0 : text.trim().length > 0;
  const missingField = mode === 'tags' ? 'Tags' : 'Text';

  // 캐시 버스터용 타임스탬프 (클라이언트에서만)
  const [cacheKey, setCacheKey] = useState(0);

  // 설정 변경 시 캐시 키 업데이트
  useEffect(() => {
    setCacheKey(Date.now());
  }, [mode, tags, text, title, theme, direction, profileUrl, animation, width, fontSize]);

  // previewUrl 생성
  const previewUrl = useMemo(() => {
    const url = generateUrl();
    return cacheKey ? `${url}&_t=${cacheKey}` : url;
  }, [generateUrl, cacheKey]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* 헤더 - 말풍선 스타일 (bubble 디자인과 정확히 동일) */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-8 md:pt-12">
        <div className="flex items-center justify-between">
          <div className="relative inline-block">
            <svg width="220" height="60" viewBox="0 0 220 60" className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
              <defs>
                <filter id="headerShadow">
                  <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.1"/>
                </filter>
              </defs>
              {/* 말풍선 배경 - bubble과 동일한 path (왼쪽 꼬리) */}
              <path
                d="M 20,10 L 180,10 Q 190,10 190,20 L 190,50 Q 190,60 180,60 L 20,60 Q 10,60 10,50 L 10,38 L 2,30 L 10,22 L 10,20 Q 10,10 20,10 Z"
                fill="#ffffff"
                stroke="#e0e0e0"
                strokeWidth="1"
                filter="url(#headerShadow)"
              />
              {/* 텍스트 */}
              <text
                x="100"
                y="38"
                textAnchor="middle"
                fill="#000000"
                fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
                fontSize="20"
                fontWeight="800"
              >
                git bubble
              </text>
            </svg>
          </div>

          <div className="flex items-center gap-3">
            {/* 누적 방문자 수 */}
            {visitorCount !== null && (
              <div className="flex items-center gap-1.5 px-3 py-2 bg-black/5 rounded-full">
                <span className="text-sm">👀</span>
                <span className="text-sm font-medium text-black/70">
                  {visitorCount.toLocaleString()}
                </span>
              </div>
            )}

            {/* GitHub Star 링크 */}
            <a
              href="https://github.com/0jenn0/git-bubble"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-black/80 rounded-full transition-all hover:scale-105 active:scale-95"
            >
              <span className="text-lg animate-bounce">⭐</span>
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span className="text-sm font-bold text-white">
                Star
              </span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12 pb-24 md:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* 프리뷰 - 모바일에서는 맨 위, PC에서는 오른쪽에 sticky */}
          <div className="lg:order-2 lg:sticky lg:top-6 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto">
            <div className="lg:h-full lg:flex lg:flex-col">
              <h2 className="text-xs font-semibold text-black/40 mb-6 uppercase tracking-widest">Preview</h2>
              <div className="flex justify-center items-center min-h-[200px] lg:flex-1 lg:overflow-auto">
                {hasRequiredValues ? (
                  <img
                    key={previewUrl}
                    src={previewUrl}
                    alt="Bubble Preview"
                    className="max-w-full h-auto"
                    onError={(e) => {
                      console.error('Image load error:', e);
                      console.error('Failed URL:', previewUrl);
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully:', previewUrl.substring(0, 100));
                    }}
                  />
                ) : (
                  <div className="text-center px-6">
                    <p className="text-sm text-black/60 mb-1">필수값 <span className="font-semibold">{missingField}</span>을</p>
                    <p className="text-sm text-black/60">넣어주세요!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 설정 패널 - 모바일에서는 아래, PC에서는 왼쪽 */}
          <div className="lg:order-1 lg:pr-6">
            <h2 className="text-xs font-semibold text-black/40 mb-8 uppercase tracking-widest">Settings</h2>
              
              {/* 모드 선택 */}
              <div className="mb-8">
                <label className="flex items-center gap-2 text-xs font-medium text-black/40 mb-3 uppercase tracking-widest">
                  Mode
                  <span className="text-[10px] font-normal normal-case bg-black text-white px-1.5 py-0.5 rounded-[4px]">필수</span>
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMode('tags')}
                    className={`flex-1 px-4 py-2.5 rounded-[4px] text-sm font-medium transition-all ${
                      mode === 'tags'
                        ? 'bg-black text-white'
                        : 'bg-black/5 text-black/60 hover:bg-black/10'
                    }`}
                  >
                    태그
                  </button>
                  <button
                    onClick={() => setMode('text')}
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

              {/* 태그 또는 텍스트 입력 */}
              {mode === 'tags' ? (
                <div className="mb-8">
                  <label className="flex items-center gap-2 text-xs font-medium text-black/40 mb-3 uppercase tracking-widest">
                    Tags
                    <span className="text-[10px] font-normal normal-case bg-black text-white px-1.5 py-0.5 rounded-[4px]">필수</span>
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
                    <span className="text-[10px] font-normal normal-case bg-black text-white px-1.5 py-0.5 rounded-[4px]">필수</span>
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

              {/* 제목 */}
              <div className="mb-8">
                <label className="flex items-center gap-2 text-xs font-medium text-black/40 mb-3 uppercase tracking-widest">
                  Title
                  <span className="text-[10px] font-normal normal-case bg-black/10 text-black/40 px-1.5 py-0.5 rounded-[4px]">선택</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="제목 (선택사항)"
                  className="w-full px-0 py-3 bg-transparent border-b border-black/10 focus:outline-none focus:border-black text-sm transition-all"
                />
              </div>

              {/* 테마 */}
              <div className="mb-8">
                <label className="flex items-center gap-2 text-xs font-medium text-black/40 mb-3 uppercase tracking-widest">
                  Theme
                  <span className="text-[10px] font-normal normal-case bg-black/10 text-black/40 px-1.5 py-0.5 rounded-[4px]">선택</span>
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex-1 px-4 py-2.5 rounded-[4px] text-sm font-medium transition-all ${
                      theme === 'light'
                        ? 'bg-black text-white'
                        : 'bg-black/5 text-black/60 hover:bg-black/10'
                    }`}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
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

              {/* 방향 */}
              <div className="mb-8">
                <label className="flex items-center gap-2 text-xs font-medium text-black/40 mb-3 uppercase tracking-widest">
                  Direction
                  <span className="text-[10px] font-normal normal-case bg-black/10 text-black/40 px-1.5 py-0.5 rounded-[4px]">선택</span>
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDirection('left')}
                    className={`flex-1 px-4 py-2.5 rounded-[4px] text-sm font-medium transition-all ${
                      direction === 'left'
                        ? 'bg-black text-white'
                        : 'bg-black/5 text-black/60 hover:bg-black/10'
                    }`}
                  >
                    왼쪽
                  </button>
                  <button
                    onClick={() => setDirection('right')}
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

              {/* 프로필 이미지 */}
              <div className="mb-8">
                <label className="flex items-center gap-2 text-xs font-medium text-black/40 mb-3 uppercase tracking-widest">
                  Profile Image
                  <span className="text-[10px] font-normal normal-case bg-black/10 text-black/40 px-1.5 py-0.5 rounded-[4px]">선택</span>
                </label>

                {/* 이미지 업로드 영역 */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all mb-3 ${
                    isDragging
                      ? 'border-black bg-black/5'
                      : 'border-black/20 hover:border-black/40'
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
                      <svg className="w-8 h-8 text-black/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-black/60">
                        이미지를 드래그하거나 클릭하여 업로드
                      </p>
                      <p className="text-xs text-black/30">JPG, PNG, GIF, WebP (최대 5MB)</p>
                    </div>
                  )}
                </div>

                {uploadMutation.isError && (
                  <p className="text-xs text-red-500 mb-2">
                    업로드 실패: {uploadMutation.error?.message}
                  </p>
                )}

                {/* URL 직접 입력 */}
                <div className="flex items-center gap-2 text-xs text-black/40 mb-2">
                  <div className="flex-1 h-px bg-black/10" />
                  <span>또는 URL 직접 입력</span>
                  <div className="flex-1 h-px bg-black/10" />
                </div>
                <input
                  type="text"
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
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

              {/* 애니메이션 */}
              <div className="mb-8">
                <label className="flex items-center gap-2 text-xs font-medium text-black/40 mb-3 uppercase tracking-widest">
                  Animation
                  <span className="text-[10px] font-normal normal-case bg-black/10 text-black/40 px-1.5 py-0.5 rounded-[4px]">선택</span>
                </label>
                <select
                  value={animation}
                  onChange={(e) => setAnimation(e.target.value as 'none' | 'float' | 'pulse')}
                  className="w-full px-0 py-3 bg-transparent border-b border-black/10 focus:outline-none focus:border-black text-sm transition-all"
                >
                  <option value="none">없음</option>
                  <option value="float">Float</option>
                  <option value="pulse">Pulse</option>
                </select>
              </div>

              {/* 너비 */}
              <div className="mb-8">
                <label className="flex items-center gap-2 text-xs font-medium text-black/40 mb-3 uppercase tracking-widest">
                  Width: {width}px
                  <span className="text-[10px] font-normal normal-case bg-black/10 text-black/40 px-1.5 py-0.5 rounded-[4px]">선택</span>
                </label>
                <input
                  type="range"
                  min="300"
                  max="600"
                  step="20"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full accent-black [&::-webkit-slider-runnable-track]:bg-black/10 [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:mt-[-6px] [&::-moz-range-track]:bg-black/10 [&::-moz-range-track]:h-1 [&::-moz-range-track]:rounded-full [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-black [&::-moz-range-thumb]:border-0"
                />
              </div>

              {/* 폰트 크기 */}
              <div className="mb-8">
                <label className="flex items-center gap-2 text-xs font-medium text-black/40 mb-3 uppercase tracking-widest">
                  Font Size: {fontSize}px
                  <span className="text-[10px] font-normal normal-case bg-black/10 text-black/40 px-1.5 py-0.5 rounded-[4px]">선택</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="16"
                  step="1"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-black [&::-webkit-slider-runnable-track]:bg-black/10 [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:mt-[-6px] [&::-moz-range-track]:bg-black/10 [&::-moz-range-track]:h-1 [&::-moz-range-track]:rounded-full [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-black [&::-moz-range-thumb]:border-0"
                />
              </div>
          </div>
        </div>
      </div>

      {/* 복사 버튼 - Fixed with Glassmorphism */}
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
    </div>
  );
}
