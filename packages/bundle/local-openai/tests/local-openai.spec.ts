/** Profile-patch coverage for the local OpenAI-compatible route. */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import * as yaml from 'js-yaml'
import { entryListSchema } from '@deepseek-ai/cordis-plugin-include'
import { Config } from '@deepseek-ai/dsh-llm-pi-ai'
import type { PiAiProviderProfile } from '@deepseek-ai/dsh-llm-pi-ai'

describe('dsh-local-openai bundle', () => {
  it('boots a named local route and selects it for new Agents', () => {
    const root = fileURLToPath(new URL('..', import.meta.url))
    const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as {
      dsh?: { bundle?: { patch?: string } }
    }
    expect(manifest.dsh?.bundle?.patch).toBe('./cordis.patch.yml')
    const patches = yaml.load(readFileSync(resolve(root, manifest.dsh!.bundle!.patch!), 'utf8'), {
      schema: entryListSchema,
    }) as Array<{ id: string; config: Record<string, unknown> }>
    const provider = (patches.find(patch => patch.id === 'llm-pi-ai')?.config.providers as Record<string, PiAiProviderProfile>)['local-openai']
    expect(provider).toMatchObject({
      displayName: 'Local OpenAI-compatible server',
      apiKeyEnv: 'LOCAL_OPENAI_API_KEY',
      api: 'openai-completions',
      baseURL: 'http://127.0.0.1:8000/v1',
      models: [{ id: 'Qwen/Qwen3-8B' }],
    })
    expect(patches.find(patch => patch.id === 'agent-default-model')?.config).toEqual({
      provider: 'local-openai', model: 'Qwen/Qwen3-8B',
    })
    expect(new Config({ providers: { 'local-openai': provider } })).toMatchObject({
      providers: { 'local-openai': { apiKeyEnv: 'LOCAL_OPENAI_API_KEY' } },
    })
  })

  it('keeps the placeholder credential explicit: missing fails and a non-empty placeholder is usable', async () => {
    const { assertUsableApiKey } = await import('@deepseek-ai/dsh-llm')
    expect(() => assertUsableApiKey('', 'llm-pi-ai', 'LOCAL_OPENAI_API_KEY')).toThrow('LOCAL_OPENAI_API_KEY is blank')
    expect(() => assertUsableApiKey('not-needed', 'llm-pi-ai', 'LOCAL_OPENAI_API_KEY')).not.toThrow()
  })
})
