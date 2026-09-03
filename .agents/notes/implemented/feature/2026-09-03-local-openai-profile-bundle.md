# Agent Note: Local OpenAI-compatible profile bundle

Status: implemented

English | [中文](2026-09-03-local-openai-profile-bundle.zh.md)

## Problem

A user who runs a local OpenAI-compatible model server needs a profile layer that selects that server without changing the default DeepSeek Cloud route for other users. Leaving the base default selected causes a new local deployment to request `deepseek-official` and fail for a missing DeepSeek credential before it reaches the local server.

## Decision

`@deepseek-ai/dsh-local-openai` is an official opt-in bundle layered after `dsh-base`. It replaces the base `llm-pi-ai` row with the named `local-openai` route, an OpenAI chat-completions URL and model that users can replace in their profile patch, and it selects that route through `agent-default-model`. The route references `LOCAL_OPENAI_API_KEY`; `not-needed` is the documented non-secret placeholder for a server that ignores Bearer authentication.

The base bundle remains unchanged. Its `web_search` tool continues to use the DeepSeek search provider and independently needs `DEEPSEEK_API_KEY`; a local-only profile disables `tool-web` when that service is unavailable.

## Alternatives considered

**Changing dsh-base to use a local endpoint.** This would alter the standard DeepSeek Cloud path and make a default installation depend on a local server, so it fails the opt-in requirement.

**Adding a local provider only through the Web Models page.** It leaves headless and other profile users without a runnable known configuration and does not select the local route for their first Agent.

**Removing the credential reference for unauthenticated servers.** pi-ai's OpenAI-compatible client still needs a usable Bearer value; the explicit placeholder makes that requirement visible without treating it as a secret.

## Consequences

- Users add one in-box bundle to a base-backed profile and keep the normal DeepSeek defaults everywhere else.
- Local deployments must choose a server-compatible model id and supply either a real key or the documented placeholder.
- Local chat does not make all model-related features free: model downloads, local compute, electricity, and optional DeepSeek web search remain separate costs.
