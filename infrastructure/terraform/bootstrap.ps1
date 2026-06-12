# Bootstrap: create the Terraform state S3 bucket before running terraform init.
# Run once: .\bootstrap.ps1
# Requires: AWS CLI configured with credentials for eu-west-1

$BUCKET  = "wholesale-platform-tfstate"
$REGION  = "eu-west-1"

Write-Host "Creating S3 state bucket: $BUCKET"

aws s3api create-bucket `
    --bucket $BUCKET `
    --region $REGION `
    --create-bucket-configuration LocationConstraint=$REGION

# Versioning keeps every state revision so you can roll back
aws s3api put-bucket-versioning `
    --bucket $BUCKET `
    --versioning-configuration Status=Enabled

# Server-side encryption at rest
aws s3api put-bucket-encryption `
    --bucket $BUCKET `
    --server-side-encryption-configuration '{
        "Rules": [{
            "ApplyServerSideEncryptionByDefault": {
                "SSEAlgorithm": "AES256"
            }
        }]
    }'

# Block all public access
aws s3api put-public-access-block `
    --bucket $BUCKET `
    --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

Write-Host "Done. Now run: terraform init"
