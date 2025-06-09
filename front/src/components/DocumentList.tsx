import { useState, useEffect } from 'react'
import axios from 'axios'
import DocumentUpload from './DocumentUpload'

const DocumentList = () => {
  const [documents, setDocuments] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDocuments = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await axios.get('http://172.20.3.133:8000/document_list/')
      setDocuments(response.data.documents || [])
    } catch (error: any) {
      console.error('Error fetching documents:', error)
      setError(error.message || 'Failed to fetch documents')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div>
      <DocumentUpload onUploadSuccess={fetchDocuments} />
      
      <div style={{
        padding: '1rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        margin: '10px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, color: '#2d3748' }}>Documents</h3>
          <button
            onClick={fetchDocuments}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#4a5568',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Refresh
          </button>
        </div>

        {error && (
          <div style={{
            padding: '0.75rem',
            backgroundColor: '#fed7d7',
            color: '#c53030',
            borderRadius: '4px',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading documents...</div>
        ) : documents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>
            No documents found
          </div>
        ) : (
          <div style={{
            maxHeight: '60vh',
            overflowY: 'auto'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{
                  backgroundColor: '#f7fafc',
                  borderBottom: '2px solid #e2e8f0'
                }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem', color: '#4a5568' }}>Name</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc, index) => (
                  <tr
                    key={doc}
                    style={{
                      borderBottom: '1px solid #e2e8f0',
                      backgroundColor: index % 2 === 0 ? 'white' : '#f7fafc'
                    }}
                  >
                    <td style={{ padding: '0.75rem' }}>{doc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default DocumentList 