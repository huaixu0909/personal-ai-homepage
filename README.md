# Yunhao AI Lab

这是一个面向大模型应用开发、AI Agent、RAG 和 AI 工程化方向的个人作品集网站。

当前项目是整个 `Yunhao AI Lab` 的统一入口，用来展示个人介绍、核心项目、项目详情页，以及后续的 Demo、文章和技术实验。

## 当前功能

- 首页个人介绍
- 核心项目展示区
- 企业知识库 RAG Agent 系统详情页
- JD-简历匹配与学习规划系统详情页
- 本地 Demo 跳转入口
- GitHub 仓库跳转入口

## 技术栈

- Next.js
- TypeScript
- Tailwind CSS
- App Router

## 本地运行

```powershell
cd "D:\Code\codex\AI lab\personal-ai-homepage"
npm install
npm.cmd run dev
```

打开浏览器访问：

```text
http://localhost:3000
```

## 页面路径

```text
/                              首页
/projects/rag-agent            RAG Agent 项目详情页
/projects/jd-resume-analyzer   JD 简历分析项目详情页
```

## 关联项目

### rag-agent-system

企业知识库 RAG Agent 系统最小原型。

本地服务地址：

```text
http://localhost:8000
```

GitHub 仓库：

```text
git@github.com:huaixu0909/rag-agent-system.git
```

### jd-resume-analyzer

JD-简历匹配与学习规划系统最小原型。

本地服务地址：

```text
http://localhost:8001
```

GitHub 仓库：

```text
git@github.com:huaixu0909/jd-resume-analyzer.git
```

## 本地联调

建议同时启动三个服务：

```text
personal-ai-homepage  http://localhost:3000
rag-agent-system      http://localhost:8000
jd-resume-analyzer    http://localhost:8001
```

从首页点击两个项目的“本地 Demo”，应分别跳转到对应后端服务。

## 后续计划

- 增加项目截图和 Demo 页面
- 增加文章列表和 Markdown/MDX 内容渲染
- 将后端 JSON 首页升级为可交互 Demo 页面
- 完成三个项目的本地联调
- 功能完善后再部署到线上

