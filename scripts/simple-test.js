#!/usr/bin/env node

const https = require('https');

const token = 'EAAKSz8EpkqkBQxSuiG2iPRA7fjl85P0UgqzttG48xsDOkOisz1ynSbQVOEER4akRFicLZCMWOOknzUuEnD6QBMgQV9ZAvyPPUhA6MvxIKDU58DUzZBIWaTHUhL9B2tDplCkash32KQZCXMZBZBxrOE68cpHMwWN1J7wZCBBcCoBIvgmxre5qwXHHZBEnPAdk4smrx6Elye5qq7K3ZCDXUxWcc9q1nJyIdFoLhxiPBqM3IT5uouz2BUYwsH6k1jg5KNbdxH2QZD';
const phoneNumberId = '527697617099639';
const recipientNumber = '201092750351';

console.log('🚀 اختبار واتس أب مباشر\n');
console.log('📱 البيانات:');
console.log(`- Phone Number ID: ${phoneNumberId}`);
console.log(`- Recipient: +${recipientNumber}`);
console.log(`- Token Length: ${token.length} حرف\n`);

const postData = JSON.stringify({
  messaging_product: 'whatsapp',
  to: recipientNumber,
  type: 'text',
  text: {
    preview_url: false,
    body: 'اختبار نظام Visual Accountability Engine - تم الاتصال بنجاح ✅'
  }
});

const options = {
  hostname: 'graph.instagram.com',
  port: 443,
  path: `/v24.0/${phoneNumberId}/messages?access_token=${token}`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': postData.length
  }
};

console.log('📤 جاري الإرسال...\n');

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Response:\n${data}\n`);

    try {
      const response = JSON.parse(data);
      
      if (res.statusCode === 200 && response.messages) {
        console.log('✅ نجح الإرسال!');
        console.log(`Message ID: ${response.messages[0].id}`);
      } else if (response.error) {
        console.log(`❌ خطأ: ${response.error.message}`);
      }
    } catch (e) {
      console.log('❌ خطأ في معالجة الاستجابة');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ خطأ في الاتصال:', error);
});

req.write(postData);
req.end();
