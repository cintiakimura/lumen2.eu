#!/bin/bash

# Cloud Run Environment Variables Configuration Script
# This script helps you configure environment variables for your Cloud Run service

set -e

# Configuration
SERVICE_NAME="web-app-frontend-service"
REGION="us-central1"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

get_current_env_vars() {
    print_header "Current Environment Variables"
    
    if gcloud run services describe "$SERVICE_NAME" --region "$REGION" &>/dev/null; then
        gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format='value(spec.template.spec.containers[0].env[].name)' 2>/dev/null || echo "No variables set"
    else
        print_error "Service '$SERVICE_NAME' not found in region '$REGION'"
        return 1
    fi
}

set_env_vars_interactive() {
    print_header "Set Environment Variables - Interactive Mode"
    
    echo ""
    echo "Enter environment variables (press Enter with empty key to finish):"
    echo ""
    
    declare -a vars
    local count=0
    
    while true; do
        read -p "Variable name ${count}$((++count)): " var_name
        if [ -z "$var_name" ]; then
            break
        fi
        
        read -sp "Variable value: " var_value
        echo ""
        
        vars+=("${var_name}=${var_value}")
    done
    
    if [ ${#vars[@]} -eq 0 ]; then
        print_error "No variables provided"
        return 1
    fi
    
    # Join with commas
    local env_vars_string=""
    for i in "${!vars[@]}"; do
        if [ $i -gt 0 ]; then
            env_vars_string="${env_vars_string},"
        fi
        env_vars_string="${env_vars_string}${vars[$i]}"
    done
    
    # Apply variables
    apply_env_vars "$env_vars_string"
}

set_env_vars_from_file() {
    local file_path=$1
    
    if [ ! -f "$file_path" ]; then
        print_error "File not found: $file_path"
        return 1
    fi
    
    print_header "Loading Variables from File"
    print_info "Using: $file_path"
    
    # Parse .env file
    local env_vars_string=""
    local first=true
    
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        [[ $key =~ ^#.*$ ]] && continue
        [ -z "$key" ] && continue
        
        if [ "$first" = true ]; then
            env_vars_string="${key}=${value}"
            first=false
        else
            env_vars_string="${env_vars_string},${key}=${value}"
        fi
    done < "$file_path"
    
    apply_env_vars "$env_vars_string"
}

set_firebase_vars() {
    print_header "Configure Firebase Variables"
    
    echo ""
    echo "Enter your Firebase project configuration:"
    echo ""
    
    read -p "Firebase API Key: " firebase_api_key
    read -p "Firebase Auth Domain: " firebase_auth_domain
    read -p "Firebase Project ID: " firebase_project_id
    read -p "Firebase Storage Bucket: " firebase_storage_bucket
    read -p "Firebase Messaging Sender ID: " firebase_messaging_sender_id
    read -p "Firebase App ID: " firebase_app_id
    read -sp "Google Generative AI API Key: " google_genai_api_key
    echo ""
    
    env_vars_string="VITE_FIREBASE_API_KEY=${firebase_api_key},"
    env_vars_string="${env_vars_string}VITE_FIREBASE_AUTH_DOMAIN=${firebase_auth_domain},"
    env_vars_string="${env_vars_string}VITE_FIREBASE_PROJECT_ID=${firebase_project_id},"
    env_vars_string="${env_vars_string}VITE_FIREBASE_STORAGE_BUCKET=${firebase_storage_bucket},"
    env_vars_string="${env_vars_string}VITE_FIREBASE_MESSAGING_SENDER_ID=${firebase_messaging_sender_id},"
    env_vars_string="${env_vars_string}VITE_FIREBASE_APP_ID=${firebase_app_id},"
    env_vars_string="${env_vars_string}VITE_GOOGLE_GENAI_API_KEY=${google_genai_api_key},"
    env_vars_string="${env_vars_string}VITE_APP_ENV=production"
    
    apply_env_vars "$env_vars_string"
}

apply_env_vars() {
    local env_vars=$1
    
    print_header "Applying Environment Variables"
    
    echo "Updating Cloud Run service: $SERVICE_NAME"
    echo "Region: $REGION"
    echo ""
    print_info "This will create a new revision of your service..."
    echo ""
    
    if gcloud run services update "$SERVICE_NAME" \
        --region "$REGION" \
        --update-env-vars "$env_vars" \
        --quiet; then
        print_success "Environment variables updated successfully"
        echo ""
        print_info "New revision deployed"
        print_info "Service URL: $(gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format='value(status.url)')"
    else
        print_error "Failed to update environment variables"
        return 1
    fi
}

remove_env_vars() {
    local var_names=$1
    
    print_header "Removing Environment Variables"
    
    echo "Removing: $var_names"
    echo "Service: $SERVICE_NAME"
    echo "Region: $REGION"
    echo ""
    
    if gcloud run services update "$SERVICE_NAME" \
        --region "$REGION" \
        --remove-env-vars "$var_names" \
        --quiet; then
        print_success "Environment variables removed successfully"
    else
        print_error "Failed to remove environment variables"
        return 1
    fi
}

menu() {
    clear
    print_header "Cloud Run Environment Variables Manager"
    echo ""
    echo "Service: $SERVICE_NAME"
    echo "Region: $REGION"
    echo ""
    echo "Options:"
    echo "1) View current environment variables"
    echo "2) Configure Firebase variables interactively"
    echo "3) Set variables from .env.example file"
    echo "4) Set variables interactively"
    echo "5) Remove variables"
    echo "6) Change service name"
    echo "7) Change region"
    echo "0) Exit"
    echo ""
}

get_project_id() {
    local project_id=$(gcloud config get-value project 2>/dev/null || echo "")
    
    if [ -z "$project_id" ]; then
        print_error "No Google Cloud project is set"
        exit 1
    fi
    
    echo "$project_id"
}

verify_service_exists() {
    if ! gcloud run services describe "$SERVICE_NAME" --region "$REGION" &>/dev/null; then
        print_error "Service '$SERVICE_NAME' not found in region '$REGION'"
        echo ""
        echo "Available services:"
        gcloud run services list --region "$REGION" --format="table(metadata.name)"
        
        read -p "Enter service name: " SERVICE_NAME
    fi
}

main() {
    # Check prerequisites
    if ! command -v gcloud &> /dev/null; then
        print_error "gcloud CLI is not installed"
        exit 1
    fi
    
    # Verify we have a project
    PROJECT_ID=$(get_project_id)
    print_info "Using project: $PROJECT_ID"
    
    # Verify service exists
    verify_service_exists
    
    echo ""
    read -p "Press Enter to continue..."
    
    while true; do
        menu
        read -p "Select option (0-7): " option
        
        case $option in
            1)
                echo ""
                get_current_env_vars
                echo ""
                read -p "Press Enter to continue..."
                ;;
            2)
                echo ""
                set_firebase_vars
                echo ""
                read -p "Press Enter to continue..."
                ;;
            3)
                echo ""
                set_env_vars_from_file ".env.example"
                echo ""
                read -p "Press Enter to continue..."
                ;;
            4)
                echo ""
                set_env_vars_interactive
                echo ""
                read -p "Press Enter to continue..."
                ;;
            5)
                echo ""
                read -p "Variable names to remove (comma-separated): " var_names
                remove_env_vars "$var_names"
                echo ""
                read -p "Press Enter to continue..."
                ;;
            6)
                echo ""
                read -p "New service name: " SERVICE_NAME
                verify_service_exists
                echo ""
                ;;
            7)
                echo ""
                echo "Available regions:"
                gcloud run list --format="table(service.region)" | sort -u
                read -p "New region: " REGION
                echo ""
                ;;
            0)
                print_info "Exiting..."
                exit 0
                ;;
            *)
                print_error "Invalid option"
                read -p "Press Enter to continue..."
                ;;
        esac
    done
}

# Run main function
main
