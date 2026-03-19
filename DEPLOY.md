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
SECONDME_CLIENT_ID=2c1be8e5-2f64-45b6-ab22-691e15321474
SECONDME_CLIENT_SECRET=30434b5d085cb362146b635f58648718924c9e9d9a7295e95f7d1e4d40895a79
SECONDME_REDIRECT_URI=https://your-app.vercel.app/api/auth/callback
DATABASE_URL=file:./dev.db
KIMI_API_KEY=sk-kimi-cASHa6tbmkk6p9DFEUIiaLuiINOAVZmrPKh7pd6zJaWiaJ9EH8GLFOiLc9la6Qiy
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
