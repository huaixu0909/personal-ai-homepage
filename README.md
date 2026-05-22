# 曾见云霞满天 AI Lab

这是一个面向大模型应用开发、AI Agent、RAG 和 AI 工程化方向的个人作品集网站。当前主站用于展示核心项目、项目详情页和本地可交互 Demo。

## 当前功能

- 首页作品集展示
- RAG Agent System 项目详情页
- Multi-Agent Data Factory 项目详情页
- RAG Agent 可交互 Demo
- Multi-Agent Data Factory 可交互 Demo
- GitHub 仓库跳转入口
- 本地多服务联调

## 技术栈

- Next.js
- TypeScript
- Tailwind CSS
- App Router

## 页面路径

```text
/                                      首页
/projects/rag-agent                    RAG Agent 项目详情页
/projects/multi-agent-data-factory     Multi-Agent Data Factory 项目详情页
/demos/rag-agent                       RAG Agent 可交互 Demo
/demos/multi-agent-data-factory        Multi-Agent Data Factory 可交互 Demo
```

## 本地运行主页

```powershell
cd "D:\Code\codex\AI lab\personal-ai-homepage"
npm install
npm.cmd run dev
```

打开：

```text
http://localhost:3000
```

## 完整服务启动流程

### 1. 启动 RAG 后端

```powershell
cd "D:\Code\codex\AI lab\rag-agent-system"
D:\Download\Coding\CondaData\envs_dirs\llm_env\python.exe -m pip install -r requirements.txt
D:\Download\Coding\CondaData\envs_dirs\llm_env\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

地址：

```text
http://localhost:8000
http://localhost:8000/docs
```

### 2. 启动 Multi-Agent Data Factory 后端

```powershell
cd "D:\Code\codex\AI lab\multi-agent-data-factory"
D:\Download\Coding\CondaData\envs_dirs\llm_env\python.exe -m pip install -r requirements.txt
D:\Download\Coding\CondaData\envs_dirs\llm_env\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
```

地址：

```text
http://localhost:8001
http://localhost:8001/docs
http://localhost:8001/api/scenarios
```

如需启用 DeepSeek 真实 LLM 生成，请在 `multi-agent-data-factory/.env` 中配置：

```env
DEEPSEEK_API_KEY=你的_deepseek_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-v4-flash
```

### 3. 启动个人主页

```powershell
cd "D:\Code\codex\AI lab\personal-ai-homepage"
npm.cmd run dev
```

地址：

```text
http://localhost:3000
```

## Demo 与后端接口关系

### RAG Agent Demo

前端页面：

```text
http://localhost:3000/demos/rag-agent
```

主要后端接口：

```text
GET    http://localhost:8000/health
GET    http://localhost:8000/api/documents
GET    http://localhost:8000/api/documents/{document_id}
POST   http://localhost:8000/api/documents/upload/batch
PATCH  http://localhost:8000/api/documents/{document_id}/tags
DELETE http://localhost:8000/api/documents/{document_id}
POST   http://localhost:8000/api/search
POST   http://localhost:8000/api/chat
```

### Multi-Agent Data Factory Demo

前端页面：

```text
http://localhost:3000/demos/multi-agent-data-factory
```

主要后端接口：

```text
GET  http://localhost:8001/health
GET  http://localhost:8001/api/scenarios
POST http://localhost:8001/api/simulations/code-review
POST http://localhost:8001/api/simulations/customer-complaint
POST http://localhost:8001/api/simulations/technical-interview
GET  http://localhost:8001/api/conversations
GET  http://localhost:8001/api/conversations/{conversation_id}
GET  http://localhost:8001/api/datasets/export.jsonl
GET  http://localhost:8001/api/personas
```

Multi-Agent Demo 支持：

- 三场景生成控制台
- 中文 Agent 角色展示
- 场景模板填充
- 模拟对话查看
- 质量评分查看
- 数据集搜索、筛选、分页
- 按当前筛选条件导出 JSONL
- Persona 池、Persona 表现统计和最近记忆展示
- LangGraph 工作流节点展示
- 独立 Agent 节点执行轨迹展示

## 本地验收清单

- `http://localhost:3000` 可以打开首页
- 首页项目卡片可以跳转到详情页
- 首页项目卡片可以跳转到 Demo 页面
- `http://localhost:3000/demos/rag-agent` 可以完成 RAG 知识库问答
- `http://localhost:3000/demos/multi-agent-data-factory` 可以生成中文 Code Review、客服投诉和技术面试多 Agent 对话
- Multi-Agent Demo 可以搜索、筛选、翻页和导出 JSONL
- Multi-Agent Demo 可以展示 LangGraph workflow_engine、workflow_steps 和 agent_trace
- 后端未启动时，Demo 页面能显示清晰错误提示

## 关联仓库

```text
git@github.com:huaixu0909/personal-ai-homepage.git
git@github.com:huaixu0909/rag-agent-system.git
git@github.com:huaixu0909/multi-agent-data-factory.git
```

## 后续计划

- Multi-Agent Data Factory 接入 Persona Generator
- Multi-Agent Data Factory 强化 Persona 演化策略
- Multi-Agent Data Factory 强化 LangGraph 条件路由和更细粒度 Agent 节点
- Multi-Agent Data Factory 增加数据集版本管理
- RAG 系统继续优化检索质量和引用体验
