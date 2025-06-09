import { useState, useRef, useEffect } from 'react'
import axios from 'axios'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string,
  sources: string[]
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleString(),
      sources: []
    }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      console.log('Sending query to API...')
      const response = await axios.post(`http://172.20.3.133:8000/query/?query=${encodeURIComponent(input)}`)

      console.log('Response:', response.data)
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.response || response.data.answer || 'No response received',
        timestamp: new Date().toLocaleString(),
        sources: response.data.sources || 'No sources provided'
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error: any) {
      console.error('Error details:', error)
      setError(error.response?.data?.detail?.[0]?.msg || error.message || 'Failed to get response')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      height: '80vh',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      margin: '10px 10px 10px 10px'
    }}>
      <div style={{
        padding: '1rem',
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <h2 style={{ margin: 0, color: '#2d3748' }}>Document Q&A Chat</h2>
      </div>
      
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem',
        backgroundColor: '#f8fafc'
      }}>
        {error && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#fed7d7',
            color: '#c53030',
            borderRadius: '4px',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}
        
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '1rem'
            }}
          >
            <div
              style={{
                maxWidth: '70%',
                backgroundColor: message.role === 'user' ? '#3182ce' : 'white',
                color: message.role === 'user' ? 'white' : 'black',
                padding: '0.75rem',
                borderRadius: '8px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
              <div style={{ 
                fontSize: '0.75rem', 
                color: message.role === 'user' ? 'rgba(255,255,255,0.8)' : '#718096',
                marginTop: '0.5rem'
              }}>
                {message.timestamp}
              </div>
              <div style={{ 
                fontSize: '0.75rem', 
                color: message.role === 'user' ? 'rgba(255,255,255,0.8)' : '#718096',
                marginTop: '0.5rem'
              }}>
                {message.sources.join(', ')}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={{
        padding: '1rem',
        backgroundColor: 'white',
        borderTop: '1px solid #e2e8f0'
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your documents..."
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '4px',
              border: '1px solid #e2e8f0',
              fontSize: '1rem'
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3182ce',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
              opacity: isLoading || !input.trim() ? 0.7 : 1,
              fontSize: '1rem'
            }}
          >
            {isLoading ? 'Thinking...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Chat 