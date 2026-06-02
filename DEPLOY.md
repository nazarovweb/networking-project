# Deployment Guide — AWS Free Tier

This guide deploys the Wholesale Platform to AWS using **only free-tier resources**.
Total monthly cost: **$0** (within 12-month free tier limits).

---

## Architecture (Free Tier)

```
Internet
    │
    ▼
┌─────────────────────────────────────────────────────┐
│  VPC  10.0.0.0/16                                   │
│                                                     │
│  ┌──────────────────────────────┐                   │
│  │  Public Subnet 10.0.1.0/24  │                   │
│  │                             │                   │
│  │  ┌───────────────────────┐  │  ◄── Internet     │
│  │  │  EC2 t2.micro (FREE)  │  │      Gateway      │
│  │  │                       │  │                   │
│  │  │  ┌─────────────────┐  │  │                   │
│  │  │  │  Nginx (LB)     │  │  │                   │
│  │  │  │  port 80        │  │  │                   │
│  │  │  └────────┬────────┘  │  │                   │
│  │  │     ┌─────┴──────┐    │  │                   │
│  │  │  ┌──▼──┐      ┌──▼──┐ │  │                   │
│  │  │  │ FE  │      │ BE  │ │  │                   │
│  │  │  │3000 │      │3500 │ │  │                   │
│  │  │  └─────┘      └──┬──┘ │  │                   │
│  │  └──────────────────┼────┘  │                   │
│  └─────────────────────┼───────┘                   │
│                        │                           │
│  ┌──────────────────────▼──────────────────────┐   │
│  │  Private Subnet 10.0.2.0/24                 │   │
│  │                                             │   │
│  │  ┌─────────────────────────────────────┐    │   │
│  │  │  RDS PostgreSQL db.t3.micro (FREE)  │    │   │
│  │  │  port 5432 — no internet access     │    │   │
│  │  └─────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## Prerequisites

Install these on your local machine:

```powershell
# 1. Terraform
winget install HashiCorp.Terraform

# 2. AWS CLI
winget install Amazon.AWSCLI

# 3. Git (already installed)
```

---

## Step 1 — Configure AWS CLI

```powershell
aws configure
# Enter when prompted:
#   AWS Access Key ID:     <from AWS Console → IAM → your user → Security credentials>
#   AWS Secret Access Key: <same page>
#   Default region:        eu-west-1
#   Default output format: json
```

To get your keys: AWS Console → top-right menu → **Security credentials** → **Access keys** → **Create access key**.

---

## Step 2 — Create EC2 Key Pair

```powershell
# Create key pair and save the private key
aws ec2 create-key-pair `
  --key-name wholesale-key `
  --region eu-west-1 `
  --query "KeyMaterial" `
  --output text > "$env:USERPROFILE\.ssh\wholesale-key.pem"

# Fix permissions (Windows: just keep the file safe)
```

---

## Step 3 — Deploy Infrastructure with Terraform

```powershell
cd infrastructure\terraform-free-tier

# Copy and edit the variables file
copy terraform.tfvars.example terraform.tfvars
notepad terraform.tfvars      # fill in your values

# Initialize Terraform
terraform init

# Preview what will be created
terraform plan

# Deploy (takes ~5 minutes, mainly waiting for RDS)
terraform apply
# Type 'yes' when prompted
```

After apply completes, copy the outputs:
```
app_public_ip = "54.x.x.x"
app_url       = "http://54.x.x.x"
ssh_command   = "ssh -i ~/.ssh/wholesale-key.pem ubuntu@54.x.x.x"
```

---

## Step 4 — Push Code to GitHub

```powershell
cd D:\networking-project

git init
git remote add origin https://github.com/YOUR_USERNAME/networking-project.git
git add .
git commit -m "Initial deployment"
git push -u origin main
```

---

## Step 5 — Configure GitHub Secrets

GitHub → your repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret name   | Value                              |
|---------------|------------------------------------|
| `EC2_HOST`    | Your EC2 Elastic IP (e.g. 54.x.x.x) |
| `EC2_SSH_KEY` | Contents of `wholesale-key.pem`    |

To get the key content:
```powershell
Get-Content "$env:USERPROFILE\.ssh\wholesale-key.pem"
# Copy the entire output including -----BEGIN/END----- lines
```

---

## Step 6 — First Deployment

The EC2 user_data script automatically starts the app on first boot. 
Wait ~5 minutes after Terraform apply, then check:

```powershell
# SSH into the server
ssh -i "$env:USERPROFILE\.ssh\wholesale-key.pem" ubuntu@YOUR_EC2_IP

# Check if containers are running
docker compose ps

# View startup logs
docker compose logs -f

# Check the app
curl http://localhost/health
```

The app will be live at: `http://YOUR_EC2_IP`

---

## Step 7 — Verify CI/CD Pipeline

Any push to `main` branch now:
1. Runs TypeScript checks
2. Builds Docker images
3. SSHs into EC2 and restarts containers
4. Runs health checks

View pipeline: GitHub → your repo → **Actions** tab.

---

## Demo: Auto-scaling (for assignment criteria C.M3 / D.M4)

On the EC2 server, scale up replicas manually:

```bash
# SSH into server first
ssh -i ~/.ssh/wholesale-key.pem ubuntu@YOUR_EC2_IP

# Scale to 3 backend replicas (load-balanced by nginx)
docker compose up -d --scale backend=3 --scale frontend=2

# Watch resource usage in real time
docker stats

# Run load test from local machine (install hey first)
# go install github.com/rakyll/hey@latest
hey -n 2000 -c 100 http://YOUR_EC2_IP/api/
```

---

## Cost Breakdown

| Resource          | Spec          | Free Tier Limit    | Cost      |
|-------------------|---------------|--------------------|-----------|
| EC2               | t2.micro      | 750 h/month        | **$0.00** |
| RDS PostgreSQL    | db.t3.micro   | 750 h/month, 20GB  | **$0.00** |
| EBS (root volume) | 30 GB gp2     | 30 GB/month        | **$0.00** |
| Data transfer out | < 1 GB/month  | 1 GB/month         | **$0.00** |
| VPC, SGs, IGW     | —             | Always free        | **$0.00** |
| **Total**         |               |                    | **$0.00** |

> Free tier valid for **12 months** from account creation date.

---

## Teardown (when done with assignment)

```powershell
cd infrastructure\terraform-free-tier
terraform destroy
# Type 'yes' — removes ALL created resources to avoid any charges
```
