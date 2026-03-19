import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const scripts = [
  {
    title: "套路陷阱",
    description: "188元写真套餐最终花费3万。摄影师、销售、顾客、店长在退款纠纷中各执一词。",
    sourceEvent: "zhihu_photo_trap",
    scriptType: "消费/维权",
    difficulty: 2,
    duration: 20,
    background: JSON.stringify({ time: "2026年3月", location: "调解室", socialContext: "退款纠纷" }),
    roles: JSON.stringify([
      { id: "role_1", name: "李娜", age: 26, occupation: "消费者", personality: ["冲动"], coreGoal: "要回3万", secret: "其实很多照片自己满意", initialState: "愤怒" },
      { id: "role_2", name: "老张", age: 38, occupation: "摄影师", personality: ["专业"], coreGoal: "证明没强迫", secret: "销售压力大", initialState: "委屈" },
      { id: "role_3", name: "小王", age: 24, occupation: "销售", personality: ["能说"], coreGoal: "保业绩", secret: "话术是培训的", initialState: "自信" },
      { id: "role_4", name: "陈姐", age: 42, occupation: "店长", personality: ["圆滑"], coreGoal: "保声誉", secret: "从不退款", initialState: "和气" },
      { id: "role_5", name: "调解员", age: 50, occupation: "消协", personality: ["公正"], coreGoal: "找方案", secret: "见多了", initialState: "冷静" }
    ]),
    scenes: JSON.stringify([
      { id: "scene_1", name: "投诉", location: "调解室", description: "李娜讲述", mood: "愤怒", keyEvents: ["188变3万"] },
      { id: "scene_2", name: "辩解", location: "调解室", description: "商家解释", mood: "对峙", keyEvents: ["出示合同"] },
      { id: "scene_3", name: "交锋", location: "调解室", description: "证据", mood: "紧张", keyEvents: ["录音曝光"] },
      { id: "scene_4", name: "追责", location: "调解室", description: "责任", mood: "混乱", keyEvents: ["话术违规"] },
      { id: "scene_5", name: "方案", location: "调解室", description: "处理", mood: "妥协", keyEvents: ["退款方案"] }
    ]),
    endings: JSON.stringify([
      { id: "ending_1", name: "部分退款", description: "退1.5万", condition: "各让一步", impact: "neutral" },
      { id: "ending_2", name: "全额退款", description: "全退并整改", condition: "证据确凿", impact: "positive" },
      { id: "ending_3", name: "失败", description: "起诉", condition: "不妥协", impact: "negative" },
      { id: "ending_4", name: "反转", description: "撤诉", condition: "坦白", impact: "bittersweet" }
    ])
  },
  {
    title: "Token时代",
    description: "腾讯阿里发AI Token。技术、HR、管理层对AI态度不同。",
    sourceEvent: "zhihu_ai_token",
    scriptType: "科技/职场",
    difficulty: 3,
    duration: 25,
    background: JSON.stringify({ time: "2026年3月", location: "会议室", socialContext: "AI Token政策讨论" }),
    roles: JSON.stringify([
      { id: "role_1", name: "张工", age: 32, occupation: "工程师", personality: ["技术派"], coreGoal: "推AI", secret: "偷用半年", initialState: "兴奋" },
      { id: "role_2", name: "老李", age: 45, occupation: "程序员", personality: ["保守"], coreGoal: "反对", secret: "学不会", initialState: "焦虑" },
      { id: "role_3", name: "王姐", age: 38, occupation: "HR", personality: ["现实"], coreGoal: "控成本", secret: "准备裁员", initialState: "中立" },
      { id: "role_4", name: "陈总", age: 40, occupation: "CTO", personality: ["激进"], coreGoal: "推AI", secret: "要替代岗位", initialState: "期待" },
      { id: "role_5", name: "小刘", age: 23, occupation: "初级", personality: ["迷茫"], coreGoal: "搞清影响", secret: "一直在用", initialState: "观望" }
    ]),
    scenes: JSON.stringify([
      { id: "scene_1", name: "宣布", location: "会议室", description: "政策", mood: "惊讶", keyEvents: ["Token介绍"] },
      { id: "scene_2", name: "效率", location: "会议室", description: "争论", mood: "对立", keyEvents: ["数据对比"] },
      { id: "scene_3", name: "危机", location: "会议室", description: "裁员", mood: "恐慌", keyEvents: ["裁员暗示"] },
      { id: "scene_4", name: "揭露", location: "会议室", description: "坦白", mood: "真诚", keyEvents: ["承认偷用"] },
      { id: "scene_5", name: "抉择", location: "会议室", description: "决定", mood: "决断", keyEvents: ["政策落地"] }
    ]),
    endings: JSON.stringify([
      { id: "ending_1", name: "拥抱", description: "培训提效", condition: "共识", impact: "positive" },
      { id: "ending_2", name: "分化", description: "边缘化", condition: "强推", impact: "negative" },
      { id: "ending_3", name: "观望", description: "暂缓", condition: "犹豫", impact: "neutral" },
      { id: "ending_4", name: "和解", description: "互帮互助", condition: "年轻人帮忙", impact: "positive" }
    ])
  }
];

async function seed() {
  for (const script of scripts) {
    await prisma.script.create({ data: script });
    console.log(`Created: ${script.title}`);
  }
}

seed().then(() => process.exit(0));
