# Fixing CORS Error

## Problem
You're seeing a CORS error because:
1. The frontend API URL is still set to the placeholder `https://your-backend-domain.com/api`
2. The backend CORS configuration needs to allow your Vercel frontend domain

## Solution

### Step 1: Deploy Your Backend

You need to deploy your backend to a hosting service first. Options:
- **Railway**: https://railway.app
- **Heroku**: https://heroku.com
- **Vercel**: https://vercel.com (for serverless)
- **AWS/Google Cloud/Azure**: Cloud platform services

### Step 2: Update Frontend API URL

Once your backend is deployed, you have two options:

#### Option A: Use Environment Variable (Recommended for Vercel)

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add a new variable:
   - **Name:** `REACT_APP_API_URL`
   - **Value:** `https://your-backend-url.com/api` (replace with your actual backend URL)
   - **Environment:** Production (and Preview if you want)

4. Redeploy your Vercel frontend

#### Option B: Update Code Directly

Edit `src/services/api.ts` and replace line 27:
```typescript
return 'https://your-actual-backend-url.com/api';
```

Replace `your-actual-backend-url.com` with your deployed backend URL

### Step 3: Update Backend CORS

The backend CORS configuration has been updated to allow:
- `https://v-e-t.vercel.app`
- Any `*.vercel.app` domain
- Local development URLs

If you need to add more domains, edit `backend/src/server.ts` and add them to the `allowedOrigins` array.

### Step 4: Verify Backend is Running

Test your backend health endpoint:
```bash
curl https://your-backend-url.com/api/health
```

Should return:
```json
{"status":"OK","message":"V.E.T API is running"}
```

### Step 5: Check Browser Console

After updating, check your browser console. You should see:
```
🌐 API Base URL: https://your-backend-url.com/api
```

## Quick Fix Checklist

- [ ] Backend is deployed and accessible
- [ ] Backend CORS allows `https://v-e-t.vercel.app`
- [ ] Frontend `REACT_APP_API_URL` is set in Vercel environment variables
- [ ] Frontend code uses the correct backend URL
- [ ] Both services are redeployed

## Common Issues

### Still seeing CORS error after fixing
- Clear browser cache
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Check browser console for the actual API URL being used
- Verify backend CORS logs show the request origin

### Backend returns 404
- Make sure backend routes use `/api` prefix
- Check that backend server is actually running
- Verify the URL in browser matches your backend URL

### Network Error
- Backend might be down or sleeping (free tier services may sleep after inactivity)
- Check backend logs in hosting dashboard
- Verify environment variables are set correctly

