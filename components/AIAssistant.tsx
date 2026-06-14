'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

type ChatMessage = { role: string; content: string }

function formatInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>
    }

    return <span key={index}>{part}</span>
  })
}

function FormattedMessage({ content }: { content: string }) {
  const lines = content
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {lines.map((line, index) => {
        const heading = line.match(/^#{1,4}\s+(.+)$/)
        if (heading) {
          return (
            <p key={index} className="font-semibold text-gray-950">
              {formatInline(heading[1])}
            </p>
          )
        }

        const bullet = line.match(/^[-*]\s+(.+)$/)
        if (bullet) {
          return (
            <p key={index} className="pl-3 text-gray-900">
              <span className="mr-2 text-red-600">•</span>
              {formatInline(bullet[1])}
            </p>
          )
        }

        const numbered = line.match(/^(\d+)\.\s+(.+)$/)
        if (numbered) {
          return (
            <p key={index} className="pl-3 text-gray-900">
              <span className="mr-2 font-semibold text-red-600">{numbered[1]}.</span>
              {formatInline(numbered[2])}
            </p>
          )
        }

        return <p key={index}>{formatInline(line)}</p>
      })}
    </div>
  )
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        const assistantMessage = {
          role: 'assistant',
          content: error.message || 'Gemini is temporarily unavailable. Core BloodBridge features still work.',
        }
        setMessages(prev => [...prev, assistantMessage])
        return
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullMessage = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          fullMessage += decoder.decode(value, { stream: true })
        }
      }

      const assistantMessage = { 
        role: 'assistant', 
        content: fullMessage || 'I\'m ready to help. Ask me anything about blood donation, eligibility, or blood types!' 
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage = { 
        role: 'assistant', 
        content: error instanceof Error ? error.message : 'I encountered a temporary issue. Please try again in a moment.'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Chat Button */}
      <div className="fixed bottom-6 right-6 z-[90]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-all duration-200 hover:-translate-y-1 hover:scale-110 hover:bg-red-700 hover:shadow-xl"
          aria-label="Open AI Assistant"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[90] flex max-h-[min(620px,calc(100vh-8rem))] w-[min(440px,calc(100vw-2rem))] flex-col rounded-lg border border-gray-200 bg-white shadow-2xl bb-scale-in">
          {/* Header */}
          <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold">BloodBridge Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-md text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 hover:opacity-90"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-8">
                <p className="font-medium">Hello! I&apos;m BloodBridge AI</p>
                <p className="text-xs mt-2">Ask me about blood donation, eligibility, or blood types</p>
              </div>
            )}
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[82%] overflow-hidden break-words px-3 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-red-600 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-900 rounded-bl-none'
                  }`}
                >
                  {message.role === 'user' ? (
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  ) : (
                    <FormattedMessage content={message.content} />
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 px-3 py-2 rounded-lg rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-lg">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
