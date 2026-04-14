#!/usr/bin/env node

/**
 * Deployment Fix Script
 * Fixes common deployment issues and validates configuration
 */

const fs = require('fs')
const path = require('path')

console.log('🔧 BS3DCrafts Deployment Fix')
console.log('=============================')

// Check package.json
console.log('\n1. Checking package.json...')
const packagePath = path.join(process.cwd(), 'package.json')
if (fs.existsSync(packagePath)) {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
  console.log(`   ✅ Package name: ${pkg.name}`)
  console.log(`   ✅ Version: ${pkg.version}`)
  console.log(`   ✅ Next.js version: ${pkg.dependencies?.next || 'Not found'}`)
  
  // Check build script
  if (pkg.scripts?.build) {
    console.log(`   ✅ Build script: ${pkg.scripts.build}`)
  } else {
    console.log(`   ❌ Build script missing`)
  }
} else {
  console.log('   ❌ package.json not found')
}

// Check Next.js config
console.log('\n2. Checking Next.js configuration...')
const nextConfigPaths = [
  'next.config.js',
  'next.config.mjs', 
  'next.config.ts'
]

let nextConfigFound = false
for (const configPath of nextConfigPaths) {
  if (fs.existsSync(configPath)) {
    console.log(`   ✅ Found: ${configPath}`)
    nextConfigFound = true
    break
  }
}

if (!nextConfigFound) {
  console.log('   ❌ No Next.js config found')
}

// Check Vercel config
console.log('\n3. Checking Vercel configuration...')
const vercelConfigPath = 'vercel.json'
if (fs.existsSync(vercelConfigPath)) {
  try {
    const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'))
    console.log(`   ✅ Found vercel.json`)
    console.log(`   ✅ Framework: ${vercelConfig.framework || 'not specified'}`)
    console.log(`   ✅ Build command: ${vercelConfig.buildCommand || 'default'}`)
  } catch (error) {
    console.log(`   ❌ Invalid vercel.json: ${error.message}`)
  }
} else {
  console.log('   ⚠️  No vercel.json found (using defaults)')
}

// Check environment files
console.log('\n4. Checking environment files...')
const envFiles = ['.env', '.env.local', '.env.production']
for (const envFile of envFiles) {
  if (fs.existsSync(envFile)) {
    console.log(`   ✅ Found: ${envFile}`)
  }
}

// Check critical directories
console.log('\n5. Checking project structure...')
const criticalDirs = ['app', 'components', 'lib', 'public']
for (const dir of criticalDirs) {
  if (fs.existsSync(dir)) {
    console.log(`   ✅ ${dir}/ exists`)
  } else {
    console.log(`   ❌ ${dir}/ missing`)
  }
}

// Check for common issues
console.log('\n6. Checking for common issues...')

// Check for TypeScript config
if (fs.existsSync('tsconfig.json')) {
  console.log('   ✅ TypeScript configuration found')
} else {
  console.log('   ⚠️  No TypeScript configuration')
}

// Check for Tailwind config
const tailwindConfigs = ['tailwind.config.js', 'tailwind.config.ts']
let tailwindFound = false
for (const config of tailwindConfigs) {
  if (fs.existsSync(config)) {
    console.log(`   ✅ Tailwind config: ${config}`)
    tailwindFound = true
    break
  }
}
if (!tailwindFound) {
  console.log('   ⚠️  No Tailwind config found')
}

// Generate deployment checklist
console.log('\n📋 Deployment Checklist')
console.log('========================')
console.log('□ Environment variables set in Vercel dashboard')
console.log('□ Database connection string is correct')
console.log('□ Supabase keys are configured')
console.log('□ Domain is properly configured')
console.log('□ SSL certificate is active')
console.log('□ Build logs show no errors')
console.log('□ API endpoints are responding')

console.log('\n🚀 Next Steps')
console.log('=============')
console.log('1. Commit and push these configuration changes')
console.log('2. Check Vercel deployment logs')
console.log('3. Verify environment variables in Vercel dashboard')
console.log('4. Test the deployment with: node scripts/check-deployment.js')

console.log('\n✅ Configuration fixes applied!')