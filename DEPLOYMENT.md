# BNC 篮球联赛网站 — SiteGround 部署指南

## 环境变量

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `ADMIN_PASSWORD` | 管理后台密码 | 是 |
| `SESSION_SECRET` | Session 加密密钥（≥32字符） | 是 |
| `DEFAULT_LANG` | 默认语言 | 否 |
| `NEXT_PUBLIC_BASE_URL` | 网站域名 | 是 |
| `YOUTUBE_API_KEY` | YouTube Data API v3 | 推荐 |
| `FACEBOOK_ACCESS_TOKEN` | Facebook Graph API | 否 |
| `FACEBOOK_PAGE_ID` | Facebook 页面 ID | 否 |
| `NODE_ENV` | `production` | 是 |

## 部署步骤

1. 上传项目至 SiteGround
2. Site Tools → Dev → Node.js 创建应用
3. 配置环境变量
4. SSH 执行：

```bash
npm install --production
npm run build
```

5. 启动命令：`npm start`
6. 设置 `public/uploads/` 和 `config.json` 写权限

## 管理后台

- 访问：`https://bncleague.com/admin`
- 仅需输入繁体中文，保存后自动生成简体及英文版本
- 可管理：站点设置、Hero 区、联赛列表、关于我们、SEO

## 故障排除

| 问题 | 解决方案 |
|------|----------|
| YouTube 视频不显示 | 配置 `YOUTUBE_API_KEY` |
| Facebook 贴文不显示 | 使用 Page Plugin 嵌入（默认），或配置 Graph API Token |
| 比赛页面空白 | 检查 ScoreLab URL 是否有效 |
| 管理后台无法保存 | 检查 `config.json` 写权限 |
