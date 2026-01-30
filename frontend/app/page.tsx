'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import FileUpload from '@/components/FileUpload'
import MatchResults from '@/components/MatchResults'
import Header from '@/components/Header'
import { uploadAndMatch, checkHealth } from '@/services/api'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [documentId, setDocumentId] = useState<string | null>(null)
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null)
  const [authConfigured, setAuthConfigured] = useState<boolean | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [hasRegistration, setHasRegistration] = useState<boolean>(false)

  // Redirect professors to dashboard
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const role = (session.user as any)?.role
      const storedRole = typeof window !== 'undefined' ? localStorage.getItem('selectedRole') : null
      const actualRole = role === 'professor' ? 'professor' : (storedRole === 'professor' ? 'professor' : 'student')
      
      if (actualRole === 'professor') {
        router.push('/professor')
      }
    }
  }, [status, session, router])

  // Redirect professors to dashboard
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const role = (session.user as any)?.role
      const storedRole = typeof window !== 'undefined' ? localStorage.getItem('selectedRole') : null
      const actualRole = role === 'professor' ? 'professor' : (storedRole === 'professor' ? 'professor' : 'student')
      
      if (actualRole === 'professor') {
        router.push('/professor')
        return
      }
    }
  }, [status, session, router])

  // Check backend connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await checkHealth()
        setBackendConnected(true)
        setError(null)
      } catch (err) {
        setBackendConnected(false)
        setError('Không thể kết nối đến backend. Vui lòng đảm bảo backend đang chạy tại http://localhost:8000')
      }
    }
    checkConnection()
  }, [])

  // Check auth configuration
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

  // Save role to session after login and sync with backend
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const selectedRole = localStorage.getItem('selectedRole')
      console.log('DEBUG: Selected role from localStorage:', selectedRole)
      
      // Ensure role is set correctly
      let userRole: 'student' | 'professor' = 'student' // default
      if (selectedRole && (selectedRole === 'student' || selectedRole === 'professor')) {
        userRole = selectedRole as 'student' | 'professor'
        // Update session user object with role
        (session.user as any).role = userRole
        console.log('DEBUG: Set role to session:', userRole)
      } else {
        // If no role selected, check if there's one in session
        const sessionRole = (session.user as any).role
        if (sessionRole === 'student' || sessionRole === 'professor') {
          userRole = sessionRole
          // Save to localStorage for consistency
          localStorage.setItem('selectedRole', userRole)
        }
      }
      
      // Store user ID for API calls
      if (session.user.id) {
        localStorage.setItem('userId', session.user.id)
      }
      
      // Sync user with backend (use the correct role)
      const syncUser = async () => {
        try {
          const { createUser } = await import('@/services/api')
          
          const userData = await createUser({
            google_id: session.user.id,
            email: session.user.email || '',
            name: session.user.name || '',
            role: userRole, // Use the determined role
            avatar_url: session.user.image || null
          })
          
          // Store MongoDB user ID if returned
          if (userData && userData.id) {
            localStorage.setItem('mongoUserId', userData.id)
            console.log('DEBUG: Stored mongoUserId:', userData.id)
          }
          
          // Check for role mismatch flag from backend
          if (userData && typeof userData === 'object') {
            if ((userData as any).role_mismatch) {
              const originalRole = (userData as any).original_role
              const roleLabel = originalRole === 'professor' ? 'Giảng viên' : 'Học sinh'
              console.warn(`⚠️ Role mismatch detected. User has role "${originalRole}" in database.`)
              alert(`⚠️ Bạn đã đăng ký với vai trò "${roleLabel}". Vui lòng đăng xuất và đăng nhập lại với vai trò đúng.`)
              // Clear wrong role from localStorage
              localStorage.removeItem('selectedRole')
              // Sign out to force re-login with correct role
              const { signOut } = await import('next-auth/react')
              signOut({ callbackUrl: '/' })
              return
            }
            
            // IMPORTANT: Use role from backend (database), not from localStorage
            // This prevents role switching if user already exists
            if ('role' in userData) {
              const backendRole = String((userData as any).role)
              if (backendRole === 'student' || backendRole === 'professor') {
                // If user tried to use different role, show warning and prevent login
                if (userRole !== backendRole && backendRole) {
                  console.warn(`⚠️ Role mismatch: User tried to login as "${userRole}" but database has "${backendRole}".`)
                  const roleLabel = backendRole === 'professor' ? 'Giảng viên' : 'Học sinh'
                  alert(`⚠️ Bạn đã đăng ký với vai trò "${roleLabel}". Vui lòng đăng xuất và đăng nhập lại với vai trò đúng.`)
                  // Clear wrong role from localStorage
                  localStorage.removeItem('selectedRole')
                  // Sign out to force re-login with correct role
                  const { signOut } = await import('next-auth/react')
                  signOut({ callbackUrl: '/' })
                  return
                }
                
                // Override localStorage and session with database role
                localStorage.setItem('selectedRole', backendRole)
                ;(session.user as any).role = backendRole
                console.log('DEBUG: Role synced from backend (database):', backendRole)
              }
            }
          }
        } catch (error) {
          console.error('Error syncing user:', error)
        }
      }
      syncUser()
    }
  }, [status, session])

  // Check registration status for a document
  const checkRegistrationStatus = async (docId: string) => {
    try {
      const { getMyRegistrations } = await import('@/services/api')
      const regs = await getMyRegistrations()
      const hasReg = regs.registrations?.some(
        (r: any) => r.document_id === docId
      ) || false
      setHasRegistration(hasReg)
    } catch (err) {
      console.error('Error checking registrations:', err)
      setHasRegistration(false)
    }
  }

  // Check registration when documentId changes
  useEffect(() => {
    if (documentId && status === 'authenticated') {
      checkRegistrationStatus(documentId)
    } else {
      setHasRegistration(false)
    }
  }, [documentId, status])

  const handleUpload = async (file: File) => {
    setLoading(true)
    setError(null)
    setMatches([])
    setUploadedFile(file.name)

    try {
      setUploadProgress(0)
      const result = await uploadAndMatch(
        file,
        5,
        true,
        (progress) => {
          // Update progress (note: this is upload progress, not processing progress)
          setUploadProgress(Math.min(progress, 90)) // Cap at 90% until processing completes
        }
      )
      setUploadProgress(100)
      setMatches(result.matches || [])
      const docId = (result as any).document_id || null
      setDocumentId(docId)
      setError(null) // Clear any previous errors
      
      // Debug: Log document_id
      console.log('📄 Document ID from upload:', docId)
      console.log('📦 Full result keys:', Object.keys(result))
      console.log('👤 User status:', status)
      console.log('🆔 User ID from localStorage:', localStorage.getItem('userId'))
      console.log('🆔 MongoDB User ID:', localStorage.getItem('mongoUserId'))
      
      // Check if user already has registration for this document
      if (docId && status === 'authenticated') {
        checkRegistrationStatus(docId)
      } else if (!docId && status === 'authenticated') {
        console.warn('⚠️ No document_id returned from upload even though user is authenticated.')
        console.warn('Possible reasons:')
        console.warn('1. MongoDB connection failed (check backend logs)')
        console.warn('2. User ID not sent correctly (check X-User-Id header)')
        console.warn('3. Document creation failed silently')
      }
    } catch (err: any) {
      setUploadProgress(0)
      let errorMessage = err?.response?.data?.detail || 
                         err?.message || 
                         'Có lỗi xảy ra khi xử lý file. Vui lòng thử lại.'
      
      // Handle timeout specifically
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        errorMessage = 'Thời gian xử lý quá lâu (quá 5 phút). File có thể quá lớn hoặc hệ thống đang bận. Vui lòng thử lại với file nhỏ hơn hoặc đợi một chút.'
      }
      
      setError(errorMessage)
      console.error('Upload error:', err)
      
      // Log more details for debugging
      if (err?.response) {
        console.error('Response status:', err.response.status)
        console.error('Response data:', err.response.data)
      }
    } finally {
      setLoading(false)
      // Reset progress after a delay
      setTimeout(() => setUploadProgress(0), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-teal-50 to-primary-100">
      <Header />
      <main className="py-8 px-4">
        <div className="max-w-6xl mx-auto">

        {/* Auth Configuration Warning */}
        {authConfigured === false && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            <p className="font-semibold">⚠️ Google OAuth chưa được cấu hình:</p>
            <p className="text-sm mt-1">
              Để sử dụng tính năng đăng nhập, vui lòng cấu hình Google OAuth credentials.
            </p>
            <ul className="list-disc list-inside text-sm mt-2 space-y-1">
              <li>Tạo file <code className="bg-red-100 px-1 rounded">frontend/.env.local</code></li>
              <li>Thêm <code className="bg-red-100 px-1 rounded">GOOGLE_CLIENT_ID</code> và <code className="bg-red-100 px-1 rounded">GOOGLE_CLIENT_SECRET</code></li>
              <li>Xem hướng dẫn trong file <code className="bg-red-100 px-1 rounded">AUTH_SETUP.md</code></li>
            </ul>
          </div>
        )}

        {/* Auth Required Message */}
        {status === 'unauthenticated' && authConfigured !== false && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6">
            <p className="font-semibold">⚠️ Yêu cầu đăng nhập:</p>
            <p>Vui lòng đăng nhập với Google để sử dụng hệ thống. Click nút &quot;Đăng nhập&quot; ở góc trên bên phải.</p>
          </div>
        )}

        {/* Role-specific content */}
        {status === 'authenticated' && (() => {
          const role = (session?.user as any)?.role || 'student'
          const storedRole = typeof window !== 'undefined' ? localStorage.getItem('selectedRole') : null
          const actualRole = role === 'professor' ? 'professor' : (storedRole === 'professor' ? 'professor' : 'student')
          
          if (actualRole === 'professor') {
            return (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6 text-center">
                <div className="mb-4">
                  <svg className="w-16 h-16 text-primary-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Chào mừng Giảng viên!</h2>
                  <p className="text-gray-600 mb-4">
                    Trang này dành cho học sinh upload báo cáo. Vui lòng vào Dashboard để quản lý đăng ký và profile.
                  </p>
                  <a
                    href="/professor"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-primary-500 to-teal-500 text-white rounded-lg hover:from-primary-600 hover:to-teal-600 font-medium shadow-md transition-all"
                  >
                    Vào Dashboard Giảng viên →
                  </a>
                </div>
              </div>
            )
          }
          return null
        })()}

        {/* Upload Section - Only for students */}
        {status === 'authenticated' && (() => {
          const role = (session?.user as any)?.role || 'student'
          const storedRole = typeof window !== 'undefined' ? localStorage.getItem('selectedRole') : null
          const actualRole = role === 'professor' ? 'professor' : (storedRole === 'professor' ? 'professor' : 'student')
          
          if (actualRole !== 'professor') {
            return (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <FileUpload
                  onUpload={handleUpload}
                  loading={loading}
                  disabled={loading}
                />
              </div>
            )
          }
          return null
        })()}

        {/* Backend Connection Status */}
        {backendConnected === false && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6">
            <p className="font-semibold">⚠️ Cảnh báo:</p>
            <p>Backend không kết nối được. Vui lòng:</p>
            <ul className="list-disc list-inside mt-2 text-sm">
              <li>Kiểm tra backend có đang chạy tại <code className="bg-yellow-100 px-1 rounded">http://localhost:8000</code> không</li>
              <li>Chạy lệnh: <code className="bg-yellow-100 px-1 rounded">cd backend && uvicorn main:app --reload</code></li>
              <li>Kiểm tra file <code className="bg-yellow-100 px-1 rounded">.env</code> có <code className="bg-yellow-100 px-1 rounded">OPENAI_API_KEY</code> không</li>
            </ul>
          </div>
        )}

        {/* Error Message */}
        {error && backendConnected !== false && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="font-semibold">Lỗi:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Results Section */}
        {status === 'authenticated' && uploadedFile && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Kết quả đề xuất cho: <span className="text-primary-600 font-bold">{uploadedFile}</span>
            </h2>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                <p className="mt-4 text-gray-600">Đang xử lý và tìm kiếm giảng viên phù hợp...</p>
                {uploadProgress > 0 && (
                  <div className="mt-6 w-full max-w-md mx-auto">
                    <div className="bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">{uploadProgress}%</p>
                  </div>
                )}
                <p className="mt-4 text-xs text-gray-500">
                  Quá trình này có thể mất vài phút tùy thuộc vào kích thước file và độ phức tạp của nội dung...
                </p>
              </div>
            ) : matches.length > 0 ? (
              <MatchResults 
                matches={matches} 
                documentId={documentId}
                hasExistingRegistration={hasRegistration}
                onRegistrationChange={async () => {
                  // Refresh registration status after successful registration
                  if (documentId) {
                    await checkRegistrationStatus(documentId)
                  }
                }}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                Chưa có kết quả. Vui lòng upload file để bắt đầu.
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        {!uploadedFile && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Hướng dẫn sử dụng
            </h3>
            <ul className="list-disc list-inside text-blue-800 space-y-1">
              <li>Upload file báo cáo của bạn (PDF, DOCX, hoặc TXT)</li>
              <li>Hệ thống sẽ tự động phân tích nội dung</li>
              <li>Nhận danh sách giảng viên phù hợp nhất với bài báo cáo của bạn</li>
              <li>Xem điểm khớp và thông tin chi tiết của từng giảng viên</li>
            </ul>
          </div>
        )}
        </div>
      </main>
    </div>
  )
}

