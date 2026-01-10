'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocale } from '@/shared/i18n';

type Theme = 'light' | 'dark';

export function useVillageConfig() {
  const [username, setUsername] = useState('');
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(200);
  const [theme, setTheme] = useState<Theme>('light');
  const [cacheKey, setCacheKey] = useState(0);
  const { locale } = useLocale();

  useEffect(() => {
    setCacheKey(Date.now());
  }, [username, width, height, theme, locale]);

  const hasRequiredValues = useMemo(() => {
    return username.trim().length > 0;
  }, [username]);

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
    if (!hasRequiredValues) return '';
    const generatedUrl = generateUrl();
    return cacheKey ? `${generatedUrl}&_t=${cacheKey}` : generatedUrl;
  }, [generateUrl, cacheKey, hasRequiredValues]);

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
