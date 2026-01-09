import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/shared/lib/supabase';
import {
  selectCharactersForUser,
} from '@/shared/lib/village-characters';
import {
  generateVillageSVG,
  RepoData,
} from '@/shared/lib/svg-village-generator';


// GitHub 레포지토리별 최근 커밋 수 조회
async function fetchRepoCommits(username: string): Promise<RepoData[]> {
  try {
    // 1. 유저의 레포지토리 목록 가져오기
    const reposResponse = await fetch(
      `https://api.github.com/users/${username}/repos?sort=pushed&per_page=10`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          ...(process.env.GITHUB_TOKEN && {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
          }),
        },
      }
    );

    if (!reposResponse.ok) {
      console.warn(`GitHub API error: ${reposResponse.status}`);
      return [];
    }

    const repos = await reposResponse.json();

    // 2. 각 레포의 최근 30일 커밋 수 가져오기
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const since = thirtyDaysAgo.toISOString();

    const repoDataPromises = repos.slice(0, 6).map(async (repo: { name: string; full_name: string }) => {
      try {
        const commitsResponse = await fetch(
          `https://api.github.com/repos/${repo.full_name}/commits?since=${since}&per_page=100`,
          {
            headers: {
              Accept: 'application/vnd.github.v3+json',
              ...(process.env.GITHUB_TOKEN && {
                Authorization: `token ${process.env.GITHUB_TOKEN}`,
              }),
            },
          }
        );

        if (!commitsResponse.ok) {
          return { name: repo.name, recentCommits: 0 };
        }

        const commits = await commitsResponse.json();
        return {
          name: repo.name,
          recentCommits: Array.isArray(commits) ? commits.length : 0,
        };
      } catch {
        return { name: repo.name, recentCommits: 0 };
      }
    });

    const repoData = await Promise.all(repoDataPromises);
    return repoData.filter(r => r.recentCommits > 0 || repoData.indexOf(r) < 3);
  } catch (error) {
    console.error('Error fetching repo commits:', error);
    return [];
  }
}

// Supabase에 마을 데이터 저장/업데이트
async function saveVillageData(
  username: string,
  repos: RepoData[],
  totalCommits: number
): Promise<void> {
  try {
    const { error } = await supabase.from('github_villages').upsert(
      {
        github_username: username,
        repos,
        total_commits: totalCommits,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'github_username' }
    );

    if (error) {
      console.error('Error saving village data:', error);
    }
  } catch (error) {
    console.error('Error saving village data:', error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 파라미터 파싱
    const username = searchParams.get('username');
    const width = parseInt(searchParams.get('width') || '600', 10);
    const height = parseInt(searchParams.get('height') || '200', 10);
    const theme = (searchParams.get('theme') || 'light') as 'light' | 'dark';

    // 필수 파라미터 검증
    if (!username) {
      return new NextResponse('Missing required parameter: username', {
        status: 400,
      });
    }

    // 크기 제한
    const safeWidth = Math.min(Math.max(width, 300), 1200);
    const safeHeight = Math.min(Math.max(height, 100), 400);

    // GitHub 레포지토리별 커밋 수 조회
    const repos = await fetchRepoCommits(username);
    const totalCommits = repos.reduce((sum, r) => sum + r.recentCommits, 0);

    // 캐릭터 수 계산 (10커밋당 1캐릭터, 최소 3, 최대 12)
    const characterCount = Math.min(Math.max(Math.floor(totalCommits / 10) + 3, 3), 12);
    const selectedCharacters = selectCharactersForUser(username, characterCount);

    // 데이터 저장
    await saveVillageData(username, repos, totalCommits);

    // SVG 생성
    const svg = generateVillageSVG({
      width: safeWidth,
      height: safeHeight,
      theme,
      repos,
      characters: selectedCharacters,
      username,
      totalCommits,
    });

    // 응답
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600', // 1시간 캐시
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
    });
  } catch (error) {
    console.error('Error generating village:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
