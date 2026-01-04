'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

type Theme = 'light' | 'dark';

export function useLinkConfig() {
  const [url, setUrl] = useState('');
  const [theme, setTheme] = useState<Theme>('light');
  const [width, setWidth] = useState(400);
  const [customThumbnail, setCustomThumbnail] = useState('');
  const [cacheKey, setCacheKey] = useState(0);

  useEffect(() => {
    setCacheKey(Date.now());
  }, [url, theme, width, customThumbnail]);

  const generateUrl = useCallback(() => {
    if (!url) return '';

    const params = new URLSearchParams();
    params.set('url', url);
    params.set('theme', theme);
    params.set('width', width.toString());
    if (customThumbnail) {
      params.set('thumbnail', customThumbnail);
    }

    return `/api/link?${params.toString()}`;
  }, [url, theme, width, customThumbnail]);

  const previewUrl = useMemo(() => {
    const generatedUrl = generateUrl();
    if (!generatedUrl) return '';
    return cacheKey ? `${generatedUrl}&_t=${cacheKey}` : generatedUrl;
  }, [generateUrl, cacheKey]);

  const hasRequiredValues = url.trim().length > 0;

  return {
    url,
    theme,
    width,
    customThumbnail,
    setUrl,
    setTheme,
    setWidth,
    setCustomThumbnail,
    previewUrl,
    hasRequiredValues,
    generateUrl,
  };
}
