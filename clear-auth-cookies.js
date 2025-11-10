// Clear all authentication cookies and reset NextAuth sessions
// Run this in your browser console to clear all auth-related cookies

// Clear NextAuth cookies
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});

// Clear localStorage and sessionStorage
localStorage.clear();
sessionStorage.clear();

console.log("All authentication cookies and storage cleared!");
console.log("Please refresh the page and try again.");