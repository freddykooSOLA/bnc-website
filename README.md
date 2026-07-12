# BNC 篮球联赛官方网站

BNC Basketball League 官方网站的 Next.js 实现，支持三语（繁体中文、简体中文、英文）、ScoreLab 数据、YouTube/Facebook 动态内容、管理后台。

## 快速开始

```bash
npm install
cp .env.local.example .env.local
# 编辑 .env.local 设置环境变量
npm run dev
```

访问：
- 前台：http://localhost:3000/zh-hk
- 管理后台：http://localhost:3000/admin

## 功能

- **三语支持**：`/zh-hk/`、`/zh-cn/`、`/en/`，根据浏览器语言自动跳转
- **首页动态**：联赛选择器（积分榜/赛果/赛程）、YouTube 最新 6 条视频、Facebook 动态
- **比赛页面**：iframe 嵌入 ScoreLab 赛季页面
- **关于我们**：联络信息 + Google 地图
- **管理后台**：仅输入繁体中文，自动转简体及英文
- **SEO**：sitemap、robots.txt、Open Graph、hreflang、JSON-LD

## 环境变量

| 变量 | 说明 |
|------|------|
| `ADMIN_PASSWORD` | 管理后台密码 |
| `SESSION_SECRET` | Session 加密密钥（≥32字符） |
| `YOUTUBE_API_KEY` | YouTube Data API v3 密钥 |
| `FACEBOOK_ACCESS_TOKEN` | Facebook Graph API（可选） |
| `NEXT_PUBLIC_BASE_URL` | 网站域名 |

## 部署

详见 [DEPLOYMENT.md](./DEPLOYMENT.md)
