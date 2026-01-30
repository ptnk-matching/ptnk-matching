'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SignIn() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const error = searchParams.get('error')
  const [selectedRole, setSelectedRole] = useState<'student' | 'professor' | null>(null)

  // Check if auth is configured
  useEffect(() => {
    const checkAuthConfig = async () => {
      try {
        const response = await fetch('/api/auth/config')
        const data = await response.json()
        if (!data.configured) {
          // Don't auto redirect if not configured
          return
        }
        
        const role = localStorage.getItem('selectedRole')
        if (role && (role === 'student' || role === 'professor')) {
          setSelectedRole(role as 'student' | 'professor')
          // Auto sign in with Google if role is already selected
          signIn('google', { callbackUrl })
        }
      } catch (error) {
        console.error('Error checking auth config:', error)
      }
    }
    checkAuthConfig()
  }, [callbackUrl])

  const handleRoleSelect = async (role: 'student' | 'professor') => {
    // Check if auth is configured first
    try {
      const response = await fetch('/api/auth/config')
      const data = await response.json()
      if (!data.configured) {
        alert('Google OAuth chưa được cấu hình. Vui lòng xem file AUTH_SETUP.md để setup.')
        return
      }
    } catch (error) {
      console.error('Error checking auth config:', error)
      alert('Không thể kiểm tra cấu hình. Vui lòng thử lại.')
      return
    }
    
    localStorage.setItem('selectedRole', role)
    setSelectedRole(role)
    signIn('google', { callbackUrl })
  }

  // If no role selected, show role selection
  if (!selectedRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Chọn vai trò của bạn
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Vui lòng chọn vai trò của bạn để tiếp tục đăng nhập
          </p>

          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleRoleSelect('student')}
              className="w-full p-4 border-2 border-gray-300 rounded-lg text-left hover:border-primary-400 hover:bg-primary-50 transition-all"
            >
              <div className="flex items-center gap-3">
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
                <div>
                  <h3 className="font-semibold text-gray-900">Học sinh</h3>
                  <p className="text-sm text-gray-600">
                    Upload bài báo cáo và tìm giảng viên phù hợp
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleRoleSelect('professor')}
              className="w-full p-4 border-2 border-gray-300 rounded-lg text-left hover:border-primary-400 hover:bg-primary-50 transition-all"
            >
              <div className="flex items-center gap-3">
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
                <div>
                  <h3 className="font-semibold text-gray-900">Giảng viên</h3>
                  <p className="text-sm text-gray-600">
                    Quản lý profile và xem các bài báo cáo phù hợp
                  </p>
                </div>
              </div>
            </button>
          </div>

          <button
            onClick={() => router.push('/')}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Hủy
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 text-center">
          Đăng nhập
        </h1>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p className="font-semibold">Lỗi đăng nhập:</p>
            <p>
              {error === 'Configuration' && 'Cấu hình OAuth chưa đúng. Vui lòng kiểm tra environment variables.'}
              {error === 'AccessDenied' && 'Bạn không có quyền truy cập.'}
              {error !== 'Configuration' && error !== 'AccessDenied' && 'Đã xảy ra lỗi khi đăng nhập.'}
            </p>
          </div>
        )}
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">Đang chuyển hướng đến Google...</p>
        </div>
      </div>
    </div>
  )
}

