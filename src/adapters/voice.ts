import type { IntegrationFlags } from '../core/config'

export function commissionerLine(pot: number, backCount: number, fadeCount: number, daysLeft: number): string {
  return `${fadeCount} doubters against you, ${backCount} backing you. The pot's at $${pot}. ${daysLeft} days left.`
}

export function makeVoice(flags: IntegrationFlags) {
  return {
    async line(text: string) {
      if (!flags.elevenlabs) return { audioUrl: '/commissioner.mp3', text, mocked: true }
      // LIVE: ElevenLabs TTS -> audio blob url
      throw new Error('live ElevenLabs not wired in this build')
    },
  }
}
