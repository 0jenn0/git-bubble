import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/shared/lib/supabase';
import {
  selectCharactersForUser,
} from '@/shared/lib/village-characters';
import {
  generateVillageSVG,
  RepoData,
} from '@/shared/lib/svg-village-generator';


// GitHub 올해 총 커밋 수 조회 (GraphQL API 사용)
async function fetchYearlyCommits(username: string): Promise<{ repos: RepoData[]; totalCommits: number }> {
  try {
    const currentYear = new Date().getFullYear();
    const startOfYear = `${currentYear}-01-01T00:00:00Z`;

    // GraphQL로 올해 contribution 수 조회
    const query = `
      query($username: String!) {
        user(login: $username) {
          contributionsCollection(from: "${startOfYear}") {
            totalCommitContributions
            contributionCalendar {
              totalContributions
            }
          }
          repositories(first: 10, orderBy: {field: PUSHED_AT, direction: DESC}) {
            nodes {
              name
              defaultBranchRef {
                target {
                  ... on Commit {
                    history(since: "${startOfYear}") {
                      totalCount
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
      },
      body: JSON.stringify({ query, variables: { username } }),
    });

    if (!response.ok) {
      console.warn(`GitHub GraphQL API error: ${response.status}`);
      return { repos: [], totalCommits: 0 };
    }

    const data = await response.json();

    if (data.errors || !data.data?.user) {
      console.warn('GitHub GraphQL error:', data.errors);
      return { repos: [], totalCommits: 0 };
    }

    const user = data.data.user;
    const totalCommits = user.contributionsCollection.totalCommitContributions;

    interface RepoNode {
      name: string;
      defaultBranchRef: {
        target: {
          history: {
            totalCount: number;
          };
        };
      } | null;
    }

    const repos: RepoData[] = user.repositories.nodes
      .filter((repo: RepoNode) => {
        const count = repo.defaultBranchRef?.target?.history?.totalCount;
        return count !== undefined && count > 0;
      })
      .slice(0, 6)
      .map((repo: RepoNode) => ({
        name: repo.name,
        recentCommits: repo.defaultBranchRef?.target?.history?.totalCount ?? 0,
      }));

    return { repos, totalCommits };
  } catch (error) {
    console.error('Error fetching yearly commits:', error);
    return { repos: [], totalCommits: 0 };
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

    // GitHub 올해 커밋 수 조회
    const { repos, totalCommits } = await fetchYearlyCommits(username);

    // 캐릭터 수 계산 (100커밋당 1캐릭터, 최소 1, 최대 12)
    const characterCount = Math.min(Math.max(Math.floor(totalCommits / 100), 1), 12);
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
