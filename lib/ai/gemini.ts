const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash'

export const AI_DISABLED_MESSAGE =
  'AI assistant is currently disabled. Core BloodBridge features still work.'

export interface ChatMessage {
  role: string
  content?: string
  parts?: Array<{ text?: string }>
}

export class GeminiApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'GeminiApiError'
    this.status = status
  }
}

export function normalizeChatMessages(messages: unknown): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
  if (!Array.isArray(messages)) return []

  return messages
    .map((msg: ChatMessage) => {
      const content = msg.content || msg.parts?.map((part) => part.text || '').join('') || ''
      return {
        role: msg.role === 'assistant' ? 'model' as const : 'user' as const,
        parts: [{ text: content.trim() }],
      }
    })
    .filter((msg) => msg.parts[0].text.length > 0)
}

export async function askGemini(input: {
  apiKey: string
  systemPrompt: string
  messages: ReturnType<typeof normalizeChatMessages>
}) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': input.apiKey,
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: input.systemPrompt }],
        },
        contents: input.messages,
        generationConfig: {
          temperature: 0.4,
          topP: 0.9,
          maxOutputTokens: 800,
        },
      }),
    }
  )

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    const message =
      errorBody?.error?.message ||
      `Gemini request failed with status ${response.status}`
    throw new GeminiApiError(response.status, message)
  }

  const result = await response.json()
  return (
    result?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text)
      .filter(Boolean)
      .join('') ||
    'I am ready to help. Ask me anything about blood donation, eligibility, or blood types!'
  )
}
