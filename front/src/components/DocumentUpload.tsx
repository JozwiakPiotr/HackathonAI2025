import { useState } from 'react'
import axios from 'axios'

interface DocumentUploadProps {
  onUploadSuccess: () => void
}

const DocumentUpload = ({ onUploadSuccess }: DocumentUploadProps) => {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
      setSuccess(null)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!file) {
      setError('Please select a file')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      await axios.post('http://172.20.3.133:8000/add_document/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      setSuccess('Document uploaded successfully!')
      setFile(null)
      onUploadSuccess()
    } catch (error: any) {
      console.error('Error uploading document:', error)
      setError(error.response?.data?.detail || error.message || 'Failed to upload document')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      padding: '1rem',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      margin: '10px'
    }}>
      <h3 style={{ color: '#2d3748', marginBottom: '1rem' }}>Upload Document</h3>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="file"
            onChange={handleFileChange}
            style={{
              padding: '0.5rem',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              width: '100%'
            }}
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !file}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: isLoading || !file ? '#cbd5e0' : '#4a5568',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading || !file ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Uploading...' : 'Upload Document'}
        </button>
      </form>

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

      {success && (
        <div style={{
          padding: '0.75rem',
          backgroundColor: '#c6f6d5',
          color: '#2f855a',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          {success}
        </div>
      )}
    </div>
  )
}

export default DocumentUpload 