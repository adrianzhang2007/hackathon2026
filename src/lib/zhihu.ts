import crypto from 'crypto';

const ZHIHU_BASE_URL = 'https://openapi.zhihu.com';
const APP_KEY = process.env.ZHIHU_APP_KEY!;
const APP_SECRET = process.env.ZHIHU_APP_SECRET!;

function generateSign(timestamp: string, logId: string): string {
  const signStr = `app_key:${APP_KEY}|ts:${timestamp}|logid:${logId}|extra_info:`;
  return crypto.createHmac('sha256', APP_SECRET).update(signStr).digest('base64');
}

export interface ZhihuHotTopic {
  title: string;
  body: string;
  link_url: string;
  heat_score: number;
  token: string;
  answers?: Array<{
    body: string;
    vote_up_count: number;
    comment_count: number;
  }>;
}

export async function getZhihuHotList(topCnt = 50, publishInHours = 168): Promise<ZhihuHotTopic[]> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const logId = `log_${Date.now()}`;
  const sign = generateSign(timestamp, logId);

  const response = await fetch(
    `${ZHIHU_BASE_URL}/openapi/billboard/list?top_cnt=${topCnt}&publish_in_hours=${publishInHours}`,
    {
      headers: {
        'X-App-Key': APP_KEY,
        'X-Timestamp': timestamp,
        'X-Log-Id': logId,
        'X-Sign': sign,
        'X-Extra-Info': '',
      },
    }
  );

  const data = await response.json();
  return data.status === 0 ? data.data.list : [];
}

export async function getRingDetail(ringId: string, pageNum = 1, pageSize = 20) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const logId = `log_${Date.now()}`;
  const sign = generateSign(timestamp, logId);

  const response = await fetch(
    `${ZHIHU_BASE_URL}/openapi/ring/detail?ring_id=${ringId}&page_num=${pageNum}&page_size=${pageSize}`,
    { headers: { 'X-App-Key': APP_KEY, 'X-Timestamp': timestamp, 'X-Log-Id': logId, 'X-Sign': sign } }
  );

  const data = await response.json();
  return data.status === 0 ? data.data : null;
}

export async function publishPin(ringId: string, title: string, content: string, imageUrls?: string[]) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const logId = `log_${Date.now()}`;
  const sign = generateSign(timestamp, logId);

  const response = await fetch(`${ZHIHU_BASE_URL}/openapi/publish/pin`, {
    method: 'POST',
    headers: {
      'X-App-Key': APP_KEY,
      'X-Timestamp': timestamp,
      'X-Log-Id': logId,
      'X-Sign': sign,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ring_id: ringId, title, content, image_urls: imageUrls || [] }),
  });

  return await response.json();
}

export async function likeContent(contentToken: string, contentType: 'pin' | 'comment', actionValue: 0 | 1) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const logId = `log_${Date.now()}`;
  const sign = generateSign(timestamp, logId);

  const response = await fetch(`${ZHIHU_BASE_URL}/openapi/reaction`, {
    method: 'POST',
    headers: {
      'X-App-Key': APP_KEY,
      'X-Timestamp': timestamp,
      'X-Log-Id': logId,
      'X-Sign': sign,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content_token: contentToken, content_type: contentType, action_type: 'like', action_value: actionValue }),
  });

  return await response.json();
}

export async function createComment(contentToken: string, contentType: 'pin' | 'comment', content: string) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const logId = `log_${Date.now()}`;
  const sign = generateSign(timestamp, logId);

  const response = await fetch(`${ZHIHU_BASE_URL}/openapi/comment/create`, {
    method: 'POST',
    headers: {
      'X-App-Key': APP_KEY,
      'X-Timestamp': timestamp,
      'X-Log-Id': logId,
      'X-Sign': sign,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content_token: contentToken, content_type: contentType, content }),
  });

  return await response.json();
}

export async function deleteComment(commentId: string) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const logId = `log_${Date.now()}`;
  const sign = generateSign(timestamp, logId);

  const response = await fetch(`${ZHIHU_BASE_URL}/openapi/comment/delete`, {
    method: 'POST',
    headers: {
      'X-App-Key': APP_KEY,
      'X-Timestamp': timestamp,
      'X-Log-Id': logId,
      'X-Sign': sign,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ comment_id: commentId }),
  });

  return await response.json();
}

export async function getCommentList(contentToken: string, contentType: 'pin' | 'comment', pageNum = 1, pageSize = 10) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const logId = `log_${Date.now()}`;
  const sign = generateSign(timestamp, logId);

  const response = await fetch(
    `${ZHIHU_BASE_URL}/openapi/comment/list?content_token=${contentToken}&content_type=${contentType}&page_num=${pageNum}&page_size=${pageSize}`,
    { headers: { 'X-App-Key': APP_KEY, 'X-Timestamp': timestamp, 'X-Log-Id': logId, 'X-Sign': sign, 'X-Extra-Info': '' } }
  );

  const data = await response.json();
  return data.status === 0 ? data.data : null;
}

export async function searchGlobal(query: string, count = 10) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const logId = `log_${Date.now()}`;
  const sign = generateSign(timestamp, logId);

  const response = await fetch(
    `${ZHIHU_BASE_URL}/openapi/search/global?query=${encodeURIComponent(query)}&count=${count}`,
    { headers: { 'X-App-Key': APP_KEY, 'X-Timestamp': timestamp, 'X-Log-Id': logId, 'X-Sign': sign, 'X-Extra-Info': '' } }
  );

  const data = await response.json();
  return data.status === 0 ? data.data : null;
}
