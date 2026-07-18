import type { IntegrationFlags } from '../core/config'
import type { Market } from '../core/types'
import { getEnv } from '../core/config'

export interface Verdict { success: boolean; reason: string; mocked: boolean }

const BACKBOARD_API = 'https://app.backboard.io/api/threads/messages'

/** Mock verifier: keyword heuristic (needs "5" + "PR"). */
function mockVerify(evidence: string): Verdict {
  const success = /\b5\b|\bfive\b/i.test(evidence) && /pr/i.test(evidence)
  return { success, reason: success ? 'Goal met per evidence' : 'Goal not met', mocked: true }
}

export function makeVerifier(flags: IntegrationFlags) {
  return {
    async verify(market: Market, evidence: string): Promise<Verdict> {
      if (!flags.backboard) {
        return mockVerify(evidence)
      }

      // LIVE: Backboard verification
      const apiKey = getEnv('VITE_BACKBOARD_API_KEY')

      const prompt = [
        `You are a neutral judge for a commitment market called "Stakes".`,
        `The creator set this goal: "${market.goal}"`,
        `Deadline: ${market.deadlineIso}`,
        ``,
        `The evidence submitted is:`,
        `"${evidence}"`,
        ``,
        `Based on the evidence, did the creator meet the goal?`,
        `Respond ONLY with a JSON object: { "success": true/false, "reason": "one-sentence explanation" }`,
      ].join('\n')

      try {
        const res = await fetch(BACKBOARD_API, {
          method: 'POST',
          headers: {
            'X-API-Key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: prompt,
            llm_provider: 'openai',
            model_name: 'gpt-4o-mini',
          }),
        })

        if (!res.ok) {
          console.warn(`Backboard API error (${res.status}), falling back to mock verifier.`)
          return mockVerify(evidence)
        }

        const data = await res.json()
        const text: string = data.content ?? ''

        // Parse the JSON from the LLM's response (may be wrapped in markdown code fences)
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
          console.warn(`Backboard returned unparseable response, falling back to mock:`, text)
          return mockVerify(evidence)
        }

        const parsed = JSON.parse(jsonMatch[0]) as { success: boolean; reason: string }
        console.log(`🧠 Backboard LLM verification complete:`, parsed)
        return { success: parsed.success, reason: parsed.reason, mocked: false }
      } catch (err) {
        console.warn('Backboard request failed, falling back to mock verifier:', err)
        return mockVerify(evidence)
      }
    },
  }
}
