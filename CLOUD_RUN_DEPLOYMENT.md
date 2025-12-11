# Cloud Run Deployment Guide

This document explains how to deploy your React application to Google Cloud Run using Cloud Build.

## Prerequisites

- Google Cloud Project with billing enabled
- `gcloud` CLI installed and authenticated
- Docker installed (for local testing)
- GitHub account with repository access

## Project Structure

```
.
├── Dockerfile              # Multi-stage build configuration
├── cloudbuild.yml         # Cloud Build configuration
├── server.js              # Node.js Express server
├── .env.example           # Example environment variables
└── ...
```

## Environment Variables

### Frontend Environment Variables (Vite)

These variables are built into the application during the build process:

- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase authentication domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID
- `VITE_GOOGLE_GENAI_API_KEY` - Google Generative AI API key
- `VITE_APP_ENV` - Application environment (development/production)
- `VITE_APP_URL` - Application URL

### Runtime Environment Variables (Node.js Server)

These variables are available at runtime in the Cloud Run service:

- `NODE_ENV` - Set to 'production' for Cloud Run
- `PORT` - Port the server listens on (default: 8080)

## Setting Up Cloud Build Trigger

### Step 1: Navigate to Cloud Build

1. Go to the [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Navigate to **Cloud Build** > **Triggers**

### Step 2: Create a New Trigger

1. Click **Create Trigger**
2. Name your trigger (e.g., `lumen-app-deploy`)
3. Select **GitHub** as the source
4. Click **Authenticate** and follow OAuth flow to connect your GitHub account

### Step 3: Configure the Trigger

1. **Repository**: Select `cintiakimura/lumen2.eu`
2. **Branch**: Enter `main` (or your desired branch)
3. **Build Configuration**: Select `Cloud Build configuration file`
4. **Location**: Enter `cloudbuild.yml`
5. **Substitutions** (Optional): Add additional variables if needed
6. Click **Create**

### Step 4: Configure Environment Variables

You have two options to set environment variables for your Cloud Run service:

#### Option A: Via Cloud Console (Recommended for sensitive data)

1. Go to **Cloud Run**
2. Select the deployed service (`web-app-frontend-service`)
3. Click **Edit & Deploy New Revision**
4. Under **Container**, expand **Environment variables**
5. Add your variables:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - etc.
6. Click **Deploy**

#### Option B: Via Cloud Build (For non-sensitive values)

Edit `cloudbuild.yml` and update the `--set-env-vars` line:

```yaml
- '--set-env-vars'
- 'NODE_ENV=production,VITE_APP_ENV=production,YOUR_VAR=value'
```

#### Option C: Using Secret Manager (For sensitive data)

1. Create secrets in Google Secret Manager:
   ```bash
   echo -n "your-api-key" | gcloud secrets create firebase-api-key --data-file=-
   ```

2. Grant Cloud Build service account access:
   ```bash
   gcloud secrets add-iam-policy-binding firebase-api-key \
     --member=serviceAccount:YOUR_PROJECT_NUMBER@cloudbuild.gserviceaccount.com \
     --role=roles/secretmanager.secretAccessor
   ```

3. Update `cloudbuild.yml` to use the secret:
   ```yaml
   - name: 'gcr.io/cloud-builders/gke-deploy'
     args: ['run', '--filename=.', '--image=gcr.io/${PROJECT_ID}/lumen-app:${COMMIT_SHA}', '--location=us-central1', '--cluster=web-app-frontend-service']
     secretEnv: ['FIREBASE_API_KEY']
   
   onSuccess:
     - name: 'gcr.io/cloud-builders/kubectl'
       args: ['set', 'env', 'deployment/web-app', 'VITE_FIREBASE_API_KEY=$FIREBASE_API_KEY']
       secretEnv: ['FIREBASE_API_KEY']
   ```

## Local Testing

### Build and Run Locally

```bash
# Build the Docker image
docker build -t lumen-app:latest .

# Run the container
docker run -p 8080:8080 lumen-app:latest

# Test the application
curl http://localhost:8080
curl http://localhost:8080/health
```

### Using Docker Compose

```bash
docker-compose up
```

See `docker-compose.yml` for configuration.

## Deployment Workflow

Once the trigger is configured:

1. **Make changes** to your code and push to the `main` branch
2. **Cloud Build triggers automatically**
3. **Build process**:
   - Docker image is built and pushed to Container Registry
   - Image is deployed to Cloud Run
   - Service is updated with the new image
4. **Access your application** at the Cloud Run URL provided in the console

## Monitoring and Debugging

### View Cloud Build Logs

```bash
gcloud builds log --stream LATEST
```

### View Cloud Run Logs

```bash
gcloud logging read "resource.type=cloud_run_revision" --limit 50 --format json
```

### Check Cloud Run Service

```bash
gcloud run services list
gcloud run services describe web-app-frontend-service --region us-central1
```

## Troubleshooting

### Build Failures

1. Check Cloud Build logs: Navigate to **Cloud Build** > **History**
2. Common issues:
   - Missing dependencies in `package.json`
   - Incorrect build configuration in `Dockerfile`
   - Missing environment variables at build time

### Service Deployment Issues

1. Check service logs in Cloud Run console
2. Verify environment variables are set correctly
3. Check memory/CPU allocation is sufficient (minimum 512Mi recommended)

### Runtime Errors

1. Access Cloud Run logs:
   ```bash
   gcloud run logs read web-app-frontend-service --region us-central1 --limit 50
   ```
2. Check application configuration and environment variables

## Customization

### Changing the Service Name

Edit `cloudbuild.yml`:
```yaml
- 'web-app-frontend-service'  # Change this to your desired service name
```

### Changing the Region

Edit `cloudbuild.yml`:
```yaml
- 'us-central1'  # Change to your desired region (e.g., europe-west1, asia-northeast1)
```

### Adjusting Resource Allocation

Edit `cloudbuild.yml`:
```yaml
- '--memory'
- '512Mi'  # Increase for memory-intensive applications
- '--cpu'
- '1'      # Increase for CPU-intensive applications
```

## Security Considerations

1. **Secrets**: Never commit sensitive data. Use Secret Manager for API keys
2. **Authentication**: Consider enabling Cloud Run service authentication for restricted access
3. **IAM**: Grant minimal necessary permissions to service accounts
4. **Network**: Use VPC connectors for accessing private resources
5. **Logs**: Set up Cloud Logging for monitoring and auditing

## Cost Estimation

Cloud Run charges based on:
- **Requests**: $0.40 per million requests
- **Compute time**: $0.00001667 per vCPU-second ($0.06 per vCPU-hour)
- **Memory**: $0.00000278 per GB-second ($0.01 per GB-hour)
- **Network egress**: Standard Cloud egress rates

For a typical small application with moderate traffic, monthly costs should be minimal due to Cloud Run's pay-per-use model.

## Next Steps

1. Set up monitoring alerts
2. Configure domain name with Cloud Armor for DDoS protection
3. Set up CI/CD pipeline for staging environment
4. Implement automated testing in Cloud Build
5. Configure Cloud Run autoscaling policies
