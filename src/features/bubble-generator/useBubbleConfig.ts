'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

type Mode = 'tags' | 'text';
type Theme = 'light' | 'dark';
type Direction = 'left' | 'right';
type Animation = 'none' | 'float' | 'pulse';

const getInitialValue = (key: string, defaultValue: string) => {
  if (typeof window === 'undefined') return defaultValue;
  const params = new URLSearchParams(window.location.search);
  return params.get(key) || defaultValue;
};

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export function useBubbleConfig() {
  const [mode, setMode] = useState<Mode>(() => {
    const urlMode = getInitialValue('mode', 'tags');
    return urlMode === 'text' ? 'text' : 'tags';
  });

  const [tags, setTags] = useState(() =>
    getInitialValue('tags', 'ENFP,풀스택개발자,React.js,커피중독자')
  );
  const [text, setText] = useState(() =>
    getInitialValue('tags', '안녕하세요! 이것은 일반 텍스트 모드입니다.')
  );
  const [title, setTitle] = useState(() => getInitialValue('title', 'About Me'));
  const [theme, setTheme] = useState<Theme>(() => {
    const urlTheme = getInitialValue('theme', 'light');
    return urlTheme === 'dark' ? 'dark' : 'light';
  });
  const [direction, setDirection] = useState<Direction>(() => {
    const urlDirection = getInitialValue('direction', 'left');
    return urlDirection === 'right' ? 'right' : 'left';
  });
  const [profileUrl, setProfileUrl] = useState(() =>
    getInitialValue('profileUrl', '')
  );
  const [animation, setAnimation] = useState<Animation>(() => {
    const urlAnimation = getInitialValue('animation', 'none');
    return ['none', 'float', 'pulse'].includes(urlAnimation)
      ? (urlAnimation as Animation)
      : 'none';
  });
  const [width, setWidth] = useState(() => {
    const urlWidth = getInitialValue('width', '400');
    return parseInt(urlWidth) || 400;
  });
  const [fontSize, setFontSize] = useState(() => {
    const urlFontSize = getInitialValue('fontSize', '12');
    return parseInt(urlFontSize) || 12;
  });

  const debouncedTags = useDebounce(tags, 500);
  const debouncedText = useDebounce(text, 500);
  const debouncedTitle = useDebounce(title, 500);
  const debouncedProfileUrl = useDebounce(profileUrl, 500);

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

    return `/api/bubble?${params.toString()}`;
  }, [mode, tags, text, title, theme, direction, profileUrl, animation, width, fontSize]);

  const [cacheKey, setCacheKey] = useState(0);

  useEffect(() => {
    setCacheKey(Date.now());
  }, [mode, debouncedTags, debouncedText, debouncedTitle, theme, direction, debouncedProfileUrl, animation, width, fontSize]);

  const previewUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set('tags', mode === 'tags' ? debouncedTags : debouncedText);
    params.set('mode', mode);
    if (debouncedTitle) params.set('title', debouncedTitle);
    params.set('theme', theme);
    params.set('direction', direction);
    if (debouncedProfileUrl) params.set('profileUrl', debouncedProfileUrl);
    if (animation !== 'none') params.set('animation', animation);
    params.set('width', width.toString());
    params.set('fontSize', fontSize.toString());
    const url = `/api/bubble?${params.toString()}`;
    return cacheKey ? `${url}&_t=${cacheKey}` : url;
  }, [mode, debouncedTags, debouncedText, debouncedTitle, theme, direction, debouncedProfileUrl, animation, width, fontSize, cacheKey]);

  const hasRequiredValues = mode === 'tags' ? tags.trim().length > 0 : text.trim().length > 0;
  const missingField = mode === 'tags' ? 'Tags' : 'Text';

  return {
    // State
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
    // Setters
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
    // Computed
    generateUrl,
    previewUrl,
    hasRequiredValues,
    missingField,
  };
}
