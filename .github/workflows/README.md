# GitHub Actions Workflows

CI/CD pipelines for the Template project.

## 🔄 Workflows

### 1. CI Pipeline (`ci.yml`)

Runs on every push and pull request to ensure code quality.

**Steps:**

- Install dependencies
- Run linting
- Run type checking
- Run tests
- Build all packages

**Matrix builds:**

- Node.js versions: 20.x, 22.x
- OS: Ubuntu latest

### 2. Deploy Pipeline (`deploy.yml`)

Deploys applications to Google Cloud Run.

**Triggers:**

- Push to `main` branch
- Manual workflow dispatch

**Deployed services:**

- template-api
- template-web

**Steps:**

1. Checkout code
2. Authenticate to Google Cloud
3. Configure Docker for Artifact Registry
4. Build and push Docker images
5. Deploy to Cloud Run
6. Run health checks

### 3. Release Pipeline (`release.yml`)

Creates GitHub releases and tags.

**Triggers:**

- Manual workflow dispatch with version input

**Steps:**

1. Create git tag
2. Generate changelog
3. Create GitHub release
4. Trigger deployment

## 🔒 Secrets

Required GitHub secrets:

- `GCP_SA_KEY`: Service account key for GCP authentication
- `GCP_PROJECT_ID`: Google Cloud project ID
- `SLACK_WEBHOOK_URL`: Slack notification webhook (optional)

## 🚀 Manual Deployment

To manually trigger a deployment:

```bash
gh workflow run deploy.yml --ref main
```

To create a release:

```bash
gh workflow run release.yml -f version=1.0.0
```

## 📊 Status Badges

Add these to your README:

```markdown
![CI](https://github.com/[owner]/[repo]/workflows/CI/badge.svg)
![Deploy](https://github.com/[owner]/[repo]/workflows/Deploy/badge.svg)
```

## 🛠️ Local Testing

Test workflows locally with [act](https://github.com/nektos/act):

```bash
# Test CI workflow
act push

# Test with specific Node version
act push --matrix node-version:20.x
```

## 📝 Best Practices

1. **Use caching**: Cache dependencies to speed up builds
2. **Matrix builds**: Test across multiple Node versions
3. **Fail fast**: Stop all matrix jobs if one fails
4. **Timeouts**: Set reasonable timeouts for jobs
5. **Concurrency**: Limit concurrent deployments
6. **Notifications**: Send notifications on failure
