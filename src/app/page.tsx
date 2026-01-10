import { Metadata } from 'next';
import { Suspense } from 'react';
import { HomePage } from '@/widgets/home-page';

export const metadata: Metadata = {
  title: 'Git Bubble - GitHub README Decorator',
  description:
    'Create cute decorations for your GitHub README. Bubbles, link previews, dividers, pixel villages, and more.',
  keywords: ['GitHub', 'profile', 'bubble', 'generator', 'readme', 'badge', 'village'],
  openGraph: {
    title: 'Git Bubble - GitHub README Decorator',
    description: 'Create cute decorations for your GitHub README.',
    type: 'website',
    url: 'https://git-bubble.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Git Bubble - GitHub README Decorator',
    description: 'Create cute decorations for your GitHub README.',
  },
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100" />}>
      <HomePage />
    </Suspense>
  );
}
