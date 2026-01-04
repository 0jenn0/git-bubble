'use client';

import { useBubbleConfig } from '@/features/bubble-generator';
import { Header } from '@/widgets/header';
import { BubblePreview } from '@/widgets/bubble-preview';
import { BubbleSettings } from '@/widgets/bubble-settings';
import { CopyButton } from '@/widgets/copy-button';

export function HomePage() {
  const {
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
    previewUrl,
    hasRequiredValues,
    missingField,
    generateUrl,
  } = useBubbleConfig();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12 pb-24 md:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          <BubblePreview
            previewUrl={previewUrl}
            hasRequiredValues={hasRequiredValues}
            missingField={missingField}
          />

          <BubbleSettings
            mode={mode}
            tags={tags}
            text={text}
            title={title}
            theme={theme}
            direction={direction}
            profileUrl={profileUrl}
            animation={animation}
            width={width}
            fontSize={fontSize}
            setMode={setMode}
            setTags={setTags}
            setText={setText}
            setTitle={setTitle}
            setTheme={setTheme}
            setDirection={setDirection}
            setProfileUrl={setProfileUrl}
            setAnimation={setAnimation}
            setWidth={setWidth}
            setFontSize={setFontSize}
          />
        </div>
      </div>

      <CopyButton generateUrl={generateUrl} />
    </div>
  );
}
