// Quick verification of NextAuth callback URL
// Run this in your browser console on the login page

console.log('NextAuth Configuration Check:');
console.log('Current Origin:', window.location.origin);
console.log('Expected Callback URL:', window.location.origin + '/api/auth/callback/google');
console.log('');
console.log('Add this exact URL to Google Cloud Console:');
console.log(window.location.origin + '/api/auth/callback/google');