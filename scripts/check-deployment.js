#!/usr/bin/env node

/**
 * Deployment Health Check Script
 * Checks if the deployed application is working correctly
 */

const https = require('https')
const http = require('http')

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bs3dcrafts-co.vercel.app'

async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http
    
    const req = client.get(url, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        })
      })
    })
    
    req.on('error', (error) => {
      reject(error)
    })
    
    req.setTimeout(10000, () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })
  })
}

async function checkEndpoint(path, description) {
  const url = `${SITE_URL}${path}`
  console.log(`\n🔍 Checking ${description}...`)
  console.log(`   URL: ${url}`)
  
  try {
    const response = await makeRequest(url)
    
    if (response.statusCode === 200) {
      console.log(`   ✅ Status: ${response.statusCode} OK`)
      
      // Check if it's JSON
      if (response.headers['content-type']?.includes('application/json')) {
        try {
          const json = JSON.parse(response.data)
          console.log(`   📄 Response: ${JSON.stringify(json, null, 2).substring(0, 200)}...`)
        } catch {
          console.log(`   📄 Response: JSON parse error`)
        }
      } else {
        console.log(`   📄 Content-Type: ${response.headers['content-type']}`)
        console.log(`   📄 Content Length: ${response.data.length} bytes`)
      }
      
      return true
    } else {
      console.log(`   ❌ Status: ${response.statusCode}`)
      console.log(`   📄 Response: ${response.data.substring(0, 500)}`)
      return false
    }
  } catch (error) {
    console.log(`   💥 Error: ${error.message}`)
    return false
  }
}

async function runHealthCheck() {
  console.log('🚀 BS3DCrafts Deployment Health Check')
  console.log('=====================================')
  console.log(`Target URL: ${SITE_URL}`)
  console.log(`Timestamp: ${new Date().toISOString()}`)
  
  const checks = [
    { path: '/api/health/simple', description: 'Simple Health Check' },
    { path: '/api/health', description: 'Full Health Check' },
    { path: '/api/content/homepage', description: 'Homepage Content API' },
    { path: '/api/content/settings', description: 'Settings API' },
    { path: '/', description: 'Homepage' },
  ]
  
  let passedChecks = 0
  let totalChecks = checks.length
  
  for (const check of checks) {
    const passed = await checkEndpoint(check.path, check.description)
    if (passed) passedChecks++
  }
  
  console.log('\n📊 Summary')
  console.log('===========')
  console.log(`Passed: ${passedChecks}/${totalChecks}`)
  console.log(`Success Rate: ${Math.round((passedChecks / totalChecks) * 100)}%`)
  
  if (passedChecks === totalChecks) {
    console.log('\n🎉 All checks passed! Deployment is healthy.')
    process.exit(0)
  } else {
    console.log('\n⚠️  Some checks failed. Please investigate.')
    
    console.log('\n🔧 Troubleshooting Steps:')
    console.log('1. Check Vercel deployment logs')
    console.log('2. Verify environment variables are set')
    console.log('3. Check database connectivity')
    console.log('4. Review application error logs')
    
    process.exit(1)
  }
}

// Run the health check
runHealthCheck().catch((error) => {
  console.error('💥 Health check failed:', error)
  process.exit(1)
})