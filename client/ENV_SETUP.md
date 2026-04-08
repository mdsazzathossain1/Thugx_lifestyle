# Frontend Environment Variables Guide

## Vercel Environment Variables Setup

### How to Set Variables in Vercel

1. Go to **Vercel Dashboard** → Your Project
2. Click **Settings** → **Environment Variables**
3. Add the following variables:

---

## Production Environment

### Development (Local Testing)
```
VITE_API_URL=http://localhost:5000
VITE_BACKEND_URL=http://localhost:5000
```

### Production (After Backend Deployed)
```
VITE_API_URL=https://your-railway-url.railway.app
VITE_BACKEND_URL=https://your-railway-url.railway.app
```

### Production with Custom Domain
```
VITE_API_URL=https://api.thugxlifestyle.com
VITE_BACKEND_URL=https://api.thugxlifestyle.com
```

---

## Environment Scopes in Vercel

Set these in all three scopes:
- ✅ Production
- ✅ Preview  
- ✅ Development

This ensures all deployments (main, branches, local) work correctly.

---

## After Setting Variables

1. Go to **Deployments** tab
2. Click "Redeploy" on latest commit
3. Wait for build to complete
4. Test at https://your-domain.vercel.app

---

## Troubleshooting

**Issue**: Blank white page or 404
- **Solution**: Redeploy after setting env vars

**Issue**: API calls fail (CORS/Network)
- **Solution**: Verify VITE_API_URL is correct backend URL

**Issue**: `.env` file not working locally
- **Solution**: Create `client/.env.local`:
  ```
  VITE_API_URL=http://localhost:5000
  VITE_BACKEND_URL=http://localhost:5000
  ```
- Restart dev server: `npm run dev`
