#!/bin/bash

# Cloud Build Setup Script for Lumen2.eu Application
# This script automates the setup of Cloud Build triggers and deployment configuration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
GITHUB_REPO="cintiakimura/lumen2.eu"
GITHUB_BRANCH="main"
BUILD_CONFIG_FILE="cloudbuild.yml"
SERVICE_NAME="web-app-frontend-service"
REGION="us-central1"

# Functions
print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

check_gcloud_installed() {
    if ! command -v gcloud &> /dev/null; then
        print_error "gcloud CLI is not installed"
        echo "Please install the Google Cloud SDK: https://cloud.google.com/sdk/docs/install"
        exit 1
    fi
    print_success "gcloud CLI is installed"
}

check_github_authenticated() {
    if ! command -v gh &> /dev/null; then
        print_warning "GitHub CLI (gh) is not installed"
        echo "Some features may be limited. Install from: https://cli.github.com/"
    else
        print_success "GitHub CLI is available"
    fi
}

get_project_id() {
    local project_id=$(gcloud config get-value project 2>/dev/null || echo "")
    
    if [ -z "$project_id" ]; then
        print_error "No Google Cloud project is set"
        echo ""
        echo "Available projects:"
        gcloud projects list --format="table(projectId)"
        echo ""
        read -p "Enter your Google Cloud Project ID: " project_id
        
        if [ -z "$project_id" ]; then
            print_error "Project ID is required"
            exit 1
        fi
        
        gcloud config set project "$project_id"
    fi
    
    echo "$project_id"
}

enable_required_apis() {
    print_header "Enabling Required Google Cloud APIs"
    
    local apis=(
        "cloudbuild.googleapis.com"
        "containerregistry.googleapis.com"
        "run.googleapis.com"
        "storage-api.googleapis.com"
    )
    
    for api in "${apis[@]}"; do
        echo "Enabling $api..."
        gcloud services enable "$api" --quiet 2>/dev/null || true
    done
    
    print_success "APIs enabled"
}

create_service_account() {
    local project_id=$1
    local sa_name="cloud-run-deployer"
    local sa_email="${sa_name}@${project_id}.iam.gserviceaccount.com"
    
    print_header "Setting Up Service Account"
    
    # Check if service account exists
    if gcloud iam service-accounts describe "$sa_email" --project="$project_id" &>/dev/null; then
        print_info "Service account $sa_name already exists"
    else
        print_info "Creating service account $sa_name..."
        gcloud iam service-accounts create "$sa_name" \
            --display-name="Cloud Run Deployer" \
            --project="$project_id"
        print_success "Service account created"
    fi
    
    # Grant necessary roles
    local roles=(
        "roles/run.admin"
        "roles/storage.admin"
        "roles/container.developer"
    )
    
    for role in "${roles[@]}"; do
        print_info "Granting $role to $sa_email..."
        gcloud projects add-iam-policy-binding "$project_id" \
            --member="serviceAccount:$sa_email" \
            --role="$role" \
            --condition=None \
            --quiet 2>/dev/null || true
    done
    
    print_success "Service account configured"
}

create_cloud_build_trigger() {
    local project_id=$1
    
    print_header "Creating Cloud Build Trigger"
    
    print_info "Manual trigger creation required (automated setup not available)"
    echo ""
    echo "To create the trigger manually:"
    echo "1. Go to: https://console.cloud.google.com/cloud-build/triggers?project=${project_id}"
    echo "2. Click 'Create Trigger'"
    echo "3. Configure with these settings:"
    echo "   - Name: lumen-app-deploy"
    echo "   - Source: GitHub"
    echo "   - Repository: ${GITHUB_REPO}"
    echo "   - Branch: ^${GITHUB_BRANCH}$"
    echo "   - Build configuration: ${BUILD_CONFIG_FILE}"
    echo ""
}

setup_secrets() {
    local project_id=$1
    
    print_header "Secret Manager Setup"
    
    print_info "For sensitive data (API keys), use Google Secret Manager:"
    echo ""
    echo "Example commands:"
    echo "  # Create a secret"
    echo "  echo -n 'your-api-key' | gcloud secrets create firebase-api-key --data-file=-"
    echo ""
    echo "  # Grant Cloud Build access"
    echo "  PROJECT_NUMBER=\$(gcloud projects describe ${project_id} --format='value(projectNumber)')"
    echo "  gcloud secrets add-iam-policy-binding firebase-api-key \\"
    echo "    --member=serviceAccount:\${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com \\"
    echo "    --role=roles/secretmanager.secretAccessor"
    echo ""
}

test_docker_build() {
    print_header "Testing Docker Build Locally"
    
    if ! command -v docker &> /dev/null; then
        print_warning "Docker is not installed. Skipping local test."
        return
    fi
    
    read -p "Build Docker image locally? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Building Docker image..."
        docker build -t lumen-app:latest .
        print_success "Docker image built successfully"
        
        echo ""
        print_info "To test locally, run:"
        echo "  docker run -p 8080:8080 lumen-app:latest"
        echo ""
        echo "Then visit: http://localhost:8080"
    fi
}

deployment_checklist() {
    print_header "Pre-Deployment Checklist"
    
    echo ""
    echo "Before deploying, ensure:"
    echo "  [ ] Environment variables are configured in Cloud Run"
    echo "  [ ] Firebase configuration is correct"
    echo "  [ ] Google Generative AI API key is set"
    echo "  [ ] Service account has necessary permissions"
    echo "  [ ] Cloud Build has access to your GitHub repository"
    echo "  [ ] Repository contains all required files:"
    echo "      - Dockerfile"
    echo "      - cloudbuild.yml"
    echo "      - server.js"
    echo "      - package.json"
    echo ""
}

next_steps() {
    print_header "Next Steps"
    
    echo ""
    echo "1. Commit and push all changes to GitHub:"
    echo "   git add ."
    echo "   git commit -m 'Add Cloud Run deployment configuration'"
    echo "   git push origin main"
    echo ""
    echo "2. Create the Cloud Build trigger (see instructions above)"
    echo ""
    echo "3. Configure environment variables in Cloud Run UI or via command line"
    echo ""
    echo "4. Monitor deployments:"
    echo "   gcloud builds log --stream LATEST"
    echo ""
    echo "5. View service logs:"
    echo "   gcloud run logs read ${SERVICE_NAME} --region ${REGION}"
    echo ""
}

# Main execution
main() {
    clear
    print_header "Lumen2.eu Cloud Run Deployment Setup"
    echo ""
    
    # Check prerequisites
    print_info "Checking prerequisites..."
    check_gcloud_installed
    check_github_authenticated
    echo ""
    
    # Get project ID
    PROJECT_ID=$(get_project_id)
    echo ""
    print_success "Using project: $PROJECT_ID"
    echo ""
    
    # Enable APIs
    enable_required_apis
    echo ""
    
    # Create service account
    create_service_account "$PROJECT_ID"
    echo ""
    
    # Create Cloud Build trigger
    create_cloud_build_trigger "$PROJECT_ID"
    echo ""
    
    # Setup secrets
    setup_secrets "$PROJECT_ID"
    echo ""
    
    # Test Docker build
    test_docker_build
    echo ""
    
    # Deployment checklist
    deployment_checklist
    echo ""
    
    # Next steps
    next_steps
}

# Run main function
main
