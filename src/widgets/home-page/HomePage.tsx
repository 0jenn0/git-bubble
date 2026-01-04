'use client';

import { useState } from 'react';
import { useBubbleConfig } from '@/features/bubble-generator';
import { useLinkConfig } from '@/features/link-generator';
import { Header } from '@/widgets/header';
import { BubblePreview } from '@/widgets/bubble-preview';
import { BubbleSettings } from '@/widgets/bubble-settings';
import { LinkPreview } from '@/widgets/link-preview';
import { LinkSettings } from '@/widgets/link-settings';
import { CopyButton } from '@/widgets/copy-button';

type GeneratorTab = 'bubble' | 'link';

export function HomePage() {
  const [activeTab, setActiveTab] = useState<GeneratorTab>('bubble');

  const bubbleConfig = useBubbleConfig();
  const linkConfig = useLinkConfig();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12 pb-24 md:pb-32">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-black/5 rounded-full p-1">
            <button
              onClick={() => setActiveTab('bubble')}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeTab === 'bubble'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-black/60 hover:text-black'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                말풍선
              </span>
            </button>
            <button
              onClick={() => setActiveTab('link')}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeTab === 'link'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-black/60 hover:text-black'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                링크 프리뷰
              </span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {activeTab === 'bubble' ? (
            <>
              <BubblePreview
                previewUrl={bubbleConfig.previewUrl}
                hasRequiredValues={bubbleConfig.hasRequiredValues}
                missingField={bubbleConfig.missingField}
              />
              <BubbleSettings
                mode={bubbleConfig.mode}
                tags={bubbleConfig.tags}
                text={bubbleConfig.text}
                title={bubbleConfig.title}
                theme={bubbleConfig.theme}
                direction={bubbleConfig.direction}
                profileUrl={bubbleConfig.profileUrl}
                animation={bubbleConfig.animation}
                width={bubbleConfig.width}
                fontSize={bubbleConfig.fontSize}
                setMode={bubbleConfig.setMode}
                setTags={bubbleConfig.setTags}
                setText={bubbleConfig.setText}
                setTitle={bubbleConfig.setTitle}
                setTheme={bubbleConfig.setTheme}
                setDirection={bubbleConfig.setDirection}
                setProfileUrl={bubbleConfig.setProfileUrl}
                setAnimation={bubbleConfig.setAnimation}
                setWidth={bubbleConfig.setWidth}
                setFontSize={bubbleConfig.setFontSize}
              />
            </>
          ) : (
            <>
              <LinkPreview
                previewUrl={linkConfig.previewUrl}
                hasRequiredValues={linkConfig.hasRequiredValues}
              />
              <LinkSettings
                url={linkConfig.url}
                theme={linkConfig.theme}
                width={linkConfig.width}
                customThumbnail={linkConfig.customThumbnail}
                setUrl={linkConfig.setUrl}
                setTheme={linkConfig.setTheme}
                setWidth={linkConfig.setWidth}
                setCustomThumbnail={linkConfig.setCustomThumbnail}
              />
            </>
          )}
        </div>
      </div>

      <CopyButton
        generateUrl={
          activeTab === 'bubble' ? bubbleConfig.generateUrl : linkConfig.generateUrl
        }
        mode={activeTab === 'bubble' ? bubbleConfig.mode : 'link'}
        disabled={
          activeTab === 'bubble'
            ? !bubbleConfig.hasRequiredValues
            : !linkConfig.hasRequiredValues
        }
        linkUrl={activeTab === 'link' ? linkConfig.url : undefined}
      />
    </div>
  );
}
