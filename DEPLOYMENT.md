# Deploying EMS Backend to Render

## Quick Start Guide

### Step 1: Push Backend to GitHub

First, ensure your backend code is pushed to GitHub:

```bash
cd c:\Users\Admin\Desktop\React\employee-management-system-backend
git add .
git commit -m "Configure for Render deployment"
git push origin main
```

---

### Step 2: Create Render Account & Web Service

1. Go to [render.com](https://render.com) and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account
4. Select repository: `vishal-stackops/EMS-Backend`
5. Configure the service:
   - **Name**: `ems-backend` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

---

### Step 3: Configure Environment Variables

In the Render dashboard, add these environment variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `MONGO_URI` | `mongodb+srv://rajeshr051968_db_user:TXKwfmPr1l9Rzul4@emscluster.aoxsdmx.mongodb.net/employee_management?retryWrites=true&w=majority&appName=EMSCluster` |
| `JWT_ACCESS_SECRET` | `3232db0eee1442415056b4bd4684e5906fd654e04642d8d6673a464e413959c172c5570a66b573ac45a4acb836dea274651c23f9958fcb4484706fb3709ce935` |
| `JWT_REFRESH_SECRET` | `de3b435c0f90c43ed5ad0cb3b29d1b88cf95ca8f71f53717f094cb964d43a037363d2e3ef1fc9b727a52bc4e79ed2ea09cd98c4ba07b29209cb31b5351eef99f` |
| `ACCESS_TOKEN_EXPIRES` | `15m` |
| `REFRESH_TOKEN_EXPIRES` | `7d` |
| `FRONTEND_URL` | (Your frontend URL - add after frontend deployment) |

> **Note**: Copy these values from your local `.env` file

---

### Step 4: Configure MongoDB Atlas

Ensure MongoDB Atlas allows connections from Render:

1. Go to MongoDB Atlas dashboard
2. Navigate to **Network Access**
3. Click **"Add IP Address"**
4. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
5. Click **"Confirm"**

> **Security Note**: For production, you can restrict to Render's specific IP ranges after deployment

---

### Step 5: Deploy

1. Click **"Create Web Service"** in Render
2. Wait for the build to complete (3-5 minutes)
3. Once deployed, you'll get a URL like: `https://ems-backend-xxxx.onrender.com`

---

### Step 6: Verify Deployment

Test your backend is working:

1. **Health Check**: Visit `https://your-backend-url.onrender.com/` in browser
   - Should show: "EMS Backend is running 🚀"

2. **API Test**: Use Postman or curl to test login:
   ```bash
   curl -X POST https://your-backend-url.onrender.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"your-email","password":"your-password"}'
   ```

3. **Check Logs**: In Render dashboard, view logs for any errors

---

### Step 7: Update Frontend

Update your frontend to use the new backend URL:

1. Open `employee-management-system/src/services/api.js`
2. Update the base URL:
   ```javascript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-backend-url.onrender.com/api';
   ```
3. Create `.env` file in frontend:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```
4. For local development, create `.env.local`:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

---

### Step 8: Update CORS in Render

After deploying frontend, update the `FRONTEND_URL` environment variable in Render:

1. Go to Render dashboard → Your service → Environment
2. Update `FRONTEND_URL` to your frontend URL (e.g., Vercel/Netlify URL)
3. Service will automatically redeploy

---

## Important Notes

### Free Tier Limitations
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds (cold start)
- 750 hours/month runtime limit

### Keep Service Active (Optional)
Use [UptimeRobot](https://uptimerobot.com) to ping your backend every 10 minutes:
- Create free account
- Add new monitor
- Set URL: `https://your-backend-url.onrender.com/`
- Set interval: 10 minutes

---

## Troubleshooting

### Build Fails
- Check Render logs for specific error
- Ensure `package.json` has correct `start` script
- Verify all dependencies are in `dependencies`, not `devDependencies`

### Database Connection Error
- Verify MongoDB Atlas network access allows 0.0.0.0/0
- Check `MONGO_URI` environment variable is correct
- Ensure database user has proper permissions

### CORS Errors
- Verify `FRONTEND_URL` environment variable is set correctly
- Check frontend is using correct backend URL
- Review Render logs for CORS-related errors

### 503 Service Unavailable
- Service may be spinning up (wait 30-60 seconds)
- Check Render dashboard for service status
- Review logs for crash/error messages

---

## Next Steps

1. Deploy frontend to Vercel/Netlify
2. Update `FRONTEND_URL` in Render
3. Test full application end-to-end
4. Consider upgrading to paid plan for production use
