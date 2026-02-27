#!/usr/bin/env node

import https from 'https';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

if (!TOKEN || !PHONE_ID) {
  console.error('Missing TOKEN or PHONE_ID');
  process.exit(1);
}

const message = {
  messaging_product: "whatsapp",
  to: "201092750351",
  type: "text",
  text: {
    body: "✅ نظام WhatsApp يعمل بنجاح! الرسالة وصلت من النظام"
  }
};

const options = {
  hostname: 'graph.instagram.com',
  path: `/v25.0/${PHONE_ID}/messages?access_token=${TOKEN}`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(JSON.stringify(message))
  }
};

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
    
    if (res.statusCode === 200) {
      const response = JSON.parse(data);
      console.log('\n✅ تم إرسال الرسالة بنجاح!');
      console.log('Message ID:', response.messages[0].id);
    } else {
      console.log('\n❌ فشل الإرسال');
    }
  });
});

req.on('error', (e) => {
  console.error('Error:', e);
});

console.log('📤 جاري إرسال الرسالة...\n');
req.write(JSON.stringify(message));
req.end();
