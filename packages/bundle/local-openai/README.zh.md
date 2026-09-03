---
description: "为 dsh profile 提供本地 OpenAI 兼容模型服务器设置的可选层，并选择本地默认模型。"
kind: "package-bundle"
---

# @deepseek-ai/dsh-local-openai

[English](README.md) | 中文

## Summary

`dsh-local-openai` 将已有的 base-backed profile 变为本地 OpenAI 兼容服务器的可选客户端。它添加名为 `local-openai` 的提供方，地址为 `http://127.0.0.1:8000/v1`，并为新 Agent 选择 `Qwen/Qwen3-8B`。在 profile 的应用 bundle 之后安装它；未安装此层时，标准 DeepSeek Cloud profile 保持不变。服务器必须实现 OpenAI chat completions。

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Further Exploration](#further-exploration)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

-----

<a id="use-this-package"></a>
## Use this package

### Install into a headless profile

创建随附的一次性 profile，添加此内置 bundle，然后设置 OpenAI 兼容客户端需要的占位 key；即使本地服务器忽略认证也需要它：

```sh
dsh --profile headless --help
dsh plugin --profile headless add @deepseek-ai/dsh-local-openai
export LOCAL_OPENAI_API_KEY=not-needed
dsh --profile headless "Say hello."
```

`dsh plugin` 在 base 和 headless 层之后添加 bundle，因此它的两个按 id 定位的 patch 会替换 base 的 `llm-pi-ai` 和 `agent-default-model` 配置。对其他 base-backed profile 使用同一 add 命令。移除 bundle 可恢复该 profile 的 DeepSeek 默认值：

```sh
dsh plugin --profile headless remove @deepseek-ai/dsh-local-openai
```

### Change the server or model

本地路由是普通的 `llm-pi-ai` 配置。在 profile 的 `cordis.patch.yml` 中覆盖完整的 provider 行和默认模型行；将示例模型 id 换成服务器实际提供的值：

```yaml
- id: llm-pi-ai
  config:
    providers:
      local-openai:
        displayName: Local OpenAI-compatible server
        apiKeyEnv: LOCAL_OPENAI_API_KEY
        api: openai-completions
        baseURL: http://127.0.0.1:8000/v1
        models:
          - id: your-local-model

- id: agent-default-model
  config:
    provider: local-openai
    model: your-local-model
```

对于无认证服务器，`LOCAL_OPENAI_API_KEY=not-needed` 是已记录的非秘密占位符。不要在 patch 中写入真实凭据；请使用环境变量或受管理的凭据存储。

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals — click to expand</summary>

静态 patch 将休眠的 `llm-pi-ai` 行替换为命名的 OpenAI-completions 本地路由，并替换 base Agent 默认值。提供方适配器拥有请求序列化和凭据查找；此 bundle 只拥有 profile 层默认值。

| File | Role |
|---|---|
| [`cordis.patch.yml`](cordis.patch.yml) | 本地 provider 和默认选择 patch 行。 |
| [`src/index.ts`](src/index.ts) | 没有运行时 API 的包入口。 |
| [`tests/local-openai.spec.ts`](tests/local-openai.spec.ts) | Patch 解析、路由/默认选择和占位 key 行为。 |

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

- [Bundle package map](../README.zh.md) — 安装中可用的 profile 层。
- [Provider guide](../../../docs/user/guide/providers.zh.md) — 本地服务器设置和 settings。
- [Generated configuration catalog](../../../docs/config-catalog.zh.md#deepseek-aidsh-llm-pi-ai) — 完整 `llm-pi-ai` 配置。

-----

<a id="model-experience"></a>
## Model Experience

通过 `dsh-llm-pi-ai` 间接生效。此 bundle 改变新 Agent 选择的 provider 和模型；适配器拥有请求内容和模型响应。

#### KV Cache effect

此 bundle 不添加提示内容或请求前缀字段。

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

- **OpenAI chat completions only** — 配置的路由使用 `openai-completions`；请选择兼容的服务器和模型。
- **A placeholder key is still required** — pi-ai 发送 Bearer 值；服务器没有认证时设置已记录的非秘密值。
- **Base web search remains a DeepSeek service** — 它独立于本地聊天路由而需要 `DEEPSEEK_API_KEY`。本地专用 profile 没有该 key 时请禁用 `tool-web`。
- **Patch settings replace whole configuration** — 更改 URL 或模型时，请重述 provider 行中的每个字段。

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

None.

</details>
