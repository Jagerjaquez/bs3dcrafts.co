#!/usr/bin/env node

/**
 * Setup Admin Account Script
 * Creates initial admin account and sets up authentication
 */

const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

async function setupAdmin() {
  try {
    console.log('🔐 Setting up admin account...')
    console.log('')

    // Check if .env exists
    const envPath = path.join(process.cwd(), '.env')
    if (!fs.existsSync(envPath)) {
      console.error('❌ .env file not found!')
      console.error('Please create .env file first')
      process.exit(1)
    }

    // Read current .env
    let envContent = fs.readFileSync(envPath, 'utf8')

    // Check if admin is already configured
    if (envContent.includes('ADMIN_PASSWORD_HASH=') && envContent.includes('ADMIN_SECRET=')) {
      console.log('✅ Admin account already configured!')
      
      // Extract admin secret for login instructions
      const adminSecretMatch = envContent.match(/ADMIN_SECRET=(.+)/)
      if (adminSecretMatch) {
        const adminSecret = adminSecretMatch[1]
        console.log('')
        console.log('🔑 Admin Login Information:')
        console.log('URL: https://bs3dcrafts.com/admin/login')
        console.log('Password: Use the ADMIN_SECRET from your .env file')
        console.log('')
        console.log('💡 For security, the actual password is not displayed.')
        console.log('   Check your .env file for ADMIN_SECRET value.')
      }
      return
    }

    // Generate secure admin password
    const adminPassword = crypto.randomBytes(16).toString('hex')
    console.log(`🔑 Generated admin password: ${adminPassword}`)

    // Hash the password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds)
    console.log('🔒 Password hashed successfully')

    // Generate admin secret (for API access)
    const adminSecret = crypto.randomBytes(32).toString('base64')
    console.log('🔐 Generated admin secret')

    // Update .env file
    if (!envContent.includes('ADMIN_SECRET=')) {
      envContent += `\n# Admin Authentication\nADMIN_SECRET=${adminSecret}\n`
    }
    
    if (!envContent.includes('ADMIN_PASSWORD_HASH=')) {
      envContent += `ADMIN_PASSWORD_HASH="${hashedPassword}"\n`
    }

    // Write updated .env
    fs.writeFileSync(envPath, envContent)
    console.log('✅ Updated .env file with admin credentials')

    console.log('')
    console.log('🎉 Admin account setup complete!')
    console.log('')
    console.log('📋 Admin Login Information:')
    console.log('URL: https://bs3dcrafts.com/admin/login')
    console.log(`Password: ${adminPassword}`)
    console.log('')
    console.log('⚠️  IMPORTANT:')
    console.log('1. Save this password securely - it will not be shown again')
    console.log('2. The password is also stored as ADMIN_SECRET in your .env file')
    console.log('3. Never commit the .env file to version control')
    console.log('')
    console.log('🚀 Next Steps:')
    console.log('1. Access the admin panel at: https://bs3dcrafts.com/admin/login')
    console.log('2. Log in with the password above')
    console.log('3. Set up initial site content')
    console.log('4. Configure site settings')
    console.log('')

  } catch (error) {
    console.error('❌ Admin setup failed:', error.message)
    process.exit(1)
  }
}

// Run setup
setupAdmin()