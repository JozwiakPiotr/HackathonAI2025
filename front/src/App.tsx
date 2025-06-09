import Chat from './components/Chat'

function App() {
  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '2rem',
      backgroundColor: '#f7f7f7',
      minHeight: '100vh'
    }}>
      <h1 style={{ 
        textAlign: 'center', 
        marginBottom: '2rem',
        color: '#2d3748'
      }}>
        Ollama Chat
      </h1>
      <Chat />
    </div>
  )
}

export default App
