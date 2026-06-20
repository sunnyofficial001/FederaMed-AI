#!/bin/bash
set -e

REGION=${AWS_REGION:-"us-east-1"}
BUCKET_NAME="federamed-ai-tf-state-$(aws sts get-caller-identity --query Account --output text)"
TABLE_NAME="federamed-ai-lock-table"

echo "🚀 Bootstrapping Terraform Backend in $REGION..."

# Create S3 Bucket
echo "📦 Creating S3 Bucket: $BUCKET_NAME"
aws s3api create-bucket --bucket $BUCKET_NAME --region $REGION \
    --create-bucket-configuration LocationConstraint=$REGION 2>/dev/null || echo "Bucket might already exist."

aws s3api put-bucket-versioning --bucket $BUCKET_NAME --versioning-configuration Status=Enabled
aws s3api put-bucket-encryption --bucket $BUCKET_NAME \
    --server-side-encryption-configuration '{"Rules": [{"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "AES256"}}]}'
aws s3api put-public-access-block --bucket $BUCKET_NAME \
    --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# Create DynamoDB Table
echo "🔒 Creating DynamoDB Table: $TABLE_NAME"
aws dynamodb create-table --table-name $TABLE_NAME \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region $REGION 2>/dev/null || echo "Table might already exist."

echo "✅ Backend ready! Update terraform/main.tf with bucket: $BUCKET_NAME"