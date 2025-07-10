# Infrastructure

Infrastructure as Code (IaC) setup for the template project using Terraform and Google Cloud Platform.

## 📋 Prerequisites

- Terraform >= 1.5.0
- Google Cloud SDK (gcloud CLI)
- GCP Project with billing enabled
- Service Account with appropriate permissions

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install Terraform
brew install terraform

# Install Google Cloud SDK
brew install google-cloud-sdk

# Login to GCP
gcloud auth login
gcloud auth application-default login
```

### 2. Setup Terraform

```bash
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Create terraform.tfvars
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your values
```

### 3. Deploy Infrastructure

```bash
# Plan deployment
terraform plan

# Apply changes
terraform apply

# Destroy resources (when needed)
terraform destroy
```

## 🏗️ Architecture

### Services

- **Cloud Run**: Serverless container hosting
  - API Server
  - Web Application
- **Cloud SQL**: Managed PostgreSQL database
- **Cloud Storage**: Object storage for files
- **Cloud CDN**: Content delivery network
- **Cloud Load Balancing**: Application load balancer
- **Cloud Armor**: DDoS protection and WAF

### Networking

- VPC with private subnets
- Cloud NAT for outbound connectivity
- Private Google Access enabled
- VPC Connector for Cloud Run

### Security

- Identity and Access Management (IAM)
- Secret Manager for sensitive data
- Cloud KMS for encryption keys
- Binary Authorization for container security

## 📁 Directory Structure

```
infrastructure/
├── terraform/
│   ├── main.tf              # Main configuration
│   ├── variables.tf         # Variable definitions
│   ├── outputs.tf           # Output values
│   ├── providers.tf         # Provider configuration
│   ├── modules/             # Terraform modules
│   │   ├── cloud-run/       # Cloud Run module
│   │   ├── cloud-sql/       # Cloud SQL module
│   │   ├── networking/      # VPC and networking
│   │   └── storage/         # Cloud Storage module
│   └── environments/        # Environment-specific configs
│       ├── dev/
│       ├── staging/
│       └── production/
├── docker/                  # Docker configurations
│   ├── api.Dockerfile       # API server Dockerfile
│   └── web.Dockerfile       # Web app Dockerfile
└── scripts/                 # Deployment scripts
    ├── deploy.sh
    └── rollback.sh
```

## 🔧 Configuration

### Environment Variables

Key environment variables for Terraform:

```bash
export TF_VAR_project_id="your-gcp-project-id"
export TF_VAR_region="us-central1"
export TF_VAR_environment="production"
```

### Terraform Variables

See `terraform.tfvars.example` for all available variables.

## 🚢 Deployment

### Manual Deployment

```bash
# Build and push Docker images
./scripts/build-images.sh

# Deploy to Cloud Run
./scripts/deploy.sh production
```

### CI/CD Pipeline

GitHub Actions workflow automatically:

1. Builds Docker images
2. Pushes to Artifact Registry
3. Deploys to Cloud Run
4. Runs health checks

## 🔒 Security Best Practices

1. **Least Privilege**: IAM roles follow principle of least privilege
2. **Encryption**: All data encrypted at rest and in transit
3. **Network Security**: Private subnets and firewall rules
4. **Secret Management**: Sensitive data in Secret Manager
5. **Monitoring**: Cloud Logging and Cloud Monitoring enabled

## 📊 Monitoring

- **Cloud Logging**: Centralized log management
- **Cloud Monitoring**: Metrics and alerting
- **Cloud Trace**: Distributed tracing
- **Error Reporting**: Automatic error tracking

## 💰 Cost Optimization

- Cloud Run scales to zero when not in use
- Cloud SQL configured with appropriate machine types
- Cloud CDN for static asset caching
- Budget alerts configured

## 🔄 Backup and Recovery

- Cloud SQL automated backups (7-day retention)
- Point-in-time recovery enabled
- Cross-region backup replication
- Disaster recovery procedures documented

## 📚 Additional Resources

- [Terraform GCP Provider Documentation](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [GCP Best Practices](https://cloud.google.com/docs/enterprise/best-practices-for-enterprise-organizations)
