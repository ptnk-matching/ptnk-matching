import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 300000, // 5 minutes timeout for file processing (upload + AI matching can take time)
})

// Add interceptor to include user ID from session
api.interceptors.request.use(
  (config) => {
    // Get MongoDB user ID (preferred) or Google ID
    if (typeof window !== 'undefined') {
      const mongoUserId = localStorage.getItem('mongoUserId')
      const googleUserId = localStorage.getItem('userId')
      const userId = mongoUserId || googleUserId
      if (userId) {
        config.headers['X-User-Id'] = userId
        config.headers['X-Google-Id'] = googleUserId || userId // Also send Google ID as fallback
        console.log('DEBUG: Sending X-User-Id:', userId, 'X-Google-Id:', googleUserId || userId)
      } else {
        console.warn('DEBUG: No user ID found in localStorage')
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    if (error.response) {
      // Server responded with error status
      const status = error.response.status
      const data = error.response.data
      
      if (status === 401) {
        console.error('Unauthorized - user may need to login again')
      } else if (status === 403) {
        console.error('Forbidden - user does not have permission')
      } else if (status === 404) {
        console.error('Not found:', error.config.url)
      } else if (status >= 500) {
        console.error('Server error:', data)
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request)
    } else {
      // Something happened in setting up the request
      console.error('Error setting up request:', error.message)
    }
    
    return Promise.reject(error)
  }
)

export default api

// Types
export interface MatchResult {
  professor_id: string
  professor_name: string
  similarity_score: number
  match_percentage: number
  analysis?: string
}

export interface UploadAndMatchResponse {
  matches: MatchResult[]
  document_id?: string
}

// API functions
export async function matchProfessors(
  text: string,
  topK: number = 5,
  includeAnalysis: boolean = true
): Promise<MatchResult[]> {
  const response = await api.post('/api/match', {
    text,
    top_k: topK,
    include_analysis: includeAnalysis,
  })
  return response.data.matches || []
}

export async function uploadAndMatch(
  file: File,
  topK: number = 5,
  includeAnalysis: boolean = true,
  onUploadProgress?: (progress: number) => void
): Promise<UploadAndMatchResponse & { document_id?: string }> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post<UploadAndMatchResponse & { document_id?: string }>(
    `/api/upload-and-match?top_k=${topK}&include_analysis=${includeAnalysis}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 300000, // 5 minutes for this specific request
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onUploadProgress(percentCompleted)
        }
      },
    }
  )

  return response.data
}

export async function getProfessors() {
  const response = await api.get('/api/professors')
  return response.data
}

// User APIs
export async function createUser(userData: {
  google_id: string
  email: string
  name: string
  role: string
  avatar_url?: string | null
}) {
  const response = await api.post('/api/users/', userData)
  return response.data
}

export async function getCurrentUser() {
  const response = await api.get('/api/users/me')
  return response.data
}

// Document APIs
export async function uploadDocument(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await api.post('/api/documents/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export async function getMyDocuments() {
  const response = await api.get('/api/documents/me')
  return response.data
}

export async function getDocument(documentId: string) {
  const response = await api.get(`/api/documents/${documentId}`)
  return response.data
}

export async function getDocumentDownloadUrl(documentId: string) {
  const response = await api.get(`/api/documents/${documentId}/download`)
  return response.data
}

// Registration APIs
export interface CreateRegistrationRequest {
  professor_id: string
  document_id: string
  priority?: number
  notes?: string
}

export async function createRegistration(data: CreateRegistrationRequest) {
  const response = await api.post('/api/registrations/', data)
  return response.data
}

export async function getMyRegistrations() {
  const response = await api.get('/api/registrations/')
  return response.data
}

export async function updateRegistrationStatus(
  registrationId: string,
  status: 'pending' | 'accepted' | 'rejected',
  reason?: string
) {
  const response = await api.put(
    `/api/registrations/${registrationId}/status`,
    { 
      status,
      reason: reason || undefined
    }
  )
  return response.data
}

export async function deleteRegistration(registrationId: string) {
  const response = await api.delete(`/api/registrations/${registrationId}`)
  return response.data
}

// Health check function
export async function checkHealth() {
  try {
    const response = await api.get('/health')
    return response.data
  } catch (error) {
    console.error('Health check failed:', error)
    throw error
  }
}

// Auth config check
export async function getAuthConfig() {
  const response = await fetch('/api/auth/config')
  return response.json()
}

// Professor Profile APIs
export async function getMyProfile() {
  const response = await api.get('/api/professor-profile/')
  return response.data
}

export async function createProfile(profileData: {
  name: string
  title: string
  department: string
  research_interests: string[]
  bio?: string
  expertise_areas?: string[]
  education?: string
  publications?: string
  contact_email?: string
}) {
  const response = await api.post('/api/professor-profile/', profileData)
  return response.data
}

export async function updateProfile(profileData: {
  name: string
  title: string
  department: string
  research_interests: string[]
  bio?: string
  expertise_areas?: string[]
  education?: string
  publications?: string
  contact_email?: string
}) {
  const response = await api.put('/api/professor-profile/', profileData)
  return response.data
}

export async function uploadCV(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await api.post('/api/professor-profile/upload-cv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

// Notification APIs
export interface Notification {
  id: string;
  user_id: string;
  type: 'registration_request' | 'registration_accepted' | 'registration_rejected';
  title: string;
  message: string;
  related_user_id?: string;
  related_registration_id?: string;
  related_document_id?: string;
  is_read: boolean;
  created_at: string;
}

export const getMyNotifications = async (): Promise<{
  notifications: Notification[];
  unread_count: number;
  total: number;
}> => {
  const response = await api.get('/api/notifications/');
  return response.data;
};

export const getUnreadNotificationCount = async (): Promise<{ unread_count: number }> => {
  const response = await api.get('/api/notifications/unread-count');
  return response.data;
};

export const markNotificationAsRead = async (notificationId: string): Promise<{ success: boolean }> => {
  const response = await api.put(`/api/notifications/${notificationId}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async (): Promise<{ success: boolean; message: string }> => {
  const response = await api.put('/api/notifications/read-all');
  return response.data;
};

export const deleteNotification = async (notificationId: string): Promise<{ success: boolean }> => {
  const response = await api.delete(`/api/notifications/${notificationId}`);
  return response.data;
};
