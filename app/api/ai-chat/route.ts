import { createClient } from '@/lib/supabase/server'
import { AI_DISABLED_MESSAGE, GeminiApiError, askGemini, normalizeChatMessages } from '@/lib/ai/gemini'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { messages, context } = body as { messages?: unknown; context?: unknown }
    const normalizedMessages = normalizeChatMessages(messages)

    if (normalizedMessages.length === 0) {
      return new Response(JSON.stringify({ error: 'A message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return new Response(AI_DISABLED_MESSAGE, {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
    }

    const systemPrompt = `You are BloodBridge AI Assistant, a specialized AI for blood donation and blood request matching. Your expertise includes:

1. **Blood Donation Eligibility**: Assess donor eligibility based on health, medications, recent travel, tattoos, and medical history
2. **Blood Type Compatibility**: Provide accurate information about blood type compatibility, universal donors/recipients
3. **Donor Matching Intelligence**: Help find ideal donor-recipient matches considering location, blood type, urgency, and health factors
4. **Health Guidance**: Give practical pre- and post-donation care advice, dietary recommendations, hydration tips
5. **Emergency Response**: Provide calm, actionable guidance for urgent blood requests
6. **Platform Navigation**: Guide users through BloodBridge features, requesting blood, finding donors
7. **Medical Education**: Explain blood banking concepts, transfusion processes, and medical terminology

**Communication Style**:
- Be empathetic and supportive, especially with recipients in critical need
- Provide evidence-based medical information with appropriate disclaimers
- Use clear, non-technical language while maintaining accuracy
- Suggest professional medical consultation for serious concerns
- Acknowledge emotional aspects of blood donation and receiving

${context ? `**User Context**: ${JSON.stringify(context)}` : ''}

Always prioritize user safety and accurate medical information.`

    const text = await askGemini({
      apiKey,
      systemPrompt,
      messages: normalizedMessages,
    })

    return new Response(text, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (error) {
    console.error('[v0] AI Chat error:', error)

    if (error instanceof GeminiApiError) {
      const message =
        error.status === 400 || error.status === 401 || error.status === 403
          ? 'Gemini rejected the API key or model. Check that GEMINI_API_KEY is copied from Google AI Studio and that the key is active.'
          : error.status === 429
            ? 'Gemini quota or rate limit was reached. Please wait a moment and try again.'
            : 'Gemini is temporarily unavailable. Core BloodBridge features still work.'

      return new Response(
        JSON.stringify({
          error: 'Gemini request failed',
          message,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        error: 'Failed to process message',
        message: 'Please try again in a moment.'
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
