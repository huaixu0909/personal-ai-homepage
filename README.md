# 曾见云霞满天 AI Lab

这是一个面向大模型应用开发、AI Agent、RAG 和 AI 工程化方向的个人作品集网站。

当前项目是 `曾见云霞满天 AI Lab` 的统一入口，用来展示个人介绍、核心项目、项目详情页和可交互 Demo 页面。

## 当前功能

- 首页个人介绍
- 核心项目展示区
- 企业知识库 RAG Agent 系统详情页
- JD-简历匹配与学习规划系统详情页
- RAG Agent 可交互 Demo 页面
- JD 简历分析可交互 Demo 页面
- GitHub 仓库跳转入口
- 本地三服务联调

## 技术栈

- Next.js
- TypeScript
- Tailwind CSS
- App Router

## 页面路径

```text
/                              首页
/projects/rag-agent            RAG Agent 项目详情页
/projects/jd-resume-analyzer   JD 简历分析项目详情页
/demos/rag-agent               RAG Agent 可交互 Demo
/demos/jd-resume-analyzer      JD 简历分析可交互 Demo
```

## 本地运行个人主页

```powershell
cd "D:\Code\codex\AI lab\personal-ai-homepage"
npm install
npm.cmd run dev
```

打开浏览器访问：

```text
http://localhost:3000
```

## 完整三服务启动流程

本项目的两个 Demo 页面会调用本地后端服务，因此完整联调时需要同时启动三个服务。

### 1. 启动 RAG 后端

```powershell
cd "D:\Code\codex\AI lab\rag-agent-system"
D:\Download\Coding\CondaData\envs_dirs\llm_env\python.exe -m pip install -r requirements.txt
D:\Download\Coding\CondaData\envs_dirs\llm_env\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

RAG 后端地址：

```text
http://localhost:8000
http://localhost:8000/docs
```

### 2. 启动 JD 分析后端

```powershell
cd "D:\Code\codex\AI lab\jd-resume-analyzer"
D:\Download\Coding\CondaData\envs_dirs\llm_env\python.exe -m pip install -r requirements.txt
D:\Download\Coding\CondaData\envs_dirs\llm_env\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
```

JD 分析后端地址：

```text
http://localhost:8001
http://localhost:8001/docs
```

### 3. 启动个人主页

```powershell
cd "D:\Code\codex\AI lab\personal-ai-homepage"
npm.cmd run dev
```

个人主页地址：

```text
http://localhost:3000
```

## 前端 Demo 与后端接口关系

### RAG Agent Demo

前端页面：

```text
http://localhost:3000/demos/rag-agent
```

调用后端接口：

```text
GET  http://localhost:8000/health
GET  http://localhost:8000/api/documents
GET  http://localhost:8000/api/documents/{document_id}
POST http://localhost:8000/api/documents/upload
DELETE http://localhost:8000/api/documents/{document_id}
POST http://localhost:8000/api/search
POST http://localhost:8000/api/chat
```

当前 RAG Demo 支持上传文档、删除文档、查看结构增强 chunks、展示章节路径/页码/overlap、根据问题检索相关 chunks，以及调用 DeepSeek 基于检索结果生成回答。DeepSeek 不可用时会显示模板回答。

### JD 简历分析 Demo

前端页面：

```text
http://localhost:3000/demos/jd-resume-analyzer
```

调用后端接口：

```text
GET  http://localhost:8001/health
POST http://localhost:8001/api/analyze
```

## 本地验收清单

- `http://localhost:3000` 可以打开首页
- 首页两个项目卡片可以跳转到详情页
- 首页两个项目卡片可以跳转到 Demo 页面
- `http://localhost:3000/demos/rag-agent` 可以上传文档并展示 chunks
- RAG Demo 可以输入问题并展示 top_k 检索结果
- RAG Demo 可以生成基于检索结果的模板回答和 sources
- `http://localhost:3000/demos/jd-resume-analyzer` 可以提交 JD 和简历文本，并展示匹配分数、技能差距和学习计划
- 后端未启动时，Demo 页面能显示清晰错误提示

## 关联仓库

```text
git@github.com:huaixu0909/personal-ai-homepage.git
git@github.com:huaixu0909/rag-agent-system.git
git@github.com:huaixu0909/jd-resume-analyzer.git
```

## 后续计划

- 给 RAG 后端接入真实 embedding 模型
- 给 RAG 后端接入 Qdrant 或 Chroma
- 将检索结果接入真实 RAG Prompt
- 给 JD Demo 接入真实 LLM 结构化分析
- 给 JD 后端增加 PDF 简历解析
- 增加项目截图、文章列表和技术复盘
- 功能较完整后再进行线上部署
