#!/usr/bin/env node

const https = require('https');

const token = 'EAAMo2xRQsWkBQ2PEju1TYXFy1XKT19ZAkId2n7cfntv6ZC0VUG6FmplYX04NSZAl0VEQJG08cqzqZAfL6nSlWoPHjcTIg2JBWZBAkdvR7P0FSU20qsybaQUa3tQGS0UTPPUrhtVsYpEmpAZCrZCr9sw8MZBB76WkAZApV8SCbqHmOxyL85aMnJcbqvSTALB77nu2dJK3iYnUXZAOzvFxUVrFcc38JxkWLnD3oY2yahKsH96T4bIbdZBUaBODN82pGTVJPd7Jy6cZC2lE3LhiBib4AsIBPNFuuz9hW3X5FKzy5AZDZD';

console.log('🔍 اختبار صحة التوكن...\n');
console.log('Token Length:', token.length);
console.log('Token Preview:', token.substring(0, 30) + '...\n');

const options = {
  hostname: 'graph.instagram.com',
  path: `/v25.0/me?access_token=${token}`,
  method: 'GET'
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
      console.log(JSON.stringify(response, null, 2));
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ خطأ:', e.message);
});

req.end();
