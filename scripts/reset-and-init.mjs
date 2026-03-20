import { PrismaClient } from '@prisma/client';
import { generateImage } from '../src/lib/image.js';
import { generateScript } from '../src/lib/ai.js';

const prisma = new PrismaClient();

// 8条热榜数据
const hotTopics = [
  {
    token: '2018016098444863053',
    title: '新一代小米 SU7 发布，全系搭载 V6s Plus 超级电机，最高续航达 902km，还有哪些看点？',
    body: '2026新一代SU7春季新品发布会举行。全系搭载V6s Plus超级电机，Max版零百加速3.08s，最高时速265km/h；Pro版CLTC续航902km。全系碳化硅高压平台，Max版最大充电倍率5.2C，10%-80%最快充电时间12分钟。',
    heatScore: 6960000,
    linkUrl: 'https://www.zhihu.com/question/2018016098444863053'
  },
  {
    token: '2017767643180990921',
    title: '长春警方通报路虎一分钟8次别停奔驰致追尾，已立为刑事案件，此前曾认定「无违法事实」，究竟怎么回事？',
    body: '长春市公安局通报：针对"路虎别停奔驰致追尾"一事，已将其立为刑事案件，并依法对路虎车主采取刑事强制措施。当事人在道路畅通情况下，一分钟内连续8次急刹别停，最终追尾。此前警方曾以"没有违法事实"为由终止调查，引发舆论关注后案件重启。',
    heatScore: 5440000,
    linkUrl: 'https://www.zhihu.com/question/2017767643180990921'
  },
  {
    token: '2017932964302954834',
    title: '贾国龙创办人均40-50元砂锅焖面新品牌，称要承接西贝关店与员工，如何看待西贝这次「下沉自救」？',
    body: '西贝餐饮创始人贾国龙推出新品牌"龙面"，主打人均40-50元的砂锅焖面，计划承接西贝部分关店和员工。这是西贝在高端餐饮受挫后向大众市场转型的尝试。',
    heatScore: 2690000,
    linkUrl: 'https://www.zhihu.com/question/2017932964302954834'
  },
  {
    token: '2017898437954281589',
    title: '3月19日沪指跌1.39%险守4000点，油气、绿电板块逆势走强，如何看待今日行情？',
    body: '3月19日A股市场震荡下跌，沪指跌1.39%险守4000点关口。两市超4000只个股下跌，但油气、绿电板块逆势走强。市场对经济数据和政策预期存在分歧。',
    heatScore: 2570000,
    linkUrl: 'https://www.zhihu.com/question/2017898437954281589'
  },
  {
    token: '2017692346066630422',
    title: '美以袭击伊朗进入第20天，当前局势如何？还有哪些信息值得关注？',
    body: '美以对伊朗的军事行动已进入第20天，冲突持续升级。伊朗多次发动导弹反击，地区局势紧张。国际社会呼吁停火，但双方暂无和谈迹象。',
    heatScore: 2350000,
    linkUrl: 'https://www.zhihu.com/question/2017692346066630422'
  },
  {
    token: '2017913786695186154',
    title: '5个月增加1万亿美元，美国国债总额突破历史新高至39万亿美元，对美国经济和全球金融市场有哪些影响？',
    body: '美国国债总额突破39万亿美元，仅5个月就增加1万亿美元。债务规模持续膨胀引发对财政可持续性的担忧，可能影响美元信用和全球金融市场稳定。',
    heatScore: 2130000,
    linkUrl: 'https://www.zhihu.com/question/2017913786695186154'
  },
  {
    token: '2017550373682950542',
    title: '如何看待主播「芜湖大司马」直播带货宣称全网最低价，遭弹幕打脸后，厂商瞬间将该商品全网提价的操作？',
    body: '主播"芜湖大司马"直播带货时宣称某商品为"全网最低价"，被观众弹幕指出其他平台更便宜后，厂商迅速将该商品在全网提价。引发关于直播带货价格欺诈的讨论。',
    heatScore: 1900000,
    linkUrl: 'https://www.zhihu.com/question/2017550373682950542'
  },
  {
    token: '2017879750970929531',
    title: '中国第五大城市群确定，最大特点是「散装」，长江中游凭什么跻身「第五极」？它们的核心优势是什么？',
    body: '长江中游城市群正式获批成为中国第五大城市群，涵盖武汉、长沙、南昌等核心城市。与京津冀、长三角等不同，该城市群呈现多中心"散装"特征，依托长江黄金水道和中部区位优势发展。',
    heatScore: 1670000,
    linkUrl: 'https://www.zhihu.com/question/2017879750970929531'
  }
];

async function clearData() {
  console.log('清空数据...');
  // 按依赖顺序删除
  await prisma.chatMessage.deleteMany({});
  await prisma.roomMember.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.script.deleteMany({});
  console.log('已清空房间、剧本、消息数据');
}

async function createScript(topic) {
  console.log(`生成剧本: ${topic.title.slice(0, 30)}...`);
  
  try {
    // 生成剧本内容
    const scriptData = await generateScript(topic.title, topic.body, []);
    
    if (!scriptData) {
      console.error('剧本生成失败');
      return null;
    }
    
    // 生成封面图
    const imagePrompt = `${topic.title}，剧本杀场景，电影海报风格，戏剧性，视觉冲击力，电影大片，氛围感，oc渲染，光线追踪，质感真实`;
    const coverImage = await generateImage(imagePrompt);
    
    // 保存剧本
    const script = await prisma.script.create({
      data: {
        title: scriptData.title,
        description: scriptData.description,
        sourceEvent: topic.token,
        scriptType: scriptData.scriptType,
        difficulty: scriptData.difficulty,
        duration: 10, // 10分钟游戏时间
        background: JSON.stringify(scriptData.background),
        roles: JSON.stringify(scriptData.roles),
        scenes: JSON.stringify(scriptData.scenes),
        endings: JSON.stringify(scriptData.endings),
        coverImage: coverImage,
      }
    });
    
    console.log(`✅ 剧本创建成功: ${script.title} (ID: ${script.id})`);
    return script;
  } catch (e) {
    console.error('创建剧本失败:', e.message);
    return null;
  }
}

async function main() {
  // 清空数据
  await clearData();
  
  // 为每条热榜生成剧本
  console.log('\n开始生成8个剧本...');
  for (const topic of hotTopics) {
    await createScript(topic);
    // 延迟避免API限流
    await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log('\n全部完成！');
}

main().catch(console.error).finally(() => prisma.$disconnect());
