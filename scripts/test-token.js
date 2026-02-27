#!/usr/bin/env node

import fetch from 'node-fetch';
import dotenv from 'dotenv';
import https from 'https';

dotenv.config();

console.log('🔍 اختبار توكن WhatsApp - تشخيصي\n');

const token = process.env.WHATSAPP_ACCESS_TOKEN || process.env.ACCESS_TOKEN;
const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

if (!token) {
  console.error('❌ لا توجد توكن في .env.local');
  process.exit(1);
}

console.log(`📋 البيانات:`);
console.log(`Token length: ${token.length} حرف`);
console.log(`Token starts with: ${token.substring(0, 20)}...`);
console.log(`Business Account ID: ${businessAccountId}`);
console.log(`Phone Number ID: ${phoneNumberId}\n`);

async function testToken() {
  try {
    console.log('🔗 جاري اختبار التوكن مع Meta API...\n');
    
    // اختبار 1: التحقق من صحة التوكن
    const meResponse = await fetch(
      `https://graph.instagram.com/v24.0/me?access_token=${token}`
    );
    
    const meData = await meResponse.json();
    
    if (meResponse.ok) {
      console.log('✅ التوكن صحيح وقابل للاستخدام!');
      console.log('   User ID:', meData.id);
      console.log('   Name:', meData.name, '\n');
    } else {
      console.log('❌ خطأ في التوكن:', meData.error?.message);
      console.log('   Code:', meData.error?.code);
      
      if (meData.error?.code === 190) {
        console.log('\n💡 الحل المقترح:');
        console.log('   1. اذهب إلى: https://developers.facebook.com/apps/724370950034089/');
        console.log('   2. انسخ توكن جديد من Settings > User Access Tokens');
        console.log('   3. احرص على أن يكون لديه صلاحيات: whatsapp_business_messaging');
      }
      return;
    }
    
    // اختبار 2: اختبار إرسال رسالة اختبار
    if (phoneNumberId) {
      console.log('📱 جاري اختبار إرسال رسالة...\n');
      
      const sendResponse = await fetch(
        `https://graph.instagram.com/v24.0/${phoneNumberId}/messages?access_token=${token}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: '201092750351',
            type: 'text',
            text: {
              preview_url: false,
              body: 'اختبار نظام WhatsApp - النظام يعمل بنجاح ✅'
            }
          })
        }
      );
      
      const sendData = await sendResponse.json();
      
      if (sendResponse.ok) {
        console.log('✅ تم إرسال الرسالة بنجاح!');
        console.log('   Message ID:', sendData.messages[0].id);
      } else {
        console.log('❌ فشل الإرسال:', sendData.error?.message);
      }
    }
  } catch (error) {
    console.error('❌ خطأ في الاتصال:', error.message);
  }
}

testToken();
