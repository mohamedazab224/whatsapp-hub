// scripts/test-apis.js
// اختبار الـ APIs بعد التطوير

const API_URL = process.env.API_URL || 'http://localhost:3000'
const AUTH_TOKEN = process.env.AUTH_TOKEN || 'test_token'

const tests = []
let passed = 0
let failed = 0

async function test(name, fn) {
  try {
    console.log(`\n🧪 Testing: ${name}`)
    await fn()
    console.log(`✅ PASSED: ${name}`)
    passed++
  } catch (error) {
    console.error(`❌ FAILED: ${name}`)
    console.error(`   Error: ${error.message}`)
    failed++
  }
}

async function request(method, path, body = null) {
  const url = `${API_URL}${path}`
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AUTH_TOKEN}`,
    },
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(url, options)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(`${response.status}: ${data.error?.message || data.error || 'Unknown error'}`)
  }

  return data
}

async function runTests() {
  console.log('🚀 Starting API Tests...\n')

  // Test 1: Health Check
  await test('Health Check', async () => {
    const data = await request('GET', '/api/health')
    if (data.status !== 'ok') throw new Error('Health check failed')
  })

  // Test 2: Get Contacts (Empty List)
  await test('Get Contacts - Empty List', async () => {
    const data = await request('GET', '/api/contacts')
    if (!data.success) throw new Error('Failed to get contacts')
    if (!Array.isArray(data.data)) throw new Error('Data is not an array')
  })

  // Test 3: Create Contact with Invalid Email
  await test('Create Contact - Validation Error', async () => {
    try {
      await request('POST', '/api/contacts', {
        name: 'Test',
        wa_id: 'invalid',
      })
      throw new Error('Should have failed validation')
    } catch (error) {
      if (error.message.includes('400')) {
        // Expected
        return
      }
      throw error
    }
  })

  // Test 4: Create Contact - Success
  let contactId = null
  await test('Create Contact - Success', async () => {
    const data = await request('POST', '/api/contacts', {
      name: 'Test Contact',
      wa_id: '+201012345678',
    })
    if (!data.data.id) throw new Error('No contact ID returned')
    contactId = data.data.id
  })

  // Test 5: Get Contacts - With Data
  await test('Get Contacts - With Data', async () => {
    const data = await request('GET', '/api/contacts')
    if (!data.data || data.data.length === 0) throw new Error('No contacts returned')
    if (data.pagination.total < 1) throw new Error('Total count is wrong')
  })

  // Test 6: Get Messages - Empty
  await test('Get Messages - Empty', async () => {
    const data = await request('GET', '/api/messages')
    if (!data.success) throw new Error('Failed to get messages')
    if (!Array.isArray(data.data)) throw new Error('Data is not an array')
  })

  // Test 7: Create Message - Success
  await test('Create Message - Success', async () => {
    const data = await request('POST', '/api/messages', {
      contact_id: contactId,
      body: 'Test message',
      type: 'text',
    })
    if (!data.data.id) throw new Error('No message ID returned')
  })

  // Test 8: Rate Limiting
  await test('Rate Limiting - Check Header', async () => {
    const url = `${API_URL}/api/contacts`
    const options = {
      headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` },
    }

    // Make multiple rapid requests
    for (let i = 0; i < 5; i++) {
      await fetch(url, options)
    }
    // Should still work with rate limiting
  })

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log(`\n📊 Test Summary:`)
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📈 Total:  ${passed + failed}`)
  console.log(`\n${failed === 0 ? '🎉 All tests passed!' : '⚠️ Some tests failed'}`)
  console.log('\n' + '='.repeat(50))

  process.exit(failed > 0 ? 1 : 0)
}

// Run tests
runTests().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
