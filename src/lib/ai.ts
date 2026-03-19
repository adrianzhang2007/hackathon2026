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
  const progress = Math.min(100, Math.round((currentRound / maxRounds) * 100));
  const remainingRounds = maxRounds - currentRound;

  let stage = '开场';
  let stageGuide = '介绍自己的立场，点出矛盾';
  if (progress > 25) {
    stage = '发展';
    stageGuide = '深挖冲突，揭露细节';
  }
  if (progress > 60) {
    stage = '高潮';
    stageGuide = '矛盾爆发，情绪激烈';
  }
  if (progress > 85) {
    stage = '收尾';
    stageGuide = '做出决定，走向结局';
  }

  return `你是${role.name}，${role.age}岁，${role.occupation}。
性格：${role.personality?.join('、')}
目标：${role.coreGoal}
秘密：${role.secret}

【当前剧情】
进度：第${currentRound}/${maxRounds}轮（${stage}阶段）
场景：${scene?.name} - ${scene?.location}
氛围：${scene?.mood}

【最近对话】
${recentMessages.slice(-3).map((m: any) => `${m.roleName || '旁白'}：${m.content}`).join('\n')}

【发言规则】
1. 用短句，一句话10-15字
2. 多用动作和表情：（皱眉）（拍桌子）（冷笑）
3. 加旁白渲染气氛：[空气凝固了][他的手在颤抖]
4. ${stageGuide}
5. 总长度30-60字

【当前任务】
${stage}阶段，还剩${remainingRounds}轮。${stageGuide}。
直接生成你的台词，不要解释：`;
}

export async function analyzeZhihuTopic(title: string, body: string): Promise<any> {
  const prompt = `分析这个知乎热榜话题是否适合改编成剧本杀：

标题：${title}
内容：${body.slice(0, 500)}

要求：
1. 是否有明确的冲突或争议？
2. 是否涉及多方立场？
3. 是否有戏剧性？

输出 JSON：
{
  "suitable": true/false,
  "reason": "原因",
  "conflicts": ["冲突点1", "冲突点2"],
  "suggestedRoles": ["角色1", "角色2", "角色3"]
}`;

  console.log('[analyzeZhihuTopic] Starting analysis...');
  const result = await callKimiAPI('你是剧本分析专家', [{ role: 'user', content: prompt }], 1000);
  console.log('[analyzeZhihuTopic] Result:', result?.slice(0, 100));

  if (!result) {
    console.error('[analyzeZhihuTopic] No result from Kimi API');
    return null;
  }

  try {
    // 清理 markdown 格式
    const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('[analyzeZhihuTopic] JSON parse error:', e);
    return null;
  }
}

export async function generateScript(title: string, body: string, answers: any[]): Promise<any> {
  const prompt = `将这个真实事件改编成剧本杀：

标题：${title}
内容：${body.slice(0, 1000)}
热门回答：${answers.slice(0, 3).map((a: any) => a.body?.slice(0, 200)).join('\n\n')}

要求：
1. 5个角色，每个有目标和秘密
2. 5个场景，逐步推进剧情
3. 4个不同结局
4. 保持真实事件的核心冲突

输出严格 JSON 格式：
{
  "title": "剧本标题",
  "description": "剧本简介",
  "scriptType": "社会/商业/情感",
  "difficulty": 3,
  "duration": 30,
  "background": {"time": "时间", "location": "地点", "socialContext": "背景"},
  "roles": [{"name": "角色名", "age": 30, "occupation": "职业", "personality": ["性格1"], "coreGoal": "目标", "secret": "秘密", "initialState": "初始状态"}],
  "scenes": [{"name": "场景名", "location": "地点", "description": "描述", "mood": "氛围", "keyEvents": ["事件1"]}],
  "endings": [{"name": "结局名", "description": "描述", "condition": "触发条件", "impact": "影响"}]
}`;

  const result = await callKimiAPI('你是剧本创作专家', [{ role: 'user', content: prompt }], 4000);
  if (!result) return null;

  try {
    const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}
