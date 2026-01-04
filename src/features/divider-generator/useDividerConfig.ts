'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

type DividerStyle = 'dots' | 'dashes' | 'stars' | 'hearts' | 'sparkles';
type Theme = 'light' | 'dark';

export function useDividerConfig() {
  const [style, setStyle] = useState<DividerStyle>('dots');
  const [color, setColor] = useState('#000000');
  const [animation, setAnimation] = useState(true);
  const [width, setWidth] = useState(400);
  const [theme, setTheme] = useState<Theme>('light');
  const [size, setSize] = useState(1.0);
  const [cacheKey, setCacheKey] = useState(0);

  useEffect(() => {
    setCacheKey(Date.now());
  }, [style, color, animation, width, theme, size]);

  const generateUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.set('style', style);
    params.set('color', color);
    params.set('animation', animation.toString());
    params.set('width', width.toString());
    params.set('theme', theme);
    params.set('size', size.toString());

    return `/api/divider?${params.toString()}`;
  }, [style, color, animation, width, theme, size]);

  const previewUrl = useMemo(() => {
    const generatedUrl = generateUrl();
    return cacheKey ? `${generatedUrl}&_t=${cacheKey}` : generatedUrl;
  }, [generateUrl, cacheKey]);

  return {
    style,
    color,
    animation,
    width,
    theme,
    size,
    setStyle,
    setColor,
    setAnimation,
    setWidth,
    setTheme,
    setSize,
    previewUrl,
    generateUrl,
  };
}
