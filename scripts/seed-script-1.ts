import { prisma } from '../src/lib/prisma';

async function main() {
  const script = await prisma.script.create({
    data: {
      title: '二选一的代价',
      description: '永辉超市公开喊话山姆，质疑供应商"二选一"。在零售行业激烈竞争的背后，是供应商的艰难抉择、法律的灰色地带，以及各方利益的博弈。',
      sourceEvent: '永辉超市自有品牌喊话山姆，称不要让供应商「二选一」',
      scriptType: '现实/商业/伦理',
      difficulty: 3,
      duration: 30,
      background: JSON.stringify({
        time: '2025年3月',
        location: '中国零售行业',
        socialContext: '零售行业竞争白热化，会员店模式兴起，供应商资源成为兵家必争之地。"二选一"在行业内部是潜规则，但近年来反垄断监管趋严。'
      }),
      roles: JSON.stringify([
        {
          id: 'role_1',
          name: '林振宇',
          age: 45,
          occupation: '永辉超市自有品牌"品质永辉"负责人',
          personality: ['果决', '理想主义', '善于舆论战'],
          coreGoal: '打破山姆的供应商垄断，为永辉争取公平的竞争环境',
          secret: '其实永辉去年也曾强制供应商降价15%，他对此心知肚明',
          initialState: '正在起草那封引发轩然大波的公开信'
        },
        {
          id: 'role_2',
          name: '张伟明',
          age: 48,
          occupation: '山姆会员店采购总监',
          personality: ['强势', '务实', '防守型'],
          coreGoal: '维护山姆的供应链优势，不让永辉挖走核心供应商',
          secret: '确实曾对部分供应商暗示过" exclusivity "，但从没留下书面证据',
          initialState: '刚收到永辉的公开信，正在召开紧急会议'
        },
        {
          id: 'role_3',
          name: '王德发',
          age: 52,
          occupation: '某食品品牌创始人/供应商老板',
          personality: ['圆滑', '求生欲强', '两边都不想得罪'],
          coreGoal: '保住两边的订单，不让工厂倒闭',
          secret: '工厂的产能其实足够供应两家，但不敢说出来',
          initialState: '刚刚同时收到永辉和山姆的"约谈"邀请'
        },
        {
          id: 'role_4',
          name: '李雯',
          age: 38,
          occupation: '反垄断法专家/高校教授',
          personality: ['理性', '犀利', '喜欢戳破伪善'],
          coreGoal: '借这个案例推动行业对反垄断法的认知',
          secret: '她认为两边都不干净，这只是行业乱象的冰山一角',
          initialState: '正在被媒体追问对这个事件的看法'
        },
        {
          id: 'role_5',
          name: '赵晓晓',
          age: 28,
          occupation: '财经媒体记者',
          personality: ['敏锐', '追问型', '略带理想主义'],
          coreGoal: '挖出事件背后的真相，写一篇深度报道',
          secret: '她收到了一个内部人士的匿名爆料，但还没核实',
          initialState: '正在联系各方安排采访'
        }
      ]),
      scenes: JSON.stringify([
        {
          id: 'scene_1',
          name: '风暴前夕',
          location: '永辉总部会议室',
          participants: ['role_1', 'role_5'],
          mood: '紧张、谋划',
          description: '林振宇正在和团队讨论是否要发布那封公开信。他知道这封信一旦发出，将引发行业震动。'
        },
        {
          id: 'scene_2',
          name: '公开信发布',
          location: '舆论场/社交媒体',
          participants: ['role_1', 'role_2', 'role_5'],
          mood: '激烈、对峙',
          description: '公开信发布后在社交媒体引发热议。山姆方面紧急应对，媒体开始跟进。'
        },
        {
          id: 'scene_3',
          name: '供应商的抉择',
          location: '王德发的工厂办公室',
          participants: ['role_1', 'role_2', 'role_3'],
          mood: '压抑、艰难',
          description: '王德发同时面对两边的压力。他必须做出选择，或者找到一个两全其美的办法。'
        },
        {
          id: 'scene_4',
          name: '舆论与真相',
          location: '媒体采访现场/专家解读',
          participants: ['role_2', 'role_4', 'role_5'],
          mood: '理性、剖析',
          description: '李雯作为专家接受采访，犀利地指出了问题的本质。而赵晓晓的独家报道也即将发布。'
        },
        {
          id: 'scene_5',
          name: '终局',
          location: '各方博弈的结果显现',
          participants: ['role_1', 'role_2', 'role_3', 'role_4', 'role_5'],
          mood: '复杂、余波',
          description: '各方的选择最终导致了一个结局。但这个行业的故事，远未结束。'
        }
      ]),
      endings: JSON.stringify([
        {
          id: 'end_1',
          name: '监管之剑落下',
          triggerCondition: '舆论发酵到一定程度，监管部门介入调查',
          description: '市监局宣布对零售行业展开反垄断调查。永辉和山姆都被约谈。虽然短期内两败俱伤，但行业规则开始透明化。王德发们终于不用再做选择题。'
        },
        {
          id: 'end_2',
          name: '站队与站队',
          triggerCondition: '供应商被迫做出选择，舆论战没有结果',
          description: '王德发最终选择继续和山姆合作，放弃了永辉的订单。更多供应商被迫站队。行业形成了更明显的阵营对立，而小玩家逐渐被淘汰。'
        },
        {
          id: 'end_3',
          name: '体面的和解',
          triggerCondition: '双方高层私下沟通，达成某种默契',
          description: '公开信事件后，林振宇和张伟明在一场行业峰会上握手言和。双方承诺"公平竞争"。虽然没有实质性改变，但至少表面上风平浪静。'
        },
        {
          id: 'end_4',
          name: '搅局者的胜利',
          triggerCondition: '赵晓晓的独家报道引发更大震动',
          description: '赵晓晓的深扒报道揭露了更多行业内幕，包括永辉自己的"反向二选一"。舆论反转，消费者开始质疑所有大平台的道德高地。这场闹剧没有赢家。'
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
