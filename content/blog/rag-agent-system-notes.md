---
title: "RAG Agent System 工程笔记"
date: "2026-05-25"
description: "梳理 RAG 系统的文档上传、解析、切分、向量化、检索和问答链路。"
tags: ["RAG", "Chroma", "DeepSeek"]
---

RAG Agent System 的目标是把个人或项目文档转成可检索、可追问的知识库。

当前链路包括：

- 文档上传
- TXT / Markdown / PDF 解析
- 文本切分和 chunk 留存
- Chroma 向量库写入
- Qwen Embedding
- DeepSeek 生成回答
- 多轮对话
- 文档摘要和标签
- 异步入库任务队列

生产部署时，危险接口需要管理员密钥：

```text
X-Admin-API-Key: <ADMIN_API_KEY>
```

普通访客可以进行检索和问答，但上传、删除、重建索引等操作会被后端再次校验。这个设计让作品集页面可以公开展示，同时保留基础安全边界。
