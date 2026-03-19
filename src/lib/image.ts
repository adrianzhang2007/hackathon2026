import fs from 'fs';
import path from 'path';

const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/images/generations';
const API_KEY = '7203f049-02ad-4ee1-a73b-34409f050d47';

export async function generateImage(prompt: string): Promise<string | null> {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'doubao-seedream-5-0-260128',
        prompt,
        size: '2k',
        response_format: 'url',
        watermark: true
      })
    });

    const data = await res.json();
    console.log('[Image] API response:', JSON.stringify(data).slice(0, 200));
    if (!data.data?.[0]?.url) {
      console.error('[Image] No URL in response');
      return null;
    }

    const imageUrl = data.data[0].url;
    const imageRes = await fetch(imageUrl);
    const buffer = await imageRes.arrayBuffer();

    const dir = path.join(process.cwd(), 'public', 'covers');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filename = `${Date.now()}.jpeg`;
    const filepath = path.join(dir, filename);
    fs.writeFileSync(filepath, Buffer.from(buffer));

    return `/covers/${filename}`;
  } catch (e) {
    console.error('[Image] Generation failed:', e);
    return null;
  }
}
