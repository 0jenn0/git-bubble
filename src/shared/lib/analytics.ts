'use client';

type GTagEvent = {
  action: string;
  category: string;
  label?: string;
  value?: number;
};

declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'js',
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
  }
}

export function trackEvent({ action, category, label, value }: GTagEvent) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

// 미리 정의된 이벤트들
export const analytics = {
  // 클립보드 복사
  copyToClipboard: (mode: string) => {
    trackEvent({
      action: 'copy_to_clipboard',
      category: 'engagement',
      label: mode,
    });
  },

  // 모드 변경 (tags/text)
  changeMode: (mode: string) => {
    trackEvent({
      action: 'change_mode',
      category: 'settings',
      label: mode,
    });
  },

  // 테마 변경
  changeTheme: (theme: string) => {
    trackEvent({
      action: 'change_theme',
      category: 'settings',
      label: theme,
    });
  },

  // 방향 변경
  changeDirection: (direction: string) => {
    trackEvent({
      action: 'change_direction',
      category: 'settings',
      label: direction,
    });
  },

  // 애니메이션 변경
  changeAnimation: (animation: string) => {
    trackEvent({
      action: 'change_animation',
      category: 'settings',
      label: animation,
    });
  },

  // 이미지 업로드
  uploadImage: (success: boolean) => {
    trackEvent({
      action: 'upload_image',
      category: 'engagement',
      label: success ? 'success' : 'failed',
    });
  },

  // 프로필 이미지 URL 입력
  setProfileUrl: () => {
    trackEvent({
      action: 'set_profile_url',
      category: 'engagement',
    });
  },

  // 너비 변경
  changeWidth: (width: number) => {
    trackEvent({
      action: 'change_width',
      category: 'settings',
      value: width,
    });
  },

  // 폰트 크기 변경
  changeFontSize: (fontSize: number) => {
    trackEvent({
      action: 'change_font_size',
      category: 'settings',
      value: fontSize,
    });
  },

  // GitHub Star 버튼 클릭
  clickGitHubStar: () => {
    trackEvent({
      action: 'click_github_star',
      category: 'engagement',
    });
  },
};
