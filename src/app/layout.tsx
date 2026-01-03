import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/lib/providers';

export const metadata: Metadata = {
  title: 'BubbleTag - MZ 개발자 말풍선 생성기',
  description: 'GitHub README에서 URL 하나로 예쁜 말풍선 프로필을 만들 수 있는 서비스',
  keywords: ['github', 'profile', 'svg', 'bubble', '개발자', 'MZ'],
  authors: [{ name: 'Your Name' }],
  openGraph: {
    title: 'BubbleTag - MZ 개발자 말풍선 생성기',
    description: 'GitHub README에서 URL 하나로 예쁜 말풍선 프로필을 만들 수 있는 서비스',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
