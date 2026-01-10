'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocale } from '@/shared/i18n';

type Theme = 'light' | 'dark';

export function useVillageConfig() {
  const [username, setUsername] = useState('');
  const [debouncedUsername, setDebouncedUsername] = useState('');
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(200);
  const [theme, setTheme] = useState<Theme>('light');
  const [cacheKey, setCacheKey] = useState(0);
  const { locale } = useLocale();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUsername(username);
    }, 500);
    return () => clearTimeout(timer);
  }, [username]);

  useEffect(() => {
    setCacheKey(Date.now());
  }, [debouncedUsername, width, height, theme, locale]);

  const hasRequiredValues = useMemo(() => {
    return username.trim().length > 0;
  }, [username]);

  const hasPreviewValues = useMemo(() => {
    return debouncedUsername.trim().length > 0;
  }, [debouncedUsername]);

  const generateUrl = useCallback(() => {
    if (!hasRequiredValues) return '';

    const params = new URLSearchParams();
    params.set('username', username.trim());
    params.set('width', width.toString());
    params.set('height', height.toString());
    params.set('theme', theme);
    params.set('lang', locale);

    return `/api/village?${params.toString()}`;
  }, [username, width, height, theme, locale, hasRequiredValues]);

  const previewUrl = useMemo(() => {
    if (!hasPreviewValues) return '';

    const params = new URLSearchParams();
    params.set('username', debouncedUsername.trim());
    params.set('width', width.toString());
    params.set('height', height.toString());
    params.set('theme', theme);
    params.set('lang', locale);

    return cacheKey ? `/api/village?${params.toString()}&_t=${cacheKey}` : `/api/village?${params.toString()}`;
  }, [debouncedUsername, width, height, theme, locale, cacheKey, hasPreviewValues]);

  return {
    username,
    width,
    height,
    theme,
    setUsername,
    setWidth,
    setHeight,
    setTheme,
    previewUrl,
    generateUrl,
    hasRequiredValues,
  };
}
