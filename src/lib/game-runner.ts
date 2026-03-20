import { prisma } from './prisma';
import { callKimiAPI, callSecondMeChat, buildRoleSystemPrompt } from './ai';
import { Script, Role } from '@/types';

// 游戏运行状态
const runningRooms = new Set<string>();

// 获取或创建系统用户
async function getOrCreateSystemUser(): Promise<string> {
  const systemUserId = 'system-user';

  const existingUser = await prisma.user.findUnique({
    where: { secondmeUserId: systemUserId },
  });

  if (existingUser) {
    return existingUser.id;
  }

  const systemUser = await prisma.user.create({
    data: {
      secondmeUserId: systemUserId,
      name: '系统',
      avatar: '🔔',
      accessToken: 'system-token',
      refreshToken: 'system-refresh',
      tokenExpiresAt: new Date('2099-12-31'),
    },
  });

  return systemUser.id;
}

// 启动房间游戏循环
export async function startRoomGame(roomId: string) {
  if (runningRooms.has(roomId)) {
    console.log(`Room ${roomId} game loop already running`);
    return;
  }

  // 检查是否有真实玩家
  const members = await prisma.roomMember.findMany({
    where: { roomId },
  });

  const realPlayers = members.filter((m) => !m.isDemo);
  if (realPlayers.length === 0) {
    throw new Error('房间需要至少一名真实玩家才能启动');
  }

  runningRooms.add(roomId);
  console.log(`Starting game loop for room ${roomId}`);

  // 获取系统用户 ID
  const systemUserId = await getOrCreateSystemUser();

  // 更新房间状态为游戏中
  await prisma.room.update({
    where: { id: roomId },
    data: { status: 'playing' },
  });

  // 发送系统消息：游戏开始
  await prisma.chatMessage.create({
    data: {
      roomId,
      userId: systemUserId,
      content: '🎬 剧本演绎开始！所有角色已就位。',
      type: 'system',
    },
  });

  // 启动游戏循环
  gameLoop(roomId);
}

// 游戏配置 - 5-10分钟游戏时间（20轮，每轮15-30秒含AI请求）
const MAX_ROUNDS = 20; // 固定20轮结束
const TARGET_ROUNDS = 20; // 目标轮数

// 游戏主循环
async function gameLoop(roomId: string) {
  let roundCount = 0;

  while (runningRooms.has(roomId)) {
    try {
      // 检查房间是否还存在且状态正确
      const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
          script: true,
          members: {
            include: { user: true },
          },
          messages: {
            orderBy: { createdAt: 'asc' },
            include: { user: true },
          },
        },
      });

      if (!room || room.status === 'ended') {
        console.log(`Room ${roomId} ended or not found, stopping game loop`);
        runningRooms.delete(roomId);
        break;
      }

      // 获取当前场景和剧本数据
      const script = {
        ...room.script!,
        description: room.script!.description || undefined,
        sourceEvent: room.script!.sourceEvent || undefined,
        background: room.script!.background ? JSON.parse(room.script!.background) : undefined,
        roles: JSON.parse(room.script!.roles).map((r: any, index: number) => ({ ...r, id: r.id || `role_${index + 1}` })),
        scenes: JSON.parse(room.script!.scenes),
        endings: JSON.parse(room.script!.endings),
      } as Script;

      // 消息已按时间正序排列（数据库查询时已排序）
      const sortedMessages = room.messages;

      // 计算当前轮数（排除系统消息）
      const nonSystemMessages = sortedMessages.filter(m => m.userId !== 'system' && m.user?.secondmeUserId !== 'system-user');
      roundCount = nonSystemMessages.length;
      console.log(`[GameLoop] Round ${roundCount}/${MAX_ROUNDS}`);

      // 检查是否达到结局条件
      if (roundCount >= MAX_ROUNDS) {
        console.log(`[GameLoop] Reached max rounds (${MAX_ROUNDS}), triggering ending...`);
        await triggerEnding(roomId, script, sortedMessages);
        break;
      }

      const currentScene = getCurrentScene(script, sortedMessages);

      // 找到下一个应该发言的角色
      const nextSpeaker = await getNextSpeaker(room.members, sortedMessages);
      if (!nextSpeaker) {
        console.log(`No next speaker for room ${roomId}, waiting...`);
        await sleep(5000);
        continue;
      }

      // 生成发言，传入当前轮数
      const message = await generateCharacterSpeech(
        nextSpeaker,
        script,
        currentScene,
        sortedMessages,
        roundCount
      );

      if (message) {
        // 保存消息
        await prisma.chatMessage.create({
          data: {
            roomId,
            userId: nextSpeaker.user.id,
            roleName: nextSpeaker.roleName,
            content: message,
            type: detectMessageType(message),
          },
        });

        console.log(`[Room ${roomId}] ${nextSpeaker.roleName}: ${message.slice(0, 50)}...`);
      }

      // 等待一段时间再下一位发言（含AI请求时间，总间隔约15-30秒）
      await sleep(15000 + Math.random() * 10000); // 15-25秒随机间隔

    } catch (error) {
      console.error(`Error in game loop for room ${roomId}:`, error);
      await sleep(5000);
    }
  }
}

// 触发剧本结局
async function triggerEnding(roomId: string, script: Script, messages: any[]) {
  console.log(`[TriggerEnding] Generating ending for room ${roomId}`);

  const systemUserId = await getOrCreateSystemUser();

  // 获取所有结局选项
  const endings = Array.isArray(script.endings) ? script.endings : [];
  if (endings.length === 0) {
    console.log('[TriggerEnding] No endings defined, using default ending');
    await prisma.chatMessage.create({
      data: {
        roomId,
        userId: systemUserId,
        content: '🎭 剧本演绎结束！感谢各位的参与。',
        type: 'system',
      },
    });
    await endRoomGame(roomId);
    return;
  }

  // 构建剧情摘要用于AI判断
  const dialogueSummary = messages
    .filter(m => m.userId !== 'system' && m.user?.secondmeUserId !== 'system-user')
    .slice(-10)
    .map(m => `${m.roleName || m.user?.name}: ${m.content}`)
    .join('\n');

  // 让AI判断最合适的结局
  const endingPrompt = `【剧本结局判断】

剧本名称：${script.title}

近期剧情发展：
${dialogueSummary}

可选结局：
${endings.map((e, i) => `${i + 1}. ${e.name}: ${e.description}`).join('\n')}

请根据剧情发展，判断最符合逻辑的结局。只返回结局编号（1-${endings.length}）。`;

  console.log('[TriggerEnding] Calling AI to determine ending...');

  try {
    // 使用Kimi判断结局
    const endingResult = await callKimiAPI(
      '你是一个剧本杀结局判断助手。根据剧情发展选择最合理的结局。只返回数字编号。',
      [{ role: 'user', content: endingPrompt }],
      100
    );

    // 解析结局编号
    const endingNumber = parseInt(endingResult?.match(/\d+/)?.[0] || '1');
    const selectedEnding = endings[Math.min(endingNumber - 1, endings.length - 1)] || endings[0];

    console.log(`[TriggerEnding] Selected ending: ${selectedEnding.name}`);

    // 发送结局预告
    await prisma.chatMessage.create({
      data: {
        roomId,
        userId: systemUserId,
        content: `📜 剧情接近尾声...`,
        type: 'system',
      },
    });

    await sleep(3000);

    // 发送结局描述
    await prisma.chatMessage.create({
      data: {
        roomId,
        userId: systemUserId,
        content: `🎬 【结局：${selectedEnding.name}】\n\n${selectedEnding.description}`,
        type: 'system',
      },
    });

    await sleep(3000);

    // 发送结束语
    await prisma.chatMessage.create({
      data: {
        roomId,
        userId: systemUserId,
        content: '🎭 剧本演绎正式结束！感谢各位的精彩演出。',
        type: 'system',
      },
    });

  } catch (error) {
    console.error('[TriggerEnding] Error generating ending:', error);
    // 使用默认结局
    const defaultEnding = endings[0];
    await prisma.chatMessage.create({
      data: {
        roomId,
        userId: systemUserId,
        content: `🎬 【结局：${defaultEnding.name}】\n\n${defaultEnding.description}\n\n🎭 剧本演绎结束！`,
        type: 'system',
      },
    });
  }

  // 结束游戏
  await endRoomGame(roomId);
}

// 计算当前轮数
function getCurrentRound(messages: any[]): number {
  return messages.filter(m => m.userId !== 'system' && m.user?.secondmeUserId !== 'system-user').length;
}

// 获取下一个发言者
async function getNextSpeaker(members: any[], messages: any[]) {
  console.log(`[getNextSpeaker] Total members: ${members.length}, Total messages: ${messages.length}`);

  const currentRound = getCurrentRound(messages);
  console.log(`[getNextSpeaker] Current round: ${currentRound}/${MAX_ROUNDS}`);

  // 过滤出有角色的成员（真实玩家有 roleId，Demo 玩家 isDemo=true）
  const readyMembers = members
    .filter(m => m.roleId || m.isDemo)
    .sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());

  // 分离Demo角色和真实玩家
  const demoMembers = readyMembers.filter(m => m.isDemo);
  const realMembers = readyMembers.filter(m => !m.isDemo);

  console.log(`[getNextSpeaker] Demo members: ${demoMembers.length}, Real members: ${realMembers.length}`);

  if (readyMembers.length === 0) {
    console.log(`[getNextSpeaker] No ready members found`);
    return null;
  }

  // 找到最后发言的成员（排除系统消息）
  const nonSystemMessages = messages.filter(m => m.userId !== 'system' && m.user?.secondmeUserId !== 'system-user');
  const lastMessage = nonSystemMessages[nonSystemMessages.length - 1];
  const lastSpeakerId = lastMessage?.userId;
  const lastSpeaker = readyMembers.find(m => m.userId === lastSpeakerId);

  console.log(`[getNextSpeaker] Last speaker: ${lastSpeaker?.roleName || 'none'}`);

  // 策略：根据轮数决定发言顺序
  // - 前5轮：真实玩家优先，建立角色
  // - 6-15轮：正常轮询
  // - 16轮后：Demo角色优先发言，控制剧情走向结局

  let nextSpeaker;

  if (currentRound >= 16 && demoMembers.length > 0) {
    // 后期阶段：Demo角色优先，确保剧情推进到结局
    console.log(`[getNextSpeaker] Late stage (${currentRound} rounds), prioritizing Demo bots`);

    if (lastSpeaker?.isDemo) {
      // 如果最后是Demo发言，让真实玩家回应（如果有）
      const lastDemoIndex = demoMembers.findIndex(m => m.userId === lastSpeakerId);
      if (realMembers.length > 0) {
        // 找到回应的真实玩家
        const lastRealIndex = realMembers.findIndex(m => {
          const lastMsg = nonSystemMessages[nonSystemMessages.length - 1];
          return lastMsg?.userId === m.userId;
        });
        nextSpeaker = realMembers[(lastRealIndex + 1) % realMembers.length];
      } else {
        nextSpeaker = demoMembers[(lastDemoIndex + 1) % demoMembers.length];
      }
    } else {
      // 最后是真实玩家发言，优先Demo回应
      const demoIndex = Math.floor(Math.random() * demoMembers.length);
      nextSpeaker = demoMembers[demoIndex];
    }
  } else {
    // 正常轮询模式
    let lastIndex = readyMembers.findIndex(m => m.userId === lastSpeakerId);
    if (lastIndex === -1) lastIndex = -1;
    const nextIndex = (lastIndex + 1) % readyMembers.length;
    nextSpeaker = readyMembers[nextIndex];
  }

  console.log(`[getNextSpeaker] Selected: ${nextSpeaker?.roleName} (Demo: ${nextSpeaker?.isDemo})`);
  return nextSpeaker;
}

// 获取当前场景
function getCurrentScene(script: Script, messages: any[]): any {
  const scenes = Array.isArray(script.scenes) ? script.scenes : [];
  if (scenes.length === 0) return null;

  // 根据消息数量判断当前场景（简单逻辑：每4条消息切换一个场景，5场景 x 4 = 20轮）
  const nonSystemMessages = messages.filter(m => m.userId !== 'system');
  const sceneIndex = Math.min(
    Math.floor(nonSystemMessages.length / 4),
    scenes.length - 1
  );

  return scenes[sceneIndex];
}

// 生成角色发言
async function generateCharacterSpeech(
  member: any,
  script: Script,
  scene: any,
  messages: any[],
  currentRound: number = 0
): Promise<string | null> {
  console.log(`[generateCharacterSpeech] Starting for ${member.roleName}, isDemo: ${member.isDemo}, round: ${currentRound}/${MAX_ROUNDS}`);

  const role: Role | undefined = script.roles.find((r: Role) => r.id === member.roleId);
  if (!role) {
    console.log(`[generateCharacterSpeech] Role not found for ${member.roleId}`);
    return null;
  }

  // Demo角色强制使用剧情控制提示词
  const systemPrompt = buildRoleSystemPrompt(role, script, scene, messages, currentRound, MAX_ROUNDS);
  console.log(`[generateCharacterSpeech] System prompt built with round control: ${currentRound}/${MAX_ROUNDS}`);

  // 构建聊天消息历史
  const chatMessages = messages
    .filter((m: any) => m.userId !== 'system' && m.user?.secondmeUserId !== 'system-user')
    .slice(-5)
    .map((m: any) => ({
      role: 'user' as const,
      content: `${m.roleName || m.user?.name}: ${m.content}`,
    }));

  // Demo 角色使用 Kimi API
  if (member.isDemo) {
    console.log(`[generateCharacterSpeech] Calling Kimi API for demo role ${member.roleName}`);
    console.log(`[generateCharacterSpeech] Chat messages count: ${chatMessages.length}`);

    // Demo 使用 1000 tokens，防止截断
    const result = await callKimiAPI(systemPrompt, chatMessages, 1000);
    console.log(`[generateCharacterSpeech] Kimi API result: ${result ? result.slice(0, 50) : 'null'}`);
    return result;
  }

  // 真实玩家：尝试 SecondMe Chat API，失败则使用 Kimi 备用
  console.log(`[generateCharacterSpeech] Real user check - accessToken exists: ${!!member.user?.accessToken}`);
  if (member.user?.accessToken) {
    console.log(`[generateCharacterSpeech] Calling SecondMe Chat API for ${member.user.name}`);
    try {
      const prompt = `${systemPrompt}\n\n请生成你的回应：`;
      const result = await callSecondMeChat(member.user.accessToken, prompt);
      if (result) {
        console.log(`[generateCharacterSpeech] SecondMe Chat success: ${result.slice(0, 50)}...`);
        return result;
      }
    } catch (error) {
      console.error(`[generateCharacterSpeech] SecondMe Chat failed, falling back to Kimi:`, error);
    }

    // SecondMe 失败，使用 Kimi 备用
    console.log(`[generateCharacterSpeech] Using Kimi as fallback for real user ${member.user.name}`);
    const fallbackResult = await callKimiAPI(systemPrompt, chatMessages, 1000);
    console.log(`[generateCharacterSpeech] Kimi fallback result: ${fallbackResult ? fallbackResult.slice(0, 50) : 'null'}`);
    return fallbackResult;
  }

  console.log(`[generateCharacterSpeech] No accessToken, using Kimi for ${member.user?.name}`);
  const noTokenResult = await callKimiAPI(systemPrompt, chatMessages, 1000);
  return noTokenResult;
}

// 检测消息类型
function detectMessageType(content: string): 'text' | 'action' | 'thought' | 'system' {
  if (content.startsWith('（心想：') || content.includes('心想：')) {
    return 'thought';
  }
  if (content.startsWith('（') && content.endsWith('）')) {
    return 'action';
  }
  if (content.startsWith('说：')) {
    return 'text';
  }
  return 'text';
}

// 结束房间游戏
export async function endRoomGame(roomId: string) {
  runningRooms.delete(roomId);

  // 更新房间状态
  await prisma.room.update({
    where: { id: roomId },
    data: { status: 'ended', endedAt: new Date() },
  });

  // 获取系统用户 ID
  const systemUserId = await getOrCreateSystemUser();

  // 发送结束消息
  await prisma.chatMessage.create({
    data: {
      roomId,
      userId: systemUserId,
      content: '🎭 剧本演绎结束！感谢各位的参与。',
      type: 'system',
    },
  });

  console.log(`Game ended for room ${roomId}`);
}

// 检查是否应该结束游戏
export function shouldEndGame(roomId: string): boolean {
  return !runningRooms.has(roomId);
}

// 辅助函数：延迟
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 启动所有进行中的房间
export async function startAllActiveRooms() {
  const activeRooms = await prisma.room.findMany({
    where: {
      status: { in: ['waiting', 'ready', 'playing'] },
    },
  });

  for (const room of activeRooms) {
    // 检查是否有足够的成员
    const memberCount = await prisma.roomMember.count({
      where: { roomId: room.id },
    });

    if (memberCount >= 2) {
      await startRoomGame(room.id);
    }
  }
}
