# Lumen2.eu - Deployment Configuration

This directory contains all necessary configuration files for deploying the Lumen2.eu application to Google Cloud Run.

## Quick Start

### 1. Prerequisites

- Google Cloud Project with billing enabled
- `gcloud` CLI installed: https://cloud.google.com/sdk/docs/install
- Docker installed (for local testing): https://docs.docker.com/install
- GitHub account with repository access

### 2. Automated Setup (Recommended)

```bash
# Run the setup script
./setup-cloud-run.sh
```

This script will:
- Check prerequisites
- Enable necessary Google Cloud APIs
- Create a service account with proper permissions
- Guide you through creating a Cloud Build trigger
- Provide instructions for environment variable configuration

### 3. Manual Cloud Build Trigger Setup

If you prefer to set up the trigger manually:

1. **Go to Cloud Console**: https://console.cloud.google.com/cloud-build/triggers
2. **Click "Create Trigger"**
3. **Configure:**
   - Name: `lumen-app-deploy`
   - Source: `GitHub (GitHub App)`
   - Repository: `cintiakimura/lumen2.eu`
   - Branch pattern: `^main$`
   - Build configuration: Cloud Build configuration file
   - Configuration file location: `cloudbuild.yml`
4. **Click "Create"**

### 4. Environment Variables

Your React application needs these environment variables for Firebase and Google Generative AI:

**Set them via Cloud Run Console:**

1. Go to Cloud Run > web-app-frontend-service
2. Click "Edit & Deploy New Revision"
3. Expand "Container" section
4. Add these variables:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GOOGLE_GENAI_API_KEY=your_genai_api_key
VITE_APP_ENV=production
VITE_APP_URL=https://your-cloud-run-url.run.app
```

## Files Overview

### Dockerfile
Multi-stage Docker build configuration that:
- Builds your React application with Vite
- Creates a minimal production image
- Serves the app with Node.js and Express
- Includes health check for Cloud Run

### cloudbuild.yml
Google Cloud Build configuration that:
- Builds and pushes Docker image to Google Container Registry
- Deploys to Cloud Run with proper configuration
- Sets environment variables
- Configures memory, CPU, and autoscaling

### server.js
Express.js server that:
- Serves static files from the `dist/` directory
- Handles SPA routing (all routes serve index.html)
- Provides health check endpoint for Cloud Run

### .env.example
Example environment variables file for local development

### docker-compose.yml
Local development setup with Docker Compose:
- Builds and runs the application locally
- Includes optional Nginx reverse proxy
- Matches Cloud Run environment

## Local Testing

### Build and run locally with Docker:

```bash
# Build the image
docker build -t lumen-app:latest .

# Run the container
docker run -p 8080:8080 lumen-app:latest

# Visit http://localhost:8080
```

### Or use Docker Compose:

```bash
docker-compose up
```

### Test the health check:

```bash
curl http://localhost:8080/health
```

## Deployment Workflow

1. **Make changes** to your code
2. **Commit and push** to main branch:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
3. **Cloud Build triggers automatically**
4. **Check deployment**:
   ```bash
   gcloud builds log --stream LATEST
   ```
5. **View live application** at Cloud Run URL

## Monitoring

### View build logs:
```bash
gcloud builds list --limit=10
gcloud builds log BUILD_ID --stream
```

### View application logs:
```bash
gcloud run logs read web-app-frontend-service --region us-central1 --limit 50
```

### Check service status:
```bash
gcloud run services describe web-app-frontend-service --region us-central1
```

## Troubleshooting

### Common Issues

**Build fails with "permission denied"**
- Ensure your service account has Cloud Run Admin role
- Run: `./setup-cloud-run.sh` to fix permissions

**Service deployed but shows 404**
- Verify environment variables are set correctly
- Check server.js is handling SPA routing properly
- Review Cloud Run logs: `gcloud run logs read web-app-frontend-service`

**Environment variables not available in app**
- Vite variables must be prefixed with `VITE_` to be available in browser
- Runtime variables are for Node.js server, not the React app
- Rebuild and redeploy after changing variables

**Image build takes too long**
- This is normal for first build
- Subsequent builds are faster due to Docker cache
- Consider increasing Cloud Build machine type

## Security Best Practices

1. **Never commit secrets** - Use Secret Manager
2. **Use service accounts** - Don't use personal credentials
3. **Limit permissions** - Grant minimal necessary roles
4. **Enable logging** - Monitor all API calls and deployments
5. **Use HTTPS** - Cloud Run provides free SSL/TLS certificates
6. **Implement authentication** - Use Cloud IAP for restricted access

## Cost Optimization

Cloud Run charges are based on:
- **Requests**: $0.40 per million
- **Compute time**: Based on CPU and memory allocation
- **Network egress**: Standard cloud network rates

**To minimize costs:**
- Set `min-instances` to 1 (avoid cold starts)
- Use appropriate memory allocation (512Mi-1Gi for most apps)
- Enable autoscaling to scale down during low traffic
- Monitor usage in Cloud Console

## Customization

### Change service name:
Edit `cloudbuild.yml`:
```yaml
- 'web-app-frontend-service'  # Change this
```

### Change region:
Edit `cloudbuild.yml`:
```yaml
- 'us-central1'  # Change to your region
```

### Adjust resources:
Edit `cloudbuild.yml`:
```yaml
- '--memory'
- '512Mi'  # Increase if needed
- '--cpu'
- '1'      # Increase for CPU-intensive work
```

## Next Steps

1. ✅ Review all configuration files
2. ✅ Set up environment variables
3. ✅ Test locally with Docker
4. ✅ Create Cloud Build trigger
5. ✅ Push to main branch to trigger deployment
6. ✅ Monitor first deployment in Cloud Build

## Support

For detailed information:
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Firebase Configuration](https://firebase.google.com/docs)
- [Google Generative AI API](https://ai.google.dev)

## Related Files

- [CLOUD_RUN_DEPLOYMENT.md](../CLOUD_RUN_DEPLOYMENT.md) - Detailed deployment guide
- [README.md](../README.md) - Project overview
- [Dockerfile](../Dockerfile) - Container configuration
- [cloudbuild.yml](../cloudbuild.yml) - Build and deployment configuration
