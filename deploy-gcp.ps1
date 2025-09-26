# Google Cloud Deployment Script for AI Travel Companion
param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectId
)

Write-Host "🚀 Deploying AI Travel Companion to Google Cloud..." -ForegroundColor Green

# Set project
gcloud config set project $ProjectId

# Enable required APIs
Write-Host "📋 Enabling required APIs..." -ForegroundColor Yellow
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com

# Build and deploy to Cloud Run
Write-Host "🔨 Building and deploying to Cloud Run..." -ForegroundColor Yellow
gcloud run deploy travel-planner `
    --source . `
    --platform managed `
    --region us-central1 `
    --allow-unauthenticated `
    --port 3000 `
    --memory 1Gi `
    --cpu 1 `
    --set-env-vars "NODE_ENV=production,JWT_SECRET=53b81d229a621a49909f3eb9170dd074c2c561909ba301ff68fae030f989c031a663262eed1e0a6afbe86a9aef09a4465f67a681495e697e0bb466e5934ecd8e,DATABASE_URL=file:./dev.db"

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "🌐 Your app should be available at the URL shown above" -ForegroundColor Cyan