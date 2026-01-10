import { supabase } from './supabase';
import crypto from 'crypto';

export type FeatureType =
  | 'bubble'
  | 'link'
  | 'divider'
  | 'village'
  | 'typing'
  | 'streak'
  | 'badge';

interface TrackingParams {
  featureType: FeatureType;
  username?: string;
  request: Request;
}

function hashIP(ip: string): string {
  return crypto
    .createHash('sha256')
    .update(ip + process.env.IP_SALT || 'git-bubble')
    .digest('hex')
    .slice(0, 16);
}

function isGitHubEmbed(referer: string | null, userAgent: string | null): boolean {
  if (!referer && !userAgent) return false;
  if (userAgent?.includes('github-camo')) return true;
  if (referer?.includes('github.com')) return true;
  if (referer?.includes('raw.githubusercontent.com')) return true;
  if (referer?.includes('githubusercontent.com')) return true;
  return false;
}

async function logToSupabase(params: {
  featureType: FeatureType;
  username?: string;
  referer: string | null;
  userAgent: string | null;
  ipHash: string;
  isGitHubEmbed: boolean;
}): Promise<void> {
  try {
    await supabase.from('usage_logs').insert({
      feature_type: params.featureType,
      username: params.username || null,
      referer: params.referer?.slice(0, 500) || null,
      user_agent: params.userAgent?.slice(0, 500) || null,
      ip_hash: params.ipHash,
      is_github_embed: params.isGitHubEmbed,
    });
  } catch (error) {
    console.error('Failed to log to Supabase:', error);
  }
}

async function logToGA4(params: {
  featureType: FeatureType;
  username?: string;
  isGitHubEmbed: boolean;
  clientId: string;
}): Promise<void> {
  const measurementId = process.env.GA4_MEASUREMENT_ID;
  const apiSecret = process.env.GA4_API_SECRET;

  if (!measurementId || !apiSecret) return;

  try {
    await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
      {
        method: 'POST',
        body: JSON.stringify({
          client_id: params.clientId,
          events: [
            {
              name: 'svg_render',
              params: {
                feature_type: params.featureType,
                username: params.username || 'anonymous',
                is_github_embed: params.isGitHubEmbed,
                engagement_time_msec: 100,
              },
            },
          ],
        }),
      }
    );
  } catch (error) {
    console.error('Failed to log to GA4:', error);
  }
}

export async function trackUsage(params: TrackingParams): Promise<void> {
  const { featureType, username, request } = params;

  const referer = request.headers.get('referer');
  const userAgent = request.headers.get('user-agent');
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0] || realIp || 'unknown';
  const ipHash = hashIP(ip);

  const isEmbed = isGitHubEmbed(referer, userAgent);

  Promise.all([
    logToSupabase({
      featureType,
      username,
      referer,
      userAgent,
      ipHash,
      isGitHubEmbed: isEmbed,
    }),
    logToGA4({
      featureType,
      username,
      isGitHubEmbed: isEmbed,
      clientId: ipHash,
    }),
  ]).catch((error) => {
    console.error('Tracking error:', error);
  });
}
