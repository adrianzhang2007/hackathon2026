import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 基于知乎热榜的剧本数据
const seedScripts = [
  {
    title: '「35岁危机」：一个互联网人的最后挣扎',
    description: '互联网大厂裁员潮下，35岁的技术总监面临失业危机。房贷、孩子教育、家庭开支的压力同时袭来，他该妥协接受降职，还是冒险创业？',
    sourceEvent: '35岁互联网裁员',
    scriptType: '现实题材',
    difficulty: 3,
    duration: 60,
    background: JSON.stringify({
      time: '2024年深秋',
      location: '北京中关村某互联网公司',
      socialContext: '互联网行业进入寒冬期，大厂纷纷裁员降本增效。35岁以上员工成为重灾区，职场的年龄歧视愈发严重。'
    }),
    roles: JSON.stringify([
      {
        id: 'role_1',
        name: '陈远',
        age: 35,
        occupation: '技术总监',
        personality: ['稳重', '责任心强', '不善言辞', '固执'],
        coreGoal: '保住工作或找到新出路，维持家庭生计',
        secret: '半年前投资失败，欠下50万债务',
        initialState: '刚收到HR约谈通知，心情沉重'
      },
      {
        id: 'role_2',
        name: '林小雨',
        age: 28,
        occupation: 'HR经理',
        personality: ['理性', '专业', '内心纠结', '有同理心'],
        coreGoal: '完成裁员指标，同时尽量减少对员工的伤害',
        secret: '自己也是外包身份，随时可能被裁',
        initialState: '准备与陈远进行艰难的裁员谈判'
      },
      {
        id: 'role_3',
        name: '张副总',
        age: 42,
        occupation: '公司副总裁',
        personality: ['圆滑', '利益至上', '表面和善', '冷酷'],
        coreGoal: '完成董事会下达的降本目标',
        secret: '计划把自己的人安插进技术部门',
        initialState: '观察谈判进程，准备最后拍板'
      },
      {
        id: 'role_4',
        name: '王阿姨',
        age: 52,
        occupation: '保洁员',
        personality: ['善良', '八卦', '热心肠', '看透世事'],
        coreGoal: '照顾好在大城市打拼的儿子',
        secret: '知道很多公司内幕消息',
        initialState: '在茶水间打扫卫生，听到了风声'
      }
    ]),
    scenes: JSON.stringify([
      {
        id: 'scene_1',
        name: '会议室的谈判',
        location: '公司会议室',
        participants: ['陈远', '林小雨', '张副总'],
        mood: '紧张压抑',
        description: '陈远被叫到会议室，面对HR和副总，他知道这一天终于来了。'
      },
      {
        id: 'scene_2',
        name: '茶水间的真相',
        location: '公司茶水间',
        participants: ['陈远', '王阿姨'],
        mood: '温馨又心酸',
        description: '王阿姨悄悄告诉陈远一些内幕，让他对局势有了新的认识。'
      },
      {
        id: 'scene_3',
        name: '最后的选择',
        location: '公司天台',
        participants: ['陈远', '林小雨'],
        mood: '开放式结局',
        description: '陈远需要做出最后的选择：接受N+1离职，还是接受降职转岗？'
      }
    ]),
    endings: JSON.stringify([
      {
        id: 'ending_1',
        name: '硬气离职',
        triggerCondition: '陈远选择拿赔偿走人',
        description: '陈远选择有尊严地离开，用赔偿金还债后，决定回老家创业开民宿，虽然收入不稳定，但找到了生活的平衡。'
      },
      {
        id: 'ending_2',
        name: '隐忍留下',
        triggerCondition: '陈远选择接受降职',
        description: '陈远选择降职为普通开发，薪资减半但至少保住了工作。他开始偷偷面试新公司，却发现35岁的程序员在就业市场上举步维艰。'
      },
      {
        id: 'ending_3',
        name: '内部创业',
        triggerCondition: '说服张副总支持他的新项目',
        description: '陈远提出一个降本增效的技术方案，成功说服副总让他负责内部创业项目，虽然风险很大，但获得了翻身的机会。'
      }
    ]),
    coverImage: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80'
  },
  {
    title: '算法囚徒：外卖骑手的生死时速',
    description: '一个外卖骑手在算法压榨下艰难求生，一次意外车祸让他陷入道德困境：是如实上报延误被罚款，还是隐瞒真相继续奔波？',
    sourceEvent: '外卖骑手困在系统里',
    scriptType: '现实题材',
    difficulty: 2,
    duration: 45,
    background: JSON.stringify({
      time: '2024年夏',
      location: '上海某繁华商圈',
      socialContext: '外卖平台算法越来越严苛，骑手们为了准时送达不得不闯红灯、逆行，交通事故频发。'
    }),
    roles: JSON.stringify([
      {
        id: 'role_1',
        name: '老刘',
        age: 38,
        occupation: '外卖骑手',
        personality: ['勤劳', '老实', '乐观', '有担当'],
        coreGoal: '多赚点钱供女儿上大学',
        secret: '腿伤已经持续半年，一直强撑着没去看',
        initialState: '刚出完车祸，餐洒了一地，超时已成定局'
      },
      {
        id: 'role_2',
        name: '小美',
        age: 24,
        occupation: '平台算法运营',
        personality: ['聪明', '有野心', '理性至上', '逐渐觉醒'],
        coreGoal: '优化配送效率，完成KPI',
        secret: '她知道算法设置的时间其实根本达不到',
        initialState: '正在分析骑手数据，发现老刘今天异常'
      },
      {
        id: 'role_3',
        name: '王姐',
        age: 45,
        occupation: '餐厅老板娘',
        personality: ['热心', '泼辣', '正义感强', '嘴硬心软'],
        coreGoal: '维护骑手权益，同时保住自己的生意',
        secret: '和平台区域经理有不正当交易',
        initialState: '看到老刘受伤，内心纠结要不要帮他'
      },
      {
        id: 'role_4',
        name: '小李',
        age: 22,
        occupation: '实习记者',
        personality: ['热血', '理想主义', '冲动', '执着'],
        coreGoal: '揭露外卖平台黑幕，完成大新闻',
        secret: '家境优渥，其实并不理解真正的底层生活',
        initialState: '正在商圈做暗访调查'
      }
    ]),
    scenes: JSON.stringify([
      {
        id: 'scene_1',
        name: '车祸现场',
        location: '十字路口',
        participants: ['老刘', '小李'],
        mood: '紧张混乱',
        description: '老刘为了赶时间闯红灯被车撞倒，小李恰好路过目睹了全过程。'
      },
      {
        id: 'scene_2',
        name: '商家的抉择',
        location: '小吃店',
        participants: ['老刘', '王姐'],
        mood: '温情脉脉',
        description: '老刘一瘸一拐地来取餐，王姐发现他的伤，内心挣扎要不要帮他作假。'
      },
      {
        id: 'scene_3',
        name: '算法的背后',
        location: '写字楼',
        participants: ['小美', '小李'],
        mood: '对峙',
        description: '小李以曝光相威胁，要求小美透露算法内幕，小美面临职业良心与道德的选择。'
      }
    ]),
    endings: JSON.stringify([
      {
        id: 'ending_1',
        name: '沉默的代价',
        triggerCondition: '老刘选择隐瞒伤情继续工作',
        description: '老刘忍痛完成配送，腿伤恶化最终导致无法继续骑手工作，但他用攒下的钱让女儿顺利上了大学。'
      },
      {
        id: 'ending_2',
        name: '揭露真相',
        triggerCondition: '三方联手曝光',
        description: '老刘、小美、小李联手向媒体曝光，引发社会广泛关注，平台被迫修改算法，但老刘也因此被平台拉黑，失去了收入来源。'
      },
      {
        id: 'ending_3',
        name: '转行重生',
        triggerCondition: '接受王姐的帮助',
        description: '王姐帮老刘在她的店里打工，虽然收入少了但安稳。老刘开始学习厨艺，准备将来自己开店。'
      }
    ]),
    coverImage: 'https://images.unsplash.com/photo-1526304640152-d4619684e484?w=800&q=80'
  },
  {
    title: '学区房困局：中产家庭的赌博',
    description: '为了孩子能上好学校，一对夫妻押上全部积蓄购买老破小学区房。就在成交前夕，学区政策突然调整，他们的人生规划瞬间崩塌。',
    sourceEvent: '学区房政策突变',
    scriptType: '现实题材',
    difficulty: 3,
    duration: 75,
    background: JSON.stringify({
      time: '2024年春',
      location: '北京某学区房小区',
      socialContext: '教育资源分配不均导致学区房价格畸高，但政策频繁调整让买房者如履薄冰。'
    }),
    roles: JSON.stringify([
      {
        id: 'role_1',
        name: '赵明',
        age: 36,
        occupation: '银行职员',
        personality: ['谨慎', '顾家', '优柔寡断', '爱面子'],
        coreGoal: '给孩子最好的教育',
        secret: '背着妻子偷偷炒股亏了20万',
        initialState: '刚签下购房合同，等待过户'
      },
      {
        id: 'role_2',
        name: '孙丽',
        age: 34,
        occupation: '小学教师',
        personality: ['强势', '好强', '控制欲强', '深爱孩子'],
        coreGoal: '让孩子赢在起跑线',
        secret: '她当初就是靠学区房改变命运，所以对学区房有执念',
        initialState: '正在研究学区政策，为入学做准备'
      },
      {
        id: 'role_3',
        name: '老周',
        age: 58,
        occupation: '房产中介',
        personality: ['油滑', '见多识广', '嘴甜心黑', '有底线'],
        coreGoal: '促成交易拿佣金',
        secret: '早就听说学区要调整，但选择隐瞒',
        initialState: '努力安抚焦虑的买家'
      },
      {
        id: 'role_4',
        name: '陈校长',
        age: 52,
        occupation: '重点小学校长',
        personality: ['睿智', '正直', '理想主义', '身不由己'],
        coreGoal: '推动教育公平，同时保住学校声誉',
        secret: '这次学区调整是他提议的',
        initialState: '面对媒体采访，回应学区调整'
      }
    ]),
    scenes: JSON.stringify([
      {
        id: 'scene_1',
        name: '政策突变',
        location: '赵明家',
        participants: ['赵明', '孙丽'],
        mood: '震惊绝望',
        description: '新闻发布：该小区被划出学区范围，赵明夫妻的世界瞬间崩塌。'
      },
      {
        id: 'scene_2',
        name: '追责谈判',
        location: '中介门店',
        participants: ['赵明', '孙丽', '老周'],
        mood: '剑拔弩张',
        description: '夫妻俩要求退房，老周却拿出了合同条款，指出政策风险已明确告知。'
      },
      {
        id: 'scene_3',
        name: '寻求公道',
        location: '教育局门口',
        participants: ['孙丽', '陈校长'],
        mood: '理性对话',
        description: '孙丽堵到陈校长，要求给个说法，却听到了关于教育公平的另一套逻辑。'
      }
    ]),
    endings: JSON.stringify([
      {
        id: 'ending_1',
        name: '割肉止损',
        triggerCondition: '选择低价转手',
        description: '夫妻俩认赔把房低价转手，亏损80万。但这次经历让他们重新审视教育的意义，决定不再鸡娃。'
      },
      {
        id: 'ending_2',
        name: '硬扛到底',
        triggerCondition: '坚持维权',
        description: '他们联合其他业主起诉教育局，虽然官司赢了，但孩子已经错过了入学时间，学区房也变成了普通房。'
      },
      {
        id: 'ending_3',
        name: '随遇而安',
        triggerCondition: '接受现实转学',
        description: '他们选择入住新房，让孩子上普通学校。意外的是孩子在普通学校表现优异，他们也开始反思焦虑教育的弊端。'
      }
    ]),
    coverImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80'
  }
];

async function main() {
  console.log('开始插入种子剧本...');
  
  for (const script of seedScripts) {
    const existing = await prisma.script.findFirst({
      where: { title: script.title }
    });
    
    if (!existing) {
      await prisma.script.create({
        data: script
      });
      console.log(`✅ 已创建剧本: ${script.title}`);
    } else {
      console.log(`⏭️  剧本已存在: ${script.title}`);
    }
  }
  
  console.log('\n种子数据插入完成！');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
