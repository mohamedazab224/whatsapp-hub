#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: Missing Supabase credentials')
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// قراءة ملف JSON
const metaFilePath = path.join(process.cwd(), 'data', 'meta_all.json')
console.log(`📂 Reading file: ${metaFilePath}`)

if (!fs.existsSync(metaFilePath)) {
  console.error(`❌ File not found: ${metaFilePath}`)
  process.exit(1)
}

const rawData = fs.readFileSync(metaFilePath, 'utf-8')
const metaData = JSON.parse(rawData)

console.log('✅ File loaded successfully')
console.log(`📊 Processing Meta data...`)

async function importMetaData() {
  try {
    // 1. إدراج App Info
    console.log('\n1️⃣ Importing App Info...')
    const appInfo = metaData.meta
    const { error: appError } = await supabase
      .from('meta_app_info')
      .upsert({
        app_id: appInfo.app_id,
        type: appInfo.type,
        application: appInfo.application,
        is_valid: appInfo.is_valid,
        issued_at: new Date(appInfo.issued_at * 1000).toISOString(),
        scopes: appInfo.scopes,
        user_id: appInfo.user_id,
      }, { onConflict: 'app_id' })

    if (appError) throw appError
    console.log('✅ App Info imported')

    // 2. إدراج Business Account
    console.log('\n2️⃣ Importing Business Account...')
    const business = metaData.business
    const { error: businessError } = await supabase
      .from('meta_business_accounts')
      .upsert({
        business_id: business.id,
        name: business.name,
        timezone_id: business.timezone_id,
        currency: business.currency,
        created_time: business.created_time,
        vertical: business.vertical,
      }, { onConflict: 'business_id' })

    if (businessError) throw businessError
    console.log(`✅ Business Account "${business.name}" imported`)

    // 3. إدراج WABAs
    console.log('\n3️⃣ Importing WhatsApp Business Accounts...')
    const wabas = metaData.wabas || []
    for (const waba of wabas) {
      const { error: wabaError } = await supabase
        .from('meta_wabas')
        .upsert({
          waba_id: waba.id,
          business_id: business.id,
          name: waba.name,
          currency: waba.currency,
          timezone_id: waba.timezone_id,
          status: waba.account_review_status,
          message_template_namespace: waba.message_template_namespace,
          on_behalf_business_account: waba.on_behalf_business_account?.id || null,
        }, { onConflict: 'waba_id' })

      if (wabaError) throw wabaError
      console.log(`  ✅ WABA: ${waba.name} (${waba.id})`)
    }

    // 4. إدراج Phone Numbers
    console.log('\n4️⃣ Importing Phone Numbers...')
    const phoneNumbers = metaData.phone_numbers || []
    for (const phone of phoneNumbers) {
      const { error: phoneError } = await supabase
        .from('meta_phone_numbers')
        .upsert({
          phone_number_id: phone.id,
          waba_id: phone.waba_id,
          business_id: business.id,
          display_phone_number: phone.display_phone_number,
          phone_number: phone.phone_number_type,
          verified_name: phone.verified_name,
          quality_rating: phone.quality_rating,
          status: phone.status || 'ACTIVE',
        }, { onConflict: 'phone_number_id' })

      if (phoneError) throw phoneError
      console.log(`  ✅ Phone: ${phone.display_phone_number} (${phone.id})`)
    }

    // 5. إدراج Message Templates
    console.log('\n5️⃣ Importing Message Templates...')
    const templates = metaData.message_templates || []
    for (const template of templates) {
      const { error: templateError } = await supabase
        .from('meta_templates')
        .upsert({
          template_id: template.id,
          waba_id: template.waba_id,
          business_id: business.id,
          name: template.name,
          status: template.status,
          category: template.category,
          language: template.language,
          components: template.components || [],
          created_at: template.created_timestamp ? 
            new Date(template.created_timestamp * 1000).toISOString() : null,
        }, { onConflict: 'template_id' })

      if (templateError) throw templateError
      console.log(`  ✅ Template: ${template.name} (${template.status})`)
    }

    console.log('\n✨ All data imported successfully!')
    console.log(`📊 Summary:`)
    console.log(`  • App ID: ${appInfo.app_id}`)
    console.log(`  • Business: ${business.name}`)
    console.log(`  • WABAs: ${wabas.length}`)
    console.log(`  • Phone Numbers: ${phoneNumbers.length}`)
    console.log(`  • Templates: ${templates.length}`)

  } catch (error) {
    console.error('❌ Error importing data:', error.message)
    process.exit(1)
  }
}

importMetaData()
