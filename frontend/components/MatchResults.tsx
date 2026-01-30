'use client'

import RegisterButton from './RegisterButton'

interface Match {
  id: string
  name: string
  title?: string
  department?: string
  expertise?: string
  research_interests?: string
  description?: string
  email?: string
  match_percentage: number
  similarity_score: number
  keywords?: string[]
  publications?: number
  analysis?: string | null
}

interface MatchResultsProps {
  matches: Match[]
  documentId?: string | null
  onRegistrationChange?: () => void
  hasExistingRegistration?: boolean
}

export default function MatchResults({ 
  matches, 
  documentId, 
  onRegistrationChange,
  hasExistingRegistration = false 
}: MatchResultsProps) {
  if (matches.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Không tìm thấy giảng viên phù hợp.
      </div>
    )
  }

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-100 text-green-800 border-green-300'
    if (percentage >= 60) return 'bg-blue-100 text-blue-800 border-blue-300'
    if (percentage >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    return 'bg-gray-100 text-gray-800 border-gray-300'
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">
        Tìm thấy <span className="font-semibold">{matches.length}</span> giảng viên phù hợp:
      </p>
      
      {matches.map((match, index) => (
        <div
          key={match.id}
          className="border rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold text-gray-900">
                  {index + 1}. {match.name}
                </h3>
                {match.title && (
                  <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {match.title}
                  </span>
                )}
              </div>
              {match.department && (
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Khoa:</span> {match.department}
                </p>
              )}
            </div>
            <div
              className={`
                px-4 py-2 rounded-lg border font-semibold text-lg
                ${getMatchColor(match.match_percentage)}
              `}
            >
              {match.match_percentage.toFixed(1)}%
            </div>
          </div>

          {match.expertise && (
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-700 mb-1">
                Chuyên môn:
              </p>
              <p className="text-sm text-gray-600">{match.expertise}</p>
            </div>
          )}

          {match.research_interests && (
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-700 mb-1">
                Lĩnh vực nghiên cứu:
              </p>
              <p className="text-sm text-gray-600">{match.research_interests}</p>
            </div>
          )}

          {match.description && (
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-700 mb-1">
                Mô tả:
              </p>
              <p className="text-sm text-gray-600">{match.description}</p>
            </div>
          )}

          {match.keywords && match.keywords.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Từ khóa:
              </p>
              <div className="flex flex-wrap gap-2">
                {match.keywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {match.analysis && (
            <div className="mb-4 mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">
                    Tại sao giảng viên này phù hợp?
                  </h4>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    {match.analysis}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex items-center gap-4">
              {match.email && (
                <a
                  href={`mailto:${match.email}`}
                  className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                >
                  📧 {match.email}
                </a>
              )}
              {match.publications !== undefined && (
                <span className="text-sm text-gray-500">
                  {match.publications} công trình nghiên cứu
                </span>
              )}
            </div>
            <div className="flex-shrink-0">
              <RegisterButton
                professorId={match.id}
                professorName={match.name}
                documentId={documentId || null}
                priority={index + 1}
                onRegistered={onRegistrationChange}
                disabled={hasExistingRegistration || !documentId}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

