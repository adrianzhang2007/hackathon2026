import { prisma } from '../src/lib/prisma';

const SECONDME_API_BASE = 'https://api.mindverse.com/gate/lab';

async function testSecondMeChat() {
  // 从数据库获取一个真实用户
  const user = await prisma.user.findFirst({
    where: {
      secondmeUserId: {
        not: {
          startsWith: 'demo-',
        },
      },
    },
  });

  if (!user) {
    console.log('No real user found in database');
    return;
  }

  console.log('Testing SecondMe Chat API...');
  console.log('User:', user.name);
  console.log('Token prefix:', user.accessToken.slice(0, 30) + '...');

  const testEndpoints = [
    '/api/secondme/chat/stream',  // 正确的端点
  ];

  for (const endpoint of testEndpoints) {
    console.log(`\n--- Testing endpoint: ${endpoint} ---`);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`${SECONDME_API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify({
          message: '你好，请简单介绍一下自己',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('Status:', response.status);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('text/event-stream')) {
          // 处理流式响应
          const reader = response.body?.getReader();
          if (reader) {
            const decoder = new TextDecoder();
            let fullContent = '';
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              fullContent += decoder.decode(value);
            }
            console.log('Stream response:', fullContent.slice(0, 200));
          }
        } else {
          const text = await response.text();
          console.log('Response:', text.slice(0, 200));
        }
      } else {
        const errorText = await response.text();
        console.error('Error:', errorText);
      }
    } catch (error: any) {
      console.error('Fetch error:', error.message);
      if (error.cause) {
        console.error('Cause:', error.cause);
      }
    }
  }

  await prisma.$disconnect();
}

testSecondMeChat().catch(console.error);
