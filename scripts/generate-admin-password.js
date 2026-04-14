#!/usr/bin/env node

/**
 * Generate Admin Password Script
 * 
 * This script generates a secure random password and its bcrypt hash
 * for use with the BS3DCrafts CMS admin authentication system.
 * 
 * Usage:
 *   node scripts/generate-admin-password.js
 *   node scripts/generate-admin-password.js --password "custom-password"
 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

function generateSecurePassword(length = 16) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length);
    password += charset[randomIndex];
  }
  
  return password;
}

function generateSecureSecret(length = 32) {
  return crypto.randomBytes(length).toString('base64');
}

async function generateAdminCredentials() {
  const args = process.argv.slice(2);
  const customPasswordIndex = args.indexOf('--password');
  
  let password;
  if (customPasswordIndex !== -1 && args[customPasswordIndex + 1]) {
    password = args[customPasswordIndex + 1];
    console.log('Using custom password...');
  } else {
    password = generateSecurePassword(16);
    console.log('Generated secure password...');
  }
  
  // Generate bcrypt hash
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  
  // Generate other secrets
  const sessionSecret = generateSecureSecret(32);
  const csrfSecret = generateSecureSecret(32);
  const adminSecret = generateSecureSecret(32);
  
  console.log('\n=== BS3DCrafts CMS Admin Credentials ===\n');
  
  console.log('📋 Add these to your .env file:\n');
  
  console.log('# Admin Authentication & CMS Security');
  console.log(`ADMIN_SECRET=${adminSecret}`);
  console.log(`SESSION_SECRET=${sessionSecret}`);
  console.log(`CSRF_SECRET=${csrfSecret}`);
  console.log(`ADMIN_PASSWORD_HASH="${hashedPassword}"`);
  
  console.log('\n🔐 Admin Login Credentials:');
  console.log(`Email: admin@bs3dcrafts.com`);
  console.log(`Password: ${password}`);
  
  console.log('\n⚠️  IMPORTANT SECURITY NOTES:');
  console.log('1. Store the password securely - it will not be shown again');
  console.log('2. Never commit the .env file to version control');
  console.log('3. Use different secrets for production and development');
  console.log('4. Consider using a password manager for the admin password');
  
  console.log('\n📝 Next Steps:');
  console.log('1. Copy the environment variables to your .env file');
  console.log('2. Run database migrations: npx prisma migrate deploy');
  console.log('3. Create admin user: npm run create-admin');
  console.log('4. Access admin panel at: /admin/login');
  
  console.log('\n✅ Setup complete! Your CMS is ready to use.\n');
}

// Verify bcrypt is available
try {
  require('bcryptjs');
} catch (error) {
  console.error('❌ Error: bcryptjs is not installed.');
  console.error('Please install it with: npm install bcryptjs');
  process.exit(1);
}

// Run the generator
generateAdminCredentials().catch(error => {
  console.error('❌ Error generating admin credentials:', error);
  process.exit(1);
});