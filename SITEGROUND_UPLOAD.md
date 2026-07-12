# SiteGround 上傳說明

## 套件內容
- 完整源代碼（不含 node_modules、.next、密碼文件）
- `config.json` 網站配置
- `public/uploads/` Logo、Favicon、Hero 圖片
- `.env.production.example` 環境變量範例

## 上傳步驟

### 1. 上傳文件
將本資料夾內**所有文件**上傳至 SiteGround 網站根目錄（例如 `public_html` 或 Node.js 應用目錄）。

可用方式：
- Site Tools → **File Manager** 上傳並解壓 ZIP
- Site Tools → **Git** 部署
- FTP / SFTP 上傳

### 2. 設置環境變量
Site Tools → **Dev → Node.js** → 你的應用 → **Environment Variables**

| 變量 | 值（請自行填寫） |
|------|----------------|
| `NODE_ENV` | `production` |
| `ADMIN_PASSWORD` | 你的管理員密碼 |
| `SESSION_SECRET` | 至少 32 字符的隨機字串 |
| `NEXT_PUBLIC_BASE_URL` | `https://bncleague.com` |
| `DEFAULT_LANG` | `zh-hk` |
| `YOUTUBE_API_KEY` | （可選） |
| `YOUTUBE_CHANNEL_ID` | `UCeAfUfcP8r1wrRvgnQmljZA` |

**切勿**將 `.env.local` 上傳到公開目錄。

### 3. SSH 安裝與構建
```bash
cd ~/www/bncleague.com/public_html   # 改為你的實際路徑
npm install
npm run build
```

### 4. 啟動應用
Node.js 面板設置：
- **Startup file**: `node_modules/next/dist/bin/next`
- **Start command**: `npm start`
- 或：`npx next start -p $PORT`

### 5. 文件權限
```bash
chmod 755 public/uploads
chmod 644 config.json
# 若後台無法保存，改為可寫：
chmod 666 config.json
```

### 6. SSL
Site Tools → Security → SSL Manager → 啟用免費 SSL

### 7. 驗證
- 前台：https://bncleague.com/zh-hk
- 後台：https://bncleague.com/admin
- 比賽頁：https://bncleague.com/zh-hk/matches

## 更新網站
```bash
# 上傳新文件後
npm install
npm run build
# Node.js 面板點 Restart
```

## 聯絡
技術問題可參考項目內 `DEPLOYMENT.md` 和 `README.md`
