import { Metadata } from 'next';
import { HomePage } from '@/widgets/home-page';

export const metadata: Metadata = {
  title: 'Git Bubble - GitHub 프로필용 말풍선 생성기',
  description:
    '당신의 GitHub 프로필을 위한 귀여운 말풍선을 만들어보세요. 태그, 텍스트, 프로필 이미지를 커스터마이징하고 바로 사용할 수 있습니다.',
  keywords: ['GitHub', 'profile', 'bubble', 'generator', 'readme', 'badge'],
  openGraph: {
    title: 'Git Bubble - GitHub 프로필용 말풍선 생성기',
    description: '당신의 GitHub 프로필을 위한 귀여운 말풍선을 만들어보세요.',
    type: 'website',
    url: 'https://git-bubble.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Git Bubble - GitHub 프로필용 말풍선 생성기',
    description: '당신의 GitHub 프로필을 위한 귀여운 말풍선을 만들어보세요.',
  },
};

export default function Page() {
  return <HomePage />;
}
