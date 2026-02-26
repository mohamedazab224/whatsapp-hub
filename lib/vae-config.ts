// VAE (Visual Accountability Engine) Configuration

export const VAE_CONFIG = {
  // معايير جودة الصور
  quality: {
    excellent: 80,
    good: 60,
    minimum: 40,
  },

  // أنواع الأعمال
  workTypes: [
    { id: "excavation", name: "الحفر والتسوية" },
    { id: "foundation", name: "الأساسات" },
    { id: "structure", name: "الهياكل الخرسانية" },
    { id: "masonry", name: "البناء والطوب" },
    { id: "roofing", name: "السقوف" },
    { id: "finishing", name: "التشطيبات" },
    { id: "utilities", name: "المرافق" },
  ],

  // مراحل التنفيذ
  phases: [
    { id: "planning", name: "التخطيط" },
    { id: "in_progress", name: "قيد التنفيذ" },
    { id: "review", name: "المراجعة" },
    { id: "completed", name: "مكتمل" },
  ],

  // مشاكل الأمان الشائعة
  safetyIssues: [
    "missing_harness",
    "exposed_height",
    "no_safety_equipment",
    "improper_scaffolding",
    "exposed_edges",
    "slip_hazard",
    "debris_hazard",
  ],

  // أنواع الهدر
  wasteTypes: [
    "material_scatter",
    "unused_equipment",
    "improper_storage",
    "water_waste",
  ],

  // معايير التقدم
  progressThresholds: {
    started: 10,
    half_complete: 50,
    almost_done: 90,
    completed: 100,
  },

  // إعدادات المعالجة
  processing: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedFormats: ["image/jpeg", "image/png", "video/mp4", "video/quicktime"],
    qualityReduction: 0.8, // تقليل الجودة إلى 80%
  },

  // تقرير
  reports: {
    types: [
      { id: "daily", name: "يومي" },
      { id: "weekly", name: "أسبوعي" },
      { id: "monthly", name: "شهري" },
    ],
    sections: [
      "media_count",
      "quality_analysis",
      "safety_issues",
      "waste_incidents",
      "progress",
      "recommendations",
    ],
  },

  // Pagination
  pagination: {
    mediaPerPage: 20,
    projectsPerPage: 10,
    reportsPerPage: 15,
  },

  // API
  api: {
    timeout: 30000, // 30 seconds
    retries: 3,
  },
}

// Helper functions
export function getWorkTypeName(workTypeId: string): string {
  const workType = VAE_CONFIG.workTypes.find((wt) => wt.id === workTypeId)
  return workType?.name || workTypeId
}

export function getPhaseName(phaseId: string): string {
  const phase = VAE_CONFIG.phases.find((p) => p.id === phaseId)
  return phase?.name || phaseId
}

export function getQualityLevel(score: number): string {
  if (score >= VAE_CONFIG.quality.excellent) return "ممتاز"
  if (score >= VAE_CONFIG.quality.good) return "جيد"
  return "ضعيف"
}

export function getProgressStatus(progress: number): string {
  if (progress >= VAE_CONFIG.progressThresholds.completed) return "مكتمل"
  if (progress >= VAE_CONFIG.progressThresholds.almost_done) return "قريب من الإكمال"
  if (progress >= VAE_CONFIG.progressThresholds.half_complete) return "في المنتصف"
  if (progress >= VAE_CONFIG.progressThresholds.started) return "تم البدء"
  return "لم يبدأ"
}
