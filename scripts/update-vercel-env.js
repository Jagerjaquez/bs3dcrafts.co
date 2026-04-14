#!/usr/bin/env node

/**
 * Update Vercel Environment Variables Script
 * Updates environment variables to use custom domain
 */

console.log('🔧 Updating Vercel Environment Variables')
console.log('========================================')

const envVars = [
  {
    key: 'NEXT_PUBLIC_SITE_URL',
    value: 'https://bs3dcrafts.com',
    description: 'Main site URL'
  },
  {
    key: 'NEXT_PUBLIC_APP_URL', 
    value: 'https://bs3dcrafts.com',
    description: 'Application URL'
  },
  {
    key: 'NEXT_PUBLIC_BASE_URL',
    value: 'https://bs3dcrafts.com', 
    description: 'Base URL for API calls'
  }
]

console.log('\n📋 Environment Variables to Update in Vercel Dashboard:')
console.log('Go to: https://vercel.com/dashboard > Your Project > Settings > Environment Variables')
console.log('')

envVars.forEach((env, index) => {
  console.log(`${index + 1}. ${env.key}`)
  console.log(`   Value: ${env.value}`)
  console.log(`   Description: ${env.description}`)
  console.log(`   Environments: Production, Preview, Development`)
  console.log('')
})

console.log('⚡ Quick Vercel CLI Commands:')
console.log('')
console.log('# Set environment variables via CLI')
envVars.forEach(env => {
  console.log(`vercel env add ${env.key}`)
  console.log(`# Enter value: ${env.value}`)
  console.log(`# Select environments: Production, Preview, Development`)
  console.log('')
})

console.log('🔄 After updating environment variables:')
console.log('1. Redeploy the project')
console.log('2. Wait for deployment to complete')
console.log('3. Test https://bs3dcrafts.com')

console.log('\n✅ Verification Steps:')
console.log('1. Check domain status in Vercel dashboard')
console.log('2. Verify SSL certificate is active')
console.log('3. Test all URLs:')
console.log('   - https://bs3dcrafts.com')
console.log('   - https://www.bs3dcrafts.com')
console.log('   - https://bs3dcrafts.com/admin/login')
console.log('   - https://bs3dcrafts.com/api/health')

console.log('\n🚨 Important Notes:')
console.log('- DNS changes can take 24-48 hours to propagate')
console.log('- SSL certificate generation may take a few minutes')
console.log('- Clear browser cache after changes')
console.log('- Use incognito/private browsing to test')