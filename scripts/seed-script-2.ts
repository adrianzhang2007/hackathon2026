import { prisma } from '../src/lib/prisma';

async function main() {
  const script = await prisma.script.create({
    data: {
      title: '德黑兰的48小时',
      description: '美以伊冲突升级的紧张时刻，国际社会紧急斡旋。外交官、记者、人道主义工作者在炮火与谈判之间，为和平做最后的努力。',
      sourceEvent: '美以伊冲突最新情况 - 美以打击伊多个目标',
      scriptType: '国际政治/外交/人道主义',
      difficulty: 4,
      duration: 40,
      background: JSON.stringify({
        time: '2025年3月',
        location: '中东地区/国际外交场合',
        socialContext: '美以伊冲突急剧升级，超过6.1万个民用设施受损，平民伤亡惨重。国际社会呼吁停火，但各方立场强硬。联合国安理会召开紧急会议，多个国家展开秘密外交斡旋。'
      }),
      roles: JSON.stringify([
        {
          id: 'role_1',
          name: '艾哈迈德·霍山尼',
          age: 58,
          occupation: '伊朗外交部副部长',
          personality: ['沉稳', '原则性强', '善于谈判'],
          coreGoal: '在维护国家尊严的同时，寻求停火与和平解决方案',
          secret: '他私下认为继续冲突对伊朗不利，但必须在强硬派面前表现出坚定立场',
          initialState: '正在等待与某欧洲大国特使的秘密会晤'
        },
        {
          id: 'role_2',
          name: '莎拉·布莱克伍德',
          age: 45,
          occupation: '联合国人道主义事务协调厅高级官员',
          personality: ['务实', '同情心强', '中立'],
          coreGoal: '促成人道主义停火，确保救援物资进入冲突地区',
          secret: '她收到了一份内部报告，显示实际平民伤亡数字远超官方公布',
          initialState: '正在协调各国捐助者会议，争取紧急援助资金'
        },
        {
          id: 'role_3',
          name: '马克西姆·沃尔科夫',
          age: 52,
          occupation: '俄罗斯外交部中东问题特使',
          personality: ['圆滑', '经验丰富', '利益导向'],
          coreGoal: '利用此次危机扩大俄罗斯在中东的影响力',
          secret: '他已经与伊朗和以色列双方都进行了秘密接触，试图促成俄罗斯主导的谈判',
          initialState: '正在与伊朗代表进行非正式会谈'
        },
        {
          id: 'role_4',
          name: '法蒂玛·哈桑',
          age: 32,
          occupation: '国际媒体记者（出生于伊朗）',
          personality: ['敏锐', '正义感强', '情感丰富'],
          coreGoal: '报道真相，让世界关注平民的苦难',
          secret: '她的家人还在德黑兰，她担心他们的安全，但无法公开表达',
          initialState: '刚刚从德黑兰发回现场报道，正在整理触目惊心的画面'
        },
        {
          id: 'role_5',
          name: '大卫·科恩',
          age: 48,
          occupation: '以色列国防军退役上校/和平组织创始人',
          personality: ['矛盾', '反思型', '勇气'],
          coreGoal: '公开反对军事行动，推动以伊直接对话',
          secret: '他的一些前同僚认为他背叛了国家，他甚至收到了死亡威胁',
          initialState: '正在策划一场要求停火的和平示威活动'
        }
      ]),
      scenes: JSON.stringify([
        {
          id: 'scene_1',
          name: '联合国紧急会议',
          location: '联合国安理会会议厅',
          participants: ['role_1', 'role_2', 'role_3'],
          mood: '紧张、正式、对抗',
          description: '各方代表就停火决议进行激烈辩论。伊朗要求谴责美以的"侵略行为"，西方国家则指责伊朗挑衅在先。'
        },
        {
          id: 'scene_2',
          name: '德黑兰的黎明',
          location: '德黑兰某医院/废墟',
          participants: ['role_2', 'role_4'],
          mood: '悲伤、震撼、人性',
          description: '法蒂玛跟随人道主义工作者进入灾区采访，目睹了战争对平民的残酷影响。'
        },
        {
          id: 'scene_3',
          name: '秘密外交',
          location: '某中立国大使馆',
          participants: ['role_1', 'role_3', 'role_5'],
          mood: '隐秘、试探、希望',
          description: '各方代表进行非正式的秘密接触，探讨停火的可能性。没有媒体，没有正式立场，只有真诚的对话。'
        },
        {
          id: 'scene_4',
          name: '舆论与压力',
          location: '国际媒体中心/社交媒体',
          participants: ['role_2', 'role_4', 'role_5'],
          mood: '公开、对抗性、影响力',
          description: '法蒂玛的深度报道在全球引发关注，和平组织的示威活动也开始获得支持。国际舆论开始转向呼吁停火。'
        },
        {
          id: 'scene_5',
          name: '最后的机会',
          location: '多方视频会议',
          participants: ['role_1', 'role_2', 'role_3', 'role_4', 'role_5'],
          mood: '决定性、紧张、历史性',
          description: '各方在联合国的斡旋下，进行最后的谈判。是继续战争，还是迈出和平的第一步？'
        }
      ]),
      endings: JSON.stringify([
        {
          id: 'end_1',
          name: '人道主义停火',
          triggerCondition: '国际社会压力足够，各方同意暂时停火',
          description: '在巨大的人道主义危机压力下，各方同意72小时停火，允许救援物资进入和人道撤离。虽然这只是暂时的和平，但至少拯救了无数生命。'
        },
        {
          id: 'end_2',
          name: '外交突破',
          triggerCondition: '秘密外交取得进展，各方做出让步',
          description: '在俄罗斯的斡旋下，各方同意坐下来进行正式谈判。战争没有结束，但至少对话的通道打开了。这是漫长和平进程的第一步。'
        },
        {
          id: 'end_3',
          name: '悲剧继续',
          triggerCondition: '各方立场过于强硬，谈判破裂',
          description: '尽管国际社会呼吁停火，但各方都无法在国内政治压力下做出让步。冲突继续升级，更多的平民将为此付出代价。'
        },
        {
          id: 'end_4',
          name: '民间和平力量',
          triggerCondition: '媒体和民间组织的努力改变舆论',
          description: '法蒂玛的报道和大卫的和平运动在全球引发共鸣。民间的压力迫使政治家们采取行动。战争没有立即停止，但和平的种子已经播下。'
        }
      ])
    }
  });

  console.log('剧本创建成功:', script.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
