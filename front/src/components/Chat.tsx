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
  const [documents, setDocuments] = useState<string[]>([])
  const [showOptions, setShowOptions] = useState(false);
  const [selected, setSelected] = useState('wybierz dokument');
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const toggleDropdown = () => setShowOptions(!showOptions);

  const handleSelect = (option: string) => {
    setSelected(option);
    setShowOptions(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const Dropdown = () => {
    return (
      <div style={{ position: 'relative', display: 'inline-block', width: '200px' }}>
        <button
          onClick={toggleDropdown}
          style={{
            padding: '8px 12px',
            fontSize: '16px',
            cursor: 'pointer',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            width: '100%',
            textAlign: 'left'
          }}
        >
          {selected} ⬆
        </button>
  
        {showOptions && (
          <div
            style={{
              position: 'absolute',
              bottom: '100%', 
              left: 0,
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '4px',
              marginBottom: '4px',
              width: '100%',
              maxHeight: '150px',
              overflowY: 'auto',
              zIndex: 100
            }}
          >
            {documents.map((doc) => (
              <div
                key={doc}
                onClick={() => handleSelect(doc)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee'
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = '#f0f0f0')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = 'white')
                }
              >
                {doc}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const fetchDocuments = async () => {
    try {
      const response = await axios.get('http://172.20.3.133:8000/document_list/')
      const docs: string[] = response.data.documents || []
      docs.unshift("wybierz dokument")
      setDocuments(docs)
    } catch (error: any) {
      console.error('Error fetching documents:', error)
    } finally {
    }
  }

  useEffect(() => {
    scrollToBottom(),
    fetchDocuments()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      let url = `http://172.20.3.133:8000/query?query=${encodeURIComponent(input)}`
      if(selected != 'wybierz dokument'){
        url += `&file=${encodeURIComponent(selected)}`
      }
      const response = await axios.post(url)

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.response
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error: any) {
      console.error('Error sending message:', error)
      setError(error.response?.data?.detail || error.message || 'Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 150px)',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      margin: '10px'
    }}>
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '70%',
              padding: '0.75rem 1rem',
              backgroundColor: message.role === 'user' ? '#2b6cb0' : '#f7fafc',
              color: message.role === 'user' ? 'white' : '#2d3748',
              borderRadius: '8px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            {message.content}
          </div>
        ))}
        {isLoading && (
          <div style={{
            alignSelf: 'flex-start',
            padding: '0.75rem 1rem',
            backgroundColor: '#f7fafc',
            color: '#2d3748',
            borderRadius: '8px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}>
            Thinking...
          </div>
        )}
        {error && (
          <div style={{
            alignSelf: 'center',
            padding: '0.75rem 1rem',
            backgroundColor: '#fed7d7',
            color: '#c53030',
            borderRadius: '8px',
            margin: '0.5rem 0'
          }}>
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          padding: '1rem',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          gap: '0.5rem'
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '0.5rem',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            fontSize: '1rem'
          }}
        />
        <Dropdown />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: isLoading || !input.trim() ? '#cbd5e0' : '#2b6cb0',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer'
          }}
        >
          Send
        </button>
      </form>
    </div>
  )
}

export default Chat 