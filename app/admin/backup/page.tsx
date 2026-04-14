'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Download, Upload, FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'

interface ImportPreview {
  summary: {
    content: number
    pages: number
    settings: number
    navigation: number
    media: number
  }
  changes: {
    content: Array<{ action: string; key: string; section: string }>
    pages: Array<{ action: string; title: string; slug: string }>
    settings: Array<{ action: string; key: string; category: string }>
    navigation: Array<{ action: string; label: string; type: string }>
    media: Array<{ action: string; filename: string; type: string }>
  }
}

export default function BackupPage() {
  const [selectedSections, setSelectedSections] = useState<string[]>(['all'])
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [lastBackupDate] = useState<string>('2024-01-15') // This would come from settings/database
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sections = [
    { id: 'all', label: 'All Content', description: 'Export everything' },
    { id: 'content', label: 'Site Content', description: 'Homepage sections, banners, etc.' },
    { id: 'pages', label: 'Pages', description: 'Dynamic pages (About, FAQ, etc.)' },
    { id: 'products', label: 'Products', description: 'Product catalog and images' },
    { id: 'settings', label: 'Settings', description: 'Site configuration' },
    { id: 'navigation', label: 'Navigation', description: 'Header and footer menus' },
    { id: 'media', label: 'Media Library', description: 'Uploaded images and files' }
  ]

  const handleSectionChange = (sectionId: string, checked: boolean) => {
    if (sectionId === 'all') {
      setSelectedSections(checked ? ['all'] : [])
    } else {
      setSelectedSections(prev => {
        const newSections = checked 
          ? [...prev.filter(s => s !== 'all'), sectionId]
          : prev.filter(s => s !== sectionId && s !== 'all')
        return newSections
      })
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const sectionsParam = selectedSections.join(',')
      const response = await fetch(`/api/admin/export?sections=${sectionsParam}`, {
        headers: {
          'X-CSRF-Token': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || ''
        }
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      // Create download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bs3dcrafts-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Backup exported successfully')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export backup')
    } finally {
      setIsExporting(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setImportPreview(null)
    }
  }

  const handlePreview = async () => {
    if (!selectedFile) return

    setIsImporting(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('preview', 'true')

      const response = await fetch('/api/admin/import', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || ''
        },
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Preview failed')
      }

      setImportPreview(result.preview)
    } catch (error) {
      console.error('Preview error:', error)
      toast.error('Failed to preview import')
    } finally {
      setIsImporting(false)
    }
  }

  const handleImport = async () => {
    if (!selectedFile) return

    setIsImporting(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('preview', 'false')

      const response = await fetch('/api/admin/import', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || ''
        },
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Import failed')
      }

      toast.success('Import completed successfully')
      setSelectedFile(null)
      setImportPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Import error:', error)
      toast.error('Failed to import backup')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Backup & Data Migration</h1>
        <p className="text-muted-foreground mt-2">
          Export and import your site content for backup and migration purposes.
        </p>
      </div>

      {/* Last Backup Info */}
      <Alert>
        <Clock className="h-4 w-4" />
        <AlertDescription>
          Last backup: {lastBackupDate ? new Date(lastBackupDate).toLocaleDateString() : 'Never'}
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Export Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Content
            </CardTitle>
            <CardDescription>
              Download your site content as a JSON backup file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-3">Select sections to export:</h4>
              <div className="space-y-2">
                {sections.map((section) => (
                  <div key={section.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={section.id}
                      checked={selectedSections.includes(section.id) || selectedSections.includes('all')}
                      onCheckedChange={(checked) => handleSectionChange(section.id, checked as boolean)}
                      disabled={selectedSections.includes('all') && section.id !== 'all'}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor={section.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {section.label}
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {section.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleExport} 
              disabled={isExporting || selectedSections.length === 0}
              className="w-full"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Backup
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Import Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Content
            </CardTitle>
            <CardDescription>
              Upload and restore content from a backup file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="backup-file" className="block text-sm font-medium mb-2">
                Select backup file:
              </label>
              <input
                ref={fileInputRef}
                id="backup-file"
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {selectedFile && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4" />
                  <span>{selectedFile.name}</span>
                  <Badge variant="secondary">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handlePreview}
                    disabled={isImporting}
                    className="flex-1"
                  >
                    Preview Changes
                  </Button>
                  <Button 
                    onClick={handleImport}
                    disabled={isImporting || !importPreview}
                    className="flex-1"
                  >
                    {isImporting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Importing...
                      </>
                    ) : (
                      'Import'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Import Preview */}
      {importPreview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Import Preview
            </CardTitle>
            <CardDescription>
              Review the changes that will be made before importing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(importPreview.summary).map(([section, count]) => (
                <div key={section} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium capitalize">{section}</span>
                  <Badge variant={count > 0 ? "default" : "secondary"}>
                    {count} items
                  </Badge>
                </div>
              ))}
            </div>

            <Alert className="mt-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                This import will update existing content and create new items where they don't exist.
                Navigation items will be completely replaced.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  )
}