'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

interface FileUploadProps {
  onUpload: (file: File) => void
  loading?: boolean
  disabled?: boolean
}

export default function FileUpload({ onUpload, loading, disabled }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0 && !disabled && !loading) {
        onUpload(acceptedFiles[0])
      }
    },
    [onUpload, disabled, loading]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    disabled: disabled || loading,
  })

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Upload bài báo cáo
      </label>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${
            isDragActive || dragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-50'
          }
          ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-4h12m-4 4v12a4 4 0 01-4 4H16a4 4 0 01-4-4V36"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {loading ? (
            <div>
              <p className="text-sm text-gray-600">Đang xử lý...</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-primary-600">
                  Click để chọn file
                </span>{' '}
                hoặc kéo thả vào đây
              </p>
              <p className="text-xs text-gray-500">
                PDF, DOCX, DOC, hoặc TXT (tối đa 10MB)
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

