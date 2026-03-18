import { prisma } from './prisma';

const SECONDME_API_BASE_URL = process.env.SECONDME_API_BASE_URL || 'https://api.mindverse.com/gate/lab';

// 发送聊天消息到 SecondMe
export async function sendChatMessage(
  accessToken: string,
  message: string,
  sessionId?: string
): Promise<ReadableStream | null> {
  try {
    const response = await fetch(`${SECONDME_API_BASE_URL}/api/chat/stream`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: message,
        session_id: sessionId,
      }),
    });

    if (!response.ok) {
      console.error('Chat request failed:', await response.text());
      return null;
    }

    return response.body;
  } catch (error) {
    console.error('Error sending chat message:', error);
    return null;
  }
}

// 获取会话列表
export async function getSessions(accessToken: string): Promise<any[]> {
  try {
    const response = await fetch(`${SECONDME_API_BASE_URL}/api/chat/sessions`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error('Get sessions failed:', await response.text());
      return [];
    }

    const result = await response.json();
    if (result.code !== 0 || !result.data) {
      return [];
    }

    return result.data.sessions || [];
  } catch (error) {
    console.error('Error getting sessions:', error);
    return [];
  }
}

// 获取会话消息
export async function getSessionMessages(accessToken: string, sessionId: string): Promise<any[]> {
  try {
    const response = await fetch(`${SECONDME_API_BASE_URL}/api/chat/sessions/${sessionId}/messages`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error('Get session messages failed:', await response.text());
      return [];
    }

    const result = await response.json();
    if (result.code !== 0 || !result.data) {
      return [];
    }

    return result.data.messages || [];
  } catch (error) {
    console.error('Error getting session messages:', error);
    return [];
  }
}

// 保存房间聊天消息到数据库
export async function saveRoomMessage(
  roomId: string,
  userId: string,
  content: string,
  type: 'text' | 'action' | 'thought' | 'system' = 'text',
  roleName?: string
) {
  return await prisma.chatMessage.create({
    data: {
      roomId,
      userId,
      content,
      type,
      roleName,
    },
  });
}

// 获取房间消息历史
export async function getRoomMessages(roomId: string) {
  return await prisma.chatMessage.findMany({
    where: { roomId },
    orderBy: { createdAt: 'asc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });
}
