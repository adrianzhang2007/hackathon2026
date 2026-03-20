# Vercel 部署指南

## 快速部署步骤

### 1. 安装 Vercel CLI
```bash
npm i -g vercel
```

### 2. 登录 Vercel
```bash
vercel login
```

### 3. 部署项目
```bash
cd /home/teammate/hackathon
vercel --prod
```

### 4. 配置环境变量

在 Vercel Dashboard 添加以下环境变量：

```
SECONDME_CLIENT_ID=your_secondme_client_id
SECONDME_CLIENT_SECRET=your_secondme_client_secret
SECONDME_REDIRECT_URI=https://your-app.vercel.app/api/auth/callback
DATABASE_URL=file:./dev.db
KIMI_API_KEY=your_kimi_api_key
```

### 5. 更新 SecondMe 回调地址

访问 https://develop.second.me/
添加生产环境回调地址：
```
https://your-app.vercel.app/api/auth/callback
```

## 提交材料

- **GitHub**: 推送代码到 GitHub
- **作品链接**: https://your-app.vercel.app
- **视频**: 录制 2-3 分钟演示
