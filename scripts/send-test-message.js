#!/usr/bin/env node

import fetch from "node-fetch"

const PHONE_NUMBER = "+201092750351"
const MESSAGE = "اختبار النظام - WhatsApp Hub\nالوقت: " + new Date().toLocaleString("ar-EG")

const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
const apiVersion = process.env.WHATSAPP_API_VERSION || "v24.0"

if (!accessToken || !phoneNumberId) {
  console.error("❌ Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID")
  console.error("Please set these environment variables and try again")
  process.exit(1)
}

async function sendTestMessage() {
  console.log(`📱 Sending test message to ${PHONE_NUMBER}...`)
  console.log(`📝 Message: ${MESSAGE}`)
  console.log(`🔑 Using Phone ID: ${phoneNumberId}`)

  try {
    const url = `https://graph.instagram.com/${apiVersion}/${phoneNumberId}/messages`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: PHONE_NUMBER,
        type: "text",
        text: { body: MESSAGE },
      }),
    })

    const data = await response.json()

    if (response.ok) {
      console.log("✅ Message sent successfully!")
      console.log(`📨 Message ID: ${data.messages[0].id}`)
    } else {
      console.error("❌ Failed to send message:")
      console.error(JSON.stringify(data, null, 2))
      process.exit(1)
    }
  } catch (error) {
    console.error("❌ Error:", error)
    process.exit(1)
  }
}

sendTestMessage()
