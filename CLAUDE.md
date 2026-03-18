# SecondMe 集成项目 - 知乎热榜剧本杀

## 应用信息

- **App Name**: 知乎热榜剧本杀
- **Client ID**: 2c1be8e5-***

## API 文档

开发时请参考官方文档：

| 文档 | 链接 |
|------|------|
| 快速入门 | https://develop-docs.second.me/zh/docs |
| OAuth2 认证 | https://develop-docs.second.me/zh/docs/authentication/oauth2 |
| API 参考 | https://develop-docs.second.me/zh/docs/api-reference/secondme |
| 错误码 | https://develop-docs.second.me/zh/docs/errors |

## 关键信息

- API 基础 URL: `https://api.mindverse.com/gate/lab`
- OAuth 授权 URL: `https://go.second.me/oauth/`
- Access Token 有效期: 2 小时
- Refresh Token 有效期: 30 天

## 已选模块

| 模块 | 说明 |
|------|------|
| auth | OAuth 认证（登录/登出/回调） |
| profile | 用户信息显示（兴趣标签、软记忆） |
| chat | 与 SecondMe AI 聊天 |
| note | 向 SecondMe 添加笔记 |

## 权限列表 (Scopes)

| 权限 | 说明 | 状态 |
|------|------|------|
| `user.info` | 用户基础信息 | ✅ 已授权 |
| `user.info.shades` | 用户兴趣标签 | ✅ 已授权 |
| `user.info.softmemory` | 软记忆数据 | ✅ 已授权 |
| `chat` | 聊天功能 | ✅ 已授权 |
| `note.add` | 添加笔记 | ✅ 已授权 |
| `voice` | 语音 | ✅ 已授权 |

> ⚠️ 所有 API 端点配置请参考 `.secondme/state.json` 中的 `api` 和 `docs` 字段
