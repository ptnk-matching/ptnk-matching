'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { getMyProfile, createProfile, updateProfile, uploadCV } from '@/services/api'
import Link from 'next/link'

export default function ProfileBuilderPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    department: '',
    research_interests: [] as string[],
    bio: '',
    expertise_areas: [] as string[],
    education: '',
    publications: '',
    contact_email: '',
  })
  const [newInterest, setNewInterest] = useState('')
  const [newExpertise, setNewExpertise] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [uploadingCV, setUploadingCV] = useState(false)
  const [cvExtracted, setCvExtracted] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') {
      loadProfile()
    }
  }, [status])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const response = await getMyProfile()
      if (response.profile) {
        setProfile(response.profile)
        setFormData({
          name: response.profile.name || '',
          title: response.profile.title || '',
          department: response.profile.department || '',
          research_interests: response.profile.research_interests || [],
          bio: response.profile.bio || '',
          expertise_areas: response.profile.expertise_areas || [],
          education: response.profile.education || '',
          publications: response.profile.publications || '',
          contact_email: response.profile.contact_email || session?.user?.email || '',
        })
      } else {
        // Initialize with user info
        setFormData({
          ...formData,
          name: session?.user?.name || '',
          contact_email: session?.user?.email || '',
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Chỉ chấp nhận file PDF')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File quá lớn. Vui lòng chọn file nhỏ hơn 10MB')
      return
    }

    setCvFile(file)
    setUploadingCV(true)

    try {
      const result = await uploadCV(file)
      
      if (result.extracted_info) {
        // Auto-fill form with extracted info
        const extracted = result.extracted_info
        setFormData({
          name: extracted.name || formData.name,
          title: extracted.title || formData.title,
          department: extracted.department || formData.department,
          research_interests: extracted.research_interests || formData.research_interests,
          bio: extracted.bio || formData.bio,
          expertise_areas: extracted.expertise_areas || formData.expertise_areas,
          education: extracted.education || formData.education,
          publications: extracted.publications || formData.publications,
          contact_email: formData.contact_email,
        })
        setCvExtracted(true)
        setSuccessMessage('Đã upload CV và trích xuất thông tin thành công! Vui lòng kiểm tra và chỉnh sửa nếu cần.')
      } else {
        setSuccessMessage('Đã upload CV thành công!')
      }

      // Reload profile
      await loadProfile()
      
      setTimeout(() => {
        setSuccessMessage('')
        setCvExtracted(false)
      }, 5000)
    } catch (error: any) {
      console.error('Error uploading CV:', error)
      alert(error.message || 'Có lỗi xảy ra khi upload CV')
    } finally {
      setUploadingCV(false)
      setCvFile(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccessMessage('')

    try {
      const profileData = {
        name: formData.name,
        title: formData.title,
        department: formData.department,
        research_interests: formData.research_interests,
        bio: formData.bio,
        expertise_areas: formData.expertise_areas,
        education: formData.education || undefined,
        publications: formData.publications || undefined,
        contact_email: formData.contact_email || undefined,
      }

      if (profile) {
        await updateProfile(profileData)
        setSuccessMessage('Cập nhật profile thành công!')
      } else {
        await createProfile(profileData)
        setSuccessMessage('Tạo profile thành công!')
      }

      // Reload profile
      await loadProfile()
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error: any) {
      console.error('Error saving profile:', error)
      alert(error.message || 'Có lỗi xảy ra khi lưu profile')
    } finally {
      setSaving(false)
    }
  }

  const addInterest = () => {
    if (newInterest.trim() && !formData.research_interests.includes(newInterest.trim())) {
      setFormData({
        ...formData,
        research_interests: [...formData.research_interests, newInterest.trim()],
      })
      setNewInterest('')
    }
  }

  const removeInterest = (index: number) => {
    setFormData({
      ...formData,
      research_interests: formData.research_interests.filter((_, i) => i !== index),
    })
  }

  const addExpertise = () => {
    if (newExpertise.trim() && !formData.expertise_areas.includes(newExpertise.trim())) {
      setFormData({
        ...formData,
        expertise_areas: [...formData.expertise_areas, newExpertise.trim()],
      })
      setNewExpertise('')
    }
  }

  const removeExpertise = (index: number) => {
    setFormData({
      ...formData,
      expertise_areas: formData.expertise_areas.filter((_, i) => i !== index),
    })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
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

  const role = (session?.user as any)?.role || 'student'
  const storedRole = typeof window !== 'undefined' ? localStorage.getItem('selectedRole') : null
  const actualRole = role === 'professor' ? 'professor' : (storedRole === 'professor' ? 'professor' : 'student')

  if (actualRole !== 'professor') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không có quyền truy cập</h1>
          <p className="text-gray-600 mb-6">Trang này chỉ dành cho Giảng viên.</p>
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

  const isComplete = profile?.is_complete || false

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Xây dựng Profile</h1>
            <Link
              href="/professor"
              className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100"
            >
              ← Về Dashboard
            </Link>
          </div>

          {isComplete && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium text-green-800">
                  Profile của bạn đã đầy đủ và sẽ được hiển thị trong kết quả tìm kiếm!
                </p>
              </div>
            </div>
          )}

          {!isComplete && profile && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium text-yellow-800">
                  Profile của bạn chưa đầy đủ. Vui lòng điền đầy đủ thông tin để được hiển thị trong kết quả tìm kiếm.
                </p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          )}

          {/* CV Upload Section */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">📄 Upload CV (Tùy chọn)</h2>
            <p className="text-sm text-gray-600 mb-3">
              Upload CV của bạn để hệ thống tự động trích xuất thông tin. Hệ thống sẽ điền sẵn các trường dựa trên CV của bạn.
            </p>
            <div className="flex items-center gap-3">
              <label className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer">
                {uploadingCV ? 'Đang xử lý...' : 'Chọn file CV (PDF)'}
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleCVUpload}
                  disabled={uploadingCV}
                  className="hidden"
                />
              </label>
              {profile?.cv_url && (
                <a
                  href={profile.cv_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-600 hover:underline"
                >
                  📎 Xem CV hiện tại
                </a>
              )}
            </div>
            {cvExtracted && (
              <p className="text-sm text-green-700 mt-2">
                ✓ Đã trích xuất thông tin từ CV. Vui lòng kiểm tra và chỉnh sửa các trường bên dưới.
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Thông tin cơ bản</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chức danh <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Giáo sư, Phó Giáo sư, Tiến sĩ..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Khoa/Bộ môn <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email liên hệ
                </label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2 mb-4">Tiểu sử</h2>
              <textarea
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Giới thiệu ngắn gọn về bản thân, kinh nghiệm nghiên cứu..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Research Interests */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2 mb-4">
                Lĩnh vực nghiên cứu <span className="text-red-500">*</span>
              </h2>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                  placeholder="Nhập lĩnh vực nghiên cứu và nhấn Enter"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={addInterest}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Thêm
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.research_interests.map((interest, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                  >
                    {interest}
                    <button
                      type="button"
                      onClick={() => removeInterest(index)}
                      className="hover:text-primary-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              {formData.research_interests.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  Chưa có lĩnh vực nghiên cứu nào. Vui lòng thêm ít nhất một lĩnh vực.
                </p>
              )}
            </div>

            {/* Expertise Areas */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2 mb-4">Chuyên môn</h2>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newExpertise}
                  onChange={(e) => setNewExpertise(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
                  placeholder="Nhập chuyên môn và nhấn Enter"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={addExpertise}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Thêm
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.expertise_areas.map((expertise, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {expertise}
                    <button
                      type="button"
                      onClick={() => removeExpertise(index)}
                      className="hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Education */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2 mb-4">Học vấn</h2>
              <textarea
                rows={3}
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                placeholder="Trình độ học vấn, bằng cấp..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Publications */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2 mb-4">Công trình nghiên cứu</h2>
              <textarea
                rows={4}
                value={formData.publications}
                onChange={(e) => setFormData({ ...formData, publications: e.target.value })}
                placeholder="Các công trình nghiên cứu, bài báo khoa học..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Link
                href="/professor"
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Hủy
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {saving ? 'Đang lưu...' : (profile ? 'Cập nhật Profile' : 'Tạo Profile')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}

