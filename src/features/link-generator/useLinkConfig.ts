'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

type Theme = 'light' | 'dark';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export function useLinkConfig() {
  const [url, setUrl] = useState('');
  const [theme, setTheme] = useState<Theme>('light');
  const [width, setWidth] = useState(400);
  const [customThumbnail, setCustomThumbnail] = useState('');
  const [badgeEnabled, setBadgeEnabled] = useState(false);
  const [badgeText, setBadgeText] = useState('NEW');
  const [badgeImage, setBadgeImage] = useState('');
  const [badgeColor, setBadgeColor] = useState('#FF0000');
  const [cacheKey, setCacheKey] = useState(0);

  const debouncedUrl = useDebounce(url, 500);
  const debouncedThumbnail = useDebounce(customThumbnail, 500);
  const debouncedBadgeText = useDebounce(badgeText, 500);
  const debouncedBadgeImage = useDebounce(badgeImage, 500);

  useEffect(() => {
    setCacheKey(Date.now());
  }, [debouncedUrl, theme, width, debouncedThumbnail, badgeEnabled, debouncedBadgeText, debouncedBadgeImage, badgeColor]);

  const generateUrl = useCallback(() => {
    if (!url) return '';

    const params = new URLSearchParams();
    params.set('url', url);
    params.set('theme', theme);
    params.set('width', width.toString());
    if (customThumbnail) {
      params.set('thumbnail', customThumbnail);
    }
    if (badgeEnabled) {
      params.set('badge', 'true');
      if (badgeText) params.set('badgeText', badgeText);
      if (badgeImage) params.set('badgeImage', badgeImage);
      if (badgeColor) params.set('badgeColor', badgeColor);
    }

    return `/api/link?${params.toString()}`;
  }, [url, theme, width, customThumbnail, badgeEnabled, badgeText, badgeImage, badgeColor]);

  const previewUrl = useMemo(() => {
    if (!debouncedUrl) return '';
    const params = new URLSearchParams();
    params.set('url', debouncedUrl);
    params.set('theme', theme);
    params.set('width', width.toString());
    if (debouncedThumbnail) {
      params.set('thumbnail', debouncedThumbnail);
    }
    if (badgeEnabled) {
      params.set('badge', 'true');
      if (debouncedBadgeText) params.set('badgeText', debouncedBadgeText);
      if (debouncedBadgeImage) params.set('badgeImage', debouncedBadgeImage);
      if (badgeColor) params.set('badgeColor', badgeColor);
    }
    const generatedUrl = `/api/link?${params.toString()}`;
    return cacheKey ? `${generatedUrl}&_t=${cacheKey}` : generatedUrl;
  }, [debouncedUrl, theme, width, debouncedThumbnail, badgeEnabled, debouncedBadgeText, debouncedBadgeImage, badgeColor, cacheKey]);

  const hasRequiredValues = url.trim().length > 0;

  return {
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
    previewUrl,
    hasRequiredValues,
    generateUrl,
  };
}
