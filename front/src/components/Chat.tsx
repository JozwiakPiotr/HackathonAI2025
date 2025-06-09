import { useState, useRef, useEffect } from 'react'
import axios from 'axios'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [selectedModel, setSelectedModel] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Fetch available models when component mounts
    const fetchModels = async () => {
      try {
        const response = await axios.get('http://172.20.3.133:11434/api/tags')
        const models = response.data.models.map((model: any) => model.name)
        setAvailableModels(models)
        if (models.length > 0) {
          setSelectedModel(models[0])
        }
      } catch (error) {
        console.error('Error fetching models:', error)
        alert('Failed to fetch available models. Please make sure Ollama is running.')
      }
    }
    fetchModels()
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !selectedModel) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      console.log('Sending request to Ollama...')
      const response = await axios.post('http://172.20.3.133:11434/api/generate', {
        model: selectedModel,
        prompt: input,
        stream: false
      })

      console.log('Response from Ollama:', response.data)
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.response,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error: any) {
      console.error('Error details:', error)
      alert(error.response?.data?.error || error.message || 'Failed to get response from Ollama')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      width: '100%',
      height: '80vh',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        padding: '1rem',
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          style={{
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid #e2e8f0',
            width: '200px'
          }}
        >
          {availableModels.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem',
        backgroundColor: '#f8fafc'
      }}>
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
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
              {message.content}
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
            placeholder="Type your message..."
            disabled={isLoading || !selectedModel}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #e2e8f0'
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !selectedModel}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#3182ce',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading || !selectedModel ? 'not-allowed' : 'pointer',
              opacity: isLoading || !selectedModel ? 0.7 : 1
            }}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Chat 