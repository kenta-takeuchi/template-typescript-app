#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID=""
REGION="asia-northeast1"
TERRAFORM_DIR="infrastructure/terraform"

# Help function
show_help() {
  echo "Usage: $0 [OPTIONS]"
  echo ""
  echo "Options:"
  echo "  -p, --project-id PROJECT_ID    GCP Project ID (required)"
  echo "  -r, --region REGION            GCP Region (default: asia-northeast1)"
  echo "  -h, --help                     Show this help message"
  echo ""
  echo "Examples:"
  echo "  $0 --project-id my-project-id"
  echo "  $0 -p my-project-id -r us-central1"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -p|--project-id)
      PROJECT_ID="$2"
      shift 2
      ;;
    -r|--region)
      REGION="$2"
      shift 2
      ;;
    -h|--help)
      show_help
      exit 0
      ;;
    *)
      echo -e "${RED}Error: Unknown option $1${NC}"
      show_help
      exit 1
      ;;
  esac
done

# Validate required parameters
if [[ -z "$PROJECT_ID" ]]; then
  echo -e "${RED}Error: Project ID is required${NC}"
  show_help
  exit 1
fi

echo -e "${GREEN}Starting deployment for project: $PROJECT_ID${NC}"
echo -e "${GREEN}Region: $REGION${NC}"

# Check if gcloud is installed and authenticated
if ! command -v gcloud &> /dev/null; then
  echo -e "${RED}Error: gcloud CLI is not installed${NC}"
  exit 1
fi

# Check if terraform is installed
if ! command -v terraform &> /dev/null; then
  echo -e "${RED}Error: Terraform is not installed${NC}"
  exit 1
fi

# Set the current project
echo -e "${YELLOW}Setting GCP project...${NC}"
gcloud config set project "$PROJECT_ID"

# Enable required APIs
echo -e "${YELLOW}Enabling required GCP APIs...${NC}"
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  sql-component.googleapis.com \
  sqladmin.googleapis.com \
  compute.googleapis.com \
  vpcaccess.googleapis.com \
  cloudresourcemanager.googleapis.com \
  iam.googleapis.com \
  storage.googleapis.com \
  monitoring.googleapis.com \
  logging.googleapis.com

# Initialize Terraform
echo -e "${YELLOW}Initializing Terraform...${NC}"
cd "$TERRAFORM_DIR"
terraform init

# Check if terraform.tfvars exists
if [[ ! -f "terraform.tfvars" ]]; then
  echo -e "${YELLOW}Creating terraform.tfvars from example...${NC}"
  cp terraform.tfvars.example terraform.tfvars
  echo -e "${RED}Please edit terraform.tfvars with your actual values before continuing${NC}"
  exit 1
fi

# Plan Terraform deployment
echo -e "${YELLOW}Planning Terraform deployment...${NC}"
terraform plan -var="project_id=$PROJECT_ID" -var="region=$REGION"

# Ask for confirmation
read -p "Do you want to apply these changes? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}Deployment cancelled${NC}"
  exit 0
fi

# Apply Terraform configuration
echo -e "${YELLOW}Applying Terraform configuration...${NC}"
terraform apply -var="project_id=$PROJECT_ID" -var="region=$REGION" -auto-approve

# Get outputs
echo -e "${YELLOW}Getting deployment outputs...${NC}"
API_URL=$(terraform output -raw api_url)
JOBSEEKER_URL=$(terraform output -raw jobseeker_web_url)
COMPANY_URL=$(terraform output -raw company_web_url)
AGENT_URL=$(terraform output -raw agent_web_url)

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo ""
echo -e "${GREEN}Application URLs:${NC}"
echo -e "  API Server:      $API_URL"
echo -e "  Jobseeker Web:   $JOBSEEKER_URL"
echo -e "  Company Web:     $COMPANY_URL"
echo -e "  Agent Web:       $AGENT_URL"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Set up your domain names to point to these URLs"
echo "2. Configure Firebase authentication"
echo "3. Run database migrations"
echo "4. Set up monitoring and alerting"