-- VAE (Visual Accountability Engine) Database Schema
-- هذا المخطط يدعم نظام توثيق الأعمال الميدانية بالصور والفيديوهات

-- 1. جداول المشاريع والمواقع
CREATE TABLE IF NOT EXISTS vae_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_code TEXT NOT NULL UNIQUE,
  project_name TEXT NOT NULL,
  description TEXT,
  client_name TEXT,
  location TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('planning', 'active', 'paused', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vae_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES vae_projects(id) ON DELETE CASCADE,
  site_code TEXT NOT NULL,
  site_name TEXT NOT NULL,
  location_gps TEXT, -- JSON: {"lat": 0, "lng": 0}
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, site_code)
);

-- 2. جدول المهام والأعمال
CREATE TABLE IF NOT EXISTS vae_work_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES vae_sites(id) ON DELETE CASCADE,
  work_code TEXT NOT NULL,
  work_name TEXT NOT NULL,
  description TEXT,
  work_type TEXT NOT NULL, -- "excavation", "foundation", "structure", etc.
  phase TEXT, -- "planning", "in_progress", "review", "completed"
  planned_start TIMESTAMPTZ,
  planned_end TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'paused')),
  progress_percentage DECIMAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(site_id, work_code)
);

-- 3. جدول الصور والفيديوهات (الميديا)
CREATE TABLE IF NOT EXISTS vae_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_item_id UUID NOT NULL REFERENCES vae_work_items(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES vae_sites(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  original_filename TEXT,
  storage_path TEXT NOT NULL, -- مسار التخزين في Supabase
  file_size BIGINT, -- بالبايتات
  mime_type TEXT,
  
  -- معلومات الصورة
  image_width INTEGER,
  image_height INTEGER,
  
  -- معلومات الموقع والزمن
  capture_time TIMESTAMPTZ NOT NULL,
  gps_location TEXT, -- JSON: {"lat": 0, "lng": 0, "accuracy": 0}
  photographer_name TEXT,
  notes TEXT,
  
  -- مصدر الصورة
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'whatsapp', 'mobile_app', 'camera')),
  whatsapp_message_id TEXT UNIQUE, -- إذا كانت من WhatsApp
  
  -- معلومات المعالجة
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  ai_analysis JSONB, -- نتائج تحليل AI
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. جدول نتائج تحليل AI (Computer Vision)
CREATE TABLE IF NOT EXISTS vae_ai_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID NOT NULL UNIQUE REFERENCES vae_media(id) ON DELETE CASCADE,
  
  -- التصنيفات والكشوفات
  detected_objects JSONB, -- ["wall", "foundation", "scaffolding"]
  quality_score DECIMAL DEFAULT 0, -- من 0-100
  quality_issues TEXT[], -- مشاكل جودة الصورة
  
  -- تحليل التقدم
  progress_indicators JSONB, -- {"concrete_poured": true, "walls_erected": false}
  estimated_progress DECIMAL DEFAULT 0, -- نسبة التقدم المتوقعة
  
  -- كشف الهدر والمشاكل
  waste_detected BOOLEAN DEFAULT false,
  waste_type TEXT[], -- ["material_scatter", "unused_equipment"]
  safety_issues TEXT[], -- ["no_harness", "exposed_height"]
  
  -- التوصيات
  recommendations JSONB,
  
  processing_time_ms INTEGER, -- الوقت المستغرق في التحليل
  model_version TEXT, -- إصدار نموذج AI المستخدم
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. جدول المقارنات الزمنية (Before/After)
CREATE TABLE IF NOT EXISTS vae_progress_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_item_id UUID NOT NULL REFERENCES vae_work_items(id) ON DELETE CASCADE,
  
  before_media_id UUID NOT NULL REFERENCES vae_media(id) ON DELETE CASCADE,
  after_media_id UUID NOT NULL REFERENCES vae_media(id) ON DELETE CASCADE,
  
  progress_detected DECIMAL, -- نسبة التقدم المرصودة
  time_difference_minutes INTEGER, -- الفرق الزمني بالدقائق
  analysis_result JSONB, -- نتائج المقارنة التفصيلية
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. جدول السجلات والأحداث
CREATE TABLE IF NOT EXISTS vae_event_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES vae_sites(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- "media_uploaded", "ai_analysis_complete", "progress_updated"
  event_data JSONB,
  created_by TEXT, -- اسم المستخدم أو الجهاز
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. جدول التقارير المنتجة
CREATE TABLE IF NOT EXISTS vae_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES vae_sites(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL, -- "daily", "weekly", "monthly"
  report_date DATE NOT NULL,
  
  -- محتوى التقرير
  summary JSONB,
  statistics JSONB, -- إحصائيات اليوم/الأسبوع
  media_count INTEGER,
  average_quality_score DECIMAL,
  progress_summary TEXT,
  
  generated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes للأداء
CREATE INDEX idx_vae_media_work_item ON vae_media(work_item_id);
CREATE INDEX idx_vae_media_site ON vae_media(site_id);
CREATE INDEX idx_vae_media_capture_time ON vae_media(capture_time);
CREATE INDEX idx_vae_media_source ON vae_media(source);
CREATE INDEX idx_vae_ai_analysis_media ON vae_ai_analysis(media_id);
CREATE INDEX idx_vae_work_items_site ON vae_work_items(site_id);
CREATE INDEX idx_vae_sites_project ON vae_sites(project_id);
CREATE INDEX idx_vae_event_logs_site ON vae_event_logs(site_id);

-- Row Level Security (RLS)
ALTER TABLE vae_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE vae_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE vae_work_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vae_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE vae_ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE vae_progress_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE vae_event_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vae_reports ENABLE ROW LEVEL SECURITY;
