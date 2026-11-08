export interface FacebookPost {
  message: string;
  createdAt: string;
  url: string;
  image: string;
}

interface GraphMedia {
  image?: { src?: string };
}

interface GraphAttachment {
  media?: GraphMedia;
  subattachments?: { data?: GraphAttachment[] };
}

interface GraphPost {
  message?: string;
  created_time: string;
  permalink_url: string;
  full_picture?: string;
  attachments?: { data?: GraphAttachment[] };
}

const FIELDS =
  'message,created_time,permalink_url,full_picture,attachments{media,subattachments}';
const PLAIN_FIELDS = 'message,created_time,permalink_url';

function firstAttachmentImage(items: GraphAttachment[] | undefined): string {
  for (const item of items ?? []) {
    const src = item.media?.image?.src;
    if (src) return src;
    const nested = firstAttachmentImage(item.subattachments?.data);
    if (nested) return nested;
  }
  return '';
}

function imageHostAllowed(src: string): boolean {
  try {
    const host = new URL(src).hostname;
    return (
      host === 'fbcdn.net' ||
      host.endsWith('.fbcdn.net') ||
      host === 'facebook.com' ||
      host.endsWith('.facebook.com') ||
      host.endsWith('.fbsbx.com')
    );
  } catch {
    return false;
  }
}

async function readPosts(token: string, pageId: string, fields: string): Promise<GraphPost[] | null> {
  const res = await fetch(
    `https://graph.facebook.com/v19.0/${pageId}/posts?fields=${fields}&limit=3&access_token=${token}`,
    { next: { revalidate: 1800 } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return Array.isArray(data.data) ? data.data : [];
}

/** 最近 3 帖。image 是本站代理路徑，不把 Facebook 圖址交到瀏覽器。 */
export async function getFacebookPosts(): Promise<FacebookPost[]> {
  const token = process.env.FACEBOOK_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID || '100094558236356';
  if (!token) return [];

  const rows = (await readPosts(token, pageId, FIELDS)) ?? (await readPosts(token, pageId, PLAIN_FIELDS));
  if (!rows) return [];

  return rows.map((post, index) => {
    const remote = firstAttachmentImage(post.attachments?.data) || post.full_picture || '';
    return {
      message: post.message ?? '',
      createdAt: post.created_time,
      url: post.permalink_url,
      image: remote && imageHostAllowed(remote) ? `/api/facebook/image?n=${index}` : '',
    };
  });
}

export async function getFacebookImage(index: number): Promise<Response | null> {
  if (!Number.isInteger(index) || index < 0 || index > 2) return null;
  const token = process.env.FACEBOOK_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID || '100094558236356';
  if (!token) return null;

  const rows = await readPosts(token, pageId, FIELDS);
  const post = rows?.[index];
  if (!post) return null;
  const remote = firstAttachmentImage(post.attachments?.data) || post.full_picture || '';
  if (!imageHostAllowed(remote)) return null;

  const img = await fetch(remote, { next: { revalidate: 1800 } });
  if (!img.ok || !imageHostAllowed(img.url)) return null;
  const type = img.headers.get('content-type') || 'image/jpeg';
  if (!type.startsWith('image/')) return null;
  return new Response(img.body, {
    headers: {
      'Content-Type': type,
      'Cache-Control': 'public, max-age=1800',
    },
  });
}
