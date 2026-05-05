# Datapilot — Vercel 部署手册

## 部署步骤

### 1. 上传到 GitHub

1. 打开 https://github.com/new 创建新仓库
   - Repository name: `datapilot-demo`
   - 设为 **Public**(免费版需要)
   - 点 "Create repository"

2. 在新仓库页,点 **"uploading an existing file"** 链接

3. 把这个文件夹里的**所有文件**(除了 node_modules)拖进去

4. 滑到底部点 **"Commit changes"**

### 2. 在 Vercel 部署

1. 打开 https://vercel.com/new
2. 找到刚才的 `datapilot-demo` 仓库,点 **"Import"**
3. **重要:** 配置环境变量
   - Name: `DEEPSEEK_API_KEY`
   - Value: `sk-8ec8c591393b4e96a7c024702d11ae35`
4. 点 **"Deploy"**
5. 等 1-2 分钟,看到 "Congratulations" 后点击域名访问

### 3. 完成

你会得到一个 `https://datapilot-demo-xxx.vercel.app` 的 URL,可以直接分享。

## 本地开发(可选)

```bash
npm install
npm run dev
```

然后打开 http://localhost:3000

注意:本地开发时,要让 /api/chat 代理生效,推荐用 `vercel dev`(需要先 `npm i -g vercel`)。
