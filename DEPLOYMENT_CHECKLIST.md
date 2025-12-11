# Cloud Run Deployment Checklist & Summary

## ✅ What Has Been Configured

### 1. **Dockerfile** - Production-Ready Container
- ✅ Multi-stage build (builder + production)
- ✅ Optimized Node.js 20 Alpine image
- ✅ Production dependencies only
- ✅ Health check endpoint configured
- ✅ Proper signal handling
- ✅ Listens on port 8080 (Cloud Run standard)

### 2. **server.js** - Express.js Server
- ✅ Serves built React application
- ✅ Handles SPA routing (all routes → index.html)
- ✅ `/health` endpoint for Cloud Run health checks
- ✅ Static file serving with compression support
- ✅ PORT environment variable support

### 3. **cloudbuild.yml** - CI/CD Pipeline
- ✅ Build Docker image
- ✅ Push to Google Container Registry
- ✅ Deploy to Cloud Run
- ✅ Environment variables configuration
- ✅ Auto-scaling settings (min/max instances)
- ✅ Resource allocation (512Mi memory, 1 CPU)
- ✅ Timeout configuration
- ✅ Build machine type optimization

### 4. **package.json** - Dependencies
- ✅ Added `express` for production server
- ✅ All required dependencies present
- ✅ Firebase SDK configured
- ✅ Google Generative AI SDK configured

### 5. **Configuration Files**
- ✅ `.env.example` - Environment variables template
- ✅ `.dockerignore` - Optimize Docker build context
- ✅ `docker-compose.yml` - Local development setup
- ✅ Updated `docker/000-default.conf` - Apache/Nginx config with SPA support

### 6. **Documentation**
- ✅ `DEPLOYMENT.md` - Quick start guide
- ✅ `CLOUD_RUN_DEPLOYMENT.md` - Detailed deployment guide
- ✅ `setup-cloud-run.sh` - Automated setup script
- ✅ `configure-cloud-run-env.sh` - Environment variable manager

---

## 🚀 Next Steps - Quick Start

### Step 1: Install/Update Dependencies
```bash
npm install
```

### Step 2: Test Locally
```bash
# Option A: Using Docker
docker build -t lumen-app:latest .
docker run -p 8080:8080 lumen-app:latest

# Option B: Using Docker Compose
docker-compose up

# Visit http://localhost:8080
# Test health check: curl http://localhost:8080/health
```

### Step 3: Commit Changes
```bash
git add .
git commit -m "Add Cloud Run deployment configuration"
git push origin main
```

### Step 4: Set Up Cloud Build (Choose One)

**Option A: Automated Setup (Recommended)**
```bash
./setup-cloud-run.sh
```

**Option B: Manual Setup**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **Cloud Build > Triggers**
3. Click **Create Trigger** with these settings:
   - **Name**: `lumen-app-deploy`
   - **Source**: GitHub
   - **Repository**: `cintiakimura/lumen2.eu`
   - **Branch**: `^main$`
   - **Configuration file**: `cloudbuild.yml`
4. Click **Create**

### Step 5: Configure Environment Variables

**Option A: Cloud Console (Recommended for sensitive data)**
1. Go to [Cloud Run Console](https://console.cloud.google.com/run)
2. Select `web-app-frontend-service`
3. Click **Edit & Deploy New Revision**
4. Expand **Container** > **Environment variables**
5. Add all variables from `.env.example`
6. Click **Deploy**

**Option B: Command Line**
```bash
./configure-cloud-run-env.sh
```

**Option C: One-line command**
```bash
gcloud run services update web-app-frontend-service \
  --region us-central1 \
  --update-env-vars VITE_FIREBASE_API_KEY=your_key,VITE_GOOGLE_GENAI_API_KEY=your_key
```

### Step 6: Monitor First Deployment
```bash
# Watch build progress
gcloud builds log --stream LATEST

# View service
gcloud run services describe web-app-frontend-service --region us-central1

# View logs
gcloud run logs read web-app-frontend-service --region us-central1 --limit 50
```

---

## 📋 Environment Variables Reference

### Required for Firebase Authentication
```bash
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

### Required for Google Generative AI
```bash
VITE_GOOGLE_GENAI_API_KEY
```

### Application Configuration
```bash
VITE_APP_ENV=production
VITE_APP_URL=https://your-cloud-run-url.run.app
```

### Runtime Environment
```bash
NODE_ENV=production  # Set automatically by Cloud Run
PORT=8080           # Set by Cloud Run, don't override
```

---

## 🔧 Configuration Customization

### Change Service Name
Edit `cloudbuild.yml`:
```yaml
- 'web-app-frontend-service'  # Line with service name
```

### Change Deployment Region
Edit `cloudbuild.yml`:
```yaml
- 'us-central1'  # Change to: europe-west1, asia-northeast1, etc.
```

### Adjust Memory Allocation
Edit `cloudbuild.yml`:
```yaml
- '--memory'
- '512Mi'  # Increase to 1Gi, 2Gi if needed
```

### Adjust Auto-scaling
Edit `cloudbuild.yml`:
```yaml
- '--min-instances'
- '1'        # Minimum running instances
- '--max-instances'
- '100'      # Maximum running instances
```

---

## 🧪 Testing Commands

### Local Docker Build
```bash
docker build -t lumen-app:test .
docker run -p 8080:8080 \
  -e VITE_APP_ENV=development \
  lumen-app:test
```

### Health Check
```bash
curl http://localhost:8080/health
# Expected response: OK
```

### View Built Files
```bash
docker run -it lumen-app:test ls -la dist/
```

### Interactive Shell in Container
```bash
docker run -it lumen-app:test sh
```

---

## 📊 Monitoring & Debugging

### View Active Builds
```bash
gcloud builds list --limit=10
```

### View Build Details
```bash
gcloud builds describe BUILD_ID
```

### View Service Metrics
```bash
gcloud monitoring dashboards list
gcloud run services describe web-app-frontend-service --region us-central1
```

### Tail Service Logs
```bash
gcloud run logs read web-app-frontend-service --region us-central1 --follow
```

### View Deployment History
```bash
gcloud run revisions list --service web-app-frontend-service --region us-central1
```

---

## 🔒 Security Checklist

- [ ] Never commit `.env` files with secrets
- [ ] Use Google Secret Manager for sensitive data
- [ ] Enable Cloud Armor for DDoS protection
- [ ] Configure Identity-Aware Proxy (IAP) if restricted access needed
- [ ] Set up Cloud Audit Logs for compliance
- [ ] Review service account permissions regularly
- [ ] Use least privilege principle for IAM roles
- [ ] Enable VPC Service Controls if needed
- [ ] Set up Cloud KMS for encryption at rest

---

## 💰 Cost Optimization

### Typical Costs for Small/Medium Apps
- **Compute**: $5-15/month for moderate traffic
- **Network**: Usually < $1/month with caching
- **Storage**: Minimal for static assets

### Ways to Reduce Costs
1. Set `min-instances: 0` for applications with low traffic (has cold start penalty)
2. Use Cloud CDN for static assets
3. Implement caching strategies
4. Monitor usage with Cloud Billing
5. Set budget alerts in Cloud Console

### Monitor Costs
```bash
gcloud billing accounts list
gcloud billing budgets list
```

---

## 🆘 Troubleshooting Guide

### Build Fails - "permission denied"
```bash
./setup-cloud-run.sh
# Ensure service account has proper roles
```

### Service Shows 404
1. Check that `server.js` is in the repository root
2. Verify `package.json` includes `express`
3. Check Cloud Run logs: `gcloud run logs read web-app-frontend-service --region us-central1`

### Environment Variables Not Available
- **Browser JS**: Must be prefixed with `VITE_`
- **Server-side**: Add to Cloud Run environment variables
- Rebuild and redeploy after changes

### Slow Cold Start
- Set `min-instances: 1` to keep service warm
- Consider increasing memory allocation
- Profile with Cloud Trace

### Deployment Takes Too Long
- First build can take 2-3 minutes (normal)
- Subsequent builds should be faster
- Use Cloud Build cache optimization

---

## 📚 Additional Resources

### Official Documentation
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Firebase Setup Guide](https://firebase.google.com/docs)
- [Google Generative AI API](https://ai.google.dev)

### Related Files in Repository
- [Dockerfile](./Dockerfile)
- [cloudbuild.yml](./cloudbuild.yml)
- [server.js](./server.js)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [CLOUD_RUN_DEPLOYMENT.md](./CLOUD_RUN_DEPLOYMENT.md)

---

## 📞 Support & Questions

If you encounter issues:
1. Check logs: `gcloud run logs read web-app-frontend-service --region us-central1`
2. Review Cloud Build logs: `gcloud builds log --stream LATEST`
3. Check [Cloud Run troubleshooting guide](https://cloud.google.com/run/docs/troubleshooting)
4. Review this checklist for missed steps

---

## ✨ Deployment Success Indicators

Once deployed successfully, you should see:

✅ Green checkmark in Cloud Build > History
✅ Service listed in Cloud Run console
✅ Service URL accessible in browser
✅ Health check returning 200 OK
✅ Application loading correctly
✅ Environment variables present in service settings
✅ Logs showing successful requests

---

**Configuration created**: December 11, 2025
**Last updated**: December 11, 2025
