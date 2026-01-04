'use client';

import { useVisitorCount } from '@/features/visitor-counter';
import { analytics } from '@/shared/lib/analytics';

export function Header() {
  const visitorCount = useVisitorCount();

  const handleGitHubStarClick = () => {
    analytics.clickGitHubStar();
  };

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b border-black/5">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://ohxmzftzhbcqmbirlvxc.supabase.co/storage/v1/object/public/profile-images/cat-1.jpg"
              alt="Logo"
              className="w-10 h-10 rounded-full object-cover  -mr-4"
            />
            <svg
              width="186"
              height="50"
              viewBox="-6 0 186 50"
              className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
            >
              <defs>
                <filter id="headerShadow">
                  <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.1" />
                </filter>
              </defs>
              <path
                d="M 15,5 L 165,5 Q 175,5 175,15 L 175,35 Q 175,45 165,45 L 15,45 Q 5,45 5,35 L 5,30 L -3,25 L 5,20 L 5,15 Q 5,5 15,5 Z"
                fill="#ffffff"
                stroke="#e0e0e0"
                strokeWidth="1"
                filter="url(#headerShadow)"
              />
              <text
                x="90"
                y="30"
                textAnchor="middle"
                fill="#000000"
                fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
                fontSize="18"
                fontWeight="800"
              >
                GIT BUBBLE
              </text>
            </svg>
          </div>

          <div className="flex items-center gap-3">
            {visitorCount !== null && (
              <div className="flex items-center gap-1.5 px-3 py-2 bg-black/5 rounded-full">
                <span className="text-sm">👀</span>
                <span className="text-sm font-medium text-black/70">
                  {visitorCount.toLocaleString()}
                </span>
              </div>
            )}

            <a
              href="https://github.com/0jenn0/git-bubble"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleGitHubStarClick}
              className="flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-black/80 rounded-full transition-all hover:scale-105 active:scale-95"
            >
              <span className="text-lg animate-bounce">⭐</span>
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span className="text-sm font-bold text-white">Star</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
