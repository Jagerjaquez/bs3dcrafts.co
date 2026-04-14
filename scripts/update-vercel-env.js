#!/usr/bin/env node

/**
 * Update Vercel Environment Variables
 * Adds admin credentials to Vercel deployment
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

function updateVercelEnv() {
  try {
    console.log('🔄 Updating Vercel environment variables...')
    console.log('')

    // Read .env file
    const envPath = path.join(process.cwd(), '.env')
    if (!fs.existsSync(envPath)) {
      console.error('❌ .env file not found!')
      process.exit(1)
    }

    const envContent = fs.readFileSync(envPath, 'utf8')
    const envLines = envContent.split('\n')

    // Extract admin credentials
    let adminSecret = ''
    let adminPasswordHash = ''

    for (const line of envLines) {
      if (line.startsWith('ADMIN_SECRET=')) {
        adminSecret = line.split('=')[1]
      }
      if (line.startsWith('ADMIN_PASSWORD_HASH=')) {
        adminPasswordHash = line.split('=')[1].replace(/"/g, '')
      }
    }

    if (!adminSecret || !adminPasswordHash) {
      console.error('❌ Admin credentials not found in .env file')
      console.error('Please run: node scripts/setup-admin.js first')
      process.exit(1)
    }

    console.log('📋 Found admin credentials in .env file')

    // Update Vercel environment variables
    const envVars = [
      { name: 'ADMIN_SECRET', value: adminSecret },
      { name: 'ADMIN_PASSWORD_HASH', value: adminPasswordHash }
    ]

    for (const envVar of envVars) {
      try {
        console.log(`🔧 Setting ${envVar.name}...`)
        
        // Set for production, preview, and development
        const environments = ['production', 'preview', 'development']
        
        for (const env of environments) {
          const command = `vercel env add ${envVar.name} ${env} --force`
          
          // Use spawn to handle interactive input
          const { spawn } = require('child_process')
          const child = spawn('vercel', ['env', 'add', envVar.name, env, '--force'], {
            stdio: ['pipe', 'pipe', 'pipe']
          })
          
          // Send the value when prompted
          child.stdin.write(envVar.value + '\n')
          child.stdin.end()
          
          await new Promise((resolve, reject) => {
            child.on('close', (code) => {
              if (code === 0) {
                resolve()
              } else {
                reject(new Error(`Command failed with code ${code}`))
              }
            })
          })
        }
        
        console.log(`   ✅ ${envVar.name} set for all environments`)
      } catch (error) {
        console.log(`   ⚠️  ${envVar.name} may already exist or failed to set`)
      }
    }

    console.log('')
    console.log('🚀 Triggering new deployment...')
    
    try {
      execSync('vercel --prod', { stdio: 'inherit' })
      console.log('✅ Deployment triggered successfully')
    } catch (error) {
      console.log('⚠️  Manual deployment may be needed')
    }

    console.log('')
    console.log('🎉 Vercel environment variables updated!')
    console.log('')
    console.log('📋 Admin Access:')
    console.log('URL: https://bs3dcrafts.com/admin/login')
    console.log('Password: Check your local .env file for ADMIN_SECRET')
    console.log('')
    console.log('⏳ Wait a few minutes for deployment to complete, then test admin access.')

  } catch (error) {
    console.error('❌ Failed to update Vercel environment variables:', error.message)
    process.exit(1)
  }
}

// Run update
updateVercelEnv()