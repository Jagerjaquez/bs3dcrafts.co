#!/usr/bin/env node

/**
 * Vercel Domain Fix Script
 * Fixes domain configuration issues
 */

console.log('🔧 Vercel Domain Fix Script')
console.log('===========================')

console.log('\n📋 Manual Steps to Fix Domain:')
console.log('1. Go to https://vercel.com/dashboard')
console.log('2. Select your BS3DCrafts project')
console.log('3. Go to Settings > Domains')
console.log('4. Remove bs3dcrafts.com domain')
console.log('5. Wait 2 minutes')
console.log('6. Add bs3dcrafts.com domain again')

console.log('\n🌐 DNS Records to Set:')
console.log('A Record:')
console.log('  Type: A')
console.log('  Name: @')
console.log('  Value: 76.76.19.61')
console.log('  TTL: 3600')

console.log('\nCNAME Record:')
console.log('  Type: CNAME')
console.log('  Name: www')
console.log('  Value: cname.vercel-dns.com')
console.log('  TTL: 3600')

console.log('\n⚡ Quick Commands:')
console.log('# Install Vercel CLI if not installed')
console.log('npm i -g vercel')

console.log('\n# Login to Vercel')
console.log('vercel login')

console.log('\n# Link project')
console.log('vercel link')

console.log('\n# Add domain')
console.log('vercel domains add bs3dcrafts.com')

console.log('\n# Check domain status')
console.log('vercel domains ls')

console.log('\n🔍 Troubleshooting:')
console.log('- Wait 24-48 hours for DNS propagation')
console.log('- Check domain registrar DNS settings')
console.log('- Verify domain is not expired')
console.log('- Contact Vercel support if issue persists')

console.log('\n✅ After fixing, test these URLs:')
console.log('- https://bs3dcrafts.com')
console.log('- https://www.bs3dcrafts.com')
console.log('- https://bs3dcrafts.com/admin/login')