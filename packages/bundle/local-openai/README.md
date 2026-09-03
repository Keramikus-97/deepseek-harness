---
description: "Opt-in local OpenAI-compatible model-server settings for a dsh profile, including a selected local default model."
kind: "package-bundle"
---

# @deepseek-ai/dsh-local-openai

English | [中文](README.zh.md)

## Summary

`dsh-local-openai` turns an existing base-backed profile into an opt-in client for a local OpenAI-compatible server. It adds one clearly named `local-openai` provider at `http://127.0.0.1:8000/v1` and selects `Qwen/Qwen3-8B` for newly created Agents. Install it after the profile's application bundle; the standard DeepSeek Cloud profiles remain unchanged until you add this layer. The server must implement OpenAI chat completions.

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

Create the shipped one-shot profile, add this in-box bundle, then set the placeholder key required by the OpenAI-compatible client even when your server ignores authentication:

```sh
dsh --profile headless --help
dsh plugin --profile headless add @deepseek-ai/dsh-local-openai
export LOCAL_OPENAI_API_KEY=not-needed
dsh --profile headless "Say hello."
```

`dsh plugin` adds the bundle after the base and headless layers, so its two id-targeted patches replace the base `llm-pi-ai` and `agent-default-model` configurations. Use the same add command with another base-backed profile. Remove the bundle to restore that profile's DeepSeek default:

```sh
dsh plugin --profile headless remove @deepseek-ai/dsh-local-openai
```

### Change the server or model

The local route is deliberately ordinary `llm-pi-ai` configuration. Override the complete provider row and default-model row in the profile's `cordis.patch.yml`; replace the example model id with one your server serves:

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

For an unauthenticated server, `LOCAL_OPENAI_API_KEY=not-needed` is a documented non-secret placeholder. Do not put a real credential in the patch; use the environment or the managed credentials store.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals — click to expand</summary>

The static patch replaces the dormant `llm-pi-ai` row with a named custom OpenAI-completions route and replaces the base agent default. The provider adapter owns request serialization and credential lookup; this bundle owns only profile-layer defaults.

| File | Role |
|---|---|
| [`cordis.patch.yml`](cordis.patch.yml) | Local provider and selected-default patch rows. |
| [`src/index.ts`](src/index.ts) | Package entry with no runtime API. |
| [`tests/local-openai.spec.ts`](tests/local-openai.spec.ts) | Patch parsing, route/default selection, and placeholder-key behavior. |

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

- [Bundle package map](../README.md) — profile layers available in the installation.
- [Provider guide](../../../docs/user/guide/providers.md) — local-server setup and settings.
- [Generated configuration catalog](../../../docs/config-catalog.md#deepseek-aidsh-llm-pi-ai) — complete `llm-pi-ai` configuration.

-----

<a id="model-experience"></a>
## Model Experience

Indirectly, through `dsh-llm-pi-ai`. This bundle changes the provider and model selected for a new Agent; the adapter owns request content and model responses.

#### KV Cache effect

The bundle adds no prompt content or request-prefix fields.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

- **OpenAI chat completions only** — the configured route uses `openai-completions`; choose a compatible server and model.
- **A placeholder key is still required** — pi-ai sends a Bearer value; set the documented non-secret value when the server has no authentication.
- **Base web search remains a DeepSeek service** — it needs `DEEPSEEK_API_KEY` independently of the local chat route. Disable `tool-web` in a local-only profile when you do not have that key.
- **Patch settings replace whole configuration** — restate every field in the provider row when changing its URL or model.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

None.

</details>
