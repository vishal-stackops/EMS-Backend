# 🚀 Render Deployment - Quick Start Guide

## What's Been Configured

✅ Backend CORS updated for production  
✅ `.gitignore` created to protect sensitive files  
✅ `render.yaml` created for infrastructure as code  
✅ Frontend API configured with environment variables  
✅ Comprehensive deployment guide created

---

## Next Steps (Manual)

### Step 1: Push Backend to GitHub

Open a terminal in the backend folder and run:

```bash
cd c:\Users\Admin\Desktop\React\employee-management-system-backend
git add .
git commit -m "Configure for Render deployment"
git push origin main
```

---

### Step 2: Deploy to Render

1. **Go to [render.com](https://render.com)** and sign up/login
2. **Click "New +" → "Web Service"**
3. **Connect GitHub** and select: `vishal-stackops/EMS-Backend`
4. **Configure service:**
   - Name: `ems-backend`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: `Free`

5. **Add Environment Variables:**

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `MONGO_URI` | `mongodb+srv://rajeshr051968_db_user:TXKwfmPr1l9Rzul4@emscluster.aoxsdmx.mongodb.net/employee_management?retryWrites=true&w=majority&appName=EMSCluster` |
   | `JWT_ACCESS_SECRET` | `3232db0eee1442415056b4bd4684e5906fd654e04642d8d6673a464e413959c172c5570a66b573ac45a4acb836dea274651c23f9958fcb4484706fb3709ce935` |
   | `JWT_REFRESH_SECRET` | `de3b435c0f90c43ed5ad0cb3b29d1b88cf95ca8f71f53717f094cb964d43a037363d2e3ef1fc9b727a52bc4e79ed2ea09cd98c4ba07b29209cb31b5351eef99f` |
   | `ACCESS_TOKEN_EXPIRES` | `15m` |
   | `REFRESH_TOKEN_EXPIRES` | `7d` |

6. **Click "Create Web Service"**

---

### Step 3: Configure MongoDB Atlas

1. Go to **MongoDB Atlas** → **Network Access**
2. Click **"Add IP Address"**
3. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

---

### Step 4: Verify Deployment

After deployment completes (3-5 minutes):

1. **Visit your backend URL** (e.g., `https://ems-backend-xxxx.onrender.com/`)
2. **Should display:** "EMS Backend is running 🚀"
3. **Check logs** in Render dashboard for any errors

---

### Step 5: Update Frontend

Create `.env` file in frontend root:

```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

Replace `your-backend-url` with your actual Render URL.

---

### Step 6: Update CORS in Render

After deploying frontend:

1. Go to **Render dashboard** → Your service → **Environment**
2. Add new variable:
   - Key: `FRONTEND_URL`
   - Value: Your frontend URL (e.g., `https://your-app.vercel.app`)
3. Service will auto-redeploy

---

## Important Notes

⚠️ **Free Tier Limitations:**
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month runtime

💡 **Keep Service Active:**
- Use [UptimeRobot](https://uptimerobot.com) to ping every 10 minutes
- Free tier available

---

## Troubleshooting

See detailed troubleshooting guide in [DEPLOYMENT.md](file:///c:/Users/Admin/Desktop/React/employee-management-system-backend/DEPLOYMENT.md)

Common issues:
- **Build fails**: Check `package.json` has correct scripts
- **Database connection error**: Verify MongoDB Atlas network access
- **CORS errors**: Ensure `FRONTEND_URL` is set correctly
- **503 errors**: Service may be spinning up (wait 30-60s)

---

## Files Created

- [.gitignore](file:///c:/Users/Admin/Desktop/React/employee-management-system-backend/.gitignore) - Git ignore rules
- [render.yaml](file:///c:/Users/Admin/Desktop/React/employee-management-system-backend/render.yaml) - Render configuration
- [DEPLOYMENT.md](file:///c:/Users/Admin/Desktop/React/employee-management-system-backend/DEPLOYMENT.md) - Detailed deployment guide
- [.env.example](file:///c:/Users/Admin/Desktop/React/employee-management-system/.env.example) - Frontend env template

## Files Modified

- [app.js](file:///c:/Users/Admin/Desktop/React/employee-management-system-backend/src/app.js) - Updated CORS configuration
- [api.js](file:///c:/Users/Admin/Desktop/React/employee-management-system/src/services/api.js) - Environment-based API URL
