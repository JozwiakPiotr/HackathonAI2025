import { useState, useRef } from 'react'
import axios from 'axios'

interface DocumentUploadProps {
  onUploadSuccess: () => void
}

const DocumentUpload = ({ onUploadSuccess }: DocumentUploadProps) => {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
      setSuccess(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
      console.log('Uploading document...')
      const response = await axios.post('http://172.20.3.133:8000/add_document/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      console.log('Response:', response.data)
      setSuccess('Document uploaded successfully!')
      setFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      onUploadSuccess()
    } catch (error: any) {
      console.error('Error details:', error)
      setError(error.response?.data?.detail?.[0]?.msg || error.message || 'Failed to upload document')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      margin: '10px',
      padding: '1rem',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    }}>
      <h3 style={{ margin: '0 0 1rem 0', color: '#2d3748' }}>Add Document</h3>
      
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

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".txt,.pdf,.doc,.docx"
          style={{ display: 'none' }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#4a5568',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {file ? file.name : 'Select Document'}
        </button>
        <button
          type="submit"
          disabled={isLoading || !file}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#3182ce',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading || !file ? 'not-allowed' : 'pointer',
            opacity: isLoading || !file ? 0.7 : 1
          }}
        >
          {isLoading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
    </div>
  )
}

export default DocumentUpload 