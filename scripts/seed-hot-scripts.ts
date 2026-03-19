import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const scripts = [
  {
    title: "山顶孤岗",
    description: "凉山招聘广播站工作人员，方圆10公里无人居住。五位应聘者各怀心事，在面试中展开关于孤独、逃避与坚守的对话。",
    sourceEvent: "zhihu_mountain_job",
    scriptType: "社会/职场/人生选择",
    difficulty: 3,
    duration: 25,
    background: {
      time: "2026年3月，招聘面试现场",
      location: "凉山州人事局会议室",
      socialContext: "海拔3614米山顶岗位，方圆10公里无人居住，值班一周休息一周"
    },
    roles: [
      {
        id: "role_1",
        name: "林晨",
        age: 28,
        occupation: "前互联网程序员",
        personality: ["社恐", "逃避主义", "技术宅"],
        coreGoal: "逃离内卷的职场环境，寻找内心平静",
        secret: "因职场PUA患上焦虑症，医生建议换环境",
        initialState: "表面平静，内心渴望逃离人群"
      },
      {
        id: "role_2",
        name: "王建国",
        age: 45,
        occupation: "退伍军人",
        personality: ["坚韧", "责任感", "沉默寡言"],
        coreGoal: "为女儿攒学费，需要稳定工作",
        secret: "妻子重病需要长期治疗，家里负债累累",
        initialState: "眼神坚定，但透露出生活的重压"
      },
      {
        id: "role_3",
        name: "张雨欣",
        age: 24,
        occupation: "应届毕业生",
        personality: ["理想主义", "文艺", "敏感"],
        coreGoal: "寻找创作灵感，体验极致孤独",
        secret: "想写小说但一直没勇气，希望用孤独逼自己创作",
        initialState: "眼中闪烁着对未知的憧憬"
      },
      {
        id: "role_4",
        name: "赵主任",
        age: 52,
        occupation: "招聘负责人",
        personality: ["务实", "直接", "有同情心"],
        coreGoal: "找到真正能坚持的人，不想再有人干两个月就跑",
        secret: "上一任员工在山上待了三个月后精神崩溃，至今心有余悸",
        initialState: "严肃审视每个应聘者，试图看透他们的真实动机"
      },
      {
        id: "role_5",
        name: "李峰",
        age: 35,
        occupation: "失业中年人",
        personality: ["焦虑", "好面子", "不甘心"],
        coreGoal: "找份工作维持生计，不想被家人看不起",
        secret: "其实很害怕孤独，但已经失业半年找不到工作",
        initialState: "强装镇定，但眼神闪躲"
      }
    ],
    scenes: [
      {
        id: "scene_1",
        name: "面试开场",
        location: "会议室",
        description: "赵主任介绍岗位真实情况，应聘者们开始意识到这份工作的特殊性",
        mood: "严肃、试探",
        keyEvents: ["岗位条件公布", "应聘者反应各异", "第一轮自我介绍"]
      },
      {
        id: "scene_2",
        name: "动机拷问",
        location: "会议室",
        description: "赵主任追问每个人为什么要来，真实动机开始浮现",
        mood: "紧张、压迫",
        keyEvents: ["林晨的社恐暴露", "王建国提到家庭", "张雨欣的理想主义"]
      },
      {
        id: "scene_3",
        name: "前任警示",
        location: "会议室",
        description: "赵主任讲述上一任员工的故事，气氛凝重",
        mood: "沉重、犹豫",
        keyEvents: ["精神崩溃案例", "应聘者开始动摇", "李峰的焦虑爆发"]
      },
      {
        id: "scene_4",
        name: "真相时刻",
        location: "会议室",
        description: "应聘者们坦露真实想法，互相质疑对方能否坚持",
        mood: "激烈、真诚",
        keyEvents: ["秘密逐渐揭露", "价值观碰撞", "选择的代价"]
      },
      {
        id: "scene_5",
        name: "最终抉择",
        location: "会议室",
        description: "赵主任宣布只招一人，应聘者做出最终决定",
        mood: "决绝、释然",
        keyEvents: ["最后陈述", "有人退出", "录取结果"]
      }
    ],
    endings: [
      {
        id: "ending_1",
        name: "逃离者的救赎",
        description: "林晨被录取，在山顶找到了内心的平静，半年后写出了技术博客，重新找回自信",
        condition: "林晨坦诚社恐问题，获得理解",
        impact: "positive"
      },
      {
        id: "ending_2",
        name: "负重者的坚守",
        description: "王建国被录取，用三倍工资支撑起家庭，但长期分离让他错过了妻子最后的时光",
        condition: "王建国展现责任感，但隐瞒妻子病情",
        impact: "bittersweet"
      },
      {
        id: "ending_3",
        name: "理想的破灭",
        description: "张雨欣被录取，但三个月后发现孤独并不浪漫，小说一个字没写，最终辞职",
        condition: "张雨欣的理想主义打动面试官",
        impact: "negative"
      },
      {
        id: "ending_4",
        name: "无人录取",
        description: "赵主任看穿所有人的动机都不纯，决定重新招聘。应聘者们各自离开，继续寻找出路",
        condition: "所有人的秘密被揭穿，无人真正适合",
        impact: "neutral"
      }
    ]
  }
];

async function seed() {
  for (const script of scripts) {
    await prisma.script.create({
      data: {
        ...script,
        background: JSON.stringify(script.background),
        roles: JSON.stringify(script.roles),
        scenes: JSON.stringify(script.scenes),
        endings: JSON.stringify(script.endings),
      }
    });
    console.log(`Created: ${script.title}`);
  }
}

seed().then(() => process.exit(0));
