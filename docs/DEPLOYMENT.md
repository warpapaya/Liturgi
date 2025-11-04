# Deployment Guide

## Prerequisites

- Kubernetes cluster (1.27+)
- kubectl configured
- PostgreSQL 16+ database
- S3-compatible storage (AWS S3 or MinIO)
- Stripe account (for billing)
- SMTP provider (SendGrid, Mailgun, etc.)
- Domain with DNS access

## Environment Variables

### Required Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/db"

# Authentication
COOKIE_SECRET="min_32_characters_random_string"

# File Storage
MINIO_ENDPOINT="s3.amazonaws.com"
MINIO_PORT="443"
MINIO_ACCESS_KEY="your_access_key"
MINIO_SECRET_KEY="your_secret_key"
MINIO_USE_SSL="true"
MINIO_BUCKET="liturgi-prod-uploads"

# Email
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="your_sendgrid_api_key"
EMAIL_FROM="noreply@yourdomain.com"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_BASIC_PRICE_ID="price_..."
STRIPE_PRO_PRICE_ID="price_..."

# Application
NEXT_PUBLIC_APP_URL="https://app.yourdomain.com"
NODE_ENV="production"
```

### Optional Variables

```bash
# Redis (caching)
REDIS_URL="redis://localhost:6379"

# Sentry (error tracking)
SENTRY_DSN="https://...@sentry.io/..."

# Analytics
GOOGLE_ANALYTICS_ID="G-..."
```

## Database Setup

### 1. Create Database

```sql
CREATE DATABASE liturgi_prod;
CREATE USER liturgi_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE liturgi_prod TO liturgi_user;
```

### 2. Run Migrations

```bash
cd app
npx prisma migrate deploy
```

### 3. Seed Initial Data (Optional)

```bash
npx prisma db seed
```

## Kubernetes Deployment

### 1. Create Namespace

```bash
kubectl create namespace production
```

### 2. Create Secrets

```bash
kubectl create secret generic liturgi-secrets \
  --from-literal=database-url="postgresql://..." \
  --from-literal=cookie-secret="..." \
  --from-literal=stripe-secret-key="sk_live_..." \
  --from-literal=minio-access-key="..." \
  --from-literal=minio-secret-key="..." \
  --from-literal=smtp-user="..." \
  --from-literal=smtp-password="..." \
  -n production
```

### 3. Create ConfigMap

```bash
kubectl apply -f k8s/configmap.yml
```

### 4. Deploy Application

```bash
kubectl apply -f k8s/deployment.yml
```

### 5. Verify Deployment

```bash
kubectl get pods -n production
kubectl logs -f deployment/liturgi-app -n production
```

## SSL/TLS Setup

### Using cert-manager

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer
kubectl apply -f k8s/cert-issuer.yml

# Certificate will be automatically provisioned via Ingress annotation
```

### Using Custom Certificate

```bash
kubectl create secret tls liturgi-tls \
  --cert=path/to/cert.pem \
  --key=path/to/key.pem \
  -n production
```

## DNS Configuration

Point your domain to the Load Balancer IP:

```
A     app.yourdomain.com    -> <LOAD_BALANCER_IP>
CNAME *.yourdomain.com      -> app.yourdomain.com
```

## Stripe Webhook Setup

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://app.yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook secret and add to secrets

## Monitoring Setup

### Prometheus

```bash
kubectl apply -f k8s/monitoring/prometheus.yml
```

### Grafana

```bash
kubectl apply -f k8s/monitoring/grafana.yml
```

Import dashboards from `k8s/monitoring/dashboards/`

### Alerts

Configure PagerDuty/Slack integration in `k8s/monitoring/alertmanager.yml`

## Backup Strategy

### Database Backups

```bash
# Daily automated backups
kubectl apply -f k8s/cronjobs/db-backup.yml
```

Or use managed database backups (AWS RDS, DigitalOcean, etc.)

### File Storage Backups

Enable S3 versioning and cross-region replication

## Scaling

### Horizontal Pod Autoscaling

Already configured in `k8s/deployment.yml`:
- Min: 3 pods
- Max: 10 pods
- Target CPU: 70%
- Target Memory: 80%

### Database Scaling

Add read replicas for analytics queries:

```bash
# Update DATABASE_URL_READ with replica endpoint
kubectl set env deployment/liturgi-app DATABASE_URL_READ="postgresql://..." -n production
```

## Rolling Updates

```bash
# Update image
kubectl set image deployment/liturgi-app \
  web=ghcr.io/yourusername/liturgi:v1.2.0 \
  -n production

# Check rollout status
kubectl rollout status deployment/liturgi-app -n production

# Rollback if needed
kubectl rollout undo deployment/liturgi-app -n production
```

## Health Checks

The application exposes health check endpoints:

- `/api/health` - Liveness probe
- `/api/ready` - Readiness probe

## Troubleshooting

### View Logs

```bash
kubectl logs -f deployment/liturgi-app -n production
kubectl logs -f deployment/liturgi-app -n production --previous # Previous pod
```

### Shell into Pod

```bash
kubectl exec -it deployment/liturgi-app -n production -- /bin/sh
```

### Check Database Connection

```bash
kubectl run -it --rm debug --image=postgres:16 --restart=Never -- \
  psql "postgresql://user:pass@host:5432/db"
```

### Performance Issues

1. Check metrics in Grafana
2. Review slow query logs
3. Analyze with `kubectl top pods -n production`
4. Scale up if needed: `kubectl scale deployment liturgi-app --replicas=5 -n production`

## Blue-Green Deployment

```bash
# Deploy green environment
kubectl apply -f k8s/deployment-green.yml

# Test green environment
kubectl port-forward svc/liturgi-app-green 3000:80 -n production

# Switch traffic (update Ingress)
kubectl patch ingress liturgi-ingress -n production --type='json' \
  -p='[{"op": "replace", "path": "/spec/rules/0/http/paths/0/backend/service/name", "value":"liturgi-app-green"}]'

# Remove blue environment after verification
kubectl delete -f k8s/deployment-blue.yml
```

## Disaster Recovery

### RTO (Recovery Time Objective): 1 hour
### RPO (Recovery Point Objective): 15 minutes

### Recovery Steps

1. **Database Recovery**
   ```bash
   # Restore from latest backup
   pg_restore -d liturgi_prod backup.dump
   ```

2. **File Storage Recovery**
   ```bash
   # S3 versioning allows point-in-time recovery
   aws s3api restore-object --bucket liturgi-prod-uploads --key file.pdf --version-id <version>
   ```

3. **Application Redeployment**
   ```bash
   kubectl apply -f k8s/deployment.yml
   ```

## Security Checklist

- [ ] All secrets stored in Kubernetes Secrets
- [ ] TLS/SSL enabled with valid certificates
- [ ] Database encryption at rest enabled
- [ ] Network policies configured
- [ ] RBAC roles properly configured
- [ ] Security scanning in CI/CD pipeline
- [ ] Rate limiting enabled
- [ ] DDoS protection configured (CloudFlare)
- [ ] Regular security audits scheduled
- [ ] Penetration testing completed

## Post-Deployment

1. **Verify all endpoints**
   ```bash
   curl https://app.yourdomain.com/api/health
   ```

2. **Create first admin user**
   ```bash
   # Via registration flow or seed script
   ```

3. **Configure email templates**
   - Login to admin panel
   - Go to Settings → Email Templates
   - Customize templates

4. **Set up monitoring alerts**
   - Configure PagerDuty integration
   - Test alert delivery

5. **Enable backups**
   - Verify daily database backups
   - Test restore procedure

## Support

For deployment issues:
- Email: devops@yourdomain.com
- Slack: #devops-support
- On-call: Check PagerDuty rotation
