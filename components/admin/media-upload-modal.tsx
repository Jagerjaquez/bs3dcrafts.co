'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { adminMultipartHeaders } from '@/lib/admin-client'
import { useToast } from '@/contexts/toast-context'
import { Upload, X, CheckCircle, AlertCircle, FileImage } from 'lucide-react'

interface UploadFile {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

interface MediaUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function MediaUploadModal({ isOpen, onClose, onSuccess }: MediaUploadModalProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const { showSuccess, showError } = useToast()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'pending'
    }))

    // Validate files
    const validFiles = newFiles.filter((uploadFile) => {
      const { file } = uploadFile
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        uploadFile.status = 'error'
        uploadFile.error = 'Sadece resim dosyaları desteklenir'
        return true // Keep it to show error
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        uploadFile.status = 'error'
        uploadFile.error = 'Dosya boyutu 5MB\'dan büyük olamaz'
        return true // Keep it to show error
      }

      return true
    })

    setFiles((prev) => [...prev, ...validFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    multiple: true
  })

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const uploadFiles = async () => {
    const pendingFiles = files.filter((f) => f.status === 'pending')
    if (pendingFiles.length === 0) return

    setIsUploading(true)
    let successCount = 0
    let errorCount = 0

    for (const uploadFile of pendingFiles) {
      try {
        // Update status to uploading
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? { ...f, status: 'uploading' as const, progress: 0 }
              : f
          )
        )

        const formData = new FormData()
        formData.append('file', uploadFile.file)

        const xhr = new XMLHttpRequest()

        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100)
            setFiles((prev) =>
              prev.map((f) =>
                f.id === uploadFile.id ? { ...f, progress } : f
              )
            )
          }
        })

        // Handle completion
        const uploadPromise = new Promise<void>((resolve, reject) => {
          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              setFiles((prev) =>
                prev.map((f) =>
                  f.id === uploadFile.id
                    ? { ...f, status: 'success' as const, progress: 100 }
                    : f
                )
              )
              successCount++
              resolve()
            } else {
              let errorMessage = 'Yükleme hatası'
              try {
                const response = JSON.parse(xhr.responseText)
                errorMessage = response.error || errorMessage
              } catch (e) {
                // Use default error message
              }
              
              setFiles((prev) =>
                prev.map((f) =>
                  f.id === uploadFile.id
                    ? { ...f, status: 'error' as const, error: errorMessage }
                    : f
                )
              )
              errorCount++
              reject(new Error(errorMessage))
            }
          })

          xhr.addEventListener('error', () => {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === uploadFile.id
                  ? { ...f, status: 'error' as const, error: 'Ağ hatası' }
                  : f
              )
            )
            errorCount++
            reject(new Error('Network error'))
          })
        })

        // Start upload
        xhr.open('POST', '/api/admin/media')
        
        // Add headers (excluding Content-Type for FormData)
        const headers = adminMultipartHeaders()
        Object.entries(headers).forEach(([key, value]) => {
          if (key.toLowerCase() !== 'content-type') {
            xhr.setRequestHeader(key, value)
          }
        })
        
        xhr.send(formData)

        await uploadPromise
      } catch (error) {
        console.error('Upload error:', error)
      }
    }

    setIsUploading(false)

    // Show summary notification
    if (successCount > 0) {
      showSuccess(
        'Dosyalar yüklendi',
        `${successCount} dosya başarıyla yüklendi${errorCount > 0 ? `, ${errorCount} dosya başarısız` : ''}`
      )
    }

    if (errorCount > 0 && successCount === 0) {
      showError('Yükleme başarısız', `${errorCount} dosya yüklenemedi`)
    }

    // Call success callback if any files were uploaded
    if (successCount > 0) {
      onSuccess()
    }
  }

  const handleClose = () => {
    if (isUploading) {
      if (!confirm('Yükleme devam ediyor. Çıkmak istediğinizden emin misiniz?')) {
        return
      }
    }
    setFiles([])
    onClose()
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'uploading':
        return <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      default:
        return <FileImage className="h-5 w-5 text-gray-400" />
    }
  }

  const pendingCount = files.filter((f) => f.status === 'pending').length
  const successCount = files.filter((f) => f.status === 'success').length
  const errorCount = files.filter((f) => f.status === 'error').length

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-white">Dosya Yükle</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Drop Zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/10'
                : 'border-gray-600 hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-white">Dosyaları buraya bırakın...</p>
            ) : (
              <div className="space-y-2">
                <p className="text-white">
                  Dosyaları buraya sürükleyin veya seçmek için tıklayın
                </p>
                <p className="text-sm text-gray-400">
                  JPEG, PNG, WebP, GIF formatları desteklenir (Maks. 5MB)
                </p>
              </div>
            )}
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">
                  Dosyalar ({files.length})
                </h3>
                {files.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFiles([])}
                    disabled={isUploading}
                    className="text-gray-400 hover:text-white"
                  >
                    Tümünü Temizle
                  </Button>
                )}
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {files.map((uploadFile) => (
                  <div
                    key={uploadFile.id}
                    className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-gray-700"
                  >
                    {getStatusIcon(uploadFile.status)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white truncate">
                          {uploadFile.file.name}
                        </p>
                        <span className="text-xs text-gray-400 ml-2">
                          {formatFileSize(uploadFile.file.size)}
                        </span>
                      </div>
                      
                      {uploadFile.status === 'uploading' && (
                        <Progress value={uploadFile.progress} className="mt-2 h-1" />
                      )}
                      
                      {uploadFile.error && (
                        <p className="text-xs text-red-400 mt-1">{uploadFile.error}</p>
                      )}
                    </div>

                    {uploadFile.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(uploadFile.id)}
                        disabled={isUploading}
                        className="text-gray-400 hover:text-white p-1"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Upload Summary */}
              {(successCount > 0 || errorCount > 0) && (
                <div className="text-sm text-gray-400 space-y-1">
                  {successCount > 0 && (
                    <div className="text-green-400">✓ {successCount} dosya başarıyla yüklendi</div>
                  )}
                  {errorCount > 0 && (
                    <div className="text-red-400">✗ {errorCount} dosya yüklenemedi</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          <div className="text-sm text-gray-400">
            {pendingCount > 0 && `${pendingCount} dosya yüklenmeyi bekliyor`}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
              className="border-gray-600 text-gray-300 hover:text-white"
            >
              {isUploading ? 'İptal' : 'Kapat'}
            </Button>
            
            {pendingCount > 0 && (
              <Button
                onClick={uploadFiles}
                disabled={isUploading}
                className="bg-primary hover:bg-primary/90"
              >
                {isUploading ? 'Yükleniyor...' : `${pendingCount} Dosyayı Yükle`}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}