'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import RoleSelectionModal from './RoleSelectionModal'
import NotificationBell from './NotificationBell'

export default function AuthButton() {
  const { data: session, status } = useSession()
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [authConfigured, setAuthConfigured] = useState<boolean | null>(null)

  // Check if auth is configured
  useEffect(() => {
    const checkAuthConfig = async () => {
      try {
        const response = await fetch('/api/auth/config')
        const data = await response.json()
        setAuthConfigured(data.configured)
      } catch (error) {
        console.error('Error checking auth config:', error)
        setAuthConfigured(false)
      }
    }
    checkAuthConfig()
  }, [])

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin"></div>
        <span className="text-sm text-gray-600">Đang tải...</span>
      </div>
    )
  }

  if (session?.user) {
    // Get role from session or localStorage
    const sessionRole = (session.user as any).role
    const storedRole = typeof window !== 'undefined' ? localStorage.getItem('selectedRole') : null
    const role = sessionRole || storedRole || 'student'
    const roleLabel = role === 'professor' ? 'Giảng viên' : 'Học sinh'
    
  return (
    <div className="flex items-center gap-4">
      {session?.user && <NotificationBell />}
        <div className="flex items-center gap-2">
          {session.user.image && (
            <Image
              src={session.user.image}
              alt={session.user.name || 'User'}
              width={32}
              height={32}
              className="rounded-full"
            />
          )}
          <div className="hidden md:block">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-900">
                {session.user.name}
              </p>
              <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded">
                {roleLabel}
              </span>
            </div>
            <p className="text-xs text-gray-500">{session.user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {role === 'professor' ? (
            <Link
              href="/professor/profile-builder"
              className="px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
            >
              Profile
            </Link>
          ) : (
            <Link
              href="/profile"
              className="px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
            >
              Profile
            </Link>
          )}
          <button
            onClick={() => {
              localStorage.removeItem('userId')
              localStorage.removeItem('mongoUserId')
              signOut()
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    )
  }

  // Show configuration warning if auth is not configured
  if (authConfigured === false) {
    return (
      <div className="flex flex-col items-end gap-2">
        <button
          disabled
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 bg-gray-200 rounded-lg cursor-not-allowed"
          title="Google OAuth chưa được cấu hình"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Đăng nhập (Chưa cấu hình)
        </button>
        <div className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded border border-yellow-200 max-w-xs">
          ⚠️ Cần setup Google OAuth. Xem AUTH_SETUP.md
        </div>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowRoleModal(true)}
        disabled={!authConfigured}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Đăng nhập
      </button>
      {authConfigured === true && (
        <RoleSelectionModal
          isOpen={showRoleModal}
          onClose={() => setShowRoleModal(false)}
        />
      )}
    </>
  )
}

