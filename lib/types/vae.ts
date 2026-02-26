// VAE (Visual Accountability Engine) Types

export interface VAEProject {
  id: string
  project_code: string
  project_name: string
  description?: string
  client_name?: string
  location?: string
  start_date?: string
  end_date?: string
  status: 'planning' | 'active' | 'paused' | 'completed'
  created_at: string
  updated_at: string
}

export interface VAESite {
  id: string
  project_id: string
  site_code: string
  site_name: string
  location_gps?: {
    lat: number
    lng: number
  }
  description?: string
  status: 'active' | 'paused' | 'completed'
  created_at: string
  updated_at: string
}

export interface VAEWorkItem {
  id: string
  site_id: string
  work_code: string
  work_name: string
  description?: string
  work_type: string
  phase?: string
  planned_start?: string
  planned_end?: string
  status: 'pending' | 'in_progress' | 'completed' | 'paused'
  progress_percentage: number
  created_at: string
  updated_at: string
}

export interface VAEMedia {
  id: string
  work_item_id: string
  site_id: string
  media_type: 'image' | 'video'
  original_filename?: string
  storage_path: string
  file_size?: number
  mime_type?: string
  image_width?: number
  image_height?: number
  capture_time: string
  gps_location?: {
    lat: number
    lng: number
    accuracy?: number
  }
  photographer_name?: string
  notes?: string
  source: 'manual' | 'whatsapp' | 'mobile_app' | 'camera'
  whatsapp_message_id?: string
  processing_status: 'pending' | 'processing' | 'completed' | 'failed'
  ai_analysis?: VAEAIAnalysis
  created_at: string
  updated_at: string
}

export interface VAEAIAnalysis {
  id: string
  media_id: string
  detected_objects?: string[]
  quality_score: number
  quality_issues?: string[]
  progress_indicators?: Record<string, boolean>
  estimated_progress: number
  waste_detected: boolean
  waste_type?: string[]
  safety_issues?: string[]
  recommendations?: Record<string, any>
  processing_time_ms?: number
  model_version?: string
  created_at: string
  updated_at: string
}

export interface VAEProgressComparison {
  id: string
  work_item_id: string
  before_media_id: string
  after_media_id: string
  progress_detected?: number
  time_difference_minutes?: number
  analysis_result?: Record<string, any>
  created_at: string
}

export interface VAEEventLog {
  id: string
  site_id: string
  event_type: string
  event_data?: Record<string, any>
  created_by?: string
  created_at: string
}

export interface VAEReport {
  id: string
  site_id: string
  report_type: 'daily' | 'weekly' | 'monthly'
  report_date: string
  summary?: Record<string, any>
  statistics?: Record<string, any>
  media_count?: number
  average_quality_score?: number
  progress_summary?: string
  generated_at: string
}

// API Response Types
export interface MediaUploadResponse {
  success: boolean
  media_id: string
  processing_status: string
  message?: string
}

export interface AIAnalysisResponse {
  success: boolean
  analysis_id: string
  quality_score: number
  detected_objects: string[]
  waste_detected: boolean
  safety_issues: string[]
  recommendations: Record<string, any>
  processing_time_ms: number
}

export interface DashboardStats {
  total_media: number
  average_quality: number
  sites_active: number
  tasks_completed: number
  waste_incidents: number
  safety_incidents: number
  daily_progress_percent: number
}
