---
title: "Multi-Agent Data Factory 设计笔记"
date: "2026-05-24"
description: "记录多 Agent 数据合成系统的场景、角色、质量评分和数据集版本设计。"
tags: ["Agent", "数据合成", "LangGraph"]
---

Multi-Agent Data Factory 用于生成高质量中文训练对话数据。

当前支持三个场景：

- Code Review
- 客服投诉
- 技术面试

系统不只是简单调用一次 LLM，而是把场景、角色、记忆、质量评分和数据集版本管理拆成可演进模块。这样做的好处是后续可以逐步增加 persona 生成器、质量评估器和多样性控制策略。

目前的重点能力包括：

- LangGraph 多 Agent workflow
- 条件路由
- 长期记忆
- 批量生成任务队列
- 数据集版本管理
- 数据去重与多样性控制

这个项目更像一个“数据生产工作台”，目标不是只生成一次 demo，而是沉淀一套可持续扩展的数据合成流程。
