import { NextResponse } from 'next/server';

const MOCK_HOT_LIST = [
  {
    title: "呷哺呷哺五年亏15亿，平价火锅之王为何被年轻人拉黑？",
    body: "呷哺呷哺曾是平价火锅的代名词，但近五年累计亏损15亿。年轻人纷纷表示不再光顾，背后原因包括涨价、服务下降、菜品质量问题等。",
    token: "zhihu_001",
    heat_score: 4040000
  },
  {
    title: "下属总是卡点上下班，作为领导该如何处理？",
    body: "有员工每天准时9点到，6点准时走，从不加班。工作完成质量尚可，但领导觉得这种态度有问题。如何平衡制度与企业文化？",
    token: "zhihu_002",
    heat_score: 2930000
  },
  {
    title: "凉山一单位招人，方圆10公里无人居住，这种工作体验会是什么样？",
    body: "四川凉山州招聘广播电视转播台工作人员，工作地点在海拔3614米的山顶，方圆10公里无人居住。网友热议：社恐人的天选之地？",
    token: "zhihu_003",
    heat_score: 2680000
  },
  {
    title: "38岁男子连续100天每天跑步100公里，身体会怎样？",
    body: "一位38岁男子挑战连续100天每天跑100公里，引发网友关注。医学专家警告可能带来的健康风险，但也有人认为这是意志力的体现。",
    token: "zhihu_004",
    heat_score: 1490000
  },
  {
    title: "188元套餐拍写真最终花费3万，摄影店套路有多深？",
    body: "消费者本想拍个简单写真，结果在摄影师的推销下不断加钱，最终花费3万元。这种消费陷阱如何避免？",
    token: "zhihu_005",
    heat_score: 1330000
  }
];

export async function GET() {
  return NextResponse.json({
    success: true,
    data: MOCK_HOT_LIST,
    mock: true
  });
}
