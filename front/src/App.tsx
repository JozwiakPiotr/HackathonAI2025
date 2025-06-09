import { useState } from 'react'
import Chat from './components/Chat'
import DocumentUpload from './components/DocumentUpload'

function App() {
  const [uploadKey, setUploadKey] = useState(0)

  const handleUploadSuccess = () => {
    // Force chat component to refresh by changing its key
    setUploadKey(prev => prev + 1)
  }

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto',
      backgroundColor: '#f7f7f7',
      maxHeight: '100vh'
    }}>
      <Chat key={uploadKey} />
      <div style={{ marginTop: '2rem' }}>
        <DocumentUpload onUploadSuccess={handleUploadSuccess} />
      </div>
    </div>
  )
}

export default App
