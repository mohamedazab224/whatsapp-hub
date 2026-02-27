#!/usr/bin/env node

const https = require('https');

const token = 'EAAMo2xRQsWkBQ2PEju1TYXFy1XKT19ZAkId2n7cfntv6ZC0VUG6FmplYX04NSZAl0VEQJG08cqzqZAfL6nSlWoPHjcTIg2JBWZBAkdvR7P0FSU20qsybaQUa3tQGS0UTPPUrhtVsYpEmpAZCrZCr9sw8MZBB76WkAZApV8SCbqHmOxyL85aMnJcbqvSTALB77nu2dJK3iYnUXZAOzvFxUVrFcc38JxkWLnD3oY2yahKsH96T4bIbdZBUaBODN82pGTVJPd7Jy6cZC2lE3LhiBib4AsIBPNFuuz9hW3X5FKzy5AZDZD';
const phoneNumberId = '527697617099639';
const recipientPhone = '201092750351';

console.log('📤 إرسال رسالة WhatsApp الآن...\n');

const postData = JSON.stringify({
  messaging_product: 'whatsapp',
  to: recipientPhone,
  type: 'text',
  text: {
    preview_url: false,
    body: '✅ اختبار نظام VAE - النظام يعمل بنجاح!\n\nهذه رسالة اختبار من نظام WhatsApp Hub المتطور.'
  }
});

const options = {
  hostname: 'graph.instagram.com',
  path: `/v25.0/${phoneNumberId}/messages?access_token=${token}`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': postData.length
  }
};

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}\n`);
    
    try {
      const response = JSON.parse(data);
      if (res.statusCode === 200) {
        console.log('✅ تم إرسال الرسالة بنجاح!');
        console.log('   Message ID:', response.messages[0].id);
        console.log('\n🎉 الرسالة وصلت إلى هاتفك!');
      } else {
        console.log('❌ خطأ:', response.error?.message);
      }
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ خطأ في الاتصال:', e.message);
});

req.write(postData);
req.end();
