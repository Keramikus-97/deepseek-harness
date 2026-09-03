# Agent Note: Local OpenAI-compatible profile bundle

Status: implemented

[English](2026-09-03-local-openai-profile-bundle.md) | 中文

## Problem

运行本地 OpenAI 兼容模型服务器的用户需要一个 profile 层，以便选择该服务器而不改变其他用户的默认 DeepSeek Cloud 路由。保留 base 默认选择会使新的本地部署请求 `deepseek-official`，并在到达本地服务器前因缺少 DeepSeek 凭据而失败。

## Decision

`@deepseek-ai/dsh-local-openai` 是在 `dsh-base` 之后分层的官方可选 bundle。它将 base 的 `llm-pi-ai` 行替换为命名的 `local-openai` 路由、可在 profile patch 中替换的 OpenAI chat-completions URL 和模型，并通过 `agent-default-model` 选择该路由。该路由引用 `LOCAL_OPENAI_API_KEY`；对于忽略 Bearer 认证的服务器，`not-needed` 是已记录的非秘密占位符。

Base bundle 保持不变。其 `web_search` 工具继续使用 DeepSeek 搜索提供方，并独立需要 `DEEPSEEK_API_KEY`；本地专用 profile 在该服务不可用时禁用 `tool-web`。

## Alternatives considered

**将 dsh-base 改为使用本地端点。** 这会改变标准 DeepSeek Cloud 路径，并使默认安装依赖本地服务器，因此不符合可选要求。

**只通过 Web Models 页面添加本地 provider。** 它使 headless 和其他 profile 用户没有可运行的已知配置，也不会为其第一个 Agent 选择本地路由。

**为无认证服务器移除凭据引用。** pi-ai 的 OpenAI 兼容客户端仍需要可用的 Bearer 值；显式占位符使该要求可见，而不把它当作秘密。

## Consequences

- 用户向 base-backed profile 添加一个内置 bundle，并在其他位置保留正常的 DeepSeek 默认值。
- 本地部署必须选择服务器兼容的模型 id，并提供真实 key 或已记录的占位符。
- 本地聊天不会让所有模型相关功能免费：模型下载、本地计算、电力和可选 DeepSeek web search 仍是独立成本。
