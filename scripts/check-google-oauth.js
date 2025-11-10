/**
 * Google OAuth Configuration Checker
 * Run this to verify your Google OAuth setup
 */

console.log('🔍 Checking Google OAuth Configuration...\n');

// Check environment variables
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const nextAuthUrl = process.env.NEXTAUTH_URL;

console.log('📋 Environment Variables:');
console.log('✅ GOOGLE_CLIENT_ID:', clientId ? '✓ Set' : '❌ Missing');
console.log('✅ GOOGLE_CLIENT_SECRET:', clientSecret ? '✓ Set' : '❌ Missing');
console.log('✅ NEXTAUTH_URL:', nextAuthUrl ? '✓ Set' : '❌ Missing');

console.log('\n🔧 Required Google Cloud Console Configuration:');
console.log('1. Project: Enable Google+ API or Google Identity API');
console.log('2. OAuth Consent Screen: Configured and published (for external users)');
console.log('3. Credentials: Web application type');
console.log('4. Authorized redirect URIs should include:');
console.log('   📌 http://localhost:3000/api/auth/callback/google');
console.log('   📌 https://yourdomain.com/api/auth/callback/google (for production)');

console.log('\n🧪 Testing OAuth Endpoints:');

// Test Google's well-known configuration
async function testGoogleConfig() {
  try {
    const response = await fetch('https://accounts.google.com/.well-known/openid-configuration');
    const config = await response.json();
    console.log('✅ Google OpenID Configuration: Available');
    console.log('   Authorization Endpoint:', config.authorization_endpoint);
    console.log('   Token Endpoint:', config.token_endpoint);
  } catch (error) {
    console.log('❌ Google OpenID Configuration: Failed to fetch');
    console.error('   Error:', error.message);
  }
}

testGoogleConfig();

console.log('\n🚀 Next Steps:');
console.log('1. Restart your development server');
console.log('2. Go to http://localhost:3000/login');
console.log('3. Click the Google sign-in button');
console.log('4. Check the browser console and server logs for any errors');

export {};