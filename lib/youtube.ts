import type { YoutubeVideo } from '@/types';

const CHANNEL_HANDLE = 'BNCChampion';
/** @BNCChampion 频道 ID */
const DEFAULT_CHANNEL_ID = 'UCeAfUfcP8r1wrRvgnQmljZA';

/** 通过 YouTube Data API 获取视频 */
export async function fetchVideosViaApi(
  apiKey: string,
  maxResults = 6
): Promise<YoutubeVideo[]> {
  const channelRes = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forHandle=${CHANNEL_HANDLE}&key=${apiKey}`,
    { next: { revalidate: 3600 } }
  );

  if (!channelRes.ok) throw new Error('频道查询失败');

  const channelData = await channelRes.json();
  const uploadsPlaylistId =
    channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

  if (!uploadsPlaylistId) throw new Error('无法获取上传列表');

  const videosRes = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${apiKey}`,
    { next: { revalidate: 1800 } }
  );

  if (!videosRes.ok) throw new Error('视频列表获取失败');

  const videosData = await videosRes.json();

  return (videosData.items ?? []).map(
    (item: {
      snippet: {
        resourceId: { videoId: string };
        title: string;
        thumbnails: { medium: { url: string } };
        publishedAt: string;
      };
    }) => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url,
      publishedAt: item.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
    })
  );
}

/** 通过 YouTube RSS Feed 获取视频（无需 API Key） */
export async function fetchVideosViaRss(
  channelId = process.env.YOUTUBE_CHANNEL_ID || DEFAULT_CHANNEL_ID,
  maxResults = 6
): Promise<YoutubeVideo[]> {
  const res = await fetch(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
    {
      headers: { 'User-Agent': 'BNC-League-Website/1.0' },
      next: { revalidate: 1800 },
    }
  );

  if (!res.ok) throw new Error('RSS 获取失败');

  const xml = await res.text();
  const videos: YoutubeVideo[] = [];

  // 解析 RSS XML（entry 区块）
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];

  for (const entry of entries) {
    if (videos.length >= maxResults) break;

    const videoId =
      entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1] ??
      entry.match(/<id>yt:video:([^<]+)<\/id>/)?.[1];

    if (!videoId) continue;

    const title = entry.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
    const publishedAt = entry.match(/<published>([^<]+)<\/published>/)?.[1] ?? '';
    const thumbnail =
      entry.match(/<media:thumbnail url="([^"]+)"/)?.[1] ??
      `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    videos.push({
      id: videoId,
      title,
      thumbnail,
      publishedAt,
      url: `https://www.youtube.com/watch?v=${videoId}`,
    });
  }

  return videos;
}

/** 获取最新视频（优先 API，回退 RSS） */
export async function fetchLatestVideos(maxResults = 6): Promise<YoutubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (apiKey) {
    try {
      return await fetchVideosViaApi(apiKey, maxResults);
    } catch {
      // API 失败时回退 RSS
    }
  }

  return fetchVideosViaRss(undefined, maxResults);
}
