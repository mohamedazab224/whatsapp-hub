#!/bin/bash
set -e

echo "========================================="
echo "تشخيص المشروع"
echo "========================================="

echo ""
echo "✓ الملفات المطلوبة في lib:"
ls -la lib/env.server.ts lib/env.public.ts lib/auth.ts 2>/dev/null || echo "❌ بعض الملفات مفقودة"

echo ""
echo "✓ التحقق من الدوال المطلوبة في env.server.ts:"
grep -c "export const getQueueEnv" lib/env.server.ts && echo "  ✓ getQueueEnv موجودة" || echo "  ❌ getQueueEnv مفقودة"
grep -c "export const getLoggerEnv" lib/env.server.ts && echo "  ✓ getLoggerEnv موجودة" || echo "  ❌ getLoggerEnv مفقودة"
grep -c "export const getWebhookEnv" lib/env.server.ts && echo "  ✓ getWebhookEnv موجودة" || echo "  ❌ getWebhookEnv مفقودة"
grep -c "export const getWhatsappApiEnv" lib/env.server.ts && echo "  ✓ getWhatsappApiEnv موجودة" || echo "  ❌ getWhatsappApiEnv مفقودة"
grep -c "export const getAuthEnv" lib/env.server.ts && echo "  ✓ getAuthEnv موجودة" || echo "  ❌ getAuthEnv مفقودة"
grep -c "export const getSupabaseAdminEnv" lib/env.server.ts && echo "  ✓ getSupabaseAdminEnv موجودة" || echo "  ❌ getSupabaseAdminEnv مفقودة"

echo ""
echo "✓ التحقق من متغيرات .env.local:"
grep -c "WHATSAPP_ACCESS_TOKEN" .env.local && echo "  ✓ WHATSAPP_ACCESS_TOKEN موجودة" || echo "  ❌ WHATSAPP_ACCESS_TOKEN مفقودة"
grep -c "WHATSAPP_PHONE_NUMBER_ID" .env.local && echo "  ✓ WHATSAPP_PHONE_NUMBER_ID موجودة" || echo "  ❌ WHATSAPP_PHONE_NUMBER_ID مفقودة"
grep -c "WHATSAPP_WEBHOOK_VERIFY_TOKEN" .env.local && echo "  ✓ WHATSAPP_WEBHOOK_VERIFY_TOKEN موجودة" || echo "  ❌ WHATSAPP_WEBHOOK_VERIFY_TOKEN مفقودة"

echo ""
echo "========================================="
echo "✅ التشخيص انتهى"
echo "========================================="
