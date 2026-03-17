# Deploying Macroweaver

This guide explains how to deploy the Macroweaver backend and frontend for free using Render and Vercel.

## 1. Push to GitHub
First, ensure all your latest code is pushed to your GitHub repository (`github.com/luminiferousBOT/...`). Both deployment platforms will pull your code directly from there.

## 2. Deploy the Backend (FastAPI) on Render
1. Go to [Render.com](https://render.com) and sign in with GitHub.
2. Click **New +** and select **Web Service**.
3. Choose "Build and deploy from a Git repository" and select your Macroweaver repo.
4. Configure the service:
   - **Name:** `macroweaver-api` (or similar)
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r backend/requirements.txt`
   - **Start Command:** `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
5. **Environment Variables:**
   - Add `GROQ_API_KEY` with your actual Groq API key from your `.env` file.
   - Add `PYTHON_VERSION` set to `3.10.0` (or whichever you are using locally).
6. Click **Create Web Service**. 
7. Once deployed, Render will give you a live URL (e.g., `https://macroweaver-api.onrender.com`). **Copy this URL.**

## 3. Deploy the Frontend (React/Vite) on Vercel
1. Go to [Vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New... > Project** and import your Macroweaver repo.
3. Configure the project:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Edit this and select the `frontend` folder.
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. **Environment Variables:**
   - Add `VITE_API_BASE_URL` and paste the Render backend URL you copied earlier, appending `/api` to the end (e.g., `https://macroweaver-api.onrender.com/api`).
5. Click **Deploy**.

## 4. Final Polish
Once Vercel finishes deploying, it will give you a live frontend URL. Since your FastAPI backend has `allow_origins=["*"]` configured in `backend/main.py`, the two parts will successfully communicate across domains.

Enjoy your live AI Economic Policy Advisor!
