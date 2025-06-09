import { Link, useLocation } from 'react-router-dom'

const Navigation = () => {
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const linkStyle = (active: boolean) => ({
    padding: '0.5rem 1rem',
    color: active ? '#2b6cb0' : '#4a5568',
    textDecoration: 'none',
    borderBottom: active ? '2px solid #2b6cb0' : 'none',
    fontWeight: active ? 'bold' : 'normal'
  })

  return (
    <nav style={{
      backgroundColor: 'white',
      padding: '1rem',
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      marginBottom: '1rem'
    }}>
      <div style={{
        display: 'flex',
        gap: '1rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <Link to="/" style={linkStyle(isActive('/'))}>
          Chat
        </Link>
        <Link to="/documents" style={linkStyle(isActive('/documents'))}>
          Documents
        </Link>
      </div>
    </nav>
  )
}

export default Navigation 