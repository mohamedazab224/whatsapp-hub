#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

const metaDataPath = process.argv[2] || './meta_all.json'

if (!fs.existsSync(metaDataPath)) {
  console.error(`❌ ملف ${metaDataPath} غير موجود`)
  process.exit(1)
}

try {
  const metaData = JSON.parse(fs.readFileSync(metaDataPath, 'utf-8'))
  
  const payload = {
    meta: metaData.meta,
    business: metaData.business,
    wabas: metaData.wabas,
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  const syncUrl = `${apiUrl}/api/meta/sync`

  console.log(`📡 جاري مزامنة البيانات إلى ${syncUrl}...`)

  fetch(syncUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        console.log('✅ تم مزامنة البيانات بنجاح!')
        console.log(`   - WABAs: ${data.stats.wabas}`)
        console.log(`   - أرقام الهواتف: ${data.stats.phone_numbers}`)
        console.log(`   - القوالب: ${data.stats.templates}`)
      } else {
        console.error('❌ خطأ:', data.error)
        process.exit(1)
      }
    })
    .catch((error) => {
      console.error('❌ خطأ في الاتصال:', error.message)
      process.exit(1)
    })
} catch (error) {
  console.error('❌ خطأ في قراءة الملف:', error instanceof Error ? error.message : 'Unknown error')
  process.exit(1)
}
