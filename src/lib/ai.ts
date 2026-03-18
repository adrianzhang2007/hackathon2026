// AI 驱动对话系统

const KIMI_API_ENDPOINT = process.env.KIMI_API_ENDPOINT || 'https://api.kimi.com/coding/v1/messages';
const KIMI_API_KEY = process.env.KIMI_API_KEY || '';
const SECONDME_API_BASE = process.env.SECONDME_API_BASE_URL || 'https://api.mindverse.com/gate/lab';

// 调用 Kimi API (Demo 角色使用)
export async function callKimiAPI(
  systemPrompt: string,
  messages: { role: string; content: string }[],
  maxTokens: number = 1000  // 增加 token 限制，防止内容截断
): Promise<string | null> {
  try {
    const response = await fetch(KIMI_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIMI_API_KEY}`,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'kimi-for-coding',
        stream: false,
        max_tokens: maxTokens,
        reasoning_effort: 'medium',
        system: systemPrompt,
        messages: messages,
      }),
    });

    if (!response.ok) {
      console.error('Kimi API error:', await response.text());
      return null;
    }

    const result = await response.json();
    return result.content?.[0]?.text || null;
  } catch (error) {
    console.error('Error calling Kimi API:', error);
    return null;
  }
}

// 调用 SecondMe Chat API (真实玩家使用)
export async function callSecondMeChat(
  accessToken: string,
  message: string,
  sessionId?: string
): Promise<string | null> {
  try {
    console.log(`[callSecondMeChat] Token prefix: ${accessToken.slice(0, 20)}..., Session: ${sessionId || 'new'}`);

    // 使用 AbortController 设置超时
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

    const response = await fetch(`${SECONDME_API_BASE}/api/secondme/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        message: message,
        sessionId: sessionId,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log(`[callSecondMeChat] Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SecondMe Chat error:', errorText);
      return null;
    }

    // 处理流式响应
    const reader = response.body?.getReader();
    if (!reader) {
      console.log('[callSecondMeChat] No reader available');
      return null;
    }

    let fullContent = '';
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              fullContent += data.content;
            }
          } catch {
            // 忽略解析错误
          }
        }
      }
    }

    console.log(`[callSecondMeChat] Full content length: ${fullContent.length}`);
    return fullContent || null;
  } catch (error) {
    console.error('Error calling SecondMe Chat:', error);
    return null;
  }
}

// 构建角色系统提示词
export function buildRoleSystemPrompt(
  role: any,
  script: any,
  scene: any,
  recentMessages: any[],
  currentRound: number = 0,
  maxRounds: number = 20
): string {
  // 计算剧情进度
  const progress = Math.min(100, Math.round((currentRound / maxRounds) * 100));
  const remainingRounds = maxRounds - currentRound;

  // 根据进度确定当前阶段
  let stage = '开场';
  if (progress > 25) stage = '发展';
  if (progress > 60) stage = '高潮';
  if (progress > 85) stage = '结局临近';

  return `【角色扮演模式 - 严格控制剧情进度】

⚠️ 重要提醒：
- 当前是第 ${currentRound}/${maxRounds} 轮（${progress}% 进度，${stage}阶段）
- 剩余 ${remainingRounds} 轮必须完成剧本核心剧情
- 你的发言必须推动剧情向结局发展，不能闲聊或重复

=== 角色信息 ===
姓名：${role.name}
年龄：${role.age}
职业：${role.occupation}
性格：${role.personality?.join('、') || '未设定'}
核心目标：${role.coreGoal}
秘密：${role.secret}
当前状态：${role.initialState}

=== 剧本信息 ===
剧本名称：${script.title}
当前场景：${scene?.name || '未知'}
地点：${scene?.location || '未知'}
情感基调：${scene?.mood || '中性'}
场景描述：${scene?.description || '无'}

=== 近期对话（最近3条）===
${recentMessages.slice(-3).map((m: any) => {
  const roleName = m.roleName || m.user?.name || '未知';
  return `${roleName}：${m.content.slice(0, 50)}${m.content.length > 50 ? '...' : ''}`;
}).join('\n')}

=== 剧情控制规则（必须遵守）===
1. 【进度控制】当前${stage}阶段，必须在${remainingRounds}轮内推进到结局
2. 【内容要求】
   - 开场阶段(1-5轮)：建立冲突，介绍背景
   - 发展阶段(6-12轮)：深化矛盾，角色互动
   - 高潮阶段(13-17轮)：冲突爆发，关键决策
   - 结局阶段(18-20轮)：收束剧情，达成结局
3. 【禁止行为】
   - ❌ 闲聊、问候、客套话
   - ❌ 重复之前说过的话
   - ❌ 偏离剧本主题的内容
   - ❌ 不推动剧情的无意义发言
4. 【强制要求】
   - ✅ 每次发言必须推进剧情
   - ✅ 回应其他角色的核心观点
   - ✅ 展现你的角色目标和秘密
   - ✅ 为结局做铺垫（特别是15轮后）

=== 发言格式 ===
- 台词：「说：...」
- 动作：（...）
- 内心独白：（心想：...）

=== 当前任务 ===
作为${role.name}，在${stage}阶段，你的发言必须：
1. 符合${stage}阶段的剧情节奏
2. 推动故事向结局发展
3. 控制在50-100字以内
4. 不要解释，直接生成台词

请生成你的回应：`;
}
