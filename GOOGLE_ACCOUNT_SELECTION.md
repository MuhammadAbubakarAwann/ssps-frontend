# 🔐 Google Account Selection Behavior

## 🎯 **Issue**: Google Not Showing Account Selection

After logging out and clicking "Login with Google", Google doesn't show the account selection screen because Google maintains its own session cookies.

## ✅ **Solution Implemented**

### **1. Enhanced Google Provider Configuration**
Updated `src/auth.ts` to include:
```typescript
GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  authorization: {
    params: {
      prompt: "select_account",     // Forces account selection
      access_type: "offline",       // Enables refresh tokens
      response_type: "code"         // Standard OAuth flow
    }
  }
})
```

### **2. What This Does:**
- ✅ **`prompt: "select_account"`**: Forces Google to show account selection screen
- ✅ **`access_type: "offline"`**: Enables refresh token for better session management
- ✅ **`response_type: "code"`**: Uses standard OAuth authorization code flow

## 🧪 **Testing**

### **Expected Behavior Now:**
1. **User logs out** → Session cleared from your app
2. **User clicks "Google"** → Redirects to Google
3. **Google shows account selection** → User can choose account
4. **User selects account** → Proceeds with login
5. **Redirected back to app** → User is logged in

### **If Still Not Working:**

#### **Option 1: Clear Google Session (User Side)**
Users can manually clear Google session:
1. **Go to**: [accounts.google.com](https://accounts.google.com)
2. **Sign out** from Google completely
3. **Return to your app** and try Google login again

#### **Option 2: Use Incognito/Private Mode**
- **Open incognito window**
- **Navigate to your login page**
- **Click Google button** → Should always show account selection

#### **Option 3: Different Browser**
- **Test in different browser**
- **Should show account selection** on first use

## 🔧 **Additional Solutions**

### **Option A: Add "Switch Account" Button**
Could add a button that forces account switching:
```typescript
await signIn("google", {
  callbackUrl: safeRedirectUrl,
  // This would force a fresh login
});
```

### **Option B: Google Logout Link**
Could provide instructions to users:
> "To switch Google accounts, please [sign out of Google](https://accounts.google.com/logout) first, then try again."

### **Option C: Manual Account Selection URL**
Could create a direct link to Google account selection:
```
https://accounts.google.com/AccountChooser
```

## 📝 **Why This Happens**

### **Google's Behavior:**
1. **Google maintains session cookies** across all Google services
2. **If user is already signed in** → Google assumes they want to use same account
3. **`prompt: "select_account"`** overrides this behavior
4. **Forces account selection** even when logged in

### **Browser Considerations:**
- **Same browser session** → Google cookies persist
- **Incognito mode** → Fresh session, always prompts
- **Different browser** → No Google cookies, always prompts

## ✅ **Current Status**

- ✅ **Google Provider**: Configured with `prompt: "select_account"`
- ✅ **Login Form**: Updated with enhanced flow
- ✅ **Register Form**: Updated with enhanced flow
- ✅ **Expected Result**: Account selection should now appear

## 🚀 **Next Steps**

1. **Restart dev server**: `npm run dev`
2. **Test the flow**:
   - Log out completely
   - Try Google login
   - Should see account selection
3. **If still not working**: Try incognito mode to verify

---

**Note**: Google's account selection behavior is controlled by Google's own session management. The `prompt: "select_account"` parameter is the standard way to request account selection, but Google may still choose to skip it in certain scenarios based on their own security policies.