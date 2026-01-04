import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { Providers } from '@/shared/lib/providers';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
  title: 'git bubble - GitHub README 말풍선 생성기',
  description: 'GitHub README에서 URL 하나로 예쁜 말풍선 프로필을 만들 수 있는 서비스',
  keywords: ['github', 'profile', 'svg', 'bubble', '개발자', 'readme'],
  authors: [{ name: '0jenn0' }],
  openGraph: {
    title: 'git bubble - GitHub README 말풍선 생성기',
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
      <head>
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
