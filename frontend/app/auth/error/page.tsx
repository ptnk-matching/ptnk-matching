'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = () => {
    switch (error) {
      case 'Configuration':
        return {
          title: 'Lỗi cấu hình',
          message: 'Cấu hình OAuth chưa đúng. Vui lòng kiểm tra environment variables GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET.',
        }
      case 'AccessDenied':
        return {
          title: 'Truy cập bị từ chối',
          message: 'Bạn không có quyền truy cập hoặc đã hủy đăng nhập.',
        }
      case 'Verification':
        return {
          title: 'Lỗi xác thực',
          message: 'Không thể xác thực token. Vui lòng thử lại.',
        }
      default:
        return {
          title: 'Lỗi đăng nhập',
          message: 'Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.',
        }
    }
  }

  const { title, message } = getErrorMessage()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600">{message}</p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/"
            className="flex-1 px-4 py-2 text-center text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Về trang chủ
          </Link>
          <Link
            href="/auth/signin"
            className="flex-1 px-4 py-2 text-center text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
          >
            Thử lại
          </Link>
        </div>
      </div>
    </div>
  )
}

