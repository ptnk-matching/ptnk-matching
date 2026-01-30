'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { getMyRegistrations, updateRegistrationStatus, getDocument, getMyProfile, getDocumentDownloadUrl } from '@/services/api'
import { getProfessors } from '@/services/api'
import Link from 'next/link'
import Header from '@/components/Header'
import ReactMarkdown from 'react-markdown'

export default function ProfessorPage() {
  const { data: session, status } = useSession()
  const [registrations, setRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRegistration, setSelectedRegistration] = useState<any | null>(null)
  const [documentContent, setDocumentContent] = useState<any | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [actionType, setActionType] = useState<'accept' | 'reject' | null>(null)
  const [reason, setReason] = useState('')
  const [profile, setProfile] = useState<any>(null)
  const [quickActionReg, setQuickActionReg] = useState<any | null>(null)
  const [quickReason, setQuickReason] = useState('')

  useEffect(() => {
    if (status === 'authenticated') {
      loadRegistrations()
      loadProfile()
    }
  }, [status])

  const loadProfile = async () => {
    try {
      const profileData = await getMyProfile()
      setProfile(profileData.profile)
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const loadRegistrations = async () => {
    try {
      setLoading(true)
      const regsData = await getMyRegistrations()
      setRegistrations(regsData.registrations || [])
    } catch (error) {
      console.error('Error loading registrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDocument = async (documentId: string) => {
    try {
      const doc = await getDocument(documentId)
      setDocumentContent(doc)
      setShowModal(true)
    } catch (error) {
      console.error('Error loading document:', error)
      alert('Không thể tải tài liệu')
    }
  }

  const handleDownloadFile = async (documentId: string, filename: string) => {
    try {
      const { download_url } = await getDocumentDownloadUrl(documentId)
      // Open presigned URL in new tab
      window.open(download_url, '_blank')
    } catch (error: any) {
      console.error('Error getting download URL:', error)
      alert(error?.response?.data?.detail || 'Không thể tải file. Vui lòng thử lại.')
    }
  }

  const handleQuickAction = async (reg: any, type: 'accept' | 'reject') => {
    if (type === 'reject' && !quickReason.trim()) {
      alert('Vui lòng nhập lý do từ chối')
      return
    }

    try {
      await updateRegistrationStatus(
        reg.id,
        type === 'accept' ? 'accepted' : 'rejected',
        quickReason || undefined
      )
      
      // Reload registrations
      await loadRegistrations()
      setQuickActionReg(null)
      setQuickReason('')
      
      alert(type === 'accept' 
        ? 'Đã chấp nhận đăng ký thành công! Học sinh sẽ nhận được thông báo.' 
        : 'Đã từ chối đăng ký. Học sinh sẽ nhận được thông báo.')
    } catch (error: any) {
      console.error('Error updating status:', error)
      alert(error.message || 'Có lỗi xảy ra khi cập nhật trạng thái')
    }
  }

  const handleAction = (reg: any, type: 'accept' | 'reject') => {
    setSelectedRegistration(reg)
    setActionType(type)
    setReason('')
    setShowModal(true)
  }

  const confirmAction = async () => {
    if (!selectedRegistration || !actionType) return

    try {
      await updateRegistrationStatus(
        selectedRegistration.id,
        actionType === 'accept' ? 'accepted' : 'rejected',
        reason
      )
      
      // Reload registrations
      await loadRegistrations()
      setShowModal(false)
      setSelectedRegistration(null)
      setActionType(null)
      setReason('')
      setDocumentContent(null)
      
      alert(actionType === 'accept' 
        ? 'Đã chấp nhận đăng ký thành công! Học sinh sẽ nhận được thông báo.' 
        : 'Đã từ chối đăng ký. Học sinh sẽ nhận được thông báo.')
    } catch (error: any) {
      console.error('Error updating status:', error)
      alert(error.message || 'Có lỗi xảy ra khi cập nhật trạng thái')
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
          <p className="text-gray-600 mb-6">Vui lòng đăng nhập với vai trò Giảng viên.</p>
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
  
  if (role !== 'professor') {
    const actualRole = role === 'student' ? 'Học sinh' : 'Chưa xác định'
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-teal-50 to-primary-100">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Không có quyền truy cập</h1>
            <p className="text-gray-600 mb-4">
              Trang này chỉ dành cho <span className="font-semibold text-primary-600">Giảng viên</span>.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">Bạn đang đăng nhập với vai trò:</span> <span className="font-bold text-yellow-900">{actualRole}</span>
              </p>
              <p className="text-xs text-yellow-700 mt-2">
                Để truy cập trang này, vui lòng đăng xuất và đăng nhập lại với vai trò <span className="font-semibold">Giảng viên</span>.
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <Link
              href="/profile"
              className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100"
            >
              Vào Profile
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

  const pendingRegistrations = registrations.filter((r: any) => r.status === 'pending')
  const processedRegistrations = registrations.filter((r: any) => r.status !== 'pending')

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-teal-50 to-primary-100">
      <Header />
      <main className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard Giảng viên
            </h2>
            <p className="text-gray-600">
              Quản lý đăng ký và profile
            </p>
          </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {session?.user?.image && (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{session?.user?.name}</h2>
                <p className="text-gray-600">{session?.user?.email}</p>
                <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded">
                  Giảng viên
                </span>
              </div>
            </div>
            <Link
              href="/professor/profile-builder"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
            >
              {profile?.is_complete ? '✏️ Cập nhật Profile' : '➕ Tạo Profile'}
            </Link>
          </div>
          
          {profile && (
            <div className={`p-4 rounded-lg border ${
              profile.is_complete 
                ? 'bg-green-50 border-green-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center gap-2">
                {profile.is_complete ? (
                  <>
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium text-green-800">
                      Profile của bạn đã đầy đủ và sẽ được hiển thị trong kết quả tìm kiếm của học sinh.
                    </p>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium text-yellow-800">
                      Profile của bạn chưa đầy đủ. Vui lòng tạo profile để được hiển thị trong kết quả tìm kiếm.
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
          
          {!profile && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-800">
                Bạn chưa có profile. Hãy tạo profile để học sinh có thể tìm thấy bạn!
              </p>
            </div>
          )}
        </div>

        {/* Pending Registrations */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Đăng ký đang chờ ({pendingRegistrations.length})
          </h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : pendingRegistrations.length > 0 ? (
            <div className="space-y-4">
              {pendingRegistrations.map((reg) => (
                <div key={reg.id} className="border-2 border-yellow-300 rounded-lg p-4 bg-yellow-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Học sinh: {reg.student_id}
                        </h3>
                        <span className="px-2 py-1 text-xs font-medium bg-yellow-200 text-yellow-800 rounded">
                          Nguyện vọng {reg.priority}
                        </span>
                      </div>
                      {reg.document_filename && (
                        <p className="text-sm text-gray-600 mb-2">
                          📄 Tài liệu: <span className="font-medium">{reg.document_filename}</span>
                        </p>
                      )}
                      {reg.notes && (
                        <p className="text-sm text-gray-600 mb-3">{reg.notes}</p>
                      )}
                      
                      {/* Quick action area */}
                      {quickActionReg?.id === reg.id ? (
                        <div className="mt-3 p-3 bg-white rounded border border-gray-300">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {quickActionReg.actionType === 'reject' ? 'Lý do từ chối:' : 'Lý do chấp nhận (tùy chọn):'}
                          </label>
                          <textarea
                            value={quickReason}
                            onChange={(e) => setQuickReason(e.target.value)}
                            placeholder={quickActionReg.actionType === 'reject' ? 'Nhập lý do từ chối...' : 'Nhập lý do chấp nhận...'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-2"
                            rows={2}
                            required={quickActionReg.actionType === 'reject'}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleQuickAction(reg, quickActionReg.actionType)}
                              className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700"
                            >
                              Xác nhận
                            </button>
                            <button
                              onClick={() => {
                                setQuickActionReg(null)
                                setQuickReason('')
                              }}
                              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleViewDocument(reg.document_id)}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            📄 Xem tài liệu
                          </button>
                          <button
                            onClick={() => {
                              setQuickActionReg({ id: reg.id, actionType: 'accept' })
                              setQuickReason('')
                            }}
                            className="px-4 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 font-medium"
                          >
                            ✓ Chấp nhận
                          </button>
                          <button
                            onClick={() => {
                              setQuickActionReg({ id: reg.id, actionType: 'reject' })
                              setQuickReason('')
                            }}
                            className="px-4 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 font-medium"
                          >
                            ✗ Từ chối
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Chưa có đăng ký nào đang chờ</p>
          )}
        </div>

        {/* Processed Registrations */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Đăng ký đã xử lý ({processedRegistrations.length})
          </h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : processedRegistrations.length > 0 ? (
            <div className="space-y-3">
              {processedRegistrations.map((reg) => (
                <div key={reg.id} className={`border rounded-lg p-4 ${
                  reg.status === 'accepted' ? 'bg-green-50 border-green-200' :
                  'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          Học sinh: {reg.student_id}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          reg.status === 'accepted' 
                            ? 'bg-green-200 text-green-800' 
                            : 'bg-red-200 text-red-800'
                        }`}>
                          {reg.status === 'accepted' ? 'Đã chấp nhận' : 'Đã từ chối'}
                        </span>
                      </div>
                      {reg.document_filename && (
                        <p className="text-sm text-gray-600 mb-1">
                          📄 {reg.document_filename}
                        </p>
                      )}
                      {reg.notes && (
                        <p className="text-sm text-gray-700 mt-2 p-2 bg-white rounded border-l-4 border-gray-300">
                          {reg.notes}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleViewDocument(reg.document_id)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Xem tài liệu
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Chưa có đăng ký nào đã xử lý</p>
          )}
        </div>

        {/* Modal for viewing document and taking action */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {actionType ? (
                      actionType === 'accept' ? 'Chấp nhận đăng ký' : 'Từ chối đăng ký'
                    ) : (
                      'Chi tiết tài liệu'
                    )}
                  </h2>
                  <button
                    onClick={() => {
                      setShowModal(false)
                      setSelectedRegistration(null)
                      setActionType(null)
                      setReason('')
                      setDocumentContent(null)
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {documentContent && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {documentContent.filename}
                    </h3>
                    {documentContent.summary && (
                      <div className="mb-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                        <h4 className="font-semibold text-blue-900 mb-3">📝 Tóm tắt AI:</h4>
                        <div className="prose prose-sm max-w-none 
                          prose-headings:text-blue-900 prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2
                          prose-p:text-blue-800 prose-p:leading-relaxed prose-p:my-2
                          prose-strong:text-blue-900 prose-strong:font-semibold
                          prose-ul:text-blue-800 prose-ul:my-2 prose-ul:pl-4
                          prose-ol:text-blue-800 prose-ol:my-2 prose-ol:pl-4
                          prose-li:text-blue-800 prose-li:my-1
                          prose-h1:text-lg prose-h2:text-base prose-h3:text-sm
                          prose-h1:font-bold prose-h2:font-semibold prose-h3:font-semibold">
                          <ReactMarkdown>{documentContent.summary}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">📄 Nội dung:</h4>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap max-h-96 overflow-y-auto">
                        {documentContent.extracted_text || 'Không có nội dung'}
                      </p>
                    </div>
                    {documentContent.s3_key && (
                      <button
                        onClick={() => handleDownloadFile(documentContent.id, documentContent.filename)}
                        className="mt-2 inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 hover:underline font-medium"
                      >
                        📎 Xem file gốc
                      </button>
                    )}
                  </div>
                )}

                {actionType && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {actionType === 'accept' ? 'Lý do chấp nhận (tùy chọn):' : 'Lý do từ chối (bắt buộc):'}
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder={
                        actionType === 'accept' 
                          ? 'Nhập lý do chấp nhận đăng ký này...'
                          : 'Nhập lý do từ chối đăng ký này...'
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      rows={4}
                      required={actionType === 'reject'}
                    />
                  </div>
                )}

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowModal(false)
                      setSelectedRegistration(null)
                      setActionType(null)
                      setReason('')
                      setDocumentContent(null)
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Đóng
                  </button>
                  {actionType && (
                    <button
                      onClick={confirmAction}
                      disabled={actionType === 'reject' && !reason.trim()}
                      className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${
                        actionType === 'accept'
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-red-600 hover:bg-red-700'
                      } disabled:bg-gray-300 disabled:cursor-not-allowed`}
                    >
                      {actionType === 'accept' ? 'Xác nhận chấp nhận' : 'Xác nhận từ chối'}
                    </button>
                  )}
                </div>
              </div>
            </div>
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

