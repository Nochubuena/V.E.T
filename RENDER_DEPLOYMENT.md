# Render Deployment Guide for V.E.T Backend

## ✅ Configuration Steps

Your backend is now configured for Render deployment with:
- ✅ `backend/index.js` - Entry point for Render
- ✅ `render.yaml` - Render service configuration
- ✅ Updated `package.json` scripts

## 🚀 Deploy to Render

### Option 1: Using render.yaml (Recommended)

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Configure for Render deployment"
   git push origin main
   ```

2. **Connect to Render:**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will detect `render.yaml` automatically
   - Review and deploy!

### Option 2: Manual Configuration

If you prefer to configure manually:

1. **Create a Web Service:**
   - Go to Render dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Settings:**
   - **Name:** `vet-backend` (or your preferred name)
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free tier or paid

3. **Add Environment Variables:**
   Go to "Environment" tab and add:
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=10000
   ```
   
   **Important:** Render automatically sets `PORT`, so don't override it unless needed.

4. **Deploy:**
   - Click "Create Web Service"
   - Wait for build to complete (~5-10 minutes)
   - Your backend will be live!

## ⚙️ Key Configuration Details

### Root Directory
- Render must use `backend/` as the root directory
- This ensures it runs `backend/index.js` instead of root `index.js`

### Build Process
- `npm run build` compiles TypeScript to JavaScript in `dist/` folder
- `npm start` runs `backend/index.js` which requires `dist/server.js`

### Entry Point
- `backend/index.js` is the entry point for production
- It requires the compiled server from `dist/server.js`
- This file is created automatically during build

## 🔍 Troubleshooting

### Error: Cannot find module '/opt/render/project/src/App'

**Problem:** Render is using the wrong root directory (repo root instead of `backend/`)

**Solution:**
1. In Render dashboard, go to your service settings
2. Check "Root Directory" setting
3. Change it from `.` or empty to `backend`
4. Save and redeploy

### Error: Cannot find module 'dist/server.js'

**Problem:** Build didn't complete or TypeScript compilation failed

**Solution:**
1. Check build logs in Render dashboard
2. Ensure `npm run build` completes successfully
3. Verify `backend/tsconfig.json` is correct
4. Check that TypeScript is in dependencies

### Build Fails

**Common Issues:**
- Missing dependencies in `package.json`
- TypeScript errors in source files
- Node version mismatch (should be Node 18+)

**Fix:**
1. Check build logs for specific errors
2. Test build locally: `cd backend && npm run build`
3. Fix any TypeScript errors
4. Ensure all dependencies are listed in `package.json`

### Environment Variables Not Working

**Problem:** Environment variables not accessible in code

**Solution:**
1. Verify variables are set in Render dashboard under "Environment"
2. Check variable names match what's used in code
3. Redeploy after adding/changing variables
4. Use `process.env.VARIABLE_NAME` in code

## 📝 Environment Variables Required

Make sure these are set in Render:

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/vet-app` |
| `JWT_SECRET` | Secret for JWT token signing | `your-super-secret-key-here` |
| `NODE_ENV` | Environment (optional) | `production` |
| `PORT` | Server port (auto-set by Render) | `10000` |

## 🔗 After Deployment

1. **Get your backend URL:**
   - Render provides: `https://your-service.onrender.com`
   - Add to your frontend `.env` or configuration

2. **Update Frontend API URL:**
   ```typescript
   // In your frontend API config
   const API_BASE_URL = 'https://your-service.onrender.com/api';
   ```

3. **Test Your API:**
   ```bash
   curl https://your-service.onrender.com/api/health
   ```
   Should return: `{"status":"OK","message":"V.E.T API is running"}`

## 🎉 Success!

Your backend should now be live on Render! The API will be available at:
```
https://your-service.onrender.com/api
```

Endpoints:
- `POST /api/auth/register` - Register new owner
- `POST /api/auth/login` - Login
- `GET /api/health` - Health check
- `GET /api/dogs` - Get dogs (requires auth)
- `POST /api/dogs` - Add dog (requires auth)

