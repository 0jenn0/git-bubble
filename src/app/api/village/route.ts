import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/shared/lib/supabase';
import { selectCharactersForUser } from '@/shared/lib/village-characters';
import { generateVillageSVG, RepoData } from '@/shared/lib/svg-village-generator';

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

// GitHub 총 커밋 수 조회 (GraphQL API 사용) - 최근 3년
async function fetchTotalCommits(
  username: string
): Promise<{ repos: RepoData[]; totalCommits: number }> {
  try {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      console.error('GITHUB_TOKEN is not configured');
      return { repos: [], totalCommits: 0 };
    }

    const now = new Date();
    let totalCommits = 0;

    // 최근 3년 커밋 합산 (GitHub API는 1년 단위로만 조회 가능)
    for (let i = 0; i < 3; i++) {
      const toDate = new Date(now);
      toDate.setFullYear(toDate.getFullYear() - i);

      const fromDate = new Date(toDate);
      fromDate.setFullYear(fromDate.getFullYear() - 1);

      const query = `
        query($username: String!, $from: DateTime!, $to: DateTime!) {
          user(login: $username) {
            contributionsCollection(from: $from, to: $to) {
              totalCommitContributions
            }
          }
        }
      `;

      const response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'User-Agent': 'git-bubble',
        },
        body: JSON.stringify({
          query,
          variables: {
            username,
            from: fromDate.toISOString(),
            to: toDate.toISOString(),
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data?.user?.contributionsCollection) {
          totalCommits += data.data.user.contributionsCollection.totalCommitContributions;
        }
      }
    }

    // 최근 활성 레포지토리 조회
    const repoQuery = `
      query($username: String!) {
        user(login: $username) {
          repositories(first: 10, orderBy: {field: PUSHED_AT, direction: DESC}) {
            nodes {
              name
              defaultBranchRef {
                target {
                  ... on Commit {
                    history(first: 1) {
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

    const repoResponse = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'User-Agent': 'git-bubble',
      },
      body: JSON.stringify({ query: repoQuery, variables: { username } }),
    });

    let repos: RepoData[] = [];

    if (repoResponse.ok) {
      const data = await repoResponse.json();
      if (data.data?.user?.repositories?.nodes) {
        repos = data.data.user.repositories.nodes
          .filter((repo: RepoNode) => {
            const count = repo.defaultBranchRef?.target?.history?.totalCount;
            return count !== undefined && count > 0;
          })
          .slice(0, 6)
          .map((repo: RepoNode) => ({
            name: repo.name,
            recentCommits: repo.defaultBranchRef?.target?.history?.totalCount ?? 0,
          }));
      }
    }

    return { repos, totalCommits };
  } catch (error) {
    console.error('Error fetching total commits:', error);
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

    // GitHub 총 커밋 수 조회 (최근 3년)
    const { repos, totalCommits } = await fetchTotalCommits(username);

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
