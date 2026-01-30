'use client'

import { useState } from 'react'
import { createRegistration } from '@/services/api'

interface RegisterButtonProps {
  professorId: string
  professorName: string
  documentId: string | null
  priority?: number
  onRegistered?: () => void
  disabled?: boolean
}

export default function RegisterButton({
  professorId,
  professorName,
  documentId,
  priority = 1,
  onRegistered,
  disabled = false
}: RegisterButtonProps) {
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async () => {
    if (!documentId) {
      setError('Vui lòng upload file trước khi đăng ký')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await createRegistration({
        professor_id: professorId,
        document_id: documentId,
        priority: priority,
        notes: `Đăng ký nguyện vọng ${priority} cho ${professorName}`
      })
      
      // Check if registration was successful
      if (result && (result.success || result.registration_id)) {
        setRegistered(true)
        setError(null)
        if (onRegistered) {
          onRegistered()
        }
      } else {
        throw new Error('Không nhận được phản hồi từ server')
      }
    } catch (err: any) {
      // Only show error if it's not a success response
      const errorMessage = err?.response?.data?.detail || err?.message || 'Có lỗi xảy ra khi đăng ký'
      
      // Check if error is actually a success (sometimes backend returns error but still saves)
      if (errorMessage.includes('already exists') || errorMessage.includes('đã đăng ký')) {
        // Registration already exists, treat as success
        setRegistered(true)
        setError(null)
        if (onRegistered) {
          onRegistered()
        }
      } else {
        setError(errorMessage)
        console.error('Registration error:', err)
      }
    } finally {
      setLoading(false)
    }
  }

  if (registered) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-sm font-medium">Đã đăng ký</span>
      </div>
    )
  }

  // Show message if no documentId
  if (!documentId) {
    return (
      <div className="px-4 py-2 text-sm text-yellow-600 bg-yellow-50 rounded-lg text-center border border-yellow-200">
        ⚠️ Chưa lưu được document. Kiểm tra MongoDB connection.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleRegister}
        disabled={loading || !documentId || disabled}
        className={`
          px-4 py-2 text-sm font-medium rounded-lg transition-colors
          ${loading || !documentId || disabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-green-600 text-white hover:bg-green-700'
          }
        `}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Đang đăng ký...
          </span>
        ) : disabled ? (
          'Đã đăng ký giảng viên khác'
        ) : (
          'Đăng ký giảng viên này'
        )}
      </button>
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}

