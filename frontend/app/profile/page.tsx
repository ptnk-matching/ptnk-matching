'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { getMyDocuments, getMyRegistrations } from '@/services/api'
import Link from 'next/link'
import Header from '@/components/Header'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [documents, setDocuments] = useState<any[]>([])
  const [registrations, setRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated') {
      loadData()
    }
  }, [status])

  const loadData = async () => {
    try {
      setLoading(true)
      const [docsData, regsData] = await Promise.all([
        getMyDocuments(),
        getMyRegistrations()
      ])
      setDocuments(docsData.documents || [])
      setRegistrations(regsData.registrations || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-teal-50 to-primary-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-teal-50 to-primary-100">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Yêu cầu đăng nhập</h1>
          <p className="text-gray-600 mb-6">Vui lòng đăng nhập để xem profile của bạn.</p>
          <Link
            href="/"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    )
  }

  // Get role from session or localStorage
  const sessionRole = (session?.user as any)?.role
  const storedRole = typeof window !== 'undefined' ? localStorage.getItem('selectedRole') : null
  const role = sessionRole || storedRole || 'student'
  const isStudent = role === 'student'
  
  // If professor tries to access student profile, redirect
  if (role === 'professor') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-teal-50 to-primary-100">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Trang này dành cho Học sinh</h1>
            <p className="text-gray-600 mb-4">
              Bạn đang đăng nhập với vai trò <span className="font-semibold text-primary-600">Giảng viên</span>.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Vai trò hiện tại:</span> <span className="font-bold text-blue-900">Giảng viên</span>
              </p>
              <p className="text-xs text-blue-700 mt-2">
                Để xem profile học sinh, vui lòng đăng xuất và đăng nhập lại với vai trò <span className="font-semibold">Học sinh</span>.
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <Link
              href="/professor"
              className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100"
            >
              Vào Dashboard
            </Link>
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-teal-50 to-primary-100">
      <Header />
      <main className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
          <div className="flex items-center gap-4">
            {session?.user?.image && (
              <img
                src={session.user.image}
                alt={session.user.name || 'User'}
                className="w-16 h-16 rounded-full"
              />
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{session?.user?.name}</h2>
              <p className="text-gray-600">{session?.user?.email}</p>
              <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded">
                {isStudent ? 'Học sinh' : 'Giảng viên'}
              </span>
            </div>
          </div>
        </div>

        {isStudent && (
          <>
            {/* Documents Section */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Tài liệu đã upload ({documents.length})
              </h2>
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc) => {
                    // Find registration for this document
                    const docRegistration = registrations.find(
                      (reg: any) => reg.document_id === doc.id
                    )
                    
                    return (
                      <div key={doc.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900">{doc.filename}</h3>
                              {docRegistration && (
                                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                                  Đã đăng ký
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              Upload: {new Date(doc.created_at).toLocaleDateString('vi-VN')}
                            </p>
                            {docRegistration && (
                              <div className="mt-2 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                                <p className="text-sm text-gray-700">
                                  <span className="font-medium">Đăng ký với:</span>{' '}
                                  {docRegistration.professor_name || docRegistration.professor_id}
                                  {docRegistration.professor_title && (
                                    <span className="text-gray-500"> - {docRegistration.professor_title}</span>
                                  )}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  Nguyện vọng {docRegistration.priority} |{' '}
                                  <span className={`font-medium ${
                                    docRegistration.status === 'accepted' ? 'text-green-600' :
                                    docRegistration.status === 'rejected' ? 'text-red-600' :
                                    'text-yellow-600'
                                  }`}>
                                    {docRegistration.status === 'accepted' ? 'Đã chấp nhận' :
                                     docRegistration.status === 'rejected' ? 'Đã từ chối' :
                                     'Đang chờ'}
                                  </span>
                                </p>
                                {docRegistration.status === 'accepted' && docRegistration.professor_email && (
                                  <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                                    <p className="text-xs font-semibold text-green-900 mb-1">📧 Email giảng viên:</p>
                                    <div className="flex items-center gap-1 mb-1">
                                      <code className="text-xs bg-white px-1 py-0.5 rounded">{docRegistration.professor_email}</code>
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(docRegistration.professor_email)
                                          alert('Đã copy email!')
                                        }}
                                        className="text-xs text-blue-600"
                                        title="Copy"
                                      >
                                        📋
                                      </button>
                                    </div>
                                    <button
                                      onClick={() => {
                                        const subject = encodeURIComponent('Liên hệ về đăng ký hướng dẫn')
                                        const body = encodeURIComponent(`Xin chào thầy/cô ${docRegistration.professor_name},\n\nTôi là học sinh đã được thầy/cô chấp nhận đăng ký hướng dẫn.\n\n`)
                                        const mailtoLink = `mailto:${docRegistration.professor_email}?subject=${subject}&body=${body}`
                                        window.location.href = mailtoLink
                                      }}
                                      className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                      </svg>
                                      Mở email client
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                            {doc.s3_url && (
                              <a
                                href={doc.s3_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary-600 hover:underline mt-2 inline-block"
                              >
                                Xem file
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Chưa có tài liệu nào</p>
              )}
            </div>

            {/* Registrations Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Đăng ký giảng viên ({registrations.length})
              </h2>
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : registrations.length > 0 ? (
                <div className="space-y-3">
                  {registrations.map((reg) => {
                    // Find document for this registration
                    const regDocument = documents.find(
                      (doc: any) => doc.id === reg.document_id
                    )
                    
                    return (
                      <div key={reg.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900">
                              Nguyện vọng {reg.priority}: {reg.professor_name || reg.professor_id}
                            </h3>
                            {reg.professor_title && (
                              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {reg.professor_title}
                              </span>
                            )}
                            {reg.status === 'accepted' && (
                              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded animate-pulse">
                                🎉 Đã được chấp nhận!
                              </span>
                            )}
                            {reg.status === 'rejected' && (
                              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">
                                ❌ Đã bị từ chối
                              </span>
                            )}
                          </div>
                            </div>
                            {reg.professor_department && (
                              <p className="text-sm text-gray-600 mb-1">
                                Khoa: {reg.professor_department}
                              </p>
                            )}
                            {regDocument && (
                              <p className="text-sm text-gray-600 mb-2">
                                <span className="font-medium">Tài liệu:</span> {regDocument.filename}
                              </p>
                            )}
                            <p className="text-sm text-gray-600 mb-2">
                              Trạng thái: <span className={`font-medium ${
                                reg.status === 'accepted' ? 'text-green-600' :
                                reg.status === 'rejected' ? 'text-red-600' :
                                'text-yellow-600'
                              }`}>
                                {reg.status === 'accepted' ? 'Đã chấp nhận' :
                                 reg.status === 'rejected' ? 'Đã từ chối' :
                                 'Đang chờ'}
                              </span>
                            </p>
                            {reg.status === 'accepted' && reg.professor_email && (
                              <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                <p className="text-sm font-semibold text-green-900 mb-2">
                                  📧 Liên hệ giảng viên:
                                </p>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-sm text-gray-700">Email:</span>
                                  <code className="text-sm bg-white px-2 py-1 rounded border">{reg.professor_email}</code>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(reg.professor_email)
                                      alert('Đã copy email vào clipboard!')
                                    }}
                                    className="text-xs text-blue-600 hover:text-blue-700"
                                    title="Copy email"
                                  >
                                    📋 Copy
                                  </button>
                                </div>
                                <button
                                  onClick={() => {
                                    const subject = encodeURIComponent('Liên hệ về đăng ký hướng dẫn')
                                    const body = encodeURIComponent(`Xin chào thầy/cô ${reg.professor_name},\n\nTôi là học sinh đã được thầy/cô chấp nhận đăng ký hướng dẫn.\n\n`)
                                    const mailtoLink = `mailto:${reg.professor_email}?subject=${subject}&body=${body}`
                                    window.location.href = mailtoLink
                                  }}
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                  Mở email client
                                </button>
                              </div>
                            )}
                            {reg.notes && (
                              <p className="text-sm text-gray-500 mt-1">{reg.notes}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Chưa có đăng ký nào</p>
              )}
            </div>
          </>
        )}

        {!isStudent && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Đăng ký từ học sinh
            </h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : registrations.length > 0 ? (
              <div className="space-y-3">
                {registrations.map((reg) => (
                  <div key={reg.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Học sinh: {reg.student_id}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Nguyện vọng {reg.priority} | Trạng thái: {reg.status}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                          Chấp nhận
                        </button>
                        <button className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">
                          Từ chối
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Chưa có đăng ký nào</p>
            )}
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-primary-600 hover:text-primary-800 font-medium"
          >
            ← Về trang chủ
          </Link>
        </div>
        </div>
      </main>
    </div>
  )
}

