# 曾见云霞满天 AI Lab

这是一个面向大模型应用开发、AI Agent、RAG 和 AI 工程化方向的个人作品集网站。当前主站用于展示核心项目、项目详情页和本地可交互产品页。

## 当前功能

- 首页作品集展示
- RAG Agent System 项目详情页
- Multi-Agent Data Factory 项目详情页
- RAG Agent 可交互产品页
- Multi-Agent Data Factory 可交互产品页
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
/products/rag-agent                       RAG Agent 可交互产品页
/products/multi-agent-data-factory        Multi-Agent Data Factory 可交互产品页
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

## 前端 API 环境变量

产品页默认使用本地后端地址：

```text
RAG API: http://localhost:8000
Multi-Agent API: http://localhost:8001
```

如需切换本地端口或线上 API，在项目根目录创建 `.env.local`：

```env
NEXT_PUBLIC_RAG_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_MULTI_AGENT_API_BASE_URL=http://localhost:8001
```

线上部署时可以改为：

```env
NEXT_PUBLIC_RAG_API_BASE_URL=https://rag-api.your-domain.com
NEXT_PUBLIC_MULTI_AGENT_API_BASE_URL=https://multi-agent-api.your-domain.com
```

注意：`.env.local` 会被 `.gitignore` 忽略，不要在前端环境变量中放 API Key。带 `NEXT_PUBLIC_` 的变量会暴露给浏览器，只适合放公开的 API 地址。

## 管理员模式

两个产品页都支持轻量管理员模式。页面中的管理员密钥只会作为请求头发送给对应后端，不会提交到 GitHub：

```text
X-Admin-API-Key: <ADMIN_API_KEY>
```

只读模式下，普通访客可以进行检索、问答和单次生成；上传、删除、重建索引、批量任务和数据集版本管理等危险操作会在前端隐藏，并由后端再次校验 `ADMIN_API_KEY`。

部署前请分别在后端 `.env` 中配置：

```env
ADMIN_API_KEY=请替换为足够长的随机字符串
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

## 产品页面与后端接口关系

### RAG Agent 产品页

前端页面：

```text
http://localhost:3000/products/rag-agent
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

### Multi-Agent Data Factory 产品页

前端页面：

```text
http://localhost:3000/products/multi-agent-data-factory
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

Multi-Agent 产品页 支持：

- 三场景生成控制台
- 中文 Agent 角色展示
- 场景模板填充
- 模拟对话查看
- 质量评分查看
- 数据集搜索、筛选、分页
- 按当前筛选条件导出 JSONL
- Persona 池、Persona 表现统计和 Agent 长期记忆展示
- LangGraph 条件路由节点与 Agent Memory 使用情况展示
- 批量生成任务队列提交、进度轮询和任务历史展示
- 数据集版本创建、版本列表、版本导出和版本删除
- 增强质量评估展示：Quality Report、多 Judge 投票、维度诊断和改进建议
- 数据去重与多样性控制展示：duplicate level、content hash、similarity score 和 dataset diversity stats
- 独立 Agent 节点执行轨迹展示
- 每个 Agent 节点的 route_reason 展示

## 本地验收清单

- `http://localhost:3000` 可以打开首页
- 首页项目卡片可以跳转到详情页
- 首页项目卡片可以跳转到 产品页面
- `http://localhost:3000/products/rag-agent` 可以完成 RAG 知识库问答
- `http://localhost:3000/products/multi-agent-data-factory` 可以生成中文 Code Review、客服投诉和技术面试多 Agent 对话
- Multi-Agent 产品页 可以搜索、筛选、翻页和导出 JSONL
- Multi-Agent 产品页 可以展示 LangGraph workflow_engine、workflow_steps 和 agent_trace
- 后端未启动时，产品页面能显示清晰错误提示

## 关联仓库

```text
git@github.com:huaixu0909/personal-ai-homepage.git
git@github.com:huaixu0909/rag-agent-system.git
git@github.com:huaixu0909/multi-agent-data-factory.git
```

## 后续计划

- Multi-Agent Data Factory 接入 Persona Generator
- Multi-Agent Data Factory 强化 Persona 演化策略
- Multi-Agent Data Factory 继续强化 Persona Generator、Prompt 模板管理和数据闭环演化
- RAG 系统继续优化检索质量和引用体验
