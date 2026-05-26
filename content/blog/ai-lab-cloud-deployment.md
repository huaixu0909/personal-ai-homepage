---
title: "AI Lab 从本地到阿里云部署记录"
date: "2026-05-26"
description: "记录个人 AI Lab 三服务从本地 Docker Compose 联调到阿里云轻量应用服务器上线的完整路径。"
tags: ["部署", "Docker", "阿里云"]
---

这次部署把三个独立项目放到同一台阿里云轻量应用服务器上：

- Next.js 个人主页
- RAG FastAPI 后端
- Multi-Agent FastAPI 后端

本地阶段先用 Docker Compose 完成三服务联调，确认前端页面、RAG 上传问答、多 Agent 生成流程都能正常工作。云上阶段使用 Nginx 做统一入口，对外只开放 80 和 443，三个应用端口都绑定在 `127.0.0.1`。

当前公网 IP 版已经可以访问：

```text
http://120.79.155.224
```

后续如果接入正式域名，会把 API 从路径代理切换为子域名：

```text
https://rag-api.example.com
https://multi-agent-api.example.com
```

这套流程的重点不是一次性把所有云服务都接上，而是先建立一个能持续迭代的部署闭环：本地开发、GitHub 推送、服务器拉取、Docker 重建、线上验证。
