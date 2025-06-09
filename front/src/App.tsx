import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import Chat from './components/Chat'
import DocumentList from './components/DocumentList'

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#f7fafc' }}>
        <Navigation />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <Routes>
            <Route path="/" element={<Chat />} />
            <Route path="/documents" element={<DocumentList />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
