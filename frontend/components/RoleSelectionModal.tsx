'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'

interface RoleSelectionModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function RoleSelectionModal({ isOpen, onClose }: RoleSelectionModalProps) {
  const [selectedRole, setSelectedRole] = useState<'student' | 'professor' | null>(null)

  if (!isOpen) return null

  const handleContinue = async () => {
    if (!selectedRole) return

    // Check if auth is configured first
    try {
      const response = await fetch('/api/auth/config')
      const data = await response.json()
      if (!data.configured) {
        alert('Google OAuth chưa được cấu hình.\n\nVui lòng:\n1. Tạo file frontend/.env.local\n2. Thêm GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET\n3. Xem AUTH_SETUP.md để biết chi tiết')
        onClose()
        return
      }
    } catch (error) {
      console.error('Error checking auth config:', error)
      alert('Không thể kiểm tra cấu hình. Vui lòng thử lại.')
      return
    }

    // Store role in localStorage temporarily, will be saved to session after login
    localStorage.setItem('selectedRole', selectedRole)
    // Sign in with Google, role will be added in callback
    signIn('google', { callbackUrl: '/' })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
          Chọn vai trò của bạn
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Vui lòng chọn vai trò của bạn để tiếp tục đăng nhập
        </p>

        <div className="space-y-3 mb-6">
          <button
            onClick={() => setSelectedRole('student')}
            className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
              selectedRole === 'student'
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-300 hover:border-primary-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedRole === 'student'
                    ? 'border-primary-600 bg-primary-600'
                    : 'border-gray-400'
                }`}
              >
                {selectedRole === 'student' && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-6 h-6 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <h3 className="font-semibold text-gray-900">Học sinh</h3>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Upload bài báo cáo và tìm giảng viên phù hợp
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setSelectedRole('professor')}
            className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
              selectedRole === 'professor'
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-300 hover:border-primary-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedRole === 'professor'
                    ? 'border-primary-600 bg-primary-600'
                    : 'border-gray-400'
                }`}
              >
                {selectedRole === 'professor' && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-6 h-6 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <h3 className="font-semibold text-gray-900">Giảng viên</h3>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Quản lý profile và xem các bài báo cáo phù hợp
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleContinue}
            disabled={!selectedRole}
            className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
              selectedRole
                ? 'bg-primary-600 hover:bg-primary-700'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Tiếp tục với Google
          </button>
        </div>
      </div>
    </div>
  )
}

