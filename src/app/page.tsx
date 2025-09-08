
export default function Home() {
  return (
  <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-8">
  <div className="max-w-4xl mx-auto text-center">
  <h1 className="text-6xl font-bold text-white mb-6">
  🗣️ BubbleTag
  </h1>
  <p className="text-xl text-purple-100 mb-12">
  MZ 개발자를 위한 동적 말풍선 생성 API
  </p>
  {/* 예시 말풍선들 */}
  <div className="flex flex-col items-center gap-8 mb-12">
  <img 
  src="/api/bubble?title=About Me&tags=ENFP,풀스택개발자,React.js,커피중독자&theme=gradient"
  alt="Example Bubble 1"
  className="rounded-lg shadow-2xl"
  />
  <img src="/api/bubble?tags=집에서,넷플릭스,보고,있어&theme=dark&profileUrl=https://i.pinimg.com/736x/5c/05/a1/5c05a1c87bf9a232c51077d58bb8afec.jpg&isOwn=false" alt="Messenger Style" className="rounded-lg shadow-2xl" />
  <img 
  src="/api/bubble?title=Tech Stack&tags=TypeScript,Next.js,Prisma&theme=purple&style=glass"
  alt="Example Bubble 2"
  className="rounded-lg shadow-2xl"
  />
  </div>
  {/* API 사용법 */}
  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-left">
  <h2 className="text-2xl font-bold text-white mb-4">🚀 사용법</h2>
  <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
  <code className="text-green-400">
  {``}
  </code>
  </div>
  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
  <div>
  <h3 className="font-semibold text-purple-200 mb-2">📋 필수 파라미터</h3>
  <ul className="text-purple-100 space-y-1">
  <li><code>tags</code> - 쉼표로 구분된 태그들</li>
  </ul>
  </div>
  <div>
  <h3 className="font-semibold text-purple-200 mb-2">🎨 선택 파라미터</h3>
  <ul className="text-purple-100 space-y-1">
  <li><code>title</code> - 말풍선 소제목</li>
  <li><code>theme</code> - 색상 테마</li>
  <li><code>style</code> - 스타일 효과</li>
  <li><code>animation</code> - 애니메이션</li>
  </ul>
  </div>
  </div>
  </div>
  {/* GitHub 링크 */}
  <div className="mt-8">
  <a 
  href="https://github.com/your-username/bubbletag"
  className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-full transition-all duration-200"
  target="_blank"
  rel="noopener noreferrer"
  >
  ⭐ GitHub에서 보기
  </a>
  </div>
  </div>
  </div>
  );
  }
              