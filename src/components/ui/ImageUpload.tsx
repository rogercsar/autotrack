import React, { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, FileText } from 'lucide-react'
import Button from './Button'

interface ImageUploadProps {
  label?: string
  value?: string
  onChange: (file: File | null, previewUrl?: string) => void
  accept?: string
  maxSize?: number // em MB
  className?: string
  error?: string
  helperText?: string
  placeholder?: string
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  value,
  onChange,
  accept = 'image/*',
  maxSize = 5, // 5MB por padrão
  className = '',
  error,
  helperText,
  placeholder = 'Clique para fazer upload ou arraste uma imagem aqui',
}) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    // Validar tamanho do arquivo
    if (file.size > maxSize * 1024 * 1024) {
      alert(`Arquivo muito grande. Tamanho máximo: ${maxSize}MB`)
      return
    }

    // Validar tipo de arquivo
    if (accept === 'image/*' && !file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem')
      return
    }

    // Criar preview
    const reader = new FileReader()
    reader.onload = (e) => {
      const previewUrl = e.target?.result as string
      setPreview(previewUrl)
      onChange(file, previewUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemove = () => {
    setPreview(null)
    onChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${
            isDragOver
              ? 'border-primary-400 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }
          ${error ? 'border-red-300' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
        />

        {preview ? (
          <div className="space-y-4">
            <div className="relative inline-block">
              {accept === 'image/*' ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-48 max-w-full rounded-lg object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-48 h-48 bg-gray-100 rounded-lg">
                  <FileText className="w-16 h-16 text-gray-400" />
                </div>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove()
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Clique para alterar ou arraste uma nova imagem
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              {accept === 'image/*' ? (
                <ImageIcon className="w-12 h-12 text-gray-400" />
              ) : (
                <Upload className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">{placeholder}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleClick()
                }}
              >
                <Upload className="w-4 h-4 mr-2" />
                Selecionar Arquivo
              </Button>
            </div>
            <p className="text-xs text-gray-500">Tamanho máximo: {maxSize}MB</p>
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  )
}

export default ImageUpload
