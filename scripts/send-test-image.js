#!/usr/bin/env node

/**
 * اختبار حقيقي - إرسال صورة من WhatsApp إلى WhatsApp
 * استخدام: node scripts/send-test-image.js
 */

const https = require('https')

// المتغيرات المطلوبة
const WHATSAPP_BUSINESS_PHONE_NUMBER_ID = process.env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID || '527697617099639'
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || 'EAAKSz8EpkqkBQsXBhzQxBQZBRTBTHJw7AXDIxBN0C4nbkowhHJFRxw9dHdF0YqQq4UThgIOBzOmaxdjf0z2gUS2Xo1PQjgBMYW6ZCZAGYhwmMMbhUGTMt7DwXZA5KXeGXOToU1ZC6SQZAQpgXfxkvWjIgooqalM078zsnpWuEwtRBNcb4jUQQZBWn0ZCOGJnmwZDZD'
const TEST_RECIPIENT_PHONE = '+201092750351' // الرقم الذي تريد الاختبار إليه
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v24.0'

console.log('🚀 اختبار حقيقي - إرسال صورة من WhatsApp')
console.log('=====================================\n')

// التحقق من المتغيرات
if (!WHATSAPP_BUSINESS_PHONE_NUMBER_ID) {
  console.error('❌ خطأ: WHATSAPP_BUSINESS_PHONE_NUMBER_ID غير موجود في .env.local')
  process.exit(1)
}

if (!WHATSAPP_ACCESS_TOKEN) {
  console.error('❌ خطأ: WHATSAPP_ACCESS_TOKEN غير موجود في .env.local')
  process.exit(1)
}

console.log('✅ متغيرات البيئة موجودة')
console.log(`📱 رقم المرسل: ${WHATSAPP_BUSINESS_PHONE_NUMBER_ID}`)
console.log(`📞 رقم المستقبل: ${TEST_RECIPIENT_PHONE}`)
console.log(`🔑 توكن: ${WHATSAPP_ACCESS_TOKEN.substring(0, 20)}...`)
console.log(`📦 API Version: ${API_VERSION}\n`)

// 1. اختبار إرسال رسالة نصية
async function sendTestMessage() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: TEST_RECIPIENT_PHONE.replace('+', ''),
      type: 'text',
      text: {
        preview_url: false,
        body: '🔬 اختبار حقيقي من نظام VAE\n\nهذه رسالة اختبار للتحقق من التكامل'
      }
    })

    const options = {
      hostname: 'graph.instagram.com',
      path: `/${API_VERSION}/${WHATSAPP_BUSINESS_PHONE_NUMBER_ID}/messages`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(data)
          console.log('✅ رسالة نصية أرسلت بنجاح')
          console.log(`   📨 Message ID: ${response.messages[0].id}\n`)
          resolve(response.messages[0].id)
        } else {
          console.error('❌ فشل إرسال الرسالة النصية')
          console.error(`   Status: ${res.statusCode}`)
          console.error(`   Response: ${data}\n`)
          reject(new Error(data))
        }
      })
    })

    req.on('error', reject)
    req.write(postData)
    req.end()
  })
}

// 2. اختبار إرسال صورة
async function sendTestImage() {
  return new Promise((resolve, reject) => {
    // صورة اختبار بسيطة (1x1 pixel)
    const imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Camponotus_flavomarginatus_ant.jpg/320px-Camponotus_flavomarginatus_ant.jpg'

    const postData = JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: TEST_RECIPIENT_PHONE.replace('+', ''),
      type: 'image',
      image: {
        link: imageUrl
      }
    })

    const options = {
      hostname: 'graph.instagram.com',
      path: `/${API_VERSION}/${WHATSAPP_BUSINESS_PHONE_NUMBER_ID}/messages`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(data)
          console.log('✅ صورة أرسلت بنجاح')
          console.log(`   📸 Message ID: ${response.messages[0].id}\n`)
          resolve(response.messages[0].id)
        } else {
          console.error('❌ فشل إرسال الصورة')
          console.error(`   Status: ${res.statusCode}`)
          console.error(`   Response: ${data}\n`)
          reject(new Error(data))
        }
      })
    })

    req.on('error', reject)
    req.write(postData)
    req.end()
  })
}

// 3. تشغيل الاختبارات
async function runTests() {
  try {
    console.log('📤 جاري إرسال الاختبارات...\n')

    await sendTestMessage()
    await new Promise(resolve => setTimeout(resolve, 2000)) // انتظر 2 ثانية

    await sendTestImage()

    console.log('=====================================')
    console.log('✨ اختبار مكتمل بنجاح!\n')
    console.log('📍 الخطوات التالية:')
    console.log('  1. افتح WhatsApp على رقمك +201092750351')
    console.log('  2. تحقق من استقبال الرسائل')
    console.log('  3. إذا استقبلت الرسائل، النظام يعمل بنجاح ✅')
    console.log('  4. الآن أرسل صورة/فيديو للنظام وسيتم معالجتها\n')

  } catch (error) {
    console.error('❌ خطأ في الاختبار:')
    console.error(error.message)
    process.exit(1)
  }
}

// تشغيل
runTests()
